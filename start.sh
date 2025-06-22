#!/bin/bash

echo "�� 启动 Odoo SaaS 管理平台..."

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 激活Python虚拟环境并检查数据库连接
echo "🔧 检查后端配置..."
source backend_env/bin/activate

# 检查PostgreSQL连接
echo "📊 检查数据库连接..."
cd backend
python -c "
import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
from django.db import connection
try:
    with connection.cursor() as cursor:
        cursor.execute('SELECT 1')
    print('✅ PostgreSQL 连接成功')
except Exception as e:
    print('❌ PostgreSQL 连接失败:', str(e))
    print('请确保 PostgreSQL 已启动并创建了数据库: odoo_saas_management')
    exit(1)
"

cd ..

# 启动前后端
echo "🚀 同时启动前端和后端..."
npm run dev
