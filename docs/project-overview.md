# Odoo SaaS 管理平台项目概述

## 项目背景

### 业务现状

- 公司将 Odoo 软件 SaaS 化，通过 Helm Chart 部署客户环境
- 每个新客户签约后，创建独立的 values 文件，执行 helm install 部署新环境
- 自动处理端口映射、域名绑定、HTTPS 证书
- 所有客户共用 odoo 命名空间，通过 release 名称区分
- 目前已有客户上线运行

### 问题现状

- 客户签约、环境部署、运维管理都是手动操作
- 缺乏统一的管理界面查看客户状态和服务状态
- 员工权限管理混乱
- 离线部署客户需要手动提供授权码

## 项目目标

构建一个 SaaS 运营管理平台，实现：

- 客户签约生命周期管理
- 可视化配置 Helm values 并自动部署
- K8s 环境统一监控和管理
- 员工权限分级管理
- 离线客户授权码管理

## 技术架构

### 总体架构

- **前端**: React + TypeScript + Tailwind CSS (Create React App)
- **后端**: Django + Django REST Framework
- **数据库**: PostgreSQL
- **容器编排**: 单 Kubernetes 集群
- **部署工具**: Helm 3

### 集成组件

- **Kubernetes Python Client**: 监控 Pod 状态和资源
- **Python Helm Client**: 执行 Helm 操作（推荐 pyhelmclient 库）
- **Django Admin**: 快速后台管理界面

## 核心功能模块

### 1. 客户管理

- 客户基本信息维护
- 签约状态跟踪
- 部署类型管理（在线/离线）
- 客户生命周期状态

### 2. 环境配置管理

- 基于 values 模板的可视化配置界面
- 支持核心配置项：客户 ID、域名、Git 仓库、密码等
- 配置模板管理和版本控制
- 已上线环境的纳管功能

### 3. K8s 服务管理

- Helm Chart 部署和更新
- 服务状态实时监控（Running/Stopped/Error/Pending）
- 环境启停控制
- 资源使用情况查看
- Pod 日志查看

### 4. 用户权限管理

- **Admin**: 全部权限
- **Operator**: 客户管理、环境操作
- **Viewer**: 只读查看权限

### 5. 离线授权管理

- 基于时间的授权码生成算法
- 授权码有效期管理
- 客户授权历史记录
- 与 Odoo 二开模块对接的验证机制

## Kubernetes 环境说明

### 命名空间设计

- 所有客户环境部署在**odoo**命名空间
- 通过 Helm Release 名称区分不同客户
- Release 命名规范：{customer-id}-{service-name}

### 资源识别

- 通过 Pod 标签识别客户环境
- 通过 Release 名称关联客户数据
- 共享命名空间简化权限管理

## 数据模型设计

### 客户实体

- 客户唯一标识、基本信息
- 部署类型、服务状态
- 签约时间、到期时间

### 环境实体

- 关联客户、Helm Release 信息
- 固定使用 odoo 命名空间
- Values 配置和 Git 仓库信息
- 部署状态和资源配置

### 权限实体

- 用户角色和权限映射
- 操作日志记录

### 授权实体

- 离线授权码生成记录
- 授权有效期和使用状态

## Values 配置说明

### 核心配置项（不可缺少）

- **customer.id**: 客户唯一标识
- **releaseNameOverride**: Helm Release 名称
- **git.customerAddons**: 客户专属模块仓库配置
- **ingress.host**: 客户访问域名
- **odoo.config.admin_passwd**: Odoo 管理员密码

### 可选配置项

- 资源限制配置
- 存储扩容配置
- PostgreSQL 配置
- TLS 证书配置

## 开发优先级

### Phase 1: 基础数据管理

1. 客户信息管理 CRUD
2. 环境配置管理
3. 用户权限系统

### Phase 2: K8s 集成

1. Helm 部署功能集成
2. Kubernetes 状态监控
3. 环境启停控制

### Phase 3: 高级功能

1. 可视化配置界面
2. 离线授权码系统
3. 监控告警功能

## 部署和纳管策略

### 新客户部署

1. 客户签约录入系统
2. 可视化配置 values
3. 自动生成 Helm 部署命令
4. 监控部署状态

### 已上线客户纳管

1. 手动录入客户信息
2. 关联现有 Kubernetes 资源
3. 同步配置信息到系统
4. 纳入统一监控管理

### 离线客户管理

1. 生成基于时间的授权码
2. 提供离线安装包
3. 授权码验证算法对接 Odoo
4. 定期授权码更新机制

## 技术选择说明

### 为什么选择 Django

- 内置 Admin 界面适合管理系统
- ORM 避免 SQL 错误
- 权限系统成熟
- REST Framework 支持完善

### 为什么选择 React

- TypeScript 类型安全
- 组件化开发适合管理界面
- 生态成熟稳定

### 为什么选择单集群设计

- 当前业务规模适合
- 避免过度设计
- 多集群需求预计一年后才出现

## 安全考虑

- Kubernetes 集群访问权限控制
- 客户数据隔离（通过 Release 区分）
- 敏感信息加密存储
- 操作审计日志
- 授权码防伪机制
