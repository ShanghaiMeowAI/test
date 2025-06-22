from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, UserActivityLog

class UserProfileSerializer(serializers.ModelSerializer):
    display_name = serializers.ReadOnlyField()
    is_admin = serializers.ReadOnlyField()
    is_operator = serializers.ReadOnlyField()
    
    class Meta:
        model = UserProfile
        fields = [
            'role', 'phone', 'department', 'position',
            'can_manage_customers', 'can_manage_environments', 
            'can_view_logs', 'can_generate_licenses',
            'display_name', 'is_admin', 'is_operator'
        ]

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(source='userprofile', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_active', 'date_joined', 'last_login', 'profile'
        ]
        read_only_fields = ['date_joined', 'last_login']

class UserActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserActivityLog
        fields = [
            'id', 'user', 'user_name', 'action', 'target_type', 'target_id',
            'description', 'ip_address', 'created_at'
        ]
        read_only_fields = ['created_at']

class CurrentUserSerializer(UserSerializer):
    """当前登录用户的序列化器"""
    permissions = serializers.SerializerMethodField()
    
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['permissions']
    
    def get_permissions(self, obj):
        """获取用户权限"""
        if hasattr(obj, 'userprofile'):
            profile = obj.userprofile
            return {
                'can_manage_customers': profile.can_manage_customers,
                'can_manage_environments': profile.can_manage_environments,
                'can_view_logs': profile.can_view_logs,
                'can_generate_licenses': profile.can_generate_licenses,
                'is_admin': profile.is_admin,
                'is_operator': profile.is_operator
            }
        return {}
