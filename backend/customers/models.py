from django.db import models
from django.contrib.auth.models import User

class Customer(models.Model):
    DEPLOYMENT_TYPES = [
        ('online', '在线部署'),
        ('offline', '离线部署'),
    ]
    
    STATUS_CHOICES = [
        ('active', '活跃'),
        ('suspended', '暂停'),
        ('expired', '已过期'),
        ('trial', '试用'),
    ]
    
    # 基本信息
    customer_id = models.CharField(max_length=50, unique=True, verbose_name='客户ID')
    name = models.CharField(max_length=100, verbose_name='客户名称')
    company = models.CharField(max_length=200, blank=True, verbose_name='公司名称')
    contact_email = models.EmailField(verbose_name='联系邮箱')
    contact_phone = models.CharField(max_length=20, blank=True, verbose_name='联系电话')
    
    # 部署信息
    deployment_type = models.CharField(
        max_length=10, 
        choices=DEPLOYMENT_TYPES, 
        default='online',
        verbose_name='部署类型'
    )
    status = models.CharField(
        max_length=10, 
        choices=STATUS_CHOICES, 
        default='trial',
        verbose_name='客户状态'
    )
    
    # 时间信息
    contract_start_date = models.DateField(blank=True, null=True, verbose_name='合同开始日期')
    contract_end_date = models.DateField(blank=True, null=True, verbose_name='合同结束日期')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    
    # 业务信息
    notes = models.TextField(blank=True, verbose_name='备注')
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name='创建人'
    )

    class Meta:
        verbose_name = '客户'
        verbose_name_plural = '客户管理'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.customer_id})"

    @property
    def is_active(self):
        return self.status == 'active'

    @property
    def environments_count(self):
        return self.environments.count()

class LicenseKey(models.Model):
    """离线授权码管理"""
    customer = models.ForeignKey(
        Customer, 
        on_delete=models.CASCADE, 
        related_name='license_keys',
        verbose_name='客户'
    )
    license_code = models.CharField(max_length=500, unique=True, verbose_name='授权码')
    expire_date = models.DateField(verbose_name='过期日期')
    is_active = models.BooleanField(default=True, verbose_name='是否激活')
    usage_count = models.IntegerField(default=0, verbose_name='使用次数')
    max_usage = models.IntegerField(default=1, verbose_name='最大使用次数')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True,
        verbose_name='创建人'
    )

    class Meta:
        verbose_name = '授权码'
        verbose_name_plural = '授权码管理'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.customer.name} - {self.license_code[:20]}..."

    @property
    def is_valid(self):
        from django.utils import timezone
        return (
            self.is_active and 
            self.expire_date >= timezone.now().date() and
            self.usage_count < self.max_usage
        )
