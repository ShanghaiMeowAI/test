# Odoo SaaS 管理系统

一个基于 Django + React 的 Odoo SaaS 平台管理系统，支持多租户环境管理、客户管理、授权码管理等功能。

## 功能特性

### ✅ 已完成功能

- **🔐 用户认证系统**

  - 用户登录/登出
  - 基于角色的权限控制（管理员、运维员、查看员）
  - JWT Token 认证

- **📊 仪表盘**

  - 系统统计数据展示
  - 客户和环境状态概览
  - 系统健康状态监控

- **👥 客户管理**

  - 客户信息 CRUD 操作
  - 客户状态管理（活跃、暂停、过期、试用）
  - 部署类型管理（在线、离线）
  - 合同信息管理

- **🖥️ 环境管理**

  - Odoo 环境的创建、编辑、删除
  - 环境启动/停止操作
  - 健康检查功能
  - 环境状态监控
  - 资源配置管理

- **� 授权码管理**

  - 离线授权码生成
  - 授权码状态管理
  - 使用次数控制
  - 有效期管理

- **👤 用户管理**

  - 用户账号 CRUD 操作
  - 用户权限配置
  - 角色分配
  - 用户资料管理

- **📋 操作日志**

  - 环境操作日志记录
  - 用户活动日志
  - 系统审计功能

- **⚙️ 系统设置**
  - 系统基本参数配置
  - Kubernetes 集群配置
  - 功能开关管理
  - 系统状态监控

## 技术栈

### 后端

- **Django 4.2** - Web 框架
- **Django REST Framework** - API 框架
- **PostgreSQL** - 数据库
- **Redis** - 缓存和会话存储

### 前端

- **React 18** - 前端框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **React Router** - 路由管理
- **Axios** - HTTP 客户端

## 项目结构

```
.
├── backend/                 # Django后端
│   ├── backend/            # Django项目配置
│   ├── customers/          # 客户管理应用
│   ├── environments/       # 环境管理应用
│   ├── users/             # 用户管理应用
│   ├── manage.py          # Django管理脚本
│   └── requirements.txt   # Python依赖
├── frontend/              # React前端
│   ├── src/
│   │   ├── components/    # React组件
│   │   ├── pages/        # 页面组件
│   │   ├── services/     # API服务
│   │   ├── types/        # TypeScript类型
│   │   └── contexts/     # React上下文
│   ├── package.json      # Node.js依赖
│   └── tailwind.config.js # Tailwind配置
├── docs/                  # 文档
└── README.md             # 项目说明
```

## 快速开始

### 前置要求

- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Redis (可选)

### 1. 克隆项目

```bash
git clone <repository-url>
cd odoo-saas-management
```

### 2. 后端设置

```bash
# 进入后端目录
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置数据库
# 编辑 backend/settings.py 中的数据库配置

# 运行数据库迁移
python manage.py migrate

# 创建管理员用户
python manage.py shell < create_admin_user.py

# 启动后端服务
python manage.py runserver
```

### 3. 前端设置

```bash
# 打开新终端，进入前端目录
cd frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置API地址

# 启动前端服务
npm start
```

### 4. 访问系统

- 前端地址: http://localhost:3000
- 后端 API: http://localhost:8000/api
- Django 管理后台: http://localhost:8000/admin

默认管理员账号:

- 用户名: `admin`
- 密码: `admin123`

## 部署指南

### 生产环境部署

1. **数据库配置**

   - 使用 PostgreSQL 作为生产数据库
   - 配置 Redis 用于缓存和会话

2. **后端部署**

   - 使用 Gunicorn + Nginx
   - 配置静态文件服务
   - 设置环境变量

3. **前端部署**
   - 运行 `npm run build` 构建生产版本
   - 使用 Nginx 提供静态文件服务

## API 文档

主要 API 端点：

- `POST /api/login/` - 用户登录
- `POST /api/logout/` - 用户登出
- `GET /api/customers/` - 获取客户列表
- `GET /api/environments/` - 获取环境列表
- `POST /api/environments/{id}/start/` - 启动环境
- `POST /api/environments/{id}/stop/` - 停止环境
- `GET /api/license-keys/` - 获取授权码列表
- `GET /api/users/` - 获取用户列表
- `GET /api/environment-logs/` - 获取环境日志

## 权限说明

### 角色权限

- **管理员 (admin)**: 拥有所有权限
- **运维员 (operator)**: 可管理客户和环境，查看日志
- **查看员 (viewer)**: 只能查看数据，不能修改

### 功能权限

- `can_manage_customers`: 客户管理权限
- `can_manage_environments`: 环境管理权限
- `can_view_logs`: 日志查看权限
- `can_generate_licenses`: 授权码生成权限

## 开发指南

### 后端开发

- 遵循 Django 最佳实践
- 使用 Django REST Framework 构建 API
- 模型定义在各应用的 `models.py` 中
- API 视图在 `views.py` 中
- 序列化器在 `serializers.py` 中

### 前端开发

- 使用 TypeScript 确保类型安全
- 组件采用函数式组件 + Hooks
- 使用 Tailwind CSS 进行样式开发
- API 调用统一在 `services/api.ts` 中管理

## 故障排除

### 常见问题

1. **数据库连接错误**

   - 检查 PostgreSQL 服务是否启动
   - 验证数据库配置信息

2. **前端无法连接后端**

   - 检查后端服务是否启动
   - 验证 `.env` 文件中的 API 地址

3. **权限错误**
   - 确保用户有相应的权限
   - 检查用户角色配置

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证。详见 LICENSE 文件。

## 联系方式

如有问题或建议，请联系开发团队。
