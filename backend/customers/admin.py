from django.contrib import admin
from .models import Customer, LicenseKey

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['customer_id', 'name', 'company', 'deployment_type', 'status', 'created_at']
    list_filter = ['deployment_type', 'status', 'created_at']
    search_fields = ['customer_id', 'name', 'company', 'contact_email']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('基本信息', {
            'fields': ('customer_id', 'name', 'company', 'contact_email', 'contact_phone')
        }),
        ('部署信息', {
            'fields': ('deployment_type', 'status')
        }),
        ('合同信息', {
            'fields': ('contract_start_date', 'contract_end_date')
        }),
        ('其他信息', {
            'fields': ('notes', 'created_by', 'created_at', 'updated_at')
        }),
    )

@admin.register(LicenseKey)
class LicenseKeyAdmin(admin.ModelAdmin):
    list_display = ['customer', 'license_code_short', 'expire_date', 'is_active', 'usage_count', 'max_usage']
    list_filter = ['is_active', 'expire_date', 'created_at']
    search_fields = ['customer__name', 'license_code']
    readonly_fields = ['created_at']
    
    def license_code_short(self, obj):
        return f"{obj.license_code[:20]}..." if len(obj.license_code) > 20 else obj.license_code
    license_code_short.short_description = '授权码'
