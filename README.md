# 简单聊天应用 - Simple Chat Application

一个简单易用的 AI 聊天应用，基于 DeepSeek API 和 Django + React 栈。

## 📋 项目结构

```
llm/
├── chat-react/          # React 前端
│   ├── public/          # 静态文件
│   ├── src/
│   │   ├── components/  # React 组件
│   │   ├── services/    # API 调用
│   │   └── App.tsx      # 主应用
│   └── package.json
│
└── chat-py/             # Django 后端
    ├── chat/            # Django 应用
    ├── chatproject/     # Django 项目配置
    ├── manage.py
    └── requirements.txt
```

## 🚀 快速开始

### 后端设置 (Django)

1. 安装依赖:
```bash
cd chat-py
pip install -r requirements.txt
```

2. 配置环境变量:
```bash
cp .env.example .env
# 编辑 .env，填入您的 DeepSeek API Key
```

3. 初始化数据库:
```bash
python manage.py migrate
```

4. 创建超级用户 (可选):
```bash
python manage.py createsuperuser
```

5. 运行服务器:
```bash
python manage.py runserver
```

后端将运行在 `http://localhost:8000`

### 前端设置 (React)

1. 安装依赖:
```bash
cd chat-react
npm install
```

2. 启动开发服务器:
```bash
npm start
```

前端将运行在 `http://localhost:3000`

## 🔌 API 端点

- `POST /api/chat/` - 发送聊天消息
- `GET /api/history/` - 获取聊天历史
- `POST /api/clear/` - 清除聊天历史
- `GET /api/health/` - 健康检查

## 🛠 技术栈

**前端:**
- React 18.2.0
- TypeScript 5.0.0
- Axios 1.6.0

**后端:**
- Django 4.2.8
- Django REST Framework 3.14.0
- OpenAI Python SDK 1.3.8
- SQLite (数据库)

**AI:**
- DeepSeek API (via OpenAI-compatible endpoint)

## 📝 环境变量

在 `chat-py/.env` 中配置:

```env
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
```

## 🎯 功能

✅ 实时聊天对话
✅ 对话历史保存
✅ 清除聊天历史
✅ DeepSeek AI 驱动
✅ 响应式设计
✅ 错误处理

## 🔐 安全提示

- 不要将 `.env` 文件提交到版本控制
- 生产环境中使用适当的 SECRET_KEY
- 配置正确的 ALLOWED_HOSTS
- 使用 HTTPS

## 📚 开发文档

### 消息结构

消息遵循标准格式:
```python
{
    "role": "user" | "assistant",
    "content": "消息内容"
}
```

### 添加新 API 端点

1. 在 `chat/views.py` 中创建视图
2. 在 `chat/urls.py` 中添加路由
3. 如需新模型，在 `chat/models.py` 中定义

## 🐛 故障排除

**后端连接失败:**
- 检查 `.env` 中的 API Key 是否正确
- 确保网络连接正常
- 检查 DeepSeek API 状态

**前端连接失败:**
- 确保后端运行在 `http://localhost:8000`
- 检查 CORS 配置
- 查看浏览器控制台中的错误信息

## 📄 许可证

MIT License

## 💡 下一步

- [ ] 用户认证系统
- [ ] 多个会话管理
- [ ] 消息搜索功能
- [ ] 导出聊天记录
- [ ] 主题切换
