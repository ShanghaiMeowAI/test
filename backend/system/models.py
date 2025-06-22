from django.db import models
from django.contrib.auth.models import User

class SystemSettings(models.Model):
    """系统设置"""
    # 基本设置
    site_name = models.CharField(max_length=100, default='Odoo SaaS 管理平台', verbose_name='站点名称')
    site_description = models.TextField(default='用于管理 Odoo SaaS 部署的管理平台', verbose_name='站点描述')
    admin_email = models.EmailField(verbose_name='管理员邮箱')
    
    # 系统设置
    maintenance_mode = models.BooleanField(default=False, verbose_name='维护模式')
    max_upload_size = models.IntegerField(default=50, verbose_name='最大上传大小(MB)')
    session_timeout = models.IntegerField(default=1440, verbose_name='会话超时时间(分钟)')
    
    # 备份设置
    backup_enabled = models.BooleanField(default=True, verbose_name='启用自动备份')
    backup_frequency = models.CharField(
        max_length=10, 
        choices=[
            ('daily', '每日'),
            ('weekly', '每周'),
            ('monthly', '每月')
        ],
        default='daily',
        verbose_name='备份频率'
    )
    
    # 日志设置
    log_retention_days = models.IntegerField(default=90, verbose_name='日志保留天数')
    
    # 邮件设置
    email_notifications = models.BooleanField(default=False, verbose_name='启用邮件通知')
    smtp_host = models.CharField(max_length=100, blank=True, verbose_name='SMTP服务器')
    smtp_port = models.IntegerField(default=587, verbose_name='SMTP端口')
    smtp_use_tls = models.BooleanField(default=True, verbose_name='使用TLS加密')
    smtp_username = models.CharField(max_length=100, blank=True, verbose_name='SMTP用户名')
    smtp_password = models.CharField(max_length=100, blank=True, verbose_name='SMTP密码')
    
    # 元数据
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    updated_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name='更新人'
    )

    class Meta:
        verbose_name = '系统设置'
        verbose_name_plural = '系统设置'

    def __str__(self):
        return f"系统设置 - {self.site_name}"

    @classmethod
    def get_settings(cls):
        """获取系统设置（单例模式）"""
        settings, created = cls.objects.get_or_create(
            pk=1,
            defaults={
                'admin_email': 'admin@example.com'
            }
        )
        return settings
