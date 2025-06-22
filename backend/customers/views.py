from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Customer, LicenseKey
from .serializers import (
    CustomerSerializer, CustomerCreateSerializer, CustomerDetailSerializer,
    LicenseKeySerializer
)

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CustomerCreateSerializer
        elif self.action == 'retrieve':
            return CustomerDetailSerializer
        return CustomerSerializer
    
    def get_queryset(self):
        queryset = Customer.objects.all()
        
        # 搜索功能
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(customer_id__icontains=search) |
                Q(name__icontains=search) |
                Q(company__icontains=search) |
                Q(contact_email__icontains=search)
            )
        
        # 状态过滤
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # 部署类型过滤
        deployment_type = self.request.query_params.get('deployment_type', None)
        if deployment_type:
            queryset = queryset.filter(deployment_type=deployment_type)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def generate_license(self, request, pk=None):
        """为客户生成授权码"""
        customer = self.get_object()
        
        # 检查权限
        if not hasattr(request.user, 'userprofile') or not request.user.userprofile.can_generate_licenses:
            return Response(
                {'error': '没有权限生成授权码'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        expire_days = request.data.get('expire_days', 365)
        
        # 生成授权码逻辑（简化版）
        import hashlib
        import base64
        from datetime import datetime, timedelta
        
        expire_date = datetime.now().date() + timedelta(days=expire_days)
        data = f"{customer.customer_id}:{expire_date.isoformat()}:secret_key"
        license_hash = hashlib.sha256(data.encode()).hexdigest()
        license_code = base64.b64encode(
            f"{customer.customer_id}:{expire_date.isoformat()}:{license_hash}".encode()
        ).decode()
        
        license_key = LicenseKey.objects.create(
            customer=customer,
            license_code=license_code,
            expire_date=expire_date,
            created_by=request.user
        )
        
        serializer = LicenseKeySerializer(license_key)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """获取客户统计信息"""
        total_customers = Customer.objects.count()
        active_customers = Customer.objects.filter(status='active').count()
        online_customers = Customer.objects.filter(deployment_type='online').count()
        offline_customers = Customer.objects.filter(deployment_type='offline').count()
        
        return Response({
            'total_customers': total_customers,
            'active_customers': active_customers,
            'online_customers': online_customers,
            'offline_customers': offline_customers,
            'trial_customers': Customer.objects.filter(status='trial').count(),
            'expired_customers': Customer.objects.filter(status='expired').count(),
        })

class LicenseKeyViewSet(viewsets.ModelViewSet):
    queryset = LicenseKey.objects.all()
    serializer_class = LicenseKeySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = LicenseKey.objects.all()
        
        # 按客户过滤
        customer_id = self.request.query_params.get('customer', None)
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)
        
        # 按状态过滤
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset
