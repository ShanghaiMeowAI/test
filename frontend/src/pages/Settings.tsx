import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loading } from '../components/ui/Loading';
import { systemSettingsApi } from '../services/api';
import type { SystemSettings } from '../types';
import {
  CogIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  ServerIcon,
  ClockIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export function Settings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<Partial<SystemSettings>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await systemSettingsApi.getSettings();
      setSettings(response.data);
      setFormData(response.data);
      setError(null);
    } catch (err) {
      setError('获取系统设置失败');
      console.error('Error loading settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await systemSettingsApi.updateSettings(formData as any);
      await loadSettings();
      alert('设置保存成功');
    } catch (err) {
      alert('保存设置失败');
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleBackup = async () => {
    if (!window.confirm('确定要备份数据库吗？此操作可能需要一些时间。')) {
      return;
    }

    try {
      await systemSettingsApi.backupDatabase();
      alert('数据库备份已开始');
    } catch (err) {
      alert('启动备份失败');
      console.error('Error starting backup:', err);
    }
  };

  const handleCleanLogs = async () => {
    const days = prompt('请输入要保留的日志天数（其余将被删除）:', '30');
    if (!days) return;

    const daysNum = parseInt(days);
    if (isNaN(daysNum) || daysNum < 1) {
      alert('请输入有效的天数');
      return;
    }

    if (!window.confirm(`确定要删除${daysNum}天前的日志吗？此操作不可恢复。`)) {
      return;
    }

    try {
      await systemSettingsApi.cleanLogs(daysNum);
      alert('日志清理已完成');
    } catch (err) {
      alert('日志清理失败');
      console.error('Error cleaning logs:', err);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const tabs = [
    { id: 'general', name: '基本设置', icon: CogIcon },
    { id: 'security', name: '安全设置', icon: ShieldCheckIcon },
    { id: 'email', name: '邮件设置', icon: EnvelopeIcon },
    { id: 'maintenance', name: '维护管理', icon: ServerIcon }
  ];

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <Button onClick={loadSettings} className="mt-4">
          重试
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">系统设置</h1>
          <p className="mt-2 text-sm text-gray-700">
            配置系统参数和选项
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button 
            onClick={handleSave}
            loading={isSaving}
            disabled={!formData}
          >
            保存设置
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 导航标签 */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 设置内容 */}
        <div className="lg:col-span-3">
          {activeTab === 'general' && (
            <Card>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">基本设置</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    配置系统的基本信息和参数
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      站点名称
                    </label>
                    <input
                      type="text"
                      value={formData.site_name || ''}
                      onChange={(e) => handleInputChange('site_name', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      站点描述
                    </label>
                    <textarea
                      rows={3}
                      value={formData.site_description || ''}
                      onChange={(e) => handleInputChange('site_description', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      管理员邮箱
                    </label>
                    <input
                      type="email"
                      value={formData.admin_email || ''}
                      onChange={(e) => handleInputChange('admin_email', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      最大上传大小 (MB)
                    </label>
                    <input
                      type="number"
                      value={formData.max_upload_size || ''}
                      onChange={(e) => handleInputChange('max_upload_size', parseInt(e.target.value))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">安全设置</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    配置系统安全相关的参数
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        维护模式
                      </label>
                      <p className="text-sm text-gray-500">
                        启用后只有管理员可以访问系统
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.maintenance_mode || false}
                      onChange={(e) => handleInputChange('maintenance_mode', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      会话超时时间 (分钟)
                    </label>
                    <input
                      type="number"
                      value={formData.session_timeout || ''}
                      onChange={(e) => handleInputChange('session_timeout', parseInt(e.target.value))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      日志保留天数
                    </label>
                    <input
                      type="number"
                      value={formData.log_retention_days || ''}
                      onChange={(e) => handleInputChange('log_retention_days', parseInt(e.target.value))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'email' && (
            <Card>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">邮件设置</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    配置系统邮件发送参数
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        启用邮件通知
                      </label>
                      <p className="text-sm text-gray-500">
                        启用后系统将发送重要事件的邮件通知
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.email_notifications || false}
                      onChange={(e) => handleInputChange('email_notifications', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        SMTP服务器
                      </label>
                      <input
                        type="text"
                        value={formData.smtp_host || ''}
                        onChange={(e) => handleInputChange('smtp_host', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        SMTP端口
                      </label>
                      <input
                        type="number"
                        value={formData.smtp_port || ''}
                        onChange={(e) => handleInputChange('smtp_port', parseInt(e.target.value))}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        使用TLS加密
                      </label>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.smtp_use_tls || false}
                      onChange={(e) => handleInputChange('smtp_use_tls', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        用户名
                      </label>
                      <input
                        type="text"
                        value={formData.smtp_username || ''}
                        onChange={(e) => handleInputChange('smtp_username', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        密码
                      </label>
                      <input
                        type="password"
                        value={formData.smtp_password || ''}
                        onChange={(e) => handleInputChange('smtp_password', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'maintenance' && (
            <Card>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">维护管理</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    系统维护和数据管理操作
                  </p>
                </div>

                <div className="space-y-6">
                  {/* 备份设置 */}
                  <div className="border-b border-gray-200 pb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      <ClockIcon className="inline h-5 w-5 mr-2" />
                      自动备份
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            启用自动备份
                          </label>
                          <p className="text-sm text-gray-500">
                            定期自动备份数据库
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.backup_enabled || false}
                          onChange={(e) => handleInputChange('backup_enabled', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          备份频率
                        </label>
                        <select
                          value={formData.backup_frequency || 'daily'}
                          onChange={(e) => handleInputChange('backup_frequency', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="daily">每日</option>
                          <option value="weekly">每周</option>
                          <option value="monthly">每月</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 手动操作 */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      <ExclamationTriangleIcon className="inline h-5 w-5 mr-2 text-yellow-500" />
                      手动操作
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">
                            立即备份数据库
                          </h5>
                          <p className="text-sm text-gray-500">
                            创建数据库的完整备份
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={handleBackup}
                        >
                          <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                          开始备份
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                        <div>
                          <h5 className="text-sm font-medium text-red-900">
                            清理历史日志
                          </h5>
                          <p className="text-sm text-red-600">
                            删除过期的操作日志以释放存储空间
                          </p>
                        </div>
                        <Button
                          variant="danger"
                          onClick={handleCleanLogs}
                        >
                          <TrashIcon className="h-4 w-4 mr-2" />
                          清理日志
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
