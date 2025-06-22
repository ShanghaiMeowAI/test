import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { customerApi } from '../../services/api';
import type { License, Customer, LicenseFormData } from '../../types';

interface LicenseFormProps {
  license?: License;
  onSubmit: (data: LicenseFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function LicenseForm({ license, onSubmit, onCancel, isSubmitting = false }: LicenseFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [formData, setFormData] = useState<LicenseFormData>({
    license_type: license?.license_type || 'trial',
    customer: license?.customer || 0,
    max_users: license?.max_users || 10,
    max_companies: license?.max_companies || 1,
    max_storage_gb: license?.max_storage_gb || 10,
    modules_enabled: license?.modules_enabled || ['base', 'web'],
    valid_from: license?.valid_from ? license.valid_from.split('T')[0] : new Date().toISOString().split('T')[0],
    valid_until: license?.valid_until ? license.valid_until.split('T')[0] : getDefaultValidUntil(),
    notes: license?.notes || ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  function getDefaultValidUntil() {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1); // 默认1年有效期
    return date.toISOString().split('T')[0];
  }

  const loadCustomers = async () => {
    try {
      const response = await customerApi.getCustomers();
      setCustomers(response.data.results);
    } catch (err) {
      console.error('Error loading customers:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof LicenseFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleModuleToggle = (module: string) => {
    setFormData(prev => ({
      ...prev,
      modules_enabled: prev.modules_enabled.includes(module)
        ? prev.modules_enabled.filter(m => m !== module)
        : [...prev.modules_enabled, module]
    }));
  };

  const availableModules = [
    { id: 'base', name: '基础模块', description: '核心功能' },
    { id: 'web', name: 'Web界面', description: 'Web客户端支持' },
    { id: 'account', name: '会计', description: '财务会计模块' },
    { id: 'sales', name: '销售', description: '销售管理模块' },
    { id: 'purchase', name: '采购', description: '采购管理模块' },
    { id: 'stock', name: '库存', description: '库存管理模块' },
    { id: 'project', name: '项目', description: '项目管理模块' },
    { id: 'hr', name: '人力资源', description: '人事管理模块' },
    { id: 'manufacturing', name: '制造', description: '生产制造模块' },
    { id: 'website', name: '网站', description: '网站建设模块' },
    { id: 'ecommerce', name: '电商', description: '电子商务模块' },
    { id: 'pos', name: 'POS', description: '销售终端模块' }
  ];

  const licenseTypeOptions = [
    { value: 'trial', label: '试用版', maxUsers: 10, maxCompanies: 1, maxStorage: 10 },
    { value: 'standard', label: '标准版', maxUsers: 50, maxCompanies: 3, maxStorage: 50 },
    { value: 'professional', label: '专业版', maxUsers: 200, maxCompanies: 10, maxStorage: 200 },
    { value: 'enterprise', label: '企业版', maxUsers: 1000, maxCompanies: 50, maxStorage: 1000 }
  ];

  const handleLicenseTypeChange = (type: string) => {
    const typeConfig = licenseTypeOptions.find(opt => opt.value === type);
    if (typeConfig) {
      setFormData(prev => ({
        ...prev,
        license_type: type as any,
        max_users: typeConfig.maxUsers,
        max_companies: typeConfig.maxCompanies,
        max_storage_gb: typeConfig.maxStorage
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            {license ? '编辑授权码' : '生成授权码'}
          </h2>
          <p className="text-sm text-gray-500">
            {license ? '修改授权码配置信息' : '为客户生成新的离线授权码'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" onClick={onCancel}>
            取消
          </Button>
          <Button 
            onClick={() => {
              const form = document.getElementById('license-form') as HTMLFormElement;
              if (form) form.requestSubmit();
            }}
            loading={isSubmitting}
          >
            {license ? '保存' : '生成'}
          </Button>
        </div>
      </div>

      <form id="license-form" onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息 */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">基本信息</h3>
            <p className="text-sm text-gray-500">授权码的基本配置信息</p>
          </div>
          
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  客户 *
                </label>
                <select
                  value={formData.customer}
                  onChange={(e) => handleInputChange('customer', parseInt(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value={0}>请选择客户</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  授权类型 *
                </label>
                <select
                  value={formData.license_type}
                  onChange={(e) => handleLicenseTypeChange(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {licenseTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  生效日期 *
                </label>
                <input
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => handleInputChange('valid_from', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  到期日期 *
                </label>
                <input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => handleInputChange('valid_until', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>
        </Card>

        {/* 资源限制 */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">资源限制</h3>
            <p className="text-sm text-gray-500">设置授权码的资源使用限制</p>
          </div>
          
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最大用户数
                </label>
                <input
                  type="number"
                  value={formData.max_users}
                  onChange={(e) => handleInputChange('max_users', parseInt(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最大公司数
                </label>
                <input
                  type="number"
                  value={formData.max_companies}
                  onChange={(e) => handleInputChange('max_companies', parseInt(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最大存储 (GB)
                </label>
                <input
                  type="number"
                  value={formData.max_storage_gb}
                  onChange={(e) => handleInputChange('max_storage_gb', parseInt(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  required
                />
              </div>
            </div>
          </div>
        </Card>

        {/* 模块权限 */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">模块权限</h3>
            <p className="text-sm text-gray-500">选择授权码允许使用的Odoo模块</p>
          </div>
          
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableModules.map((module) => (
                <div
                  key={module.id}
                  className={`relative rounded-lg border p-4 cursor-pointer ${
                    formData.modules_enabled.includes(module.id)
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleModuleToggle(module.id)}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.modules_enabled.includes(module.id)}
                      onChange={() => handleModuleToggle(module.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <label className="text-sm font-medium text-gray-900 cursor-pointer">
                        {module.name}
                      </label>
                      <p className="text-sm text-gray-500">{module.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* 备注信息 */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">备注信息</h3>
            <p className="text-sm text-gray-500">添加授权码的额外说明</p>
          </div>
          
          <div className="px-6 py-4">
            <textarea
              rows={4}
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="输入备注信息..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </Card>
      </form>
    </div>
  );
} 