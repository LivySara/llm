"""
北京环球影城门票价格 MCP Server

说明：
- 由于北京环球影城没有公开、稳定的实时报价 API，本服务采用「人工维护数据」模式：
  价格保存在 data/prices.json 中，通过 MCP 工具读取与更新。
- 提供了查询（按票种 / 按日期 / 全部）和人工维护（更新票价 / 更新日历）两类工具。

运行方式：
    python server.py
（默认以 stdio 方式启动，可被 MCP 客户端（如 Claude Desktop、CodeBuddy）连接）

依赖：
    pip install -r requirements.txt
"""

import json
import os
from datetime import datetime

from mcp.server.fastmcp import FastMCP

# ---------------------------------------------------------------------------
# 初始化
# ---------------------------------------------------------------------------
mcp = FastMCP("universal-studios-beijing-price")

DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "prices.json")


def _load() -> dict:
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _save(data: dict) -> None:
    data.setdefault("meta", {})["last_updated"] = datetime.now().strftime("%Y-%m-%d")
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# ---------------------------------------------------------------------------
# 查询类工具
# ---------------------------------------------------------------------------
@mcp.tool()
def get_all_prices() -> str:
    """获取北京环球影城所有门票价格信息（含单日票、儿童/老人票、优速通、年卡等）。

    返回一段人类可读的价格清单，并附带数据维护说明。
    """
    data = _load()
    meta = data.get("meta", {})
    lines = [f"# {meta.get('park', '北京环球影城')} 门票价格（参考价）"]
    lines.append(f"> 数据来源：{meta.get('maintained_by', '人工维护')} | 最后更新：{meta.get('last_updated', '未知')}")
    lines.append(f"> 币种：{meta.get('currency', 'CNY')}（{meta.get('unit', '元')}）\n")

    for t in data.get("tickets", []):
        lines.append(
            f"- **{t['name']}**：{t['price']} {meta.get('unit', '元')} "
            f"（类型：{t['type']}，档位：{t['tier']}）\n  {t.get('desc', '')}"
        )
    return "\n".join(lines)


@mcp.tool()
def get_price_by_id(ticket_id: str) -> str:
    """根据门票 id 查询指定票种的价格。

    Args:
        ticket_id: 门票唯一标识，例如 single_offpeak / single_peak / child /
                   senior / express_standard / annual_basic 等。
                   不确定时可先调用 get_all_prices 查看全部 id。
    """
    data = _load()
    for t in data.get("tickets", []):
        if t["id"] == ticket_id:
            meta = data.get("meta", {})
            return (
                f"票种：{t['name']}\n"
                f"价格：{t['price']} {meta.get('unit', '元')}\n"
                f"类型：{t['type']} / 档位：{t['tier']}\n"
                f"说明：{t.get('desc', '')}"
            )
    return f"未找到 id 为「{ticket_id}」的票种，请通过 get_all_prices 查看可用 id。"


@mcp.tool()
def get_price_by_date(date: str) -> str:
    """查询指定日期的单日门票价格（基于人工维护的 price calendar）。

    Args:
        date: 日期，格式 YYYY-MM-DD，例如 2026-10-01。
    """
    data = _load()
    cal = data.get("calendar", {}).get(date)
    if not cal:
        # 回退：按档位给出平日/高峰参考价
        meta = data.get("meta", {})
        off = next((t for t in data["tickets"] if t["id"] == "single_offpeak"), None)
        peak = next((t for t in data["tickets"] if t["id"] == "single_peak"), None)
        return (
            f"{date} 暂无专门维护的日历价，提供参考区间：\n"
            f"- 平日单日票：{off['price'] if off else '?'} {meta.get('unit', '元')}\n"
            f"- 高峰单日票：{peak['price'] if peak else '?'} {meta.get('unit', '元')}\n"
            f"（如需精确价格，可用 update_calendar 维护该日期。）"
        )
    meta = data.get("meta", {})
    return (
        f"日期：{date}\n"
        f"档位：{cal.get('tier', '未知')}\n"
        f"单日票价格：{cal.get('single', '?')} {meta.get('unit', '元')}\n"
        f"备注：{cal.get('note', '无')}"
    )


@mcp.tool()
def search_prices(keyword: str) -> str:
    """按关键词模糊搜索门票（匹配票种名称或说明）。

    Args:
        keyword: 关键词，例如「儿童」「年卡」「优速通」「单日」。
    """
    data = _load()
    meta = data.get("meta", {})
    kw = keyword.lower()
    hits = [
        t
        for t in data.get("tickets", [])
        if kw in t["name"].lower() or kw in t.get("desc", "").lower()
    ]
    if not hits:
        return f"未找到与「{keyword}」相关的票种。"
    lines = [f"匹配「{keyword}」的结果："]
    for t in hits:
        lines.append(f"- {t['name']}：{t['price']} {meta.get('unit', '元')}（id={t['id']}）")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# 人工维护类工具（更新数据）
# ---------------------------------------------------------------------------
@mcp.tool()
def update_price(ticket_id: str, price: float, desc: str = None) -> str:
    """人工维护：更新某个票种的价格（写入 data/prices.json）。

    Args:
        ticket_id: 门票唯一标识，例如 single_peak。
        price: 新的价格（数值，单位：元）。
        desc: 可选，新的票种说明。
    """
    data = _load()
    for t in data.get("tickets", []):
        if t["id"] == ticket_id:
            old = t["price"]
            t["price"] = price
            if desc is not None:
                t["desc"] = desc
            _save(data)
            return f"已更新 {t['name']}：{old} -> {price} {data.get('meta', {}).get('unit', '元')}"
    return f"未找到 id 为「{ticket_id}」的票种，更新失败。"


@mcp.tool()
def update_calendar(date: str, single: float, tier: str = "offpeak", note: str = "") -> str:
    """人工维护：为某一天设置单日门票价格（写入 data/prices.json 的 calendar）。

    Args:
        date: 日期 YYYY-MM-DD。
        single: 该日单日票价格（元）。
        tier: 档位，可选 offpeak / peak / premium / addon。
        note: 可选备注，例如「国庆假期」。
    """
    data = _load()
    cal = data.setdefault("calendar", {})
    cal[date] = {"tier": tier, "single": single, "note": note}
    _save(data)
    return f"已维护 {date} 的日历价：{single} 元（档位 {tier}，备注：{note or '无'}）"


@mcp.tool()
def get_maintenance_info() -> str:
    """返回数据维护说明与最近更新时间，方便使用者判断是否过期。"""
    data = _load()
    meta = data.get("meta", {})
    return (
        f"园区：{meta.get('park', '北京环球影城')}\n"
        f"维护方式：{meta.get('maintained_by', '人工维护')}\n"
        f"最后更新：{meta.get('last_updated', '未知')}\n"
        f"说明：{meta.get('note', '')}\n"
        f"已维护日历天数：{len(data.get('calendar', {}))} 天"
    )


if __name__ == "__main__":
    mcp.run()
