#!/usr/bin/env python3
"""
抓取 VOA Learning English "How to Pronounce" 系列的全部视频（zoneId=6042）。

数据源：Podcast RSS，一次性返回全部剧集（标题 / 日期 / MP4 地址）。
输出：english/playlist.json，按发布时间升序排列。

720p 地址推导：RSS 的 <enclosure> 是 360p 基础地址，
把文件名 ".mp4" 替换为 "_720p.mp4" 即为同源的 720p 地址（已验证 2018~2025 均可用）。

仅使用 Python 标准库，无需安装第三方依赖。
用法：
    python english/scripts/crawl_voa.py
    python english/scripts/crawl_voa.py --check-720p   # 额外校验 720p 是否可访问
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

RSS_URL = "https://learningenglish.voanews.com/podcast/video.aspx?zoneId=6042"

# 输出到 english/playlist.json（相对于本脚本：scripts/ -> english/）
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "playlist.json"

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0 Safari/537.36"
)

# 标题尾部形如 " - April 27, 2025" 的日期后缀，展示时去掉
TITLE_DATE_SUFFIX = re.compile(r"\s*-\s*[A-Z][a-z]+\s+\d{1,2},\s+\d{4}\s*$")


def fetch(url: str, timeout: int = 30) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def to_720p(url: str) -> str:
    """把 360p 基础地址转成 720p 地址。"""
    return re.sub(r"\.mp4(\?)", r"_720p.mp4\1", url)


def parse_pubdate(text: str) -> str:
    """RFC822 日期 -> YYYY-MM-DD（UTC 本地化后取日期）。"""
    text = (text or "").strip()
    if not text:
        return ""
    try:
        dt = parsedate_to_datetime(text)
    except (TypeError, ValueError):
        return ""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.date().isoformat()


def parse_items(xml_bytes: bytes) -> list[dict]:
    root = ET.fromstring(xml_bytes)
    items: list[dict] = []

    for item in root.iter("item"):
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        date = parse_pubdate(item.findtext("pubDate") or "")

        enclosure = item.find("enclosure")
        url360 = enclosure.get("url", "").strip() if enclosure is not None else ""
        if not url360:
            # 没有可播放地址，跳过
            continue

        items.append(
            {
                "title": TITLE_DATE_SUFFIX.sub("", title).strip(),
                "date": date,
                "articleUrl": link,
                "url720": to_720p(url360),
                "url360": url360,
            }
        )

    return items


def dedupe(items: list[dict]) -> list[dict]:
    seen: set[str] = set()
    result: list[dict] = []
    for it in items:
        key = it["articleUrl"] or it["url360"]
        if key in seen:
            continue
        seen.add(key)
        result.append(it)
    return result


def check_url(url: str, timeout: int = 15) -> bool:
    req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return 200 <= resp.status < 400
    except Exception:
        return False


def main() -> int:
    parser = argparse.ArgumentParser(description="抓取 VOA How to Pronounce 全部视频")
    parser.add_argument(
        "--check-720p",
        action="store_true",
        help="逐个 HEAD 校验 720p 地址，不可用时降级为 360p",
    )
    parser.add_argument("--out", default=str(OUTPUT_PATH), help="输出文件路径")
    args = parser.parse_args()

    print(f"[1/4] 拉取 RSS: {RSS_URL}")
    xml_bytes = fetch(RSS_URL)
    print(f"      收到 {len(xml_bytes)} 字节")

    print("[2/4] 解析剧集")
    items = dedupe(parse_items(xml_bytes))
    print(f"      解析到 {len(items)} 集（去重后）")

    if args.check_720p:
        print("[3/4] 校验 720p 可用性（可能较慢）")
        ok = 0
        for i, it in enumerate(items, 1):
            if check_url(it["url720"]):
                ok += 1
            else:
                it["url720"] = it["url360"]  # 降级
                print(f"      ! 720p 不可用，降级 360p: {it['title']}")
            if i % 25 == 0:
                print(f"      进度 {i}/{len(items)}")
        print(f"      720p 可用 {ok}/{len(items)}")
    else:
        print("[3/4] 跳过 720p 校验（默认信任推导结果）")

    # 升序：按日期，其次按标题
    items.sort(key=lambda x: (x["date"], x["title"]))

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(
        json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # 同时写一份 playlist.js（挂到全局），使 index.html 可直接用 file:// 打开
    js_path = out_path.with_suffix(".js")
    js_path.write_text(
        "window.VOA_PLAYLIST = "
        + json.dumps(items, ensure_ascii=False)
        + ";\n",
        encoding="utf-8",
    )

    print(f"[4/4] 已写出 {len(items)} 集 -> {out_path}")
    print(f"      同时写出 -> {js_path}")
    if items:
        print(f"      最早: {items[0]['date']}  {items[0]['title']}")
        print(f"      最新: {items[-1]['date']}  {items[-1]['title']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
