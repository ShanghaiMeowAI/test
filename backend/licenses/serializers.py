from rest_framework import serializers
from .models import License, LicenseUsage, LicenseLog
from customers.models import Customer

class LicenseSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    is_valid = serializers.BooleanField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = License
        fields = [
            'id', 'license_key', 'license_type', 'customer', 'customer_name',
            'max_users', 'max_companies', 'max_storage_gb', 'modules_enabled',
            'issued_at', 'valid_from', 'valid_until', 'status', 'activated_at',
            'last_check', 'hardware_fingerprint', 'deployment_domain',
            'deployment_ip', 'notes', 'is_valid', 'days_remaining'
        ]
        read_only_fields = ['license_key', 'issued_at', 'activated_at', 'last_check']

class LicenseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = License
        fields = [
            'license_type', 'customer', 'max_users', 'max_companies', 
            'max_storage_gb', 'modules_enabled', 'valid_from', 'valid_until', 'notes'
        ]

    def create(self, validated_data):
        # 设置创建人
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class LicenseDetailSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_contact_person = serializers.CharField(source='customer.contact_person', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    is_valid = serializers.BooleanField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = License
        fields = '__all__'

class LicenseUsageSerializer(serializers.ModelSerializer):
    license_key = serializers.CharField(source='license.license_key', read_only=True)
    customer_name = serializers.CharField(source='license.customer.name', read_only=True)
    
    class Meta:
        model = LicenseUsage
        fields = '__all__'

class LicenseLogSerializer(serializers.ModelSerializer):
    license_key = serializers.CharField(source='license.license_key', read_only=True)
    customer_name = serializers.CharField(source='license.customer.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = LicenseLog
        fields = '__all__'

class LicenseActivateSerializer(serializers.Serializer):
    hardware_fingerprint = serializers.CharField(max_length=100, required=False)
    deployment_domain = serializers.CharField(max_length=200, required=False)
    deployment_ip = serializers.IPAddressField(required=False)

class LicenseValidateSerializer(serializers.Serializer):
    license_key = serializers.CharField(max_length=200)
    hardware_fingerprint = serializers.CharField(max_length=100, required=False)
    current_users = serializers.IntegerField(default=0)
    current_companies = serializers.IntegerField(default=0)
    current_storage_gb = serializers.FloatField(default=0) 