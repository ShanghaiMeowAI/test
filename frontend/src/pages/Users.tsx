import { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell, EmptyState } from '../components/ui/Table';
import { Loading, TableLoading } from '../components/ui/Loading';
import { UserDetail } from '../components/users/UserDetail';
import { UserForm } from '../components/users/UserForm';
import { userApi } from '../services/api';
import type { User, UserFormData } from '../types';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  KeyIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // 页面状态
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'edit' | 'create'>('list');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await userApi.getUsers({
        search: searchTerm || undefined,
        role: roleFilter || undefined
      });
      setUsers(response.data.results);
      setError(null);
    } catch (err) {
      setError('获取用户列表失败');
      console.error('Error loading users:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDelete = async (userId: number) => {
    if (!window.confirm('确定要删除这个用户吗？此操作不可恢复。')) {
      return;
    }

    try {
      await userApi.deleteUser(userId);
      await loadUsers();
    } catch (err) {
      alert('删除用户失败');
      console.error('Error deleting user:', err);
    }
  };

  const handleResetPassword = async (userId: number) => {
    const newPassword = prompt('请输入新密码:');
    if (!newPassword) return;

    try {
      setActionLoading(userId);
      await userApi.resetPassword(userId, newPassword);
      alert('密码重置成功');
    } catch (err) {
      alert('密码重置失败');
      console.error('Error resetting password:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setCurrentView('detail');
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setCurrentView('edit');
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setCurrentView('create');
  };

  const handleCloseView = () => {
    setCurrentView('list');
    setSelectedUser(null);
  };

  const handleSubmitForm = async (data: UserFormData) => {
    try {
      setIsSubmitting(true);
      if (selectedUser) {
        await userApi.updateUser(selectedUser.id, data);
      } else {
        await userApi.createUser(data);
      }
      await loadUsers();
      setCurrentView('list');
      setSelectedUser(null);
    } catch (err) {
      alert(selectedUser ? '更新用户失败' : '创建用户失败');
      console.error('Error submitting user:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const getRoleText = (role?: string) => {
    const roleMap = {
      'admin': '管理员',
      'operator': '运维员',
      'viewer': '查看员'
    };
    return roleMap[role as keyof typeof roleMap] || '未知';
  };

  const getRoleColor = (role?: string): 'success' | 'warning' | 'info' | 'default' => {
    switch (role) {
      case 'admin': return 'success';
      case 'operator': return 'warning';
      case 'viewer': return 'info';
      default: return 'default';
    }
  };

  // 渲染不同的视图
  if (currentView === 'detail' && selectedUser) {
    return (
      <UserDetail
        user={selectedUser}
        onEdit={() => setCurrentView('edit')}
        onDelete={() => handleDelete(selectedUser.id)}
        onResetPassword={() => handleResetPassword(selectedUser.id)}
        onClose={handleCloseView}
      />
    );
  }

  if (currentView === 'edit' || currentView === 'create') {
    return (
      <UserForm
        user={selectedUser || undefined}
        onSubmit={handleSubmitForm}
        onCancel={handleCloseView}
        isSubmitting={isSubmitting}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">用户管理</h1>
          <p className="mt-2 text-sm text-gray-700">
            管理系统用户和权限
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => setCurrentView('create')}>
            <PlusIcon className="h-4 w-4 mr-2" />
            添加用户
          </Button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 搜索框 */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="搜索用户名、姓名或邮箱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 角色筛选 */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">所有角色</option>
              <option value="admin">管理员</option>
              <option value="operator">运维员</option>
              <option value="viewer">查看员</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 用户列表 */}
      <Card padding="none">
        {isLoading ? (
          <TableLoading />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <Button onClick={loadUsers} className="mt-4">
              重试
            </Button>
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            title="暂无用户"
            description="还没有添加任何用户"
            action={
              <Button onClick={() => setCurrentView('create')}>
                <PlusIcon className="h-4 w-4 mr-2" />
                添加第一个用户
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableHeaderCell>用户信息</TableHeaderCell>
              <TableHeaderCell>角色</TableHeaderCell>
              <TableHeaderCell>权限</TableHeaderCell>
              <TableHeaderCell>状态</TableHeaderCell>
              <TableHeaderCell>最后登录</TableHeaderCell>
              <TableHeaderCell>创建时间</TableHeaderCell>
              <TableHeaderCell className="text-right">操作</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{user.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={user.profile?.role || 'viewer'} />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {user.profile?.can_manage_customers && (
                        <div className="flex items-center text-xs text-green-600">
                          <ShieldCheckIcon className="h-3 w-3 mr-1" />
                          客户管理
                        </div>
                      )}
                      {user.profile?.can_manage_environments && (
                        <div className="flex items-center text-xs text-blue-600">
                          <ShieldCheckIcon className="h-3 w-3 mr-1" />
                          环境管理
                        </div>
                      )}
                      {user.profile?.can_generate_licenses && (
                        <div className="flex items-center text-xs text-purple-600">
                          <ShieldCheckIcon className="h-3 w-3 mr-1" />
                          授权码生成
                        </div>
                      )}
                      {user.profile?.can_view_logs && (
                        <div className="flex items-center text-xs text-gray-600">
                          <ClipboardDocumentListIcon className="h-3 w-3 mr-1" />
                          日志查看
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={user.is_active ? 'active' : 'suspended'} />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {formatDate(user.last_login)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {formatDate(user.date_joined)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleResetPassword(user.id)}
                        loading={actionLoading === user.id}
                      >
                        <KeyIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleView(user)}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEdit(user)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(user.id)}
                      >
                        <TrashIcon className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
