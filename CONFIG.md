# 环境配置说明

## 概述
项目已使用环境变量配置，支持.env文件和容器化部署（如ConfigMap）。

## 本地开发

### 1. 配置文件
复制模板文件：
```bash
cp .env.example .env
```

### 2. 修改配置
编辑 `.env` 文件，设置你的具体配置：

```bash
# 数据库配置
DB_HOST=your_database_host
DB_PASSWORD=your_password
# ... 其他配置
```

### 3. 启动服务
```bash
# 后端
cd backend
source ../backend_env/bin/activate
python3 manage.py runserver

# 前端
cd frontend
npm start
```

## 容器化部署

### Docker环境变量
```bash
docker run -e DB_HOST=postgres -e DB_PASSWORD=secret ...
```

### Kubernetes ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  DEBUG: "False"
  DB_HOST: "postgres-service"
  DB_NAME: "odoo_saas_management"
  # ... 其他配置
```

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    environment:
      - DEBUG=False
      - DB_HOST=postgres
      - DB_PASSWORD=${DB_PASSWORD}
    env_file:
      - .env
```

## 配置项说明

| 环境变量 | 说明 | 默认值 | 示例 |
|---------|------|-------|------|
| DEBUG | 调试模式 | False | True/False |
| SECRET_KEY | Django密钥 | 无 | your-secret-key |
| DB_HOST | 数据库主机 | 无 | localhost |
| DB_PORT | 数据库端口 | 无 | 5432 |
| DB_NAME | 数据库名 | 无 | odoo_saas_management |
| API_PAGE_SIZE | API分页大小 | 50 | 100 |

## 安全注意事项
- 永远不要提交包含敏感信息的.env文件
- 生产环境使用强密码和随机SECRET_KEY
- 限制ALLOWED_HOSTS到实际域名
