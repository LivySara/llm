"""
北京环球影城游玩攻略 MCP Server（Phase 3 新增）

说明：
- 这是「第二个 MCP server」的演示：与票价 server 不同，它提供的是
  游玩建议类数据（贴士 / 必玩项目 / 餐饮 / 最佳日期 / 拥挤程度），
  全部为静态内置数据，无需任何外部 API key，开箱即用。
- 让 Agent 同时连接「票价 server」+「攻略 server」，就能给出
  既算得清价格、又给得出游玩建议的更真实方案。

运行方式：
    python server.py
（以 stdio 方式启动，被 travel-agent 的 agent.py 通过 MCP 连接）

依赖：
    pip install -r requirements.txt  （与票价 server 共用同一份依赖）
"""

from datetime import datetime

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("universal-studios-beijing-guide")

# ---------------------------------------------------------------------------
# 内置静态攻略数据（教学用，真实项目可替换为数据库 / 爬虫 / 第三方 API）
# ---------------------------------------------------------------------------
VISIT_TIPS = [
    "下载「北京环球度假区」官方 App，可查实时排队时长、演出时间与地图。",
    "开园前 30 分钟到安检口，能抢先玩哈利波特 / 变形金刚等热门项目。",
    "带娃家庭优先刷「小黄人乐园」和「功夫熊猫盖世之地」（室内、低刺激）。",
    "优速通（Express）建议旺季 / 周末购买，可省下大量排队时间。",
    "园区餐饮偏贵，预算有限可稍带零食（园区允许带未开封食品）。",
    "晚上 20:30 左右有霍格沃茨城堡夜间灯光秀，建议提前占位。",
]

MUST_RIDE = [
    ("哈利·波特的禁忌之旅", "沉浸感最强，必玩榜第一"),
    ("变形金刚基地", "3D 骑乘，刺激度高"),
    ("侏罗纪世界大冒险", "全家皆宜，视觉效果惊艳"),
    ("霸天虎过山车", "园区最刺激过山车，胆大的必试"),
    ("小黄人闹翻天", "轻松欢乐，适合拍照"),
    ("好莱坞大道特效表演", "无需排队，整点演出"),
]

DINING = {
    "低": ["美食广场简餐（汉堡 / 面条，约 60-80 元/人）", "自带未开封零食"],
    "中": ["三把扫帚酒吧（魔法主题套餐，约 120-160 元/人）", "卡通星厨（小黄人主题，约 100-140 元/人）"],
    "高": ["主题餐厅 + 黄油啤酒体验套餐（约 200 元+/人）", "VIP 私享用餐（需额外预约）"],
}

# 各月游玩建议（1-12）：拥挤度与亮点
MONTH_ADVICE = {
    "1": ("低-中", "冬季淡季，排队短；元旦小高峰；注意保暖。"),
    "2": ("中-高", "春节假期人流大；其余时间较空。"),
    "3": ("低", "春季平季，性价比高，推荐。"),
    "4": ("低-中", "清明小高峰；整体舒适。"),
    "5": ("中-高", "劳动节假期拥挤；平日不错。"),
    "6": ("低", "初夏平季，学生未放假，推荐。"),
    "7": ("中-高", "暑期旺季，亲子客流大，建议买优速通。"),
    "8": ("中-高", "暑期延续，高温注意防暑。"),
    "9": ("低", "初秋平季，人少天气好，强烈推荐。"),
    "10": ("高", "国庆黄金周最拥挤，尽量错峰。"),
    "11": ("低", "淡季，排队极短。"),
    "12": ("低-中", "圣诞 / 元旦氛围好但有小高峰。"),
}

# 2026 年主要法定节假日（用于拥挤度判断，简化版）
HOLIDAYS_2026 = {
    "2026-01-01", "2026-02-15", "2026-02-16", "2026-02-17", "2026-02-18",
    "2026-02-19", "2026-02-20", "2026-02-21", "2026-02-22", "2026-02-23",
    "2026-02-24", "2026-04-04", "2026-04-05", "2026-04-06",
    "2026-05-01", "2026-05-02", "2026-05-03", "2026-05-04", "2026-05-05",
    "2026-06-19", "2026-06-20", "2026-06-21",
    "2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04", "2026-10-05",
    "2026-10-06", "2026-10-07",
}


# ---------------------------------------------------------------------------
# 攻略类工具
# ---------------------------------------------------------------------------
@mcp.tool()
def get_visit_tips() -> str:
    """获取北京环球影城通用游玩贴士（App、错峰、带娃、餐饮、演出等）。"""
    lines = ["# 北京环球影城游玩贴士"]
    for i, t in enumerate(VISIT_TIPS, 1):
        lines.append(f"{i}. {t}")
    return "\n".join(lines)


@mcp.tool()
def get_must_ride_attractions() -> str:
    """获取园区必玩项目清单（含推荐理由）。"""
    lines = ["# 必玩项目 Top 6"]
    for i, (name, reason) in enumerate(MUST_RIDE, 1):
        lines.append(f"{i}. **{name}**：{reason}")
    return "\n".join(lines)


@mcp.tool()
def get_dining_recommendations(budget: str = "中") -> str:
    """按预算档位推荐园区餐饮。

    Args:
        budget: 预算档位，可选「低」/「中」/「高」，默认「中」。
    """
    key = budget if budget in DINING else "中"
    items = DINING[key]
    lines = [f"# 餐饮推荐（预算：{key}）"]
    for it in items:
        lines.append(f"- {it}")
    return "\n".join(lines)


@mcp.tool()
def get_best_visit_dates(month: str = "") -> str:
    """按月份给出北京环球影城游玩建议（拥挤度 + 亮点）。

    Args:
        month: 月份数字字符串，如 "10" 表示 10 月；留空则返回全年概览。
    """
    if month and month in MONTH_ADVICE:
        level, note = MONTH_ADVICE[month]
        return f"{month} 月建议：拥挤度【{level}】；{note}"
    lines = ["# 全年各月游玩建议（拥挤度 / 亮点）"]
    for m in sorted(MONTH_ADVICE):
        level, note = MONTH_ADVICE[m]
        lines.append(f"- {m} 月：拥挤度【{level}】{note}")
    return "\n".join(lines)


@mcp.tool()
def get_crowd_level(date: str) -> str:
    """估算指定日期的园区拥挤程度（基于周末 / 法定节假日启发式规则）。

    Args:
        date: 日期，格式 YYYY-MM-DD，例如 2026-10-01。
    """
    try:
        d = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        return f"日期格式应为 YYYY-MM-DD，收到：{date}"
    weekday = d.weekday()  # 0=周一 ... 6=周日
    is_weekend = weekday >= 5
    is_holiday = date in HOLIDAYS_2026
    if is_holiday:
        level = "高（法定节假日）"
    elif is_weekend:
        level = "中-高（周末）"
    else:
        level = "低-中（平日）"
    return (
        f"日期：{date}（{['周一','周二','周三','周四','周五','周六','周日'][weekday]}）\n"
        f"预计拥挤度：{level}\n"
        f"建议：{'尽量错峰或购买优速通' if level.startswith(('高', '中-高')) else '人流较可控，游玩体验较好'}"
    )


if __name__ == "__main__":
    mcp.run()
