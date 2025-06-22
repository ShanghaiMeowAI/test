from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    """用户扩展信息"""
    ROLE_CHOICES = [
        ('admin', '管理员'),
        ('operator', '运维员'),
        ('viewer', '查看员'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name='用户')
    role = models.CharField(
        max_length=10, 
        choices=ROLE_CHOICES, 
        default='viewer',
        verbose_name='角色'
    )
    
    # 个人信息
    phone = models.CharField(max_length=20, blank=True, verbose_name='手机号')
    department = models.CharField(max_length=50, blank=True, verbose_name='部门')
    position = models.CharField(max_length=50, blank=True, verbose_name='职位')
    
    # 权限设置
    can_manage_customers = models.BooleanField(default=False, verbose_name='可管理客户')
    can_manage_environments = models.BooleanField(default=False, verbose_name='可管理环境')
    can_view_logs = models.BooleanField(default=True, verbose_name='可查看日志')
    can_generate_licenses = models.BooleanField(default=False, verbose_name='可生成授权码')
    
    # 元数据
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    class Meta:
        verbose_name = '用户资料'
        verbose_name_plural = '用户管理'

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"

    @property
    def is_admin(self):
        return self.role == 'admin'

    @property
    def is_operator(self):
        return self.role in ['admin', 'operator']

    @property
    def display_name(self):
        return self.user.get_full_name() or self.user.username

class UserActivityLog(models.Model):
    """用户操作日志"""
    ACTION_TYPES = [
        ('login', '登录'),
        ('logout', '登出'),
        ('create_customer', '创建客户'),
        ('update_customer', '更新客户'),
        ('delete_customer', '删除客户'),
        ('deploy_environment', '部署环境'),
        ('start_environment', '启动环境'),
        ('stop_environment', '停止环境'),
        ('generate_license', '生成授权码'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='用户')
    action = models.CharField(max_length=30, choices=ACTION_TYPES, verbose_name='操作类型')
    target_type = models.CharField(max_length=50, blank=True, verbose_name='目标类型')
    target_id = models.CharField(max_length=100, blank=True, verbose_name='目标ID')
    description = models.TextField(blank=True, verbose_name='操作描述')
    ip_address = models.GenericIPAddressField(blank=True, null=True, verbose_name='IP地址')
    user_agent = models.TextField(blank=True, verbose_name='用户代理')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='操作时间')

    class Meta:
        verbose_name = '操作日志'
        verbose_name_plural = '操作日志'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.get_action_display()}"
