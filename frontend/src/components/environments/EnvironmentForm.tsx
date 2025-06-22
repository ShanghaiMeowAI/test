import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { customerApi } from '../../services/api';
import type { Environment, Customer, EnvironmentFormData, GitRepository } from '../../types';

interface EnvironmentFormProps {
  environment?: Environment;
  onSubmit: (data: EnvironmentFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function EnvironmentForm({ environment, onSubmit, onCancel, isSubmitting = false }: EnvironmentFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState<EnvironmentFormData>({
    // 基础配置
    customer: environment?.customer || 0,
    release_name: environment?.release_name || '',
    namespace: environment?.namespace || 'odoo',
    domain: environment?.domain || '',
    
    // Odoo基础配置
    admin_password: environment?.admin_password || '',
    odoo_version: environment?.odoo_version || '18.0',
    workers: environment?.workers || 0,
    log_level: environment?.log_level || 'info',
    
    // Git配置
    git_ssh_secret: environment?.git_ssh_secret || 'global-git-ssh-key',
    git_odoo_repository: environment?.git_odoo_repository || 'git@github.com:ShanghaiMeowAI/MeowCloud.git',
    git_odoo_ref: environment?.git_odoo_ref || '18.0',
    git_customer_addons: environment?.git_customer_addons || [
      { name: '', repository: 'git@github.com:ShanghaiMeowAI/', ref: 'main' }
    ],
    
    // 存储配置
    storage_class: environment?.storage_class || 'longhorn-expandable',
    storage_size: environment?.storage_size || '10Gi',
    storage_auto_expand: environment?.storage_auto_expand ?? true,
    storage_expand_threshold: environment?.storage_expand_threshold || 85,
    storage_expand_size: environment?.storage_expand_size || '5Gi',
    storage_max_size: environment?.storage_max_size || '50Gi',
    
    // 数据库配置
    db_enabled: environment?.db_enabled ?? true,
    db_version: environment?.db_version || '16',
    db_instances: environment?.db_instances || 1,
    db_storage_size: environment?.db_storage_size || '5Gi',
    db_cpu_request: environment?.db_cpu_request || '100m',
    db_memory_request: environment?.db_memory_request || '256Mi',
    db_cpu_limit: environment?.db_cpu_limit || '500m',
    db_memory_limit: environment?.db_memory_limit || '512Mi',
    
    // 外部数据库配置
    external_db_enabled: environment?.external_db_enabled || false,
    external_db_host: environment?.external_db_host || '',
    external_db_port: environment?.external_db_port || 5432,
    external_db_name: environment?.external_db_name || '',
    external_db_user: environment?.external_db_user || '',
    
    // 网络配置
    ingress_enabled: environment?.ingress_enabled || false,
    ingress_class: environment?.ingress_class || 'nginx',
    ingress_path: environment?.ingress_path || '/',
    tls_enabled: environment?.tls_enabled || false,
    tls_secret_name: environment?.tls_secret_name || '',
    
    // 资源配置
    cpu_request: environment?.cpu_request || '200m',
    memory_request: environment?.memory_request || '512Mi',
    cpu_limit: environment?.cpu_limit || '1000m',
    memory_limit: environment?.memory_limit || '2Gi',
    
    // 高级Odoo配置
    limit_request: environment?.limit_request || 8192,
    limit_memory_hard: environment?.limit_memory_hard || '2684354560',
    limit_memory_soft: environment?.limit_memory_soft || '2147483648',
    proxy_mode: environment?.proxy_mode || false,
    list_db: environment?.list_db || false,
    db_filter: environment?.db_filter || ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

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

  const handleInputChange = (field: keyof EnvironmentFormData, value: any) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // 当环境名称改变时，自动生成域名
      if (field === 'release_name' && value && !prev.domain) {
        newData.domain = `${value}.erp.mmiao.net`;
      }
      
      return newData;
    });
  };

  const addGitRepository = () => {
    setFormData(prev => ({
      ...prev,
      git_customer_addons: [
        ...prev.git_customer_addons,
        { name: '', repository: 'git@github.com:ShanghaiMeowAI/', ref: 'main' }
      ]
    }));
  };

  const removeGitRepository = (index: number) => {
    setFormData(prev => ({
      ...prev,
      git_customer_addons: prev.git_customer_addons.filter((_, i) => i !== index)
    }));
  };

  const updateGitRepository = (index: number, field: keyof GitRepository, value: string) => {
    setFormData(prev => ({
      ...prev,
      git_customer_addons: prev.git_customer_addons.map((repo, i) => 
        i === index ? { ...repo, [field]: value } : repo
      )
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            {environment ? '编辑环境' : '创建环境'}
          </h2>
          <p className="text-sm text-gray-500">
            {environment ? '修改环境配置信息' : '创建新的Odoo部署环境'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" onClick={onCancel}>
            取消
          </Button>
          <Button 
            onClick={() => {
              const form = document.getElementById('environment-form') as HTMLFormElement;
              if (form) form.requestSubmit();
            }}
            loading={isSubmitting}
          >
            {environment ? '保存' : '创建'}
          </Button>
        </div>
      </div>

      <form id="environment-form" onSubmit={handleSubmit} className="space-y-6">
        {/* 基础配置 */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">基础配置</h3>
            <p className="text-sm text-gray-500">环境的基本信息和访问配置</p>
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
                  环境名称 *
                </label>
                <input
                  type="text"
                  value={formData.release_name}
                  onChange={(e) => handleInputChange('release_name', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例如: company-odoo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  命名空间
                </label>
                <input
                  type="text"
                  value={formData.namespace}
                  onChange={(e) => handleInputChange('namespace', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="odoo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  访问域名
                </label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => handleInputChange('domain', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="customer.erp.mmiao.net"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  管理员密码 *
                </label>
                <input
                  type="password"
                  value={formData.admin_password}
                  onChange={(e) => handleInputChange('admin_password', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Odoo版本
                </label>
                <select
                  value={formData.odoo_version}
                  onChange={(e) => handleInputChange('odoo_version', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="18.0">18.0</option>
                  <option value="17.0">17.0</option>
                  <option value="16.0">16.0</option>
                  <option value="15.0">15.0</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* 客户专属模块配置 */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">客户专属模块</h3>
            <p className="text-sm text-gray-500">配置客户专属的Odoo模块和代码仓库</p>
          </div>
          
          <div className="px-6 py-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  客户Addons仓库 *
                </label>
                <Button type="button" variant="ghost" size="sm" onClick={addGitRepository}>
                  添加仓库
                </Button>
              </div>
              {formData.git_customer_addons.length === 0 && (
                <div className="text-sm text-gray-500 mb-3">
                  请至少添加一个客户专属的代码仓库
                </div>
              )}
              {formData.git_customer_addons.map((repo, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-end">
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="模块名称"
                      value={repo.name}
                      onChange={(e) => updateGitRepository(index, 'name', e.target.value)}
                      className="block w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div className="col-span-6">
                    <input
                      type="text"
                      placeholder="Git仓库地址"
                      value={repo.repository}
                      onChange={(e) => updateGitRepository(index, 'repository', e.target.value)}
                      className="block w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="分支"
                      value={repo.ref}
                      onChange={(e) => updateGitRepository(index, 'ref', e.target.value)}
                      className="block w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGitRepository(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
              
              {/* 示例说明 */}
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>示例配置：</strong><br/>
                  模块名称: customer-webportal<br/>
                  仓库地址: git@github.com:ShanghaiMeowAI/customer-webportal.git<br/>
                  分支: main
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* 高级配置切换按钮 */}
        <div className="flex items-center justify-center">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2"
          >
            <span>{showAdvanced ? '隐藏高级配置' : '显示高级配置'}</span>
            <svg 
              className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
        </div>

        {/* 高级配置 */}
        {showAdvanced && (
          <div className="space-y-6">
            {/* Git配置 */}
                         <Card>
               <div className="px-6 py-4 border-b border-gray-200">
                 <h3 className="text-lg font-medium text-gray-900">Git基础配置</h3>
                 <p className="text-sm text-gray-500">Odoo核心代码仓库和SSH密钥配置</p>
               </div>
              
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SSH密钥Secret名称
                    </label>
                    <input
                      type="text"
                      value={formData.git_ssh_secret}
                      onChange={(e) => handleInputChange('git_ssh_secret', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Odoo核心仓库
                    </label>
                    <input
                      type="text"
                      value={formData.git_odoo_repository}
                      onChange={(e) => handleInputChange('git_odoo_repository', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Odoo分支/标签
                    </label>
                    <input
                      type="text"
                      value={formData.git_odoo_ref}
                      onChange={(e) => handleInputChange('git_odoo_ref', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                
              </div>
            </Card>

            {/* 存储配置 */}
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">存储配置</h3>
                <p className="text-sm text-gray-500">持久化存储和自动扩容配置</p>
              </div>
              
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      存储类
                    </label>
                    <input
                      type="text"
                      value={formData.storage_class}
                      onChange={(e) => handleInputChange('storage_class', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      存储大小
                    </label>
                    <input
                      type="text"
                      value={formData.storage_size}
                      onChange={(e) => handleInputChange('storage_size', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      最大存储
                    </label>
                    <input
                      type="text"
                      value={formData.storage_max_size}
                      onChange={(e) => handleInputChange('storage_max_size', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.storage_auto_expand}
                      onChange={(e) => handleInputChange('storage_auto_expand', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">启用自动扩容</span>
                  </label>
                </div>

                {formData.storage_auto_expand && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        扩容阈值 (%)
                      </label>
                      <input
                        type="number"
                        value={formData.storage_expand_threshold}
                        onChange={(e) => handleInputChange('storage_expand_threshold', parseInt(e.target.value))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                        max="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        扩容增量
                      </label>
                      <input
                        type="text"
                        value={formData.storage_expand_size}
                        onChange={(e) => handleInputChange('storage_expand_size', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* 数据库配置 */}
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">数据库配置</h3>
                <p className="text-sm text-gray-500">PostgreSQL数据库配置</p>
              </div>
              
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.db_enabled}
                      onChange={(e) => handleInputChange('db_enabled', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">使用内置PostgreSQL</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.external_db_enabled}
                      onChange={(e) => handleInputChange('external_db_enabled', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">使用外部数据库</span>
                  </label>
                </div>

                {formData.db_enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PostgreSQL版本
                      </label>
                      <select
                        value={formData.db_version}
                        onChange={(e) => handleInputChange('db_version', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="16">16</option>
                        <option value="15">15</option>
                        <option value="14">14</option>
                        <option value="13">13</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        实例数量
                      </label>
                      <input
                        type="number"
                        value={formData.db_instances}
                        onChange={(e) => handleInputChange('db_instances', parseInt(e.target.value))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        存储大小
                      </label>
                      <input
                        type="text"
                        value={formData.db_storage_size}
                        onChange={(e) => handleInputChange('db_storage_size', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2 lg:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CPU请求
                      </label>
                      <input
                        type="text"
                        value={formData.db_cpu_request}
                        onChange={(e) => handleInputChange('db_cpu_request', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        内存请求
                      </label>
                      <input
                        type="text"
                        value={formData.db_memory_request}
                        onChange={(e) => handleInputChange('db_memory_request', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CPU限制
                      </label>
                      <input
                        type="text"
                        value={formData.db_cpu_limit}
                        onChange={(e) => handleInputChange('db_cpu_limit', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        内存限制
                      </label>
                      <input
                        type="text"
                        value={formData.db_memory_limit}
                        onChange={(e) => handleInputChange('db_memory_limit', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {formData.external_db_enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        数据库主机
                      </label>
                      <input
                        type="text"
                        value={formData.external_db_host}
                        onChange={(e) => handleInputChange('external_db_host', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        端口
                      </label>
                      <input
                        type="number"
                        value={formData.external_db_port}
                        onChange={(e) => handleInputChange('external_db_port', parseInt(e.target.value))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        数据库名
                      </label>
                      <input
                        type="text"
                        value={formData.external_db_name}
                        onChange={(e) => handleInputChange('external_db_name', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        用户名
                      </label>
                      <input
                        type="text"
                        value={formData.external_db_user}
                        onChange={(e) => handleInputChange('external_db_user', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* 网络配置 */}
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">网络配置</h3>
                <p className="text-sm text-gray-500">Ingress和TLS配置</p>
              </div>
              
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.ingress_enabled}
                      onChange={(e) => handleInputChange('ingress_enabled', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">启用Ingress</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.tls_enabled}
                      onChange={(e) => handleInputChange('tls_enabled', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">启用TLS</span>
                  </label>
                </div>

                {formData.ingress_enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ingress类
                      </label>
                      <input
                        type="text"
                        value={formData.ingress_class}
                        onChange={(e) => handleInputChange('ingress_class', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        访问路径
                      </label>
                      <input
                        type="text"
                        value={formData.ingress_path}
                        onChange={(e) => handleInputChange('ingress_path', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {formData.tls_enabled && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          TLS证书Secret
                        </label>
                        <input
                          type="text"
                          value={formData.tls_secret_name}
                          onChange={(e) => handleInputChange('tls_secret_name', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* 资源配置 */}
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">资源配置</h3>
                <p className="text-sm text-gray-500">CPU和内存资源分配</p>
              </div>
              
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CPU请求
                    </label>
                    <input
                      type="text"
                      value={formData.cpu_request}
                      onChange={(e) => handleInputChange('cpu_request', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      内存请求
                    </label>
                    <input
                      type="text"
                      value={formData.memory_request}
                      onChange={(e) => handleInputChange('memory_request', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CPU限制
                    </label>
                    <input
                      type="text"
                      value={formData.cpu_limit}
                      onChange={(e) => handleInputChange('cpu_limit', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      内存限制
                    </label>
                    <input
                      type="text"
                      value={formData.memory_limit}
                      onChange={(e) => handleInputChange('memory_limit', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* 高级Odoo配置 */}
            <Card>
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">高级Odoo配置</h3>
                <p className="text-sm text-gray-500">Odoo服务器高级参数配置</p>
              </div>
              
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Worker数量
                    </label>
                    <input
                      type="number"
                      value={formData.workers}
                      onChange={(e) => handleInputChange('workers', parseInt(e.target.value))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">0表示开发模式，生产环境建议设置为CPU核心数*2+1</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      日志级别
                    </label>
                    <select
                      value={formData.log_level}
                      onChange={(e) => handleInputChange('log_level', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="debug">Debug</option>
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      请求限制
                    </label>
                    <input
                      type="number"
                      value={formData.limit_request}
                      onChange={(e) => handleInputChange('limit_request', parseInt(e.target.value))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      数据库过滤器
                    </label>
                    <input
                      type="text"
                      value={formData.db_filter}
                      onChange={(e) => handleInputChange('db_filter', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="%d"
                    />
                    <p className="text-xs text-gray-500 mt-1">例如: %d 自动根据域名选择数据库</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      硬内存限制 (字节)
                    </label>
                    <input
                      type="text"
                      value={formData.limit_memory_hard}
                      onChange={(e) => handleInputChange('limit_memory_hard', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      软内存限制 (字节)
                    </label>
                    <input
                      type="text"
                      value={formData.limit_memory_soft}
                      onChange={(e) => handleInputChange('limit_memory_soft', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.proxy_mode}
                      onChange={(e) => handleInputChange('proxy_mode', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">代理模式</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.list_db}
                      onChange={(e) => handleInputChange('list_db', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">显示数据库列表</span>
                  </label>
                </div>
              </div>
            </Card>
          </div>
        )}
      </form>
    </div>
  );
} 