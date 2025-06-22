from django.contrib import admin
from .models import Environment, EnvironmentLog

@admin.register(Environment)
class EnvironmentAdmin(admin.ModelAdmin):
    list_display = ['release_name', 'customer', 'domain', 'status', 'created_at']
    list_filter = ['status', 'namespace', 'created_at']
    search_fields = ['release_name', 'customer__name', 'domain']
    readonly_fields = ['created_at', 'updated_at', 'last_health_check']
    fieldsets = (
        ('基本信息', {
            'fields': ('customer', 'release_name', 'namespace', 'domain')
        }),
        ('Odoo配置', {
            'fields': ('admin_password', 'odoo_version')
        }),
        ('资源配置', {
            'fields': ('cpu_limit', 'memory_limit', 'storage_size')
        }),
        ('状态信息', {
            'fields': ('status', 'last_health_check', 'deployed_at')
        }),
        ('元数据', {
            'fields': ('created_by', 'created_at', 'updated_at')
        }),
    )

@admin.register(EnvironmentLog)
class EnvironmentLogAdmin(admin.ModelAdmin):
    list_display = ['environment', 'log_type', 'status', 'created_at', 'created_by']
    list_filter = ['log_type', 'status', 'created_at']
    search_fields = ['environment__release_name', 'message']
    readonly_fields = ['created_at']
