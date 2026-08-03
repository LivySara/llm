"""Phase 4 冒烟：验证 decompose（分层规划）与 summarize_dialogue（摘要压缩）。"""
import json
import sys
from config import DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, MODEL
from openai import OpenAI
from planner import decompose, summarize_dialogue

out = []
def log(*a):
    out.append(" ".join(str(x) for x in a))

client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=DEEPSEEK_BASE_URL)

# 1) 分层拆解：需求 + 空工具列表（仅验证递归结构）
q = "国庆带 2 大 1 小去北京环球影城玩两天，预算 3000，帮我规划并算总价"
nodes = decompose(client, q, [])
log("DECOMPOSE_OK, 顶层步骤数 =", len(nodes))
for n in nodes:
    log(" -", n["goal"], "-> 有子目标" if n.get("sub") else "(原子)")

# 2) 摘要压缩：把一段对话摘要化
text = json.dumps([
    {"role": "user", "content": "国庆 2 大 1 小两天，预算 3000"},
    {"role": "assistant", "content": "好的，我来规划"},
    {"role": "user", "content": "单日票多少钱"},
    {"role": "assistant", "content": "国庆 premium 单日票 748 元/人"},
], ensure_ascii=False)
summary = summarize_dialogue(client, text, "")
log("SUMMARY_OK, 摘要长度 =", len(summary))
log("摘要预览:", summary[:120])

with open("_smoke4.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(out))
