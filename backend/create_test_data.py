#!/usr/bin/env python
import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone

# 设置Django环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from customers.models import Customer
from environments.models import Environment, EnvironmentLog
from users.models import UserProfile, UserActivityLog
from licenses.models import License, LicenseUsage, LicenseLog
from system.models import SystemSettings

def create_test_data():
    print("开始创建测试数据...")
    
    # 获取管理员用户
    admin_user = User.objects.get(username='admin')
    
    # 创建测试客户
    customers_data = [
        {
            'customer_id': 'CUST001',
            'name': '示例科技有限公司',
            'company': '示例科技',
            'contact_email': 'contact@example.com',
            'contact_phone': '13800138001',
            'deployment_type': 'online',
            'status': 'active',
            'notes': '重要客户，优先处理'
        },
        {
            'customer_id': 'CUST002',
            'name': '测试软件公司',
            'company': '测试软件',
            'contact_email': 'test@test.com',
            'contact_phone': '13800138002',
            'deployment_type': 'offline',
            'status': 'trial',
            'notes': '试用客户'
        },
        {
            'customer_id': 'CUST003',
            'name': '演示企业集团',
            'company': '演示企业',
            'contact_email': 'demo@demo.com',
            'contact_phone': '13800138003',
            'deployment_type': 'online',
            'status': 'expired',
            'notes': '合同已到期，需要续费'
        }
    ]
    
    created_customers = []
    for data in customers_data:
        customer, created = Customer.objects.get_or_create(
            customer_id=data['customer_id'],
            defaults=data
        )
        if created:
            print(f"创建客户: {customer.name}")
        created_customers.append(customer)
    
    # 创建测试环境
    environments_data = [
        {
            'customer': created_customers[0],
            'release_name': 'example-odoo',
            'namespace': 'odoo',
            'domain': 'example.odoo.demo.com',
            'admin_password': 'admin123',
            'odoo_version': '18.0',
            'status': 'running',
            'cpu_limit': '2000m',
            'memory_limit': '4Gi',
            'storage_size': '20Gi'
        },
        {
            'customer': created_customers[1],
            'release_name': 'test-odoo',
            'namespace': 'odoo',
            'domain': 'test.odoo.demo.com',
            'admin_password': 'test123',
            'odoo_version': '17.0',
            'status': 'stopped',
            'cpu_limit': '1000m',
            'memory_limit': '2Gi',
            'storage_size': '10Gi'
        }
    ]
    
    created_environments = []
    for data in environments_data:
        env, created = Environment.objects.get_or_create(
            release_name=data['release_name'],
            namespace=data['namespace'],
            defaults={**data, 'created_by': admin_user}
        )
        if created:
            print(f"创建环境: {env.release_name}")
        created_environments.append(env)
    
    # 创建测试授权码
    licenses_data = [
        {
            'customer': created_customers[1],  # 离线部署客户
            'license_type': 'standard',
            'max_users': 50,
            'max_companies': 3,
            'max_storage_gb': 100,
            'modules_enabled': ['sale', 'purchase', 'inventory', 'accounting'],
            'valid_from': timezone.now(),
            'valid_until': timezone.now() + timedelta(days=365),
            'status': 'active',
            'deployment_domain': 'test.company.com',
            'notes': '标准版授权码'
        },
        {
            'customer': created_customers[2],
            'license_type': 'trial',
            'max_users': 10,
            'max_companies': 1,
            'max_storage_gb': 10,
            'modules_enabled': ['sale', 'crm'],
            'valid_from': timezone.now() - timedelta(days=30),
            'valid_until': timezone.now() - timedelta(days=1),
            'status': 'expired',
            'notes': '试用版授权码（已过期）'
        }
    ]
    
    created_licenses = []
    for data in licenses_data:
        license_obj = License.objects.create(**data, created_by=admin_user)
        print(f"创建授权码: {license_obj.license_key[:20]}...")
        created_licenses.append(license_obj)
    
    # 创建测试操作日志
    activity_logs_data = [
        {
            'user': admin_user,
            'action': 'login',
            'description': '管理员登录系统',
            'ip_address': '127.0.0.1'
        },
        {
            'user': admin_user,
            'action': 'create_customer',
            'target_type': 'Customer',
            'target_id': str(created_customers[0].id),
            'description': f'创建客户: {created_customers[0].name}',
            'ip_address': '127.0.0.1'
        },
        {
            'user': admin_user,
            'action': 'deploy_environment',
            'target_type': 'Environment',
            'target_id': str(created_environments[0].id),
            'description': f'部署环境: {created_environments[0].release_name}',
            'ip_address': '127.0.0.1'
        },
        {
            'user': admin_user,
            'action': 'generate_license',
            'target_type': 'License',
            'target_id': str(created_licenses[0].id),
            'description': f'生成授权码: {created_licenses[0].license_key[:20]}...',
            'ip_address': '127.0.0.1'
        }
    ]
    
    for data in activity_logs_data:
        UserActivityLog.objects.create(**data, user_agent='Test Browser')
        print(f"创建操作日志: {data['action']}")
    
    # 创建系统设置
    settings = SystemSettings.get_settings()
    settings.admin_email = 'admin@example.com'
    settings.site_name = 'Odoo SaaS 管理平台'
    settings.site_description = '用于管理 Odoo SaaS 部署的综合管理平台'
    settings.updated_by = admin_user
    settings.save()
    print("已更新系统设置")
    
    print("测试数据创建完成！")
    print(f"客户数量: {Customer.objects.count()}")
    print(f"环境数量: {Environment.objects.count()}")
    print(f"授权码数量: {License.objects.count()}")
    print(f"操作日志数量: {UserActivityLog.objects.count()}")

if __name__ == '__main__':
    create_test_data()
