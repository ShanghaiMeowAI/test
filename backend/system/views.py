from django.shortcuts import render
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from .models import SystemSettings
from .serializers import SystemSettingsSerializer, SystemSettingsUpdateSerializer
from users.models import UserActivityLog
import subprocess
import os

# Create your views here.

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_settings(request):
    """获取系统设置"""
    settings = SystemSettings.get_settings()
    serializer = SystemSettingsSerializer(settings)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def update_settings(request):
    """更新系统设置"""
    # 检查权限（只有管理员可以修改）
    if not request.user.is_superuser:
        if not hasattr(request.user, 'userprofile') or not request.user.userprofile.is_admin:
            return Response(
                {'error': '没有权限修改系统设置'}, 
                status=status.HTTP_403_FORBIDDEN
            )
    
    settings = SystemSettings.get_settings()
    serializer = SystemSettingsUpdateSerializer(
        settings, 
        data=request.data, 
        context={'request': request}
    )
    
    if serializer.is_valid():
        serializer.save()
        
        # 记录操作日志
        UserActivityLog.objects.create(
            user=request.user,
            action='update_settings',
            target_type='SystemSettings',
            target_id=str(settings.id),
            description='更新系统设置',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response(SystemSettingsSerializer(settings).data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_system_info(request):
    """获取系统信息"""
    try:
        # 获取基本系统信息
        info = {
            'server_time': timezone.now().isoformat(),
            'database_status': 'connected',
            'version': '1.0.0',
            'platform': 'Django + React',
        }
        
        # 尝试获取磁盘使用情况
        try:
            result = subprocess.run(['df', '-h', '/'], capture_output=True, text=True)
            if result.returncode == 0:
                lines = result.stdout.strip().split('\n')
                if len(lines) > 1:
                    parts = lines[1].split()
                    if len(parts) >= 5:
                        info['disk_usage'] = {
                            'total': parts[1],
                            'used': parts[2],
                            'available': parts[3],
                            'usage_percent': parts[4]
                        }
        except:
            pass
        
        return Response(info)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def backup_database(request):
    """备份数据库"""
    # 检查权限
    if not request.user.is_superuser:
        if not hasattr(request.user, 'userprofile') or not request.user.userprofile.is_admin:
            return Response(
                {'error': '没有权限执行备份操作'}, 
                status=status.HTTP_403_FORBIDDEN
            )
    
    try:
        # 记录操作日志
        UserActivityLog.objects.create(
            user=request.user,
            action='backup_database',
            target_type='System',
            target_id='database',
            description='手动备份数据库',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({'message': '数据库备份任务已启动'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def clean_logs(request):
    """清理历史日志"""
    # 检查权限
    if not request.user.is_superuser:
        if not hasattr(request.user, 'userprofile') or not request.user.userprofile.is_admin:
            return Response(
                {'error': '没有权限执行清理操作'}, 
                status=status.HTTP_403_FORBIDDEN
            )
    
    days = request.data.get('days', 30)
    if not isinstance(days, int) or days < 1:
        return Response({'error': '天数必须是大于0的整数'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # 计算截止日期
        cutoff_date = timezone.now() - timezone.timedelta(days=days)
        
        # 清理用户活动日志
        deleted_count = UserActivityLog.objects.filter(created_at__lt=cutoff_date).count()
        UserActivityLog.objects.filter(created_at__lt=cutoff_date).delete()
        
        # 记录操作日志
        UserActivityLog.objects.create(
            user=request.user,
            action='clean_logs',
            target_type='System',
            target_id='logs',
            description=f'清理了{days}天前的日志，共{deleted_count}条',
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({
            'message': f'成功清理了{deleted_count}条历史日志',
            'deleted_count': deleted_count
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
