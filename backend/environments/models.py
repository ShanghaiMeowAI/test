from django.db import models
from django.contrib.auth.models import User
from customers.models import Customer

class Environment(models.Model):
    STATUS_CHOICES = [
        ('running', '运行中'),
        ('stopped', '已停止'),
        ('error', '错误'),
        ('pending', '部署中'),
        ('unknown', '未知'),
    ]
    
    # 关联信息
    customer = models.ForeignKey(
        Customer, 
        on_delete=models.CASCADE, 
        related_name='environments',
        verbose_name='客户'
    )
    
    # Kubernetes信息
    release_name = models.CharField(max_length=100, verbose_name='Release名称')
    namespace = models.CharField(max_length=50, default='odoo', verbose_name='命名空间')
    domain = models.CharField(max_length=200, verbose_name='访问域名')
    
    # Odoo配置
    admin_password = models.CharField(max_length=100, verbose_name='管理员密码')
    odoo_version = models.CharField(max_length=20, default='18.0', verbose_name='Odoo版本')
    
    # Git配置
    git_repositories = models.JSONField(default=list, verbose_name='Git仓库配置')
    
    # 资源配置
    cpu_limit = models.CharField(max_length=20, default='1000m', verbose_name='CPU限制')
    memory_limit = models.CharField(max_length=20, default='2Gi', verbose_name='内存限制')
    storage_size = models.CharField(max_length=20, default='10Gi', verbose_name='存储大小')
    
    # 状态信息
    status = models.CharField(
        max_length=10, 
        choices=STATUS_CHOICES, 
        default='pending',
        verbose_name='运行状态'
    )
    last_health_check = models.DateTimeField(blank=True, null=True, verbose_name='最后健康检查')
    
    # 部署信息
    helm_values = models.JSONField(default=dict, verbose_name='Helm Values配置')
    deployed_at = models.DateTimeField(blank=True, null=True, verbose_name='部署时间')
    
    # 元数据
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True,
        verbose_name='创建人'
    )

    class Meta:
        verbose_name = '环境'
        verbose_name_plural = '环境管理'
        ordering = ['-created_at']
        unique_together = ['release_name', 'namespace']

    def __str__(self):
        return f"{self.customer.name} - {self.release_name}"

    @property
    def is_running(self):
        return self.status == 'running'

    @property
    def access_url(self):
        protocol = 'https' if self.domain else 'http'
        return f"{protocol}://{self.domain}" if self.domain else None

class EnvironmentLog(models.Model):
    """环境操作日志"""
    LOG_TYPES = [
        ('deploy', '部署'),
        ('start', '启动'),
        ('stop', '停止'),
        ('update', '更新'),
        ('delete', '删除'),
        ('health_check', '健康检查'),
    ]
    
    environment = models.ForeignKey(
        Environment, 
        on_delete=models.CASCADE, 
        related_name='logs',
        verbose_name='环境'
    )
    log_type = models.CharField(max_length=20, choices=LOG_TYPES, verbose_name='操作类型')
    message = models.TextField(verbose_name='日志信息')
    status = models.CharField(max_length=20, verbose_name='操作状态')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True,
        verbose_name='操作人'
    )

    class Meta:
        verbose_name = '环境日志'
        verbose_name_plural = '环境日志'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.environment.release_name} - {self.get_log_type_display()}"
