from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Q
from .models import UserProfile, UserActivityLog
from .serializers import (
    UserSerializer, UserProfileSerializer, UserActivityLogSerializer,
    CurrentUserSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = User.objects.select_related('userprofile').all()
        
        # 搜索功能
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        # 角色过滤
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(userprofile__role=role)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """获取当前用户信息"""
        serializer = CurrentUserSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_profile(self, request, pk=None):
        """更新用户资料"""
        user = self.get_object()
        
        # 检查权限：只能管理员或用户本人修改
        if not request.user.is_superuser and request.user != user:
            return Response(
                {'error': '没有权限修改此用户资料'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # 获取或创建用户资料
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UserActivityLog.objects.all()
    serializer_class = UserActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = UserActivityLog.objects.select_related('user').all()
        
        # 按用户过滤
        user_id = self.request.query_params.get('user', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # 按操作类型过滤
        action = self.request.query_params.get('action', None)
        if action:
            queryset = queryset.filter(action=action)
        
        return queryset
