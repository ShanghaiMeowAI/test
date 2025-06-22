import { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { User, UserFormData } from '../../types';

interface UserFormProps {
  user?: User;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function UserForm({ user, onSubmit, onCancel, isSubmitting = false }: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    username: user?.username || '',
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    password: '',
    is_active: user?.is_active ?? true,
    profile: {
      role: user?.profile?.role || 'viewer',
      phone: user?.profile?.phone || '',
      department: user?.profile?.department || '',
      position: user?.profile?.position || '',
      can_manage_customers: user?.profile?.can_manage_customers ?? false,
      can_manage_environments: user?.profile?.can_manage_environments ?? false,
      can_view_logs: user?.profile?.can_view_logs ?? false,
      can_generate_licenses: user?.profile?.can_generate_licenses ?? false,
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (user && !submitData.password) {
      delete submitData.password;
    }
    onSubmit(submitData);
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    if (field.startsWith('profile.')) {
      const profileField = field.replace('profile.', '');
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            {user ? '编辑用户' : '创建用户'}
          </h2>
          <p className="text-sm text-gray-500">
            {user ? '修改用户信息和权限' : '创建新的系统用户'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" onClick={onCancel}>
            取消
          </Button>
          <Button 
            onClick={() => {
              const form = document.getElementById('user-form') as HTMLFormElement;
              if (form) form.requestSubmit();
            }}
            loading={isSubmitting}
          >
            {user ? '保存' : '创建'}
          </Button>
        </div>
      </div>

      <Card>
        <form id="user-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">基本信息</h3>
          </div>
          
          <div className="px-6 pb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  用户名 *
                </label>
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱 *
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                  名
                </label>
                <input
                  type="text"
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                  姓
                </label>
                <input
                  type="text"
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  密码 {!user && '*'}
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required={!user}
                  placeholder={user ? "留空则不修改密码" : ""}
                />
              </div>

              <div>
                <label htmlFor="is_active" className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">启用用户</span>
                </label>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200">
            <h4 className="text-md font-medium text-gray-900 mb-4">用户资料</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  角色 *
                </label>
                <select
                  id="role"
                  value={formData.profile.role}
                  onChange={(e) => handleInputChange('profile.role', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="viewer">查看员</option>
                  <option value="operator">运维员</option>
                  <option value="admin">管理员</option>
                </select>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  电话
                </label>
                <input
                  type="text"
                  id="phone"
                  value={formData.profile.phone}
                  onChange={(e) => handleInputChange('profile.phone', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  部门
                </label>
                <input
                  type="text"
                  id="department"
                  value={formData.profile.department}
                  onChange={(e) => handleInputChange('profile.department', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                  职位
                </label>
                <input
                  type="text"
                  id="position"
                  value={formData.profile.position}
                  onChange={(e) => handleInputChange('profile.position', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200">
            <h4 className="text-md font-medium text-gray-900 mb-4">权限设置</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="can_manage_customers" className="flex items-center">
                  <input
                    type="checkbox"
                    id="can_manage_customers"
                    checked={formData.profile.can_manage_customers}
                    onChange={(e) => handleInputChange('profile.can_manage_customers', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">客户管理</span>
                </label>
              </div>

              <div>
                <label htmlFor="can_manage_environments" className="flex items-center">
                  <input
                    type="checkbox"
                    id="can_manage_environments"
                    checked={formData.profile.can_manage_environments}
                    onChange={(e) => handleInputChange('profile.can_manage_environments', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">环境管理</span>
                </label>
              </div>

              <div>
                <label htmlFor="can_view_logs" className="flex items-center">
                  <input
                    type="checkbox"
                    id="can_view_logs"
                    checked={formData.profile.can_view_logs}
                    onChange={(e) => handleInputChange('profile.can_view_logs', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">查看日志</span>
                </label>
              </div>

              <div>
                <label htmlFor="can_generate_licenses" className="flex items-center">
                  <input
                    type="checkbox"
                    id="can_generate_licenses"
                    checked={formData.profile.can_generate_licenses}
                    onChange={(e) => handleInputChange('profile.can_generate_licenses', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">生成授权码</span>
                </label>
              </div>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
} 