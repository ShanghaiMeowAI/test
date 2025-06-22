import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/Badge';
import type { Environment } from '../../types';
import { PencilIcon, TrashIcon, PlayIcon, StopIcon, ArrowPathIcon, LinkIcon } from '@heroicons/react/24/outline';

interface EnvironmentDetailProps {
  environment: Environment;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  onStart?: () => void;
  onStop?: () => void;
  onHealthCheck?: () => void;
  isLoading?: boolean;
}

export function EnvironmentDetail({ 
  environment, 
  onEdit, 
  onDelete, 
  onClose, 
  onStart,
  onStop,
  onHealthCheck,
  isLoading = false
}: EnvironmentDetailProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-CN');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{environment.release_name}</h2>
          <p className="text-sm text-gray-500">环境ID: {environment.id}</p>
        </div>
        <div className="flex items-center space-x-3">
          {environment.status === 'stopped' && onStart && (
            <Button size="sm" variant="success" onClick={onStart} loading={isLoading}>
              <PlayIcon className="h-4 w-4 mr-2" />
              启动
            </Button>
          )}
          {environment.status === 'running' && onStop && (
            <Button size="sm" variant="danger" onClick={onStop} loading={isLoading}>
              <StopIcon className="h-4 w-4 mr-2" />
              停止
            </Button>
          )}
          {onHealthCheck && (
            <Button size="sm" variant="ghost" onClick={onHealthCheck} loading={isLoading}>
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              健康检查
            </Button>
          )}
          <Button size="sm" onClick={onEdit}>
            <PencilIcon className="h-4 w-4 mr-2" />
            编辑
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
              <label className="block text-sm font-medium text-gray-500 mb-1">环境名称</label>
              <p className="text-sm text-gray-900">{environment.release_name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">命名空间</label>
              <p className="text-sm text-gray-900">{environment.namespace}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">客户</label>
              <p className="text-sm text-gray-900">{environment.customer_name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Odoo版本</label>
              <p className="text-sm text-gray-900">{environment.odoo_version}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">状态</label>
              <StatusBadge status={environment.status} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">访问域名</label>
              {environment.domain ? (
                <div className="flex items-center">
                  <a
                    href={environment.access_url || `https://${environment.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-500 text-sm"
                  >
                    {environment.domain}
                  </a>
                  <LinkIcon className="h-4 w-4 ml-1 text-gray-400" />
                </div>
              ) : (
                <p className="text-sm text-gray-500">-</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">资源配置</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">CPU限制</label>
              <p className="text-sm text-gray-900">{environment.cpu_limit}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">内存限制</label>
              <p className="text-sm text-gray-900">{environment.memory_limit}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">存储大小</label>
              <p className="text-sm text-gray-900">{environment.storage_size}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">时间信息</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">创建时间</label>
              <p className="text-sm text-gray-900">{formatDate(environment.created_at)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">更新时间</label>
              <p className="text-sm text-gray-900">{formatDate(environment.updated_at)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">部署时间</label>
              <p className="text-sm text-gray-900">{formatDate(environment.deployed_at)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">最后健康检查</label>
              <p className="text-sm text-gray-900">{formatDate(environment.last_health_check)}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 