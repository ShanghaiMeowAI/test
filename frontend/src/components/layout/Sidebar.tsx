import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  UserGroupIcon,
  ServerIcon,
  KeyIcon,
  UserIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  
  const navigation = [
    { name: '仪表盘', href: '/', icon: HomeIcon },
    { name: '客户管理', href: '/customers', icon: UserGroupIcon },
    { name: '环境管理', href: '/environments', icon: ServerIcon },
    { name: '授权码管理', href: '/licenses', icon: KeyIcon },
    { name: '用户管理', href: '/users', icon: UserIcon },
    { name: '操作日志', href: '/logs', icon: ChartBarIcon },
    { name: '系统设置', href: '/settings', icon: CogIcon },
  ];

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const displayName = user?.profile?.display_name || user?.username || '用户';
  const userRole = user?.profile?.role === 'admin' ? '管理员' : 
                   user?.profile?.role === 'operator' ? '运维员' : '查看员';

  return (
    <>
      {/* 移动端遮罩 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* 侧边栏 */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ServerIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-gray-900">
                  Odoo SaaS
                </h1>
                <p className="text-sm text-gray-500">运营管理平台</p>
              </div>
            </div>
            
            {/* 移动端关闭按钮 */}
            <button
              className="lg:hidden"
              onClick={onClose}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* 底部用户信息 */}
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {getInitials(displayName)}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{displayName}</p>
                <p className="text-xs text-gray-500">{userRole}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
