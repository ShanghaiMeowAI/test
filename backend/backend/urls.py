"""
URL configuration for backend project.  
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from rest_framework import status

# 导入视图集
from customers.views import CustomerViewSet
from environments.views import EnvironmentViewSet, EnvironmentLogViewSet
from users.views import UserViewSet, UserActivityLogViewSet
from licenses.views import LicenseViewSet, LicenseUsageViewSet, LicenseLogViewSet
from system.views import get_settings, update_settings, get_system_info, backup_database, clean_logs

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({
        'status': 'healthy', 
        'message': 'Odoo SaaS Management API is running',
        'database': 'connected',
        'frontend_cors': 'enabled'
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """用户登录API"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({
            'error': '用户名和密码不能为空'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(username=username, password=password)
    if user:
        token, created = Token.objects.get_or_create(user=user)
        
        # 获取用户资料
        profile_data = {}
        if hasattr(user, 'userprofile'):
            profile = user.userprofile
            profile_data = {
                'role': profile.role,
                'display_name': profile.display_name,
                'department': profile.department,
                'position': profile.position,
                'can_manage_customers': profile.can_manage_customers,
                'can_manage_environments': profile.can_manage_environments,
                'can_view_logs': profile.can_view_logs,
                'can_generate_licenses': profile.can_generate_licenses,
                'is_admin': profile.is_admin,
                'is_operator': profile.is_operator
            }
        
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'profile': profile_data
            }
        })
    else:
        return Response({
            'error': '用户名或密码错误'
        }, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def logout_view(request):
    """用户登出API"""
    try:
        request.user.auth_token.delete()
    except:
        pass
    return Response({'message': '登出成功'})

# 配置DRF路由
router = DefaultRouter()
router.register(r'customers', CustomerViewSet)
router.register(r'environments', EnvironmentViewSet)
router.register(r'environment-logs', EnvironmentLogViewSet)
router.register(r'users', UserViewSet)
router.register(r'user-activity-logs', UserActivityLogViewSet)
router.register(r'licenses', LicenseViewSet)
router.register(r'license-usage', LicenseUsageViewSet)
router.register(r'license-logs', LicenseLogViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/health/', health_check, name='health_check'),
    path('api/login/', login_view, name='login'),
    path('api/logout/', logout_view, name='logout'),
    path('api/system/settings/', get_settings, name='get_settings'),
    path('api/system/settings/update/', update_settings, name='update_settings'),
    path('api/system/info/', get_system_info, name='system_info'),
    path('api/system/backup/', backup_database, name='backup_database'),
    path('api/system/clean-logs/', clean_logs, name='clean_logs'),
    path('api-auth/', include('rest_framework.urls')),  # DRF登录界面
]
