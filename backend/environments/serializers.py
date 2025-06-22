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
            # 基础信息
            'id', 'customer', 'customer_name',
            
            # 基础配置
            'release_name', 'namespace', 'domain',
            
            # Odoo基础配置
            'admin_password', 'odoo_version', 'workers', 'log_level',
            
            # Git配置
            'git_ssh_secret', 'git_odoo_repository', 'git_odoo_ref', 'git_customer_addons',
            
            # 存储配置
            'storage_class', 'storage_size', 'storage_auto_expand', 
            'storage_expand_threshold', 'storage_expand_size', 'storage_max_size',
            
            # 数据库配置
            'db_enabled', 'db_version', 'db_instances', 'db_storage_size',
            'db_cpu_request', 'db_memory_request', 'db_cpu_limit', 'db_memory_limit',
            
            # 外部数据库配置
            'external_db_enabled', 'external_db_host', 'external_db_port',
            'external_db_name', 'external_db_user',
            
            # 网络配置
            'ingress_enabled', 'ingress_class', 'ingress_path',
            'tls_enabled', 'tls_secret_name',
            
            # 资源配置
            'cpu_request', 'memory_request', 'cpu_limit', 'memory_limit',
            
            # 高级Odoo配置
            'limit_request', 'limit_memory_hard', 'limit_memory_soft',
            'proxy_mode', 'list_db', 'db_filter',
            
            # 状态信息
            'status', 'last_health_check', 'deployed_at', 'created_at', 'updated_at',
            'is_running', 'access_url', 'helm_values'
        ]
        read_only_fields = ['created_at', 'updated_at', 'last_health_check', 'deployed_at', 'helm_values']

    def validate_release_name(self, value):
        """验证Release名称格式"""
        if not value.replace('-', '').isalnum():
            raise serializers.ValidationError("Release名称只能包含字母、数字和横线")
        return value
    
    def validate_git_customer_addons(self, value):
        """验证Git仓库配置"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Git仓库配置必须是数组格式")
        
        for addon in value:
            if not isinstance(addon, dict):
                raise serializers.ValidationError("每个Git仓库配置必须包含name、repository、ref字段")
            
            required_fields = ['name', 'repository', 'ref']
            for field in required_fields:
                if field not in addon or not addon[field]:
                    raise serializers.ValidationError(f"Git仓库配置缺少必需字段: {field}")
        
        return value
    
    def validate(self, data):
        """整体验证"""
        # 如果启用外部数据库，必须提供相关配置
        if data.get('external_db_enabled'):
            required_fields = ['external_db_host', 'external_db_name', 'external_db_user']
            for field in required_fields:
                if not data.get(field):
                    raise serializers.ValidationError(f"启用外部数据库时，{field}字段不能为空")
        
        # 如果启用TLS，在启用Ingress时必须提供证书Secret名称
        if data.get('tls_enabled') and data.get('ingress_enabled'):
            if not data.get('tls_secret_name'):
                raise serializers.ValidationError("启用TLS时必须提供证书Secret名称")
        
        return data

class EnvironmentCreateSerializer(EnvironmentSerializer):
    """创建环境时的序列化器"""
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        environment = super().create(validated_data)
        
        # 生成完整的Helm Values配置
        environment.generate_helm_values()
        environment.save()
        
        return environment

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
