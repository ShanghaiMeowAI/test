import { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell, EmptyState } from '../components/ui/Table';
import { TableLoading } from '../components/ui/Loading';
import { CustomerForm } from '../components/customers/CustomerForm';
import { CustomerDetail } from '../components/customers/CustomerDetail';
import { customerApi, licenseApi } from '../services/api';
import type { Customer, CustomerFormData } from '../types';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deploymentFilter, setDeploymentFilter] = useState('');
  
  // 视图状态管理
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        deployment_type: deploymentFilter || undefined
      };
      
      const response = await customerApi.getCustomers(params);
      setCustomers(response.data.results);
      setError(null);
    } catch (err) {
      setError('获取客户列表失败');
      console.error('Error loading customers:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter, deploymentFilter]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // 处理新增客户
  const handleCreate = () => {
    setSelectedCustomer(null);
    setViewMode('create');
  };

  // 处理查看详情
  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewMode('detail');
  };

  // 处理编辑客户
  const handleEdit = (customer?: Customer) => {
    if (customer) {
      setSelectedCustomer(customer);
    }
    setViewMode('edit');
  };

  // 处理表单提交
  const handleSubmit = async (formData: CustomerFormData) => {
    setIsSubmitting(true);
    try {
      if (selectedCustomer) {
        // 编辑客户
        await customerApi.updateCustomer(selectedCustomer.id, formData);
      } else {
        // 新增客户
        await customerApi.createCustomer(formData);
      }
      
      await loadCustomers(); // 重新加载列表
      setViewMode('list');
      setSelectedCustomer(null);
    } catch (err) {
      console.error('Submit error:', err);
      alert(selectedCustomer ? '更新客户失败' : '创建客户失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理删除客户
  const handleDelete = async (customer?: Customer) => {
    const customerToDelete = customer || selectedCustomer;
    if (!customerToDelete) return;

    if (!window.confirm(`确定要删除客户 "${customerToDelete.name}" 吗？此操作不可恢复。`)) {
      return;
    }

    try {
      await customerApi.deleteCustomer(customerToDelete.id);
      await loadCustomers(); // 重新加载列表
      
      // 如果在详情页面删除，返回列表
      if (viewMode === 'detail') {
        setViewMode('list');
        setSelectedCustomer(null);
      }
    } catch (err) {
      alert('删除客户失败');
      console.error('Error deleting customer:', err);
    }
  };

  // 处理生成授权码
  const handleGenerateLicense = async () => {
    if (!selectedCustomer) return;

    try {
      const expireDays = parseInt(prompt('请输入授权码有效期（天数）：', '365') || '365');
      if (isNaN(expireDays) || expireDays <= 0) {
        alert('请输入有效的天数');
        return;
      }

      const validFrom = new Date();
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + expireDays);

      const licenseData = {
        customer: selectedCustomer.id,
        license_type: 'standard' as const,
        max_users: 50,
        max_companies: 3,
        max_storage_gb: 100,
        modules_enabled: ['sale', 'purchase', 'inventory'],
        valid_from: validFrom.toISOString().split('T')[0],
        valid_until: validUntil.toISOString().split('T')[0],
        notes: `为客户 ${selectedCustomer.name} 生成的授权码`
      };

      await licenseApi.createLicense(licenseData);
      alert('授权码生成成功');
    } catch (err) {
      alert('生成授权码失败');
      console.error('Error generating license:', err);
    }
  };

  // 处理取消操作
  const handleCancel = () => {
    setViewMode('list');
    setSelectedCustomer(null);
    setIsSubmitting(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  return (
    <div className="space-y-6">
      {/* 根据视图模式显示不同内容 */}
      {viewMode === 'create' && (
        <CustomerForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      )}

      {viewMode === 'edit' && selectedCustomer && (
        <CustomerForm
          customer={selectedCustomer}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      )}

      {viewMode === 'detail' && selectedCustomer && (
        <CustomerDetail
          customer={selectedCustomer}
          onEdit={() => handleEdit()}
          onDelete={() => handleDelete()}
          onClose={handleCancel}
          onGenerateLicense={handleGenerateLicense}
        />
      )}

      {viewMode === 'list' && (
        <>
          {/* 页面头部 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">客户管理</h1>
              <p className="mt-2 text-sm text-gray-700">
                管理您的客户信息和合同状态
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button onClick={handleCreate}>
                <PlusIcon className="h-4 w-4 mr-2" />
                新增客户
              </Button>
            </div>
          </div>

      {/* 搜索和筛选 */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 搜索框 */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="搜索客户名称、ID或邮箱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 状态筛选 */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">所有状态</option>
              <option value="active">活跃</option>
              <option value="trial">试用</option>
              <option value="suspended">暂停</option>
              <option value="expired">已过期</option>
            </select>
          </div>

          {/* 部署类型筛选 */}
          <div>
            <select
              value={deploymentFilter}
              onChange={(e) => setDeploymentFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">所有部署类型</option>
              <option value="online">在线部署</option>
              <option value="offline">离线部署</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 客户列表 */}
      <Card padding="none">
        {isLoading ? (
          <TableLoading />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <Button onClick={loadCustomers} className="mt-4">
              重试
            </Button>
          </div>
        ) : customers.length === 0 ? (
          <EmptyState
            title="暂无客户"
            description="还没有任何客户记录"
            action={
              <Button onClick={handleCreate}>
                <PlusIcon className="h-4 w-4 mr-2" />
                新增第一个客户
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableHeaderCell>客户信息</TableHeaderCell>
              <TableHeaderCell>联系方式</TableHeaderCell>
              <TableHeaderCell>部署类型</TableHeaderCell>
              <TableHeaderCell>状态</TableHeaderCell>
              <TableHeaderCell>环境数</TableHeaderCell>
              <TableHeaderCell>合同期限</TableHeaderCell>
              <TableHeaderCell>创建时间</TableHeaderCell>
              <TableHeaderCell className="text-right">操作</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">
                        {customer.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {customer.customer_id}
                      </div>
                      {customer.company && (
                        <div className="text-sm text-gray-500">
                          {customer.company}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm text-gray-900">
                        {customer.contact_email}
                      </div>
                      {customer.contact_phone && (
                        <div className="text-sm text-gray-500">
                          {customer.contact_phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={customer.deployment_type} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={customer.status} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-gray-900">
                      {customer.environments_count}
                    </span>
                  </TableCell>
                  <TableCell>
                    {customer.contract_start_date && customer.contract_end_date ? (
                      <div className="text-sm">
                        <div>{formatDate(customer.contract_start_date)}</div>
                        <div className="text-gray-500">
                          至 {formatDate(customer.contract_end_date)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {formatDate(customer.created_at)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleView(customer)}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEdit(customer)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(customer)}
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
        </>
      )}
    </div>
  );
}
