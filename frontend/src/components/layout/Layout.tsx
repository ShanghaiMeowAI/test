import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const pageTitle = {
  '/': '仪表盘',
  '/customers': '客户管理',
  '/environments': '环境管理',
  '/licenses': '授权码管理',
  '/users': '用户管理',
  '/logs': '操作日志',
  '/settings': '系统设置'
};

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const currentTitle = pageTitle[location.pathname as keyof typeof pageTitle] || 'Odoo SaaS 管理平台';

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
      
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header onSidebarToggle={handleSidebarToggle} title={currentTitle} />
        
        <main className="flex-1 py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
