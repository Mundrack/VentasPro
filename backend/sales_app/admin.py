from django.contrib import admin
from .models import Vendedor, ReglaComision, Venta, ComisionCalculada


@admin.register(Vendedor)
class VendedorAdmin(admin.ModelAdmin):
    """Configuración del admin para Vendedor"""
    list_display = ['id', 'nombre', 'apellido', 'email', 'telefono', 'activo', 'fecha_ingreso']
    list_filter = ['activo', 'fecha_ingreso']
    search_fields = ['nombre', 'apellido', 'email']
    list_editable = ['activo']
    ordering = ['apellido', 'nombre']


@admin.register(ReglaComision)
class ReglaComisionAdmin(admin.ModelAdmin):
    """Configuración del admin para ReglaComision"""
    list_display = ['id', 'nombre', 'monto_minimo', 'porcentaje', 'activa', 'fecha_creacion']
    list_filter = ['activa', 'fecha_creacion']
    search_fields = ['nombre']
    list_editable = ['activa']
    ordering = ['monto_minimo']
    readonly_fields = ['fecha_creacion', 'fecha_modificacion']


@admin.register(Venta)
class VentaAdmin(admin.ModelAdmin):
    """Configuración del admin para Venta"""
    list_display = [
        'id', 'vendedor', 'fecha', 'monto',
        'comision_calculada', 'porcentaje_aplicado', 'fecha_registro'
    ]
    list_filter = ['fecha', 'vendedor', 'fecha_registro']
    search_fields = ['vendedor__nombre', 'vendedor__apellido', 'descripcion']
    readonly_fields = ['comision_calculada', 'porcentaje_aplicado', 'fecha_registro']
    ordering = ['-fecha', '-fecha_registro']
    date_hierarchy = 'fecha'
    
    fieldsets = (
        ('Información de la Venta', {
            'fields': ('vendedor', 'fecha', 'monto', 'descripcion')
        }),
        ('Comisión Calculada', {
            'fields': ('comision_calculada', 'porcentaje_aplicado'),
            'classes': ('collapse',)
        }),
        ('Información del Sistema', {
            'fields': ('fecha_registro',),
            'classes': ('collapse',)
        }),
    )


@admin.register(ComisionCalculada)
class ComisionCalculadaAdmin(admin.ModelAdmin):
    """Configuración del admin para ComisionCalculada"""
    list_display = [
        'id', 'vendedor', 'fecha_inicio', 'fecha_fin',
        'total_ventas', 'total_comision', 'numero_ventas', 'fecha_calculo'
    ]
    list_filter = ['fecha_inicio', 'fecha_fin', 'fecha_calculo', 'vendedor']
    search_fields = ['vendedor__nombre', 'vendedor__apellido']
    readonly_fields = ['fecha_calculo']
    ordering = ['-fecha_calculo']
    date_hierarchy = 'fecha_inicio'
