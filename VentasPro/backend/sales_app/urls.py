from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VendedorViewSet, ReglaComisionViewSet,
    VentaViewSet, ComisionViewSet
)

# Crear el router para registrar los ViewSets
router = DefaultRouter()
router.register(r'vendedores', VendedorViewSet, basename='vendedor')
router.register(r'reglas', ReglaComisionViewSet, basename='regla')
router.register(r'ventas', VentaViewSet, basename='venta')
router.register(r'comisiones', ComisionViewSet, basename='comision')

urlpatterns = [
    path('', include(router.urls)),
]
