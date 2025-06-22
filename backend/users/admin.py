from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile, UserActivityLog

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = '用户资料'

class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)

# 重新注册User admin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

@admin.register(UserActivityLog)
class UserActivityLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'target_type', 'target_id', 'created_at']
    list_filter = ['action', 'created_at']
    search_fields = ['user__username', 'description', 'target_id']
    readonly_fields = ['created_at']
