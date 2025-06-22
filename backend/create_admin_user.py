#!/usr/bin/env python
"""
创建管理员用户脚本
运行命令：python manage.py shell < create_admin_user.py
"""
import os
import django

# 配置Django环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from users.models import UserProfile

# 创建超级用户
username = 'admin'
email = 'admin@example.com'
password = 'admin123'

if not User.objects.filter(username=username).exists():
    user = User.objects.create_superuser(username=username, email=email, password=password)
    
    # 创建用户资料
    profile, created = UserProfile.objects.get_or_create(
        user=user,
        defaults={
            'role': 'admin',
            'department': '技术部',
            'position': '系统管理员',
            'can_manage_customers': True,
            'can_manage_environments': True,
            'can_view_logs': True,
            'can_generate_licenses': True,
        }
    )
    
    print(f"管理员用户创建成功: {username}")
    print(f"密码: {password}")
else:
    print(f"用户 {username} 已存在")