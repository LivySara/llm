# 多会话功能 - 后端迁移指南

## 新增功能
- 多会话管理（类似 ChatGPT 的左侧会话列表）
- 支持创建、切换、重命名、删除多个独立会话
- 每个会话维护独立的聊天上下文

## 后端迁移步骤

### 1. 进入后端目录
```bash
cd d:\out_of_work_arrange\practice-project\llm\py\chat-py
```

### 2. 激活虚拟环境（如未激活）
```bash
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 3. 安装/更新依赖（如需要）
```bash
pip install django djangorestframework django-cors-headers openai
```

### 4. 创建数据库迁移
```bash
python manage.py makemigrations chat
```

### 5. 执行迁移
```bash
python manage.py migrate
```

### 6. 启动后端服务
```bash
python manage.py runserver
```

后端将在 `http://localhost:8000` 启动

## API 端点更新

### 新增端点
| 方法 | 路径 | 功能 |
|------|------|------|
| GET | /api/conversations/ | 获取会话列表 |
| POST | /api/conversations/create/ | 创建新会话 |
| PATCH | /api/conversations/{id}/rename/ | 重命名会话 |
| DELETE | /api/conversations/{id}/delete/ | 删除会话 |
| GET | /api/conversations/{id}/messages/ | 获取指定会话消息 |

### 修改端点
- `POST /api/chat/stream/` - 新增 `conversation_id` 参数
- `POST /api/clear/` - 新增 `conversation_id` 参数

## 前端启动

```bash
cd d:\out_of_work_arrange\practice-project\llm\rt\chat-react
npm install
npm run dev
```

前端将在 `http://localhost:5173` 启动（Vite 默认端口）
