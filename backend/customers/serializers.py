from rest_framework import serializers
from .models import Customer, LicenseKey

class CustomerSerializer(serializers.ModelSerializer):
    environments_count = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()
    
    class Meta:
        model = Customer
        fields = [
            'id', 'customer_id', 'name', 'company', 'contact_email', 'contact_phone',
            'deployment_type', 'status', 'contract_start_date', 'contract_end_date',
            'notes', 'created_at', 'updated_at', 'environments_count', 'is_active'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_customer_id(self, value):
        """验证客户ID格式"""
        if not value.replace('-', '').replace('_', '').isalnum():
            raise serializers.ValidationError("客户ID只能包含字母、数字、横线和下划线")
        return value

class CustomerCreateSerializer(CustomerSerializer):
    """创建客户时的序列化器"""
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class LicenseKeySerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    is_valid = serializers.ReadOnlyField()
    
    class Meta:
        model = LicenseKey
        fields = [
            'id', 'customer', 'customer_name', 'license_code', 'expire_date',
            'is_active', 'usage_count', 'max_usage', 'created_at', 'is_valid'
        ]
        read_only_fields = ['created_at', 'usage_count']

class CustomerDetailSerializer(CustomerSerializer):
    """客户详情序列化器，包含关联的授权码和环境信息"""
    license_keys = LicenseKeySerializer(many=True, read_only=True)
    
    class Meta(CustomerSerializer.Meta):
        fields = CustomerSerializer.Meta.fields + ['license_keys']
