#!/usr/bin/env python
"""
创建管理员用户脚本
运行命令：python manage.py shell < create_admin_user.py
"""
import os
import sys
import django

# 设置Django环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from users.models import UserProfile

def create_admin_user():
    username = 'admin'
    email = 'admin@example.com'
    password = 'admin123'
    
    # 检查用户是否已存在
    if User.objects.filter(username=username).exists():
        print(f"用户 {username} 已存在")
        user = User.objects.get(username=username)
    else:
        # 创建超级用户
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            first_name='管理员',
            last_name='用户'
        )
        print(f"已创建超级用户: {username}")
    
    # 创建或更新用户资料
    profile, created = UserProfile.objects.get_or_create(
        user=user,
        defaults={
            'role': 'admin',
            'phone': '13800138000',
            'department': '技术部',
            'position': '系统管理员',
            'can_manage_customers': True,
            'can_manage_environments': True,
            'can_view_logs': True,
            'can_generate_licenses': True
        }
    )
    
    if created:
        print(f"已创建用户资料: {profile}")
    else:
        # 更新权限
        profile.role = 'admin'
        profile.can_manage_customers = True
        profile.can_manage_environments = True
        profile.can_view_logs = True
        profile.can_generate_licenses = True
        profile.save()
        print(f"已更新用户资料: {profile}")
    
    print(f"用户名: {username}")
    print(f"密码: {password}")
    print(f"邮箱: {email}")

if __name__ == '__main__':
    create_admin_user()