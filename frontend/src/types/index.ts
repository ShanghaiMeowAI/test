// 客户相关类型
export interface Customer {
  id: number;
  customer_id: string;
  name: string;
  company: string;
  contact_email: string;
  contact_phone: string;
  deployment_type: 'online' | 'offline';
  status: 'active' | 'suspended' | 'expired' | 'trial';
  contract_start_date?: string;
  contract_end_date?: string;
  notes: string;
  created_at: string;
  updated_at: string;
  environments_count: number;
  is_active: boolean;
}

// 授权码相关类型
export interface License {
  id: number;
  license_key: string;
  license_type: 'trial' | 'standard' | 'professional' | 'enterprise';
  customer: number;
  customer_name: string;
  max_users: number;
  max_companies: number;
  max_storage_gb: number;
  modules_enabled: string[];
  issued_at: string;
  valid_from: string;
  valid_until: string;
  status: 'active' | 'expired' | 'revoked' | 'pending';
  activated_at?: string;
  last_check?: string;
  hardware_fingerprint: string;
  deployment_domain: string;
  deployment_ip?: string;
  notes: string;
  is_valid: boolean;
  days_remaining: number;
}

export interface LicenseUsage {
  id: number;
  license: number;
  license_key: string;
  customer_name: string;
  current_users: number;
  current_companies: number;
  current_storage_gb: number;
  access_ip: string;
  user_agent: string;
  checked_at: string;
}

export interface LicenseLog {
  id: number;
  license: number;
  license_key: string;
  customer_name: string;
  action: 'generate' | 'activate' | 'revoke' | 'check' | 'expire';
  message: string;
  ip_address?: string;
  created_at: string;
  created_by?: number;
  created_by_name?: string;
}

// 环境相关类型
export interface Environment {
  id: number;
  customer: number;
  customer_name: string;
  
  // 基础配置
  release_name: string;
  namespace: string;
  domain: string;
  
  // Odoo基础配置
  admin_password: string;
  odoo_version: string;
  workers: number;
  log_level: string;
  
  // Git配置
  git_ssh_secret: string;
  git_odoo_repository: string;
  git_odoo_ref: string;
  git_customer_addons: GitRepository[];
  
  // 存储配置
  storage_class: string;
  storage_size: string;
  storage_auto_expand: boolean;
  storage_expand_threshold: number;
  storage_expand_size: string;
  storage_max_size: string;
  
  // 数据库配置
  db_enabled: boolean;
  db_version: string;
  db_instances: number;
  db_storage_size: string;
  db_cpu_request: string;
  db_memory_request: string;
  db_cpu_limit: string;
  db_memory_limit: string;
  
  // 外部数据库配置
  external_db_enabled: boolean;
  external_db_host: string;
  external_db_port: number;
  external_db_name: string;
  external_db_user: string;
  
  // 网络配置
  ingress_enabled: boolean;
  ingress_class: string;
  ingress_path: string;
  tls_enabled: boolean;
  tls_secret_name: string;
  
  // 资源配置
  cpu_request: string;
  memory_request: string;
  cpu_limit: string;
  memory_limit: string;
  
  // 高级Odoo配置
  limit_request: number;
  limit_memory_hard: string;
  limit_memory_soft: string;
  proxy_mode: boolean;
  list_db: boolean;
  db_filter: string;
  
  // 状态信息
  status: 'running' | 'stopped' | 'error' | 'pending' | 'unknown';
  last_health_check?: string;
  deployed_at?: string;
  created_at: string;
  updated_at: string;
  is_running: boolean;
  access_url?: string;
  helm_values: any;
}

export interface GitRepository {
  name: string;
  repository: string;
  ref: string;
}

export interface EnvironmentLog {
  id: number;
  environment: number;
  environment_name: string;
  log_type: 'deploy' | 'start' | 'stop' | 'update' | 'delete' | 'health_check';
  message: string;
  status: string;
  created_at: string;
  created_by?: number;
  created_by_name?: string;
}

// 用户相关类型
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  date_joined: string;
  last_login?: string;
  profile?: UserProfile;
}

export interface UserProfile {
  role: 'admin' | 'operator' | 'viewer';
  phone: string;
  department: string;
  position: string;
  can_manage_customers: boolean;
  can_manage_environments: boolean;
  can_view_logs: boolean;
  can_generate_licenses: boolean;
  display_name: string;
  is_admin: boolean;
  is_operator: boolean;
}

