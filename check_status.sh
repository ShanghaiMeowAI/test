#!/bin/bash

echo "🔍 检查 Odoo SaaS 管理平台状态..."

# 检查前端
echo "📱 检查前端 (React)..."
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$FRONTEND" = "200" ]; then
    echo "✅ 前端正常运行: http://localhost:3000"
else
    echo "❌ 前端无法访问"
fi

# 检查后端API
echo "🚀 检查后端 API..."
BACKEND=$(curl -s http://127.0.0.1:8000/api/health/)
if [[ $BACKEND == *"healthy"* ]]; then
    echo "✅ 后端API正常运行: http://127.0.0.1:8000/api/health/"
    echo "   响应: $BACKEND"
else
    echo "❌ 后端API无法访问"
fi

# 检查Django Admin
echo "🔧 检查Django管理后台..."
ADMIN=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/admin/)
if [ "$ADMIN" = "200" ]; then
    echo "✅ Django管理后台正常: http://127.0.0.1:8000/admin/"
else
    echo "❌ Django管理后台无法访问"
fi

echo ""
echo "🎉 项目状态检查完成！"
echo "💡 现在可以开始开发核心功能了！"
