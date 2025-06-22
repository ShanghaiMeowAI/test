from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LicenseViewSet, LicenseUsageViewSet, LicenseLogViewSet

router = DefaultRouter()
router.register('licenses', LicenseViewSet)
router.register('license-usage', LicenseUsageViewSet)
router.register('license-logs', LicenseLogViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
] 