from django.db import models
from django.contrib.auth.models import User
from customers.models import Customer
import uuid
import hashlib
from datetime import datetime, timedelta

class License(models.Model):
    """授权码"""
    STATUS_CHOICES = [
        ('active', '有效'),
        ('expired', '已过期'),
        ('revoked', '已撤销'),
        ('pending', '待激活'),
    ]
    
    TYPE_CHOICES = [
        ('trial', '试用版'),
        ('standard', '标准版'),
        ('professional', '专业版'),
        ('enterprise', '企业版'),
    ]
    
    # 基本信息
    license_key = models.CharField(max_length=200, unique=True, verbose_name='授权码')
    license_type = models.CharField(
        max_length=20, 
        choices=TYPE_CHOICES, 
        default='standard',
        verbose_name='授权类型'
    )
    
    # 关联信息
    customer = models.ForeignKey(
        Customer, 
        on_delete=models.CASCADE, 
        related_name='licenses',
        verbose_name='客户'
    )
    
    # 授权限制
    max_users = models.IntegerField(default=10, verbose_name='最大用户数')
    max_companies = models.IntegerField(default=1, verbose_name='最大公司数')
    max_storage_gb = models.IntegerField(default=10, verbose_name='最大存储GB')
    
    # 功能模块
    modules_enabled = models.JSONField(default=list, verbose_name='启用的模块')
    
    # 时间限制
    issued_at = models.DateTimeField(auto_now_add=True, verbose_name='签发时间')
    valid_from = models.DateTimeField(verbose_name='生效时间')
    valid_until = models.DateTimeField(verbose_name='到期时间')
    
    # 状态和元数据
    status = models.CharField(
        max_length=10, 
        choices=STATUS_CHOICES, 
        default='pending',
        verbose_name='状态'
    )
    activated_at = models.DateTimeField(blank=True, null=True, verbose_name='激活时间')
    last_check = models.DateTimeField(blank=True, null=True, verbose_name='最后检查时间')
    
    # 硬件指纹
    hardware_fingerprint = models.CharField(
        max_length=100, 
        blank=True, 
        verbose_name='硬件指纹'
    )
    
    # 部署信息
    deployment_domain = models.CharField(
        max_length=200, 
        blank=True, 
        verbose_name='部署域名'
    )
    deployment_ip = models.GenericIPAddressField(
        blank=True, 
        null=True, 
        verbose_name='部署IP'
    )
    
    # 创建信息
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True,
        verbose_name='创建人'
    )
    notes = models.TextField(blank=True, verbose_name='备注')

    class Meta:
        verbose_name = '授权码'
        verbose_name_plural = '授权码管理'
        ordering = ['-issued_at']

    def __str__(self):
        return f"{self.customer.name} - {self.license_key}"

    def save(self, *args, **kwargs):
        if not self.license_key:
            self.license_key = self.generate_license_key()
        super().save(*args, **kwargs)

    def generate_license_key(self):
        """生成授权码"""
        # 基于客户信息和时间戳生成唯一授权码
        data = f"{self.customer.id}-{self.customer.name}-{datetime.now().isoformat()}"
        hash_object = hashlib.sha256(data.encode())
        license_hash = hash_object.hexdigest()[:32]
        
        # 格式化为XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX
        formatted_key = '-'.join([license_hash[i:i+4] for i in range(0, 32, 4)])
        return formatted_key.upper()

    @property
    def is_valid(self):
        """检查授权码是否有效"""
        from django.utils import timezone
        now = timezone.now()
        return (
            self.status == 'active' and
            self.valid_from <= now <= self.valid_until
        )

    @property
    def days_remaining(self):
        """剩余天数"""
        if self.status != 'active':
            return 0
        from django.utils import timezone
        now = timezone.now()
        if now > self.valid_until:
            return 0
        return (self.valid_until - now).days

    def activate(self, hardware_fingerprint=None, deployment_domain=None, deployment_ip=None):
        """激活授权码"""
        from django.utils import timezone
        self.status = 'active'
        self.activated_at = timezone.now()
        if hardware_fingerprint:
            self.hardware_fingerprint = hardware_fingerprint
        if deployment_domain:
            self.deployment_domain = deployment_domain
        if deployment_ip:
            self.deployment_ip = deployment_ip
        self.save()

    def revoke(self):
        """撤销授权码"""
        self.status = 'revoked'
        self.save()

class LicenseUsage(models.Model):
    """授权码使用记录"""
    license = models.ForeignKey(
        License, 
        on_delete=models.CASCADE, 
        related_name='usage_records',
        verbose_name='授权码'
    )
    
    # 使用统计
    current_users = models.IntegerField(default=0, verbose_name='当前用户数')
    current_companies = models.IntegerField(default=0, verbose_name='当前公司数')
    current_storage_gb = models.FloatField(default=0, verbose_name='当前存储GB')
    
    # 访问信息
    access_ip = models.GenericIPAddressField(verbose_name='访问IP')
    user_agent = models.TextField(blank=True, verbose_name='用户代理')
    
    # 时间戳
    checked_at = models.DateTimeField(auto_now_add=True, verbose_name='检查时间')

    class Meta:
        verbose_name = '授权使用记录'
        verbose_name_plural = '授权使用记录'
        ordering = ['-checked_at']

    def __str__(self):
        return f"{self.license.license_key} - {self.checked_at}"

class LicenseLog(models.Model):
    """授权码操作日志"""
    ACTION_CHOICES = [
        ('generate', '生成'),
        ('activate', '激活'),
        ('revoke', '撤销'),
        ('check', '检查'),
        ('expire', '过期'),
    ]
    
    license = models.ForeignKey(
        License, 
        on_delete=models.CASCADE, 
        related_name='logs',
        verbose_name='授权码'
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES, verbose_name='操作类型')
    message = models.TextField(verbose_name='操作信息')
    ip_address = models.GenericIPAddressField(blank=True, null=True, verbose_name='IP地址')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='操作时间')
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True,
        verbose_name='操作人'
    )

    class Meta:
        verbose_name = '授权操作日志'
        verbose_name_plural = '授权操作日志'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.license.license_key} - {self.get_action_display()}"
