import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { Customer, CustomerFormData } from '../../types';

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CustomerForm({ customer, onSubmit, onCancel, isSubmitting = false }: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    customer_id: '',
    name: '',
    company: '',
    contact_email: '',
    contact_phone: '',
    deployment_type: 'online',
    status: 'trial',
    contract_start_date: '',
    contract_end_date: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<CustomerFormData>>({});

  useEffect(() => {
    if (customer) {
      setFormData({
        customer_id: customer.customer_id,
        name: customer.name,
        company: customer.company || '',
        contact_email: customer.contact_email,
        contact_phone: customer.contact_phone || '',
        deployment_type: customer.deployment_type,
        status: customer.status,
        contract_start_date: customer.contract_start_date || '',
        contract_end_date: customer.contract_end_date || '',
        notes: customer.notes || ''
      });
    }
  }, [customer]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerFormData> = {};

    if (!formData.customer_id.trim()) {
      newErrors.customer_id = '客户ID不能为空';
    }

    if (!formData.name.trim()) {
      newErrors.name = '客户名称不能为空';
    }

    if (!formData.contact_email.trim()) {
      newErrors.contact_email = '联系邮箱不能为空';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = '邮箱格式不正确';
    }

    if (formData.contract_start_date && formData.contract_end_date) {
      if (new Date(formData.contract_start_date) >= new Date(formData.contract_end_date)) {
        newErrors.contract_end_date = '合同结束日期必须晚于开始日期';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleInputChange = (field: keyof CustomerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {customer ? '编辑客户' : '新增客户'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              客户ID *
            </label>
            <input
              type="text"
              value={formData.customer_id}
              onChange={(e) => handleInputChange('customer_id', e.target.value)}
              disabled={!!customer}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                errors.customer_id ? 'border-red-300' : 'border-gray-300'
              } ${customer ? 'bg-gray-50' : 'bg-white'}`}
              placeholder="请输入客户ID"
            />
            {errors.customer_id && (
              <p className="mt-1 text-sm text-red-600">{errors.customer_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              客户名称 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="请输入客户名称"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              公司名称
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入公司名称"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              联系邮箱 *
            </label>
            <input
              type="email"
              value={formData.contact_email}
              onChange={(e) => handleInputChange('contact_email', e.target.value)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                errors.contact_email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="请输入联系邮箱"
            />
            {errors.contact_email && (
              <p className="mt-1 text-sm text-red-600">{errors.contact_email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              联系电话
            </label>
            <input
              type="tel"
              value={formData.contact_phone}
              onChange={(e) => handleInputChange('contact_phone', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入联系电话"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              部署类型
            </label>
            <select
              value={formData.deployment_type}
              onChange={(e) => handleInputChange('deployment_type', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="online">在线部署</option>
              <option value="offline">离线部署</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              客户状态
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="trial">试用</option>
              <option value="active">活跃</option>
              <option value="suspended">暂停</option>
              <option value="expired">已过期</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              合同开始日期
            </label>
            <input
              type="date"
              value={formData.contract_start_date}
              onChange={(e) => handleInputChange('contract_start_date', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              合同结束日期
            </label>
            <input
              type="date"
              value={formData.contract_end_date}
              onChange={(e) => handleInputChange('contract_end_date', e.target.value)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                errors.contract_end_date ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.contract_end_date && (
              <p className="mt-1 text-sm text-red-600">{errors.contract_end_date}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            备注
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={4}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="请输入备注信息"
          />
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? '提交中...' : (customer ? '更新' : '创建')}
          </Button>
        </div>
      </form>
    </Card>
  );
}