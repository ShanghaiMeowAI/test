#!/bin/bash

echo "🔐 测试 Odoo SaaS 登录认证系统"
echo "================================"

# 测试登录API
echo "1. 测试管理员登录..."
RESPONSE=$(curl -s -X POST http://127.0.0.1:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

if echo "$RESPONSE" | grep -q "token"; then
  echo "✅ 管理员登录成功"
  TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  echo "   Token: ${TOKEN:0:20}..."
else
  echo "❌ 管理员登录失败"
  echo "   响应: $RESPONSE"
  exit 1
fi

echo ""
echo "2. 测试Token访问受保护API..."
STATS=$(curl -s -H "Authorization: Token $TOKEN" \
  http://127.0.0.1:8000/api/customers/stats/)

if echo "$STATS" | grep -q "total_customers"; then
  echo "✅ Token认证成功，API可访问"
  echo "   客户统计: $(echo "$STATS" | grep -o '"total_customers":[0-9]*' | cut -d':' -f2) 个客户"
else
  echo "❌ Token认证失败"
  echo "   响应: $STATS"
fi

echo ""
echo "3. 测试运维员登录..."
RESPONSE2=$(curl -s -X POST http://127.0.0.1:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"operator","password":"operator123"}')

if echo "$RESPONSE2" | grep -q "token"; then
  echo "✅ 运维员登录成功"
  ROLE=$(echo "$RESPONSE2" | grep -o '"role":"[^"]*"' | cut -d'"' -f4)
  echo "   角色: $ROLE"
else
  echo "❌ 运维员登录失败"
fi

echo ""
echo "4. 测试错误凭据..."
ERROR_RESPONSE=$(curl -s -X POST http://127.0.0.1:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"wrong","password":"wrong"}')

if echo "$ERROR_RESPONSE" | grep -q "error"; then
  echo "✅ 错误凭据正确被拒绝"
else
  echo "❌ 错误凭据处理异常"
fi

echo ""
echo "🎉 认证系统测试完成！"
echo "💡 请在浏览器中访问 http://localhost:3000 进行登录测试"
