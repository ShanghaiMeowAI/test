import axios from 'axios';
import type {
  Customer, Environment, License, User, Stats, ActivityLog, SystemSettings,
  ApiResponse, CustomerFormData, EnvironmentFormData, LicenseFormData, 
  UserFormData, SystemSettingsFormData
} from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// 请求拦截器
api.interceptors.request.use((config) => {
  // 添加认证token
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Token ${token}`;
  }
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// 客户管理API
export const customerApi = {
  // 获取客户列表
  getCustomers: (params?: {
    search?: string;
    status?: string;
    deployment_type?: string;
    page?: number;
  }) => api.get<ApiResponse<Customer>>('/customers/', { params }),

  // 获取客户详情
  getCustomer: (id: number) => api.get<Customer>(`/customers/${id}/`),

  // 创建客户
  createCustomer: (data: CustomerFormData) => api.post<Customer>('/customers/', data),

  // 更新客户
  updateCustomer: (id: number, data: Partial<CustomerFormData>) =>
    api.put<Customer>(`/customers/${id}/`, data),

  // 删除客户
  deleteCustomer: (id: number) => api.delete(`/customers/${id}/`),

  // 获取客户统计
  getStats: () => api.get<Stats>('/customers/stats/'),
};

// 环境管理API
export const environmentApi = {
  // 获取环境列表
  getEnvironments: (params?: {
    search?: string;
    status?: string;
    customer?: number;
    page?: number;
  }) => api.get<ApiResponse<Environment>>('/environments/', { params }),

  // 获取环境详情
  getEnvironment: (id: number) => api.get<Environment>(`/environments/${id}/`),

  // 创建环境
  createEnvironment: (data: EnvironmentFormData) =>
    api.post<Environment>('/environments/', data),

  // 更新环境
  updateEnvironment: (id: number, data: Partial<EnvironmentFormData>) =>
    api.put<Environment>(`/environments/${id}/`, data),

  // 删除环境
  deleteEnvironment: (id: number) => api.delete(`/environments/${id}/`),

  // 启动环境
  startEnvironment: (id: number) =>
    api.post<Environment>(`/environments/${id}/start/`),

  // 停止环境
  stopEnvironment: (id: number) =>
    api.post<Environment>(`/environments/${id}/stop/`),

  // 健康检查
  healthCheck: (id: number) =>
    api.post(`/environments/${id}/health_check/`),

  // 获取环境统计
  getStats: () => api.get<Stats>('/environments/stats/'),
};

// 授权码管理API
export const licenseApi = {
  // 获取授权码列表
  getLicenses: (params?: {
    search?: string;
    status?: string;
    customer?: number;
    license_type?: string;
    page?: number;
  }) => api.get<ApiResponse<License>>('/licenses/', { params }),

  // 获取授权码详情
  getLicense: (id: number) => api.get<License>(`/licenses/${id}/`),

  // 创建授权码
  createLicense: (data: LicenseFormData) => api.post<License>('/licenses/', data),

  // 更新授权码
  updateLicense: (id: number, data: Partial<LicenseFormData>) =>
    api.put<License>(`/licenses/${id}/`, data),

  // 删除授权码
  deleteLicense: (id: number) => api.delete(`/licenses/${id}/`),

  // 激活授权码
  activateLicense: (id: number, data: {
    hardware_fingerprint?: string;
    deployment_domain?: string;
    deployment_ip?: string;
  }) => api.post(`/licenses/${id}/activate/`, data),

  // 撤销授权码
  revokeLicense: (id: number) => api.post(`/licenses/${id}/revoke/`),

  // 验证授权码
  validateLicense: (data: {
    license_key: string;
    hardware_fingerprint?: string;
    current_users?: number;
    current_companies?: number;
    current_storage_gb?: number;
  }) => api.post('/licenses/validate_license/', data),

  // 获取授权码统计
  getStats: () => api.get<Stats>('/licenses/stats/'),

  // 获取使用记录
  getUsageRecords: (params?: { license?: number }) =>
    api.get('/license-usage/', { params }),

  // 获取操作日志
  getLogs: (params?: { license?: number; action?: string }) =>
    api.get('/license-logs/', { params }),
};

// 用户管理API
export const userApi = {
  // 获取当前用户信息
  getCurrentUser: () => api.get<User>('/users/me/'),

  // 获取用户列表
  getUsers: (params?: { 
    search?: string; 
    role?: string;
    page?: number;
  }) => api.get<ApiResponse<User>>('/users/', { params }),

  // 获取用户详情
  getUser: (id: number) => api.get<User>(`/users/${id}/`),

  // 创建用户
  createUser: (data: UserFormData) => api.post<User>('/users/', data),

  // 更新用户
  updateUser: (id: number, data: Partial<UserFormData>) =>
    api.put<User>(`/users/${id}/`, data),

  // 删除用户
  deleteUser: (id: number) => api.delete(`/users/${id}/`),

  // 更新用户资料
  updateProfile: (userId: number, data: any) =>
    api.post(`/users/${userId}/update_profile/`, data),

  // 重置密码
  resetPassword: (userId: number, newPassword: string) =>
    api.post(`/users/${userId}/reset_password/`, { password: newPassword }),
};

// 操作日志API
export const activityLogApi = {
  // 获取操作日志列表
  getLogs: (params?: {
    user?: number;
    action?: string;
    target_type?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
  }) => api.get<ApiResponse<ActivityLog>>('/user-activity-logs/', { params }),

  // 获取日志详情
  getLog: (id: number) => api.get<ActivityLog>(`/user-activity-logs/${id}/`),
};

// 系统设置API
export const systemSettingsApi = {
  // 获取系统设置
  getSettings: () => api.get<SystemSettings>('/system/settings/'),

  // 更新系统设置
  updateSettings: (data: SystemSettingsFormData) =>
    api.put<SystemSettings>('/system/settings/update/', data),

  // 获取系统信息
  getSystemInfo: () => api.get('/system/info/'),

  // 备份数据库
  backupDatabase: () => api.post('/system/backup/'),

  // 清理日志
  cleanLogs: (days: number) => api.post('/system/clean-logs/', { days }),
};

// 认证API
export const authApi = {
  // 用户登录
  login: (username: string, password: string) =>
    api.post('/login/', { username, password }),

  // 用户登出
  logout: () => api.post('/logout/'),
};

// 系统API
export const systemApi = {
  // 健康检查
  healthCheck: () => api.get('/health/'),

  // 获取综合统计
  getOverallStats: async () => {
    const [customerStats, environmentStats, licenseStats] = await Promise.all([
      customerApi.getStats(),
      environmentApi.getStats(),
      licenseApi.getStats()
    ]);
    return {
      ...customerStats.data,
      ...environmentStats.data,
      ...licenseStats.data
    };
  },
};

export default api;