export interface CurrentUser extends User {
  permissions?: {
    can_manage_customers: boolean;
    can_manage_environments: boolean;
    can_view_logs: boolean;
    can_generate_licenses: boolean;
    is_admin: boolean;
    is_operator: boolean;
  };
}

// 操作日志类型
export interface ActivityLog {
  id: number;
  user: number;
  user_name: string;
  action: 'login' | 'logout' | 'create_customer' | 'update_customer' | 'delete_customer' | 
          'deploy_environment' | 'start_environment' | 'stop_environment' | 'generate_license';
  target_type: string;
  target_id: string;
  description: string;
  ip_address?: string;
  user_agent: string;
  created_at: string;
}

// 系统设置类型
export interface SystemSettings {
  id: number;
  site_name: string;
  site_description: string;
  admin_email: string;
  maintenance_mode: boolean;
  max_upload_size: number;
  session_timeout: number;
  backup_enabled: boolean;
  backup_frequency: 'daily' | 'weekly' | 'monthly';
  log_retention_days: number;
  email_notifications: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_use_tls: boolean;
  smtp_username: string;
  smtp_password: string;
  updated_at: string;
  updated_by?: number;
}

// API响应类型
export interface ApiResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface Stats {
  // 客户统计
  total_customers: number;
  active_customers: number;
  online_customers: number;
  offline_customers: number;
  trial_customers: number;
  expired_customers: number;
  
  // 环境统计
  total_environments: number;
  running_environments: number;
  stopped_environments: number;
  error_environments: number;
  pending_environments: number;
  
  // 授权码统计
  total_licenses: number;
  active_licenses: number;
  expired_licenses: number;
  revoked_licenses: number;
  pending_licenses: number;
}

// 表单类型
export interface CustomerFormData {
  customer_id: string;
  name: string;
  company: string;
  contact_email: string;
  contact_phone: string;
  deployment_type: 'online' | 'offline';
  status: 'active' | 'suspended' | 'expired' | 'trial';
  contract_start_date?: string;
  contract_end_date?: string;
  notes: string;
}

export interface EnvironmentFormData {
  // 基础配置
  customer: number;
  release_name: string;
  namespace: string;
  domain: string;
  
  // Odoo基础配置
  admin_password: string;
  odoo_version: string;
  workers: number;
  log_level: string;
  
  // Git配置
  git_ssh_secret: string;
  git_odoo_repository: string;
  git_odoo_ref: string;
  git_customer_addons: GitRepository[];
  
  // 存储配置
  storage_class: string;
  storage_size: string;
  storage_auto_expand: boolean;
  storage_expand_threshold: number;
  storage_expand_size: string;
  storage_max_size: string;
  
  // 数据库配置
  db_enabled: boolean;
  db_version: string;
  db_instances: number;
  db_storage_size: string;
  db_cpu_request: string;
  db_memory_request: string;
  db_cpu_limit: string;
  db_memory_limit: string;
  
  // 外部数据库配置
  external_db_enabled: boolean;
  external_db_host: string;
  external_db_port: number;
  external_db_name: string;
  external_db_user: string;
  
  // 网络配置
  ingress_enabled: boolean;
  ingress_class: string;
  ingress_path: string;
  tls_enabled: boolean;
  tls_secret_name: string;
  
  // 资源配置
  cpu_request: string;
  memory_request: string;
  cpu_limit: string;
  memory_limit: string;
  
  // 高级Odoo配置
  limit_request: number;
  limit_memory_hard: string;
  limit_memory_soft: string;
  proxy_mode: boolean;
  list_db: boolean;
  db_filter: string;
}

export interface LicenseFormData {
  license_type: 'trial' | 'standard' | 'professional' | 'enterprise';
  customer: number;
  max_users: number;
  max_companies: number;
  max_storage_gb: number;
  modules_enabled: string[];
  valid_from: string;
  valid_until: string;
  notes: string;
}

export interface UserFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
  is_active: boolean;
  profile: {
    role: 'admin' | 'operator' | 'viewer';
    phone: string;
    department: string;
    position: string;
    can_manage_customers: boolean;
    can_manage_environments: boolean;
    can_view_logs: boolean;
    can_generate_licenses: boolean;
  };
}

export interface SystemSettingsFormData {
  site_name: string;
  site_description: string;
  admin_email: string;
  maintenance_mode: boolean;
  max_upload_size: number;
  session_timeout: number;
  backup_enabled: boolean;
  backup_frequency: 'daily' | 'weekly' | 'monthly';
  log_retention_days: number;
  email_notifications: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_use_tls: boolean;
  smtp_username: string;
  smtp_password: string;
}
