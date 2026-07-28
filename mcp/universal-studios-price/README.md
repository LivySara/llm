# 北京环球影城价格 MCP Server

基于 Python + [FastMCP](https://github.com/modelcontextprotocol/python-sdk) 实现的 MCP 服务，
对外提供北京环球影城门票价格的查询与人工维护能力。

## 为什么是「人工维护」

北京环球影城**没有公开、稳定的实时报价 API**，价格波动受日期、档位、活动影响，
因此本项目采用**人工维护数据**模式：价格保存在 `data/prices.json`，
通过 MCP 工具读取 / 更新，保证在没有实时数据源时依然可用。

## 目录结构

```
universal-studios-price/
├── server.py            # MCP server 入口（FastMCP）
├── data/
│   └── prices.json      # 人工维护的价格数据（票种 + 价格日历）
├── requirements.txt     # 依赖
├── README.md
└── mcp-config.json      # 客户端接入配置示例
```

## 安装

```bash
pip install -r requirements.txt
```

## 运行

```bash
python server.py
```

默认以 stdio 方式启动。可被任意支持 MCP 的客户端连接（如 Claude Desktop、CodeBuddy 等）。

## 提供的工具（Tools）

### 查询类
| 工具 | 说明 |
|------|------|
| `get_all_prices()` | 获取全部门票价格清单 |
| `get_price_by_id(ticket_id)` | 按 id 查询某票种价格 |
| `get_price_by_date(date)` | 按日期查询单日票价格（含日历回退） |
| `search_prices(keyword)` | 关键词模糊搜索票种 |
| `get_maintenance_info()` | 查看数据维护说明与更新时间 |

### 维护类（人工更新数据）
| 工具 | 说明 |
|------|------|
| `update_price(ticket_id, price, desc?)` | 更新某票种价格 |
| `update_calendar(date, single, tier?, note?)` | 维护某天单日票价格 |

## 客户端接入示例（mcp-config.json）

将 `mcp-config.json` 中的内容合并到你的 MCP 客户端配置中即可，
注意把 `command` 改为本机 python 可执行文件路径。
