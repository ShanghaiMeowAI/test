from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Environment, EnvironmentLog
from .serializers import (
    EnvironmentSerializer, EnvironmentCreateSerializer, EnvironmentDetailSerializer,
    EnvironmentLogSerializer
)

class EnvironmentViewSet(viewsets.ModelViewSet):
    queryset = Environment.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EnvironmentCreateSerializer
        elif self.action == 'retrieve':
            return EnvironmentDetailSerializer
        return EnvironmentSerializer
    
    def get_queryset(self):
        queryset = Environment.objects.select_related('customer').all()
        
        # 搜索功能
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(release_name__icontains=search) |
                Q(domain__icontains=search) |
                Q(customer__name__icontains=search)
            )
        
        # 状态过滤
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # 客户过滤
        customer_id = self.request.query_params.get('customer', None)
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """启动环境"""
        environment = self.get_object()
        
        # 检查权限
        if not hasattr(request.user, 'userprofile') or not request.user.userprofile.can_manage_environments:
            return Response(
                {'error': '没有权限管理环境'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # 模拟启动环境（实际应该调用Kubernetes API）
        environment.status = 'running'
        environment.save()
        
        # 记录操作日志
        EnvironmentLog.objects.create(
            environment=environment,
            log_type='start',
            message='环境启动成功',
            status='success',
            created_by=request.user
        )
        
        serializer = self.get_serializer(environment)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def stop(self, request, pk=None):
        """停止环境"""
        environment = self.get_object()
        
        # 检查权限
        if not hasattr(request.user, 'userprofile') or not request.user.userprofile.can_manage_environments:
            return Response(
                {'error': '没有权限管理环境'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # 模拟停止环境
        environment.status = 'stopped'
        environment.save()
        
        # 记录操作日志
        EnvironmentLog.objects.create(
            environment=environment,
            log_type='stop',
            message='环境停止成功',
            status='success',
            created_by=request.user
        )
        
        serializer = self.get_serializer(environment)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def health_check(self, request, pk=None):
        """健康检查"""
        environment = self.get_object()
        
        # 模拟健康检查（实际应该检查Pod状态）
        from django.utils import timezone
        environment.last_health_check = timezone.now()
        
        # 模拟检查结果
        import random
        if random.choice([True, True, True, False]):  # 75%概率健康
            environment.status = 'running'
            message = '健康检查通过'
            check_status = 'success'
        else:
            environment.status = 'error'
            message = '健康检查失败：服务无响应'
            check_status = 'failed'
        
        environment.save()
        
        # 记录日志
        EnvironmentLog.objects.create(
            environment=environment,
            log_type='health_check',
            message=message,
            status=check_status,
            created_by=request.user
        )
        
        return Response({
            'status': environment.status,
            'message': message,
            'last_check': environment.last_health_check
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """获取环境统计信息"""
        total_environments = Environment.objects.count()
        running_environments = Environment.objects.filter(status='running').count()
        stopped_environments = Environment.objects.filter(status='stopped').count()
        error_environments = Environment.objects.filter(status='error').count()
        
        return Response({
            'total_environments': total_environments,
            'running_environments': running_environments,
            'stopped_environments': stopped_environments,
            'error_environments': error_environments,
            'pending_environments': Environment.objects.filter(status='pending').count(),
        })

class EnvironmentLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EnvironmentLog.objects.all()
    serializer_class = EnvironmentLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = EnvironmentLog.objects.select_related('environment', 'created_by').all()
        
        # 按环境过滤
        environment_id = self.request.query_params.get('environment', None)
        if environment_id:
            queryset = queryset.filter(environment_id=environment_id)
        
        # 按日志类型过滤
        log_type = self.request.query_params.get('log_type', None)
        if log_type:
            queryset = queryset.filter(log_type=log_type)
        
        return queryset
