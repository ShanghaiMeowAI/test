from rest_framework import serializers
from .models import Environment, EnvironmentLog
from customers.serializers import CustomerSerializer

class EnvironmentSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    is_running = serializers.ReadOnlyField()
    access_url = serializers.ReadOnlyField()
    
    class Meta:
        model = Environment
        fields = [
            'id', 'customer', 'customer_name', 'release_name', 'namespace', 'domain',
            'admin_password', 'odoo_version', 'cpu_limit', 'memory_limit', 'storage_size',
            'status', 'last_health_check', 'deployed_at', 'created_at', 'updated_at',
            'is_running', 'access_url'
        ]
        read_only_fields = ['created_at', 'updated_at', 'last_health_check', 'deployed_at']

    def validate_release_name(self, value):
        """验证Release名称格式"""
        if not value.replace('-', '').isalnum():
            raise serializers.ValidationError("Release名称只能包含字母、数字和横线")
        return value

class EnvironmentCreateSerializer(EnvironmentSerializer):
    """创建环境时的序列化器"""
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class EnvironmentLogSerializer(serializers.ModelSerializer):
    environment_name = serializers.CharField(source='environment.release_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = EnvironmentLog
        fields = [
            'id', 'environment', 'environment_name', 'log_type', 'message', 'status',
            'created_at', 'created_by', 'created_by_name'
        ]
        read_only_fields = ['created_at']

class EnvironmentDetailSerializer(EnvironmentSerializer):
    """环境详情序列化器，包含客户信息和操作日志"""
    customer_detail = CustomerSerializer(source='customer', read_only=True)
    logs = EnvironmentLogSerializer(many=True, read_only=True)
    
    class Meta(EnvironmentSerializer.Meta):
        fields = EnvironmentSerializer.Meta.fields + ['customer_detail', 'logs']
