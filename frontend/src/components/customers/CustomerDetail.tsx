import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge, StatusBadge } from '../ui/Badge';
import type { Customer } from '../../types';
import { PencilIcon, TrashIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface CustomerDetailProps {
  customer: Customer;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  onGenerateLicense?: () => void;
}

export function CustomerDetail({ customer, onEdit, onDelete, onClose, onGenerateLicense }: CustomerDetailProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{customer.name}</h2>
          <p className="text-sm text-gray-500">客户ID: {customer.customer_id}</p>
        </div>
        <div className="flex items-center space-x-3">
          {onGenerateLicense && customer.deployment_type === 'offline' && (
            <Button size="sm" onClick={onGenerateLicense}>
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              生成授权码
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
              <label className="block text-sm font-medium text-gray-500 mb-1">客户名称</label>
              <p className="text-sm text-gray-900">{customer.name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">客户ID</label>
              <p className="text-sm text-gray-900 font-mono">{customer.customer_id}</p>
            </div>

            {customer.company && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">公司名称</label>
                <p className="text-sm text-gray-900">{customer.company}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">联系邮箱</label>
              <p className="text-sm text-gray-900">{customer.contact_email}</p>
            </div>

            {customer.contact_phone && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">联系电话</label>
                <p className="text-sm text-gray-900">{customer.contact_phone}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">部署类型</label>
              <StatusBadge status={customer.deployment_type} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">客户状态</label>
              <StatusBadge status={customer.status} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">环境数量</label>
              <p className="text-sm text-gray-900 font-medium">{customer.environments_count} 个</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">合同信息</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">合同开始日期</label>
              <p className="text-sm text-gray-900">
                {customer.contract_start_date ? formatDate(customer.contract_start_date) : '-'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">合同结束日期</label>
              <p className="text-sm text-gray-900">
                {customer.contract_end_date ? formatDate(customer.contract_end_date) : '-'}
              </p>
            </div>

            {customer.contract_start_date && customer.contract_end_date && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">合同状态</label>
                <div className="flex items-center space-x-2">
                  {new Date(customer.contract_end_date) > new Date() ? (
                    <>
                      <Badge variant="success">有效</Badge>
                      <span className="text-sm text-gray-500">
                        还有 {Math.ceil((new Date(customer.contract_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} 天到期
                      </span>
                    </>
                  ) : (
                    <>
                      <Badge variant="danger">已过期</Badge>
                      <span className="text-sm text-gray-500">
                        已过期 {Math.ceil((new Date().getTime() - new Date(customer.contract_end_date).getTime()) / (1000 * 60 * 60 * 24))} 天
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {customer.notes && (
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">备注信息</h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{customer.notes}</p>
          </div>
        </Card>
      )}

      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">时间信息</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">创建时间</label>
              <p className="text-sm text-gray-900">{formatDateTime(customer.created_at)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">更新时间</label>
              <p className="text-sm text-gray-900">{formatDateTime(customer.updated_at)}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}