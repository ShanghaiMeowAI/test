interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variantClasses = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    default: 'bg-gray-100 text-gray-800'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm'
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
}

// 预定义的状态徽章
export function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    // 客户状态
    active: { variant: 'success' as const, text: '活跃' },
    inactive: { variant: 'default' as const, text: '未激活' },
    suspended: { variant: 'warning' as const, text: '暂停' },
    expired: { variant: 'danger' as const, text: '已过期' },
    trial: { variant: 'info' as const, text: '试用' },
    
    // 环境状态
    running: { variant: 'success' as const, text: '运行中' },
    stopped: { variant: 'danger' as const, text: '已停止' },
    error: { variant: 'danger' as const, text: '错误' },
    pending: { variant: 'warning' as const, text: '部署中' },
    unknown: { variant: 'default' as const, text: '未知' },
    
    // 部署类型
    online: { variant: 'info' as const, text: '在线部署' },
    offline: { variant: 'default' as const, text: '离线部署' },
    
    // 授权码状态
    revoked: { variant: 'danger' as const, text: '已撤销' },
    
    // 用户角色
    admin: { variant: 'success' as const, text: '管理员' },
    operator: { variant: 'warning' as const, text: '运维员' },
    viewer: { variant: 'info' as const, text: '查看员' }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'default' as const, text: status };

  return (
    <Badge variant={config.variant}>
      {config.text}
    </Badge>
  );
}
