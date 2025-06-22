from django.db import models
from django.contrib.auth.models import User
from customers.models import Customer

class Environment(models.Model):
    STATUS_CHOICES = [
        ('running', '运行中'),
        ('stopped', '已停止'),
        ('error', '错误'),
        ('pending', '部署中'),
        ('unknown', '未知'),
    ]
    
    # 关联信息
    customer = models.ForeignKey(
        Customer, 
        on_delete=models.CASCADE, 
        related_name='environments',
        verbose_name='客户'
    )
    
    # === 基础配置 ===
    release_name = models.CharField(max_length=100, verbose_name='Release名称')
    namespace = models.CharField(max_length=50, default='odoo', verbose_name='命名空间')
    domain = models.CharField(max_length=200, verbose_name='访问域名', blank=True)
    
    # Odoo基础配置
    admin_password = models.CharField(max_length=100, verbose_name='管理员密码')
    odoo_version = models.CharField(max_length=20, default='18.0', verbose_name='Odoo版本')
    workers = models.IntegerField(default=0, verbose_name='Worker数量')
    log_level = models.CharField(max_length=20, default='info', verbose_name='日志级别')
    
    # === Git配置 ===
    git_ssh_secret = models.CharField(max_length=100, default='global-git-ssh-key', verbose_name='Git SSH密钥')
    git_odoo_repository = models.CharField(
        max_length=200, 
        default='git@github.com:ShanghaiMeowAI/MeowCloud.git',
        verbose_name='Odoo核心仓库'
    )
    git_odoo_ref = models.CharField(max_length=100, default='18.0', verbose_name='Odoo分支')
    git_customer_addons = models.JSONField(default=list, verbose_name='客户Addons仓库')
    
    # === 存储配置 ===
    storage_class = models.CharField(max_length=50, default='longhorn-expandable', verbose_name='存储类')
    storage_size = models.CharField(max_length=20, default='10Gi', verbose_name='Filestore存储大小')
    storage_auto_expand = models.BooleanField(default=True, verbose_name='自动扩容')
    storage_expand_threshold = models.IntegerField(default=85, verbose_name='扩容阈值(%)')
    storage_expand_size = models.CharField(max_length=20, default='5Gi', verbose_name='扩容增量')
    storage_max_size = models.CharField(max_length=20, default='50Gi', verbose_name='最大存储')
    
    # === 数据库配置 ===
    db_enabled = models.BooleanField(default=True, verbose_name='内置PostgreSQL')
    db_version = models.CharField(max_length=10, default='16', verbose_name='PostgreSQL版本')
    db_instances = models.IntegerField(default=1, verbose_name='数据库实例数')
    db_storage_size = models.CharField(max_length=20, default='5Gi', verbose_name='数据库存储')
    db_cpu_request = models.CharField(max_length=20, default='100m', verbose_name='数据库CPU请求')
    db_memory_request = models.CharField(max_length=20, default='256Mi', verbose_name='数据库内存请求')
    db_cpu_limit = models.CharField(max_length=20, default='500m', verbose_name='数据库CPU限制')
    db_memory_limit = models.CharField(max_length=20, default='512Mi', verbose_name='数据库内存限制')
    
    # 外部数据库配置
    external_db_enabled = models.BooleanField(default=False, verbose_name='使用外部数据库')
    external_db_host = models.CharField(max_length=200, blank=True, verbose_name='外部数据库主机')
    external_db_port = models.IntegerField(default=5432, verbose_name='外部数据库端口')
    external_db_name = models.CharField(max_length=100, blank=True, verbose_name='外部数据库名')
    external_db_user = models.CharField(max_length=100, blank=True, verbose_name='外部数据库用户')
    
    # === 网络配置 ===
    ingress_enabled = models.BooleanField(default=False, verbose_name='启用Ingress')
    ingress_class = models.CharField(max_length=50, default='nginx', verbose_name='Ingress类')
    ingress_path = models.CharField(max_length=100, default='/', verbose_name='访问路径')
    tls_enabled = models.BooleanField(default=False, verbose_name='启用TLS')
    tls_secret_name = models.CharField(max_length=100, blank=True, verbose_name='TLS证书Secret')
    
    # === 资源配置 ===
    cpu_request = models.CharField(max_length=20, default='200m', verbose_name='CPU请求')
    memory_request = models.CharField(max_length=20, default='512Mi', verbose_name='内存请求')
    cpu_limit = models.CharField(max_length=20, default='1000m', verbose_name='CPU限制')
    memory_limit = models.CharField(max_length=20, default='2Gi', verbose_name='内存限制')
    
    # === 高级Odoo配置 ===
    limit_request = models.IntegerField(default=8192, verbose_name='请求限制')
    limit_memory_hard = models.CharField(max_length=20, default='2684354560', verbose_name='硬内存限制')
    limit_memory_soft = models.CharField(max_length=20, default='2147483648', verbose_name='软内存限制')
    proxy_mode = models.BooleanField(default=False, verbose_name='代理模式')
    list_db = models.BooleanField(default=False, verbose_name='显示数据库列表')
    db_filter = models.CharField(max_length=100, blank=True, verbose_name='数据库过滤器')
    
    # 状态信息
    status = models.CharField(
        max_length=10, 
        choices=STATUS_CHOICES, 
        default='pending',
        verbose_name='运行状态'
    )
    last_health_check = models.DateTimeField(blank=True, null=True, verbose_name='最后健康检查')
    
    # 部署信息
    helm_values = models.JSONField(default=dict, verbose_name='完整Helm Values')
    deployed_at = models.DateTimeField(blank=True, null=True, verbose_name='部署时间')
    
    # 元数据
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True,
        verbose_name='创建人'
    )

    class Meta:
        verbose_name = '环境'
        verbose_name_plural = '环境管理'
        ordering = ['-created_at']
        unique_together = ['release_name', 'namespace']

    def __str__(self):
        return f"{self.customer.name} - {self.release_name}"

    @property
    def is_running(self):
        return self.status == 'running'

    @property
    def access_url(self):
        if self.domain:
            protocol = 'https' if self.tls_enabled else 'http'
            return f"{protocol}://{self.domain}"
        return None

    def generate_helm_values(self):
        """生成完整的Helm Values配置"""
        values = {
            'releaseNameOverride': self.release_name,
            'customer': {
                'id': self.customer.customer_id
            },
            'image': {
                'repository': 'docker.public.mmiao.net/meowcloud/odoo-runtime-base',
                'tag': f'{self.odoo_version}-py3.12',
                'pullPolicy': 'IfNotPresent'
            },
            'git': {
                'ssh': {
                    'secretName': self.git_ssh_secret
                },
                'odooCore': {
                    'repository': self.git_odoo_repository,
                    'ref': self.git_odoo_ref
                },
                'customerAddons': self.git_customer_addons
            },
            'storage': {
                'storageClass': {
                    'create': True,
                    'name': self.storage_class,
                    'provisioner': 'driver.longhorn.io',
                    'reclaimPolicy': 'Retain',
                    'allowVolumeExpansion': True
                },
                'expansion': {
                    'enabled': self.storage_auto_expand,
                    'auto': {
                        'enabled': self.storage_auto_expand,
                        'expandThreshold': self.storage_expand_threshold,
                        'expandSize': self.storage_expand_size,
                        'maxSize': self.storage_max_size
                    }
                }
            },
            'odoo': {
                'service': {
                    'port': 8069,
                    'type': 'ClusterIP'
                },
                'config': {
                    'admin_passwd': self.admin_password,
                    'workers': self.workers,
                    'limit_request': self.limit_request,
                    'limit_memory_hard': self.limit_memory_hard,
                    'limit_memory_soft': self.limit_memory_soft,
                    'log_level': self.log_level,
                    'proxy_mode': self.proxy_mode or self.ingress_enabled,
                    'extraParams': {}
                },
                'persistence': {
                    'filestore': {
                        'enabled': True,
                        'mountPath': '/opt/odoo/filestore',
                        'size': self.storage_size,
                        'storageClass': self.storage_class
                    }
                }
            },
            'postgresql': {
                'enabled': self.db_enabled,
                'version': self.db_version,
                'numberOfInstances': self.db_instances,
                'persistence': {
                    'size': self.db_storage_size,
                    'storageClass': self.storage_class
                },
                'resources': {
                    'requests': {
                        'cpu': self.db_cpu_request,
                        'memory': self.db_memory_request
                    },
                    'limits': {
                        'cpu': self.db_cpu_limit,
                        'memory': self.db_memory_limit
                    }
                }
            },
            'ingress': {
                'enabled': self.ingress_enabled,
                'className': self.ingress_class,
                'host': self.domain,
                'path': self.ingress_path,
                'pathType': 'Prefix',
                'tls': {
                    'enabled': self.tls_enabled,
                    'secretName': self.tls_secret_name
                }
            },
            'resources': {
                'requests': {
                    'cpu': self.cpu_request,
                    'memory': self.memory_request
                },
                'limits': {
                    'cpu': self.cpu_limit,
                    'memory': self.memory_limit
                }
            }
        }
        
        # 添加外部数据库配置
        if self.external_db_enabled:
            values['postgresql']['external'] = {
                'enabled': True,
                'host': self.external_db_host,
                'port': self.external_db_port,
                'user': self.external_db_user,
                'databaseName': self.external_db_name
            }
        
        # 添加额外的Odoo配置
        if self.list_db:
            values['odoo']['config']['extraParams']['list_db'] = 'True'
        if self.db_filter:
            values['odoo']['config']['extraParams']['dbfilter'] = self.db_filter
            
        self.helm_values = values
        return values

class EnvironmentLog(models.Model):
    """环境操作日志"""
    LOG_TYPES = [
        ('deploy', '部署'),
        ('start', '启动'),
        ('stop', '停止'),
        ('update', '更新'),
        ('delete', '删除'),
        ('health_check', '健康检查'),
    ]
    
    environment = models.ForeignKey(
        Environment, 
        on_delete=models.CASCADE, 
        related_name='logs',
        verbose_name='环境'
    )
    log_type = models.CharField(max_length=20, choices=LOG_TYPES, verbose_name='操作类型')
    message = models.TextField(verbose_name='日志信息')
    status = models.CharField(max_length=20, verbose_name='操作状态')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True,
        verbose_name='操作人'
    )

    class Meta:
        verbose_name = '环境日志'
        verbose_name_plural = '环境日志'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.environment.release_name} - {self.get_log_type_display()}"
