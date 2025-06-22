import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell, EmptyState } from '../components/ui/Table';
import { Loading, TableLoading } from '../components/ui/Loading';
import { activityLogApi, userApi } from '../services/api';
import type { ActivityLog, User } from '../types';
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

export function Logs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, [searchTerm, userFilter, actionFilter, startDate, endDate]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [logsResponse, usersResponse] = await Promise.all([
        activityLogApi.getLogs({
          user: userFilter ? parseInt(userFilter) : undefined,
          action: actionFilter || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined
        }),
        userApi.getUsers()
      ]);
      
      setLogs(logsResponse.data.results);
      setUsers(usersResponse.data.results);
      setError(null);
    } catch (err) {
      setError('获取操作日志失败');
      console.error('Error loading logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const getActionText = (action: string) => {
    const actionMap = {
      'login': '登录',
      'logout': '登出',
      'create_customer': '创建客户',
      'update_customer': '更新客户',
      'delete_customer': '删除客户',
      'deploy_environment': '部署环境',
      'start_environment': '启动环境',
      'stop_environment': '停止环境',
      'generate_license': '生成授权码',
      'activate_license': '激活授权码',
      'revoke_license': '撤销授权码'
    };
    return actionMap[action as keyof typeof actionMap] || action;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
      case 'logout':
        return <UserIcon className="h-4 w-4 text-blue-600" />;
      case 'create_customer':
      case 'update_customer':
      case 'delete_customer':
        return <div className="h-4 w-4 rounded-full bg-green-600"></div>;
      case 'deploy_environment':
      case 'start_environment':
      case 'stop_environment':
        return <div className="h-4 w-4 rounded-full bg-purple-600"></div>;
      case 'generate_license':
      case 'activate_license':
      case 'revoke_license':
        return <div className="h-4 w-4 rounded-full bg-orange-600"></div>;
      default:
        return <ClipboardDocumentListIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setUserFilter('');
    setActionFilter('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">操作日志</h1>
          <p className="mt-2 text-sm text-gray-700">
            查看系统操作记录
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button 
            variant="ghost"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            {showFilters ? '隐藏筛选' : '显示筛选'}
          </Button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        {/* 基础搜索 */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="搜索操作描述、目标或IP地址..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 高级筛选 */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            {/* 用户筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                用户
              </label>
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">所有用户</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.username})
                  </option>
                ))}
              </select>
            </div>

            {/* 操作类型筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                操作类型
              </label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">所有操作</option>
                <option value="login">登录</option>
                <option value="logout">登出</option>
                <option value="create_customer">创建客户</option>
                <option value="update_customer">更新客户</option>
                <option value="delete_customer">删除客户</option>
                <option value="deploy_environment">部署环境</option>
                <option value="start_environment">启动环境</option>
                <option value="stop_environment">停止环境</option>
                <option value="generate_license">生成授权码</option>
              </select>
            </div>

            {/* 开始日期 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                开始日期
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 结束日期 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                结束日期
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="lg:col-span-4 flex justify-end">
              <Button variant="ghost" onClick={clearFilters}>
                清除筛选
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 日志列表 */}
      <Card padding="none">
        {isLoading ? (
          <TableLoading />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <Button onClick={loadData} className="mt-4">
              重试
            </Button>
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            title="暂无日志"
            description="没有找到符合条件的操作日志"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableHeaderCell>时间</TableHeaderCell>
              <TableHeaderCell>用户</TableHeaderCell>
              <TableHeaderCell>操作</TableHeaderCell>
              <TableHeaderCell>描述</TableHeaderCell>
              <TableHeaderCell>目标</TableHeaderCell>
              <TableHeaderCell>IP地址</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="text-sm text-gray-900">
                      {formatDate(log.created_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {log.user_name}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getActionIcon(log.action)}
                      <span className="ml-2 text-sm text-gray-900">
                        {getActionText(log.action)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">
                      {log.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {log.target_type && log.target_id && (
                        <span>{log.target_type}: {log.target_id}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {log.ip_address || '-'}
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
