import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';
import { systemApi } from '../services/api';
import type { Stats } from '../types';
import {
  UserGroupIcon,
  ServerIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await systemApi.getOverallStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError('获取统计数据失败');
      console.error('Error loading stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading size="lg" text="加载中..." className="min-h-96" />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">加载失败</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <button
          onClick={loadStats}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          重新加载
        </button>
      </div>
    );
  }

  const overviewCards = [
    {
      title: '总客户数',
      value: stats?.total_customers || 0,
      icon: UserGroupIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      link: '/customers'
    },
    {
      title: '活跃客户',
      value: stats?.active_customers || 0,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      link: '/customers?status=active'
    },
    {
      title: '运行环境',
      value: stats?.running_environments || 0,
      icon: ServerIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      link: '/environments?status=running'
    },
    {
      title: '错误环境',
      value: stats?.error_environments || 0,
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      link: '/environments?status=error'
    }
  ];

  return (
    <div className="space-y-8">
      {/* 概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card) => (
          <Link key={card.title} to={card.link} className="block">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${card.bgColor} p-3 rounded-lg`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 客户状态分布 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">客户状态分布</h3>
            <Link
              to="/customers"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              查看全部
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Badge variant="success" className="mr-2">活跃</Badge>
                <span className="text-sm text-gray-600">正常运营的客户</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {stats?.active_customers || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Badge variant="info" className="mr-2">试用</Badge>
                <span className="text-sm text-gray-600">试用期客户</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {stats?.trial_customers || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Badge variant="danger" className="mr-2">已过期</Badge>
                <span className="text-sm text-gray-600">合同已过期</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {stats?.expired_customers || 0}
              </span>
            </div>
          </div>
        </Card>

        {/* 环境状态分布 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">环境状态分布</h3>
            <Link
              to="/environments"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              查看全部
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Badge variant="success" className="mr-2">运行中</Badge>
                <span className="text-sm text-gray-600">正常运行</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {stats?.running_environments || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Badge variant="danger" className="mr-2">已停止</Badge>
                <span className="text-sm text-gray-600">已停止运行</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {stats?.stopped_environments || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Badge variant="warning" className="mr-2">部署中</Badge>
                <span className="text-sm text-gray-600">正在部署</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {stats?.pending_environments || 0}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* 部署类型分布 */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">部署类型分布</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <ServerIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">在线部署</p>
                <p className="text-xs text-gray-500">云端托管服务</p>
              </div>
            </div>
            <span className="text-2xl font-semibold text-blue-600">
              {stats?.online_customers || 0}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <KeyIcon className="h-8 w-8 text-gray-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">离线部署</p>
                <p className="text-xs text-gray-500">本地化部署</p>
              </div>
            </div>
            <span className="text-2xl font-semibold text-gray-600">
              {stats?.offline_customers || 0}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
