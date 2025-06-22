from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from .models import License, LicenseUsage, LicenseLog
from .serializers import (
    LicenseSerializer, LicenseCreateSerializer, LicenseDetailSerializer,
    LicenseUsageSerializer, LicenseLogSerializer, LicenseActivateSerializer,
    LicenseValidateSerializer
)

# Create your views here.

class LicenseViewSet(viewsets.ModelViewSet):
    queryset = License.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return LicenseCreateSerializer
        elif self.action == 'retrieve':
            return LicenseDetailSerializer
        return LicenseSerializer
    
    def get_queryset(self):
        queryset = License.objects.select_related('customer', 'created_by').all()
        
        # 搜索功能
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(license_key__icontains=search) |
                Q(customer__name__icontains=search) |
                Q(deployment_domain__icontains=search)
            )
        
        # 状态过滤
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # 客户过滤
        customer_id = self.request.query_params.get('customer', None)
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)
        
        # 授权类型过滤
        license_type = self.request.query_params.get('license_type', None)
        if license_type:
            queryset = queryset.filter(license_type=license_type)
        
        return queryset
    
    def perform_create(self, serializer):
        license_obj = serializer.save(created_by=self.request.user)
        
        # 记录生成日志
        LicenseLog.objects.create(
            license=license_obj,
            action='generate',
            message=f'生成授权码: {license_obj.license_key}',
            created_by=self.request.user
        )
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """激活授权码"""
        license_obj = self.get_object()
        
        if license_obj.status != 'pending':
            return Response(
                {'error': '授权码状态不正确，无法激活'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = LicenseActivateSerializer(data=request.data)
        if serializer.is_valid():
            license_obj.activate(
                hardware_fingerprint=serializer.validated_data.get('hardware_fingerprint'),
                deployment_domain=serializer.validated_data.get('deployment_domain'),
                deployment_ip=serializer.validated_data.get('deployment_ip')
            )
            
            # 记录激活日志
            LicenseLog.objects.create(
                license=license_obj,
                action='activate',
                message='授权码激活成功',
                ip_address=request.META.get('REMOTE_ADDR'),
                created_by=request.user
            )
            
            return Response({'message': '授权码激活成功'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def revoke(self, request, pk=None):
        """撤销授权码"""
        license_obj = self.get_object()
        
        if license_obj.status == 'revoked':
            return Response(
                {'error': '授权码已被撤销'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        license_obj.revoke()
        
        # 记录撤销日志
        LicenseLog.objects.create(
            license=license_obj,
            action='revoke',
            message='授权码被撤销',
            created_by=request.user
        )
        
        return Response({'message': '授权码撤销成功'})
    
    @action(detail=False, methods=['post'])
    def validate_license(self, request):
        """验证授权码"""
        serializer = LicenseValidateSerializer(data=request.data)
        if serializer.is_valid():
            license_key = serializer.validated_data['license_key']
            
            try:
                license_obj = License.objects.get(license_key=license_key)
                
                # 更新最后检查时间
                license_obj.last_check = timezone.now()
                license_obj.save()
                
                # 记录使用记录
                LicenseUsage.objects.create(
                    license=license_obj,
                    current_users=serializer.validated_data.get('current_users', 0),
                    current_companies=serializer.validated_data.get('current_companies', 0),
                    current_storage_gb=serializer.validated_data.get('current_storage_gb', 0),
                    access_ip=request.META.get('REMOTE_ADDR', ''),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')
                )
                
                # 记录检查日志
                LicenseLog.objects.create(
                    license=license_obj,
                    action='check',
                    message='授权码验证成功',
                    ip_address=request.META.get('REMOTE_ADDR')
                )
                
                return Response({
                    'valid': license_obj.is_valid,
                    'license_type': license_obj.license_type,
                    'max_users': license_obj.max_users,
                    'max_companies': license_obj.max_companies,
                    'max_storage_gb': license_obj.max_storage_gb,
                    'modules_enabled': license_obj.modules_enabled,
                    'valid_until': license_obj.valid_until,
                    'days_remaining': license_obj.days_remaining
                })
                
            except License.DoesNotExist:
                return Response(
                    {'valid': False, 'error': '授权码不存在'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """获取授权码统计信息"""
        total_licenses = License.objects.count()
        active_licenses = License.objects.filter(status='active').count()
        expired_licenses = License.objects.filter(status='expired').count()
        revoked_licenses = License.objects.filter(status='revoked').count()
        pending_licenses = License.objects.filter(status='pending').count()
        
        return Response({
            'total_licenses': total_licenses,
            'active_licenses': active_licenses,
            'expired_licenses': expired_licenses,
            'revoked_licenses': revoked_licenses,
            'pending_licenses': pending_licenses,
        })

class LicenseUsageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LicenseUsage.objects.all()
    serializer_class = LicenseUsageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = LicenseUsage.objects.select_related('license', 'license__customer').all()
        
        # 按授权码过滤
        license_id = self.request.query_params.get('license', None)
        if license_id:
            queryset = queryset.filter(license_id=license_id)
        
        return queryset

class LicenseLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LicenseLog.objects.all()
    serializer_class = LicenseLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = LicenseLog.objects.select_related('license', 'license__customer', 'created_by').all()
        
        # 按授权码过滤
        license_id = self.request.query_params.get('license', None)
        if license_id:
            queryset = queryset.filter(license_id=license_id)
        
        # 按操作类型过滤
        action = self.request.query_params.get('action', None)
        if action:
            queryset = queryset.filter(action=action)
        
        return queryset
