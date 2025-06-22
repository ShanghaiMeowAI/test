from django.contrib import admin
from .models import License, LicenseUsage, LicenseLog

@admin.register(License)
class LicenseAdmin(admin.ModelAdmin):
    list_display = [
        'license_key', 'customer', 'license_type', 'status', 
        'valid_from', 'valid_until', 'days_remaining', 'created_by'
    ]
    list_filter = ['license_type', 'status', 'issued_at']
    search_fields = ['license_key', 'customer__name', 'deployment_domain']
    readonly_fields = ['license_key', 'issued_at', 'activated_at', 'last_check']
    
    fieldsets = (
        ('基本信息', {
            'fields': ('license_key', 'license_type', 'customer', 'status')
        }),
        ('授权限制', {
            'fields': ('max_users', 'max_companies', 'max_storage_gb', 'modules_enabled')
        }),
        ('时间设置', {
            'fields': ('valid_from', 'valid_until', 'issued_at', 'activated_at', 'last_check')
        }),
        ('部署信息', {
            'fields': ('hardware_fingerprint', 'deployment_domain', 'deployment_ip'),
            'classes': ('collapse',)
        }),
        ('其他信息', {
            'fields': ('created_by', 'notes'),
            'classes': ('collapse',)
        }),
    )

@admin.register(LicenseUsage)
class LicenseUsageAdmin(admin.ModelAdmin):
    list_display = [
        'license', 'current_users', 'current_companies', 
        'current_storage_gb', 'access_ip', 'checked_at'
    ]
    list_filter = ['checked_at']
    search_fields = ['license__license_key', 'access_ip']
    readonly_fields = ['checked_at']

@admin.register(LicenseLog)
class LicenseLogAdmin(admin.ModelAdmin):
    list_display = [
        'license', 'action', 'message', 'ip_address', 'created_at', 'created_by'
    ]
    list_filter = ['action', 'created_at']
    search_fields = ['license__license_key', 'message', 'ip_address']
    readonly_fields = ['created_at']
