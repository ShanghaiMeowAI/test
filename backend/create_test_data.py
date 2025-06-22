import os
import django
import sys

# 设置Django环境
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from customers.models import Customer, LicenseKey
from environments.models import Environment, EnvironmentLog
from users.models import UserProfile
from datetime import date, datetime, timedelta

# 创建超级管理员用户
admin_user, created = User.objects.get_or_create(
    username='admin',
    defaults={
        'email': 'admin@example.com',
        'first_name': '管理员',
        'is_staff': True,
        'is_superuser': True
    }
)
if created:
    admin_user.set_password('admin123')
    admin_user.save()
    print("✅ 创建管理员用户: admin / admin123")

# 创建管理员用户资料
admin_profile, created = UserProfile.objects.get_or_create(
    user=admin_user,
    defaults={
        'role': 'admin',
        'department': 'IT部门',
        'position': '系统管理员',
        'can_manage_customers': True,
        'can_manage_environments': True,
        'can_view_logs': True,
        'can_generate_licenses': True
    }
)

# 创建运维员用户
operator_user, created = User.objects.get_or_create(
    username='operator',
    defaults={
        'email': 'operator@example.com',
        'first_name': '运维员',
        'is_staff': True
    }
)
if created:
    operator_user.set_password('operator123')
    operator_user.save()
    print("✅ 创建运维员用户: operator / operator123")

operator_profile, created = UserProfile.objects.get_or_create(
    user=operator_user,
    defaults={
        'role': 'operator',
        'department': '运维部门',
        'position': '运维工程师',
        'can_manage_customers': True,
        'can_manage_environments': True,
        'can_view_logs': True,
        'can_generate_licenses': False
    }
)

# 创建测试客户
customers_data = [
    {
        'customer_id': 'deezee',
        'name': '迪司科技',
        'company': '上海迪司信息科技有限公司',
        'contact_email': 'contact@deezee.com',
        'contact_phone': '021-12345678',
        'deployment_type': 'online',
        'status': 'active',
        'contract_start_date': date.today() - timedelta(days=30),
        'contract_end_date': date.today() + timedelta(days=335),
        'notes': '重要客户，提供电商解决方案'
    },
    {
        'customer_id': 'huabao',
        'name': '华宝集团',
        'company': '华宝集团有限公司',
        'contact_email': 'it@huabao.com',
        'contact_phone': '010-87654321',
        'deployment_type': 'offline',
        'status': 'active',
        'contract_start_date': date.today() - timedelta(days=60),
        'contract_end_date': date.today() + timedelta(days=305),
        'notes': '大型企业客户，使用离线部署'
    },
    {
        'customer_id': 'testcorp',
        'name': '测试公司',
        'company': '测试科技有限公司',
        'contact_email': 'test@testcorp.com',
        'deployment_type': 'online',
        'status': 'trial',
        'notes': '试用客户'
    }
]

for customer_data in customers_data:
    customer, created = Customer.objects.get_or_create(
        customer_id=customer_data['customer_id'],
        defaults={**customer_data, 'created_by': admin_user}
    )
    if created:
        print(f"✅ 创建客户: {customer.name}")

# 创建测试环境
environments_data = [
    {
        'customer_id': 'deezee',
        'release_name': 'deezee-webportal',
        'domain': 'webportal.erp.mmiao.net',
        'admin_password': '123456',
        'status': 'running'
    },
    {
        'customer_id': 'huabao',
        'release_name': 'huabao-erp',
        'domain': 'huabao.erp.mmiao.net',
        'admin_password': 'huabao123',
        'status': 'running'
    },
    {
        'customer_id': 'testcorp',
        'release_name': 'testcorp-trial',
        'domain': 'trial.erp.mmiao.net',
        'admin_password': 'trial123',
        'status': 'pending'
    }
]

for env_data in environments_data:
    customer = Customer.objects.get(customer_id=env_data['customer_id'])
    environment, created = Environment.objects.get_or_create(
        release_name=env_data['release_name'],
        defaults={
            'customer': customer,
            'domain': env_data['domain'],
            'admin_password': env_data['admin_password'],
            'status': env_data['status'],
            'created_by': admin_user,
            'git_repositories': [
                {
                    'name': f"{env_data['customer_id']}-modules",
                    'repository': f"git@github.com:example/{env_data['customer_id']}.git",
                    'ref': 'main'
                }
            ]
        }
    )
    if created:
        print(f"✅ 创建环境: {environment.release_name}")

print("\n🎉 测试数据创建完成！")
print("\n📊 数据统计:")
print(f"👥 客户数量: {Customer.objects.count()}")
print(f"🏗️ 环境数量: {Environment.objects.count()}")
print(f"👤 用户数量: {User.objects.count()}")
print(f"🔑 授权码数量: {LicenseKey.objects.count()}")
