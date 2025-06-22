import { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell, EmptyState } from '../components/ui/Table';
import { TableLoading } from '../components/ui/Loading';
import { EnvironmentDetail } from '../components/environments/EnvironmentDetail';
import { EnvironmentForm } from '../components/environments/EnvironmentForm';
import { environmentApi } from '../services/api';
import type { Environment, EnvironmentFormData } from '../types';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

export function Environments() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // 页面状态
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'edit' | 'create'>('list');
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadEnvironments = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        search: searchTerm || undefined,
        status: statusFilter || undefined
      };
      
      const response = await environmentApi.getEnvironments(params);
      setEnvironments(response.data.results);
      setError(null);
    } catch (err) {
      setError('获取环境列表失败');
      console.error('Error loading environments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    loadEnvironments();
  }, [loadEnvironments]);

  const handleStart = async (environmentId: number) => {
    try {
      setActionLoading(environmentId);
      await environmentApi.startEnvironment(environmentId);
      await loadEnvironments();
    } catch (err) {
      alert('启动环境失败');
      console.error('Error starting environment:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStop = async (environmentId: number) => {
    if (!window.confirm('确定要停止这个环境吗？')) {
      return;
    }

    try {
      setActionLoading(environmentId);
      await environmentApi.stopEnvironment(environmentId);
      await loadEnvironments();
    } catch (err) {
      alert('停止环境失败');
      console.error('Error stopping environment:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleHealthCheck = async (environmentId: number) => {
    try {
      setActionLoading(environmentId);
      await environmentApi.healthCheck(environmentId);
      await loadEnvironments();
    } catch (err) {
      alert('健康检查失败');
      console.error('Error checking health:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (environmentId: number) => {
    if (!window.confirm('确定要删除这个环境吗？此操作不可恢复。')) {
      return;
    }

    try {
      await environmentApi.deleteEnvironment(environmentId);
      await loadEnvironments();
    } catch (err) {
      alert('删除环境失败');
      console.error('Error deleting environment:', err);
    }
  };

  const handleView = (environment: Environment) => {
    setSelectedEnvironment(environment);
    setCurrentView('detail');
  };

  const handleEdit = (environment: Environment) => {
    setSelectedEnvironment(environment);
    setCurrentView('edit');
  };

  const handleCreate = () => {
    setSelectedEnvironment(null);
    setCurrentView('create');
  };

  const handleCloseView = () => {
    setCurrentView('list');
    setSelectedEnvironment(null);
  };

  const handleSubmitForm = async (data: EnvironmentFormData) => {
    try {
      setIsSubmitting(true);
      if (selectedEnvironment) {
        await environmentApi.updateEnvironment(selectedEnvironment.id, data);
      } else {
        await environmentApi.createEnvironment(data);
      }
      await loadEnvironments();
      setCurrentView('list');
      setSelectedEnvironment(null);
    } catch (err) {
      alert(selectedEnvironment ? '更新环境失败' : '创建环境失败');
      console.error('Error submitting environment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-CN');
  };

  // 渲染不同的视图
  if (currentView === 'detail' && selectedEnvironment) {
    return (
      <EnvironmentDetail
        environment={selectedEnvironment}
        onEdit={() => setCurrentView('edit')}
        onDelete={() => handleDelete(selectedEnvironment.id)}
        onClose={handleCloseView}
        onStart={() => handleStart(selectedEnvironment.id)}
        onStop={() => handleStop(selectedEnvironment.id)}
        onHealthCheck={() => handleHealthCheck(selectedEnvironment.id)}
        isLoading={actionLoading === selectedEnvironment.id}
      />
    );
  }

  if (currentView === 'edit' || currentView === 'create') {
    return (
      <EnvironmentForm
        environment={selectedEnvironment || undefined}
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
          <h1 className="text-2xl font-semibold text-gray-900">环境管理</h1>
          <p className="mt-2 text-sm text-gray-700">
            管理客户的Odoo部署环境
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={handleCreate}>
            <PlusIcon className="h-4 w-4 mr-2" />
            部署新环境
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
              placeholder="搜索环境名称、域名或客户..."
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
              <option value="running">运行中</option>
              <option value="stopped">已停止</option>
              <option value="error">错误</option>
              <option value="pending">部署中</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 环境列表 */}
      <Card padding="none">
        {isLoading ? (
          <TableLoading />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <Button onClick={loadEnvironments} className="mt-4">
              重试
            </Button>
          </div>
        ) : environments.length === 0 ? (
          <EmptyState
            title="暂无环境"
            description="还没有部署任何环境"
            action={
              <Button onClick={handleCreate}>
                <PlusIcon className="h-4 w-4 mr-2" />
                部署第一个环境
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableHeaderCell>环境信息</TableHeaderCell>
              <TableHeaderCell>客户</TableHeaderCell>
              <TableHeaderCell>访问地址</TableHeaderCell>
              <TableHeaderCell>状态</TableHeaderCell>
              <TableHeaderCell>资源配置</TableHeaderCell>
              <TableHeaderCell>最后检查</TableHeaderCell>
              <TableHeaderCell className="text-right">操作</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {environments.map((environment) => (
                <TableRow key={environment.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">
                        {environment.release_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        命名空间: {environment.namespace}
                      </div>
                      <div className="text-sm text-gray-500">
                        版本: {environment.odoo_version}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-gray-900">
                      {environment.customer_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {environment.access_url ? (
                      <div className="flex items-center">
                        <a
                          href={environment.access_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-500 text-sm"
                        >
                          {environment.domain}
                        </a>
                        <LinkIcon className="h-4 w-4 ml-1 text-gray-400" />
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={environment.status} />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>CPU: {environment.cpu_limit}</div>
                      <div>内存: {environment.memory_limit}</div>
                      <div>存储: {environment.storage_size}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {formatDate(environment.last_health_check)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {environment.status === 'stopped' ? (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleStart(environment.id)}
                          loading={actionLoading === environment.id}
                        >
                          <PlayIcon className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleStop(environment.id)}
                          loading={actionLoading === environment.id}
                        >
                          <StopIcon className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleHealthCheck(environment.id)}
                        loading={actionLoading === environment.id}
                      >
                        <ArrowPathIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleView(environment)}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEdit(environment)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(environment.id)}
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
