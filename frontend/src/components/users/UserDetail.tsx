import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/Badge';
import type { User } from '../../types';
import { PencilIcon, TrashIcon, KeyIcon } from '@heroicons/react/24/outline';

interface UserDetailProps {
  user: User;
  onEdit: () => void;
  onDelete: () => void;
  onResetPassword: () => void;
  onClose: () => void;
}

export function UserDetail({ user, onEdit, onDelete, onResetPassword, onClose }: UserDetailProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const getRoleName = (role: string) => {
    const roleMap = {
      admin: '管理员',
      operator: '运维员',
      viewer: '查看员'
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{user.profile?.display_name || user.username}</h2>
          <p className="text-sm text-gray-500">用户ID: {user.id}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button size="sm" onClick={onEdit}>
            <PencilIcon className="h-4 w-4 mr-2" />
            编辑
          </Button>
          <Button size="sm" variant="ghost" onClick={onResetPassword}>
            <KeyIcon className="h-4 w-4 mr-2" />
            重置密码
          </Button>
          <Button size="sm" variant="danger" onClick={onDelete}>
            <TrashIcon className="h-4 w-4 mr-2" />
            删除
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>
            返回
          </Button>
        </div>
      </div>

      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">基本信息</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">用户名</label>
              <p className="text-sm text-gray-900">{user.username}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">邮箱</label>
              <p className="text-sm text-gray-900">{user.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">姓名</label>
              <p className="text-sm text-gray-900">{`${user.first_name} ${user.last_name}`.trim() || '-'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">状态</label>
              <StatusBadge status={user.is_active ? 'active' : 'inactive'} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">注册时间</label>
              <p className="text-sm text-gray-900">{formatDate(user.date_joined)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">最后登录</label>
              <p className="text-sm text-gray-900">{formatDate(user.last_login)}</p>
            </div>
          </div>
        </div>
      </Card>

      {user.profile && (
        <>
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">用户资料</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">角色</label>
                  <p className="text-sm text-gray-900">{getRoleName(user.profile.role)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">电话</label>
                  <p className="text-sm text-gray-900">{user.profile.phone || '-'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">部门</label>
                  <p className="text-sm text-gray-900">{user.profile.department || '-'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">职位</label>
                  <p className="text-sm text-gray-900">{user.profile.position || '-'}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">权限设置</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">客户管理</label>
                  <StatusBadge status={user.profile.can_manage_customers ? 'active' : 'inactive'} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">环境管理</label>
                  <StatusBadge status={user.profile.can_manage_environments ? 'active' : 'inactive'} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">查看日志</label>
                  <StatusBadge status={user.profile.can_view_logs ? 'active' : 'inactive'} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">生成授权码</label>
                  <StatusBadge status={user.profile.can_generate_licenses ? 'active' : 'inactive'} />
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
} 