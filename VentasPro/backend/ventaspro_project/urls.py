"""
URL Configuration for VentasPro
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Admin panel
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/', include('sales_app.urls')),
    
    # API auth (opcional, para futuras mejoras)
    path('api-auth/', include('rest_framework.urls')),
]

# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Personalizar el admin
admin.site.site_header = "VentasPro - Administración"
admin.site.site_title = "VentasPro Admin"
admin.site.index_title = "Panel de Administración"
