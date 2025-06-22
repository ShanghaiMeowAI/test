from rest_framework import serializers
from .models import SystemSettings

class SystemSettingsSerializer(serializers.ModelSerializer):
    updated_by_name = serializers.CharField(source='updated_by.username', read_only=True)
    
    class Meta:
        model = SystemSettings
        fields = [
            'id', 'site_name', 'site_description', 'admin_email',
            'maintenance_mode', 'max_upload_size', 'session_timeout',
            'backup_enabled', 'backup_frequency', 'log_retention_days',
            'email_notifications', 'smtp_host', 'smtp_port', 'smtp_use_tls',
            'smtp_username', 'smtp_password', 'updated_at', 'updated_by_name'
        ]
        read_only_fields = ['updated_at', 'updated_by_name']

class SystemSettingsUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = [
            'site_name', 'site_description', 'admin_email',
            'maintenance_mode', 'max_upload_size', 'session_timeout',
            'backup_enabled', 'backup_frequency', 'log_retention_days',
            'email_notifications', 'smtp_host', 'smtp_port', 'smtp_use_tls',
            'smtp_username', 'smtp_password'
        ]

    def update(self, instance, validated_data):
        # 设置更新人
        validated_data['updated_by'] = self.context['request'].user
        return super().update(instance, validated_data) 