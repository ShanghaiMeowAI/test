import { Bars3Icon, BellIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onSidebarToggle: () => void;
  title: string;
}

export function Header({ onSidebarToggle, title }: HeaderProps) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const displayName = user?.profile?.display_name || user?.username || '用户';
  const userRole = user?.profile?.role === 'admin' ? '管理员' : 
                   user?.profile?.role === 'operator' ? '运维员' : '查看员';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          {/* 移动端菜单按钮 */}
          <button
            type="button"
            className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={onSidebarToggle}
          >
            <span className="sr-only">打开侧边栏</span>
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* 页面标题 */}
          <h1 className="ml-4 text-2xl font-semibold text-gray-900 lg:ml-0">
            {title}
          </h1>
        </div>

        {/* 右侧操作栏 */}
        <div className="flex items-center space-x-4">
          {/* 通知按钮 */}
          <button
            type="button"
            className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span className="sr-only">查看通知</span>
            <BellIcon className="h-6 w-6" />
          </button>

          {/* 用户菜单 */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {getInitials(displayName)}
                    </span>
                  </div>
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-700">{displayName}</div>
                  <div className="text-xs text-gray-500">{userRole}</div>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </div>
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <div className="font-medium">{displayName}</div>
                      <div className="text-xs text-gray-500">{user?.email}</div>
                    </div>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="#"
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block px-4 py-2 text-sm text-gray-700`}
                    >
                      个人设置
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                    >
                      登出
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
}
