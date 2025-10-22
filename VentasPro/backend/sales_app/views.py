from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg, Q
from datetime import datetime
from decimal import Decimal

from .models import Vendedor, ReglaComision, Venta, ComisionCalculada
from .serializers import (
    VendedorSerializer, VendedorSimpleSerializer,
    ReglaComisionSerializer, VentaSerializer,
    ComisionCalculadaSerializer, ResumenComisionSerializer
)


class VendedorViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar vendedores"""
    queryset = Vendedor.objects.all()
    serializer_class = VendedorSerializer
    
    def get_serializer_class(self):
        """Usa serializer simple para listado, completo para detalle"""
        if self.action == 'list':
            return VendedorSimpleSerializer
        return VendedorSerializer
    
    @action(detail=True, methods=['get'])
    def ventas(self, request, pk=None):
        """Obtiene todas las ventas de un vendedor específico"""
        vendedor = self.get_object()
        ventas = vendedor.ventas.all()
        
        # Filtros opcionales
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')
        
        if fecha_inicio:
            ventas = ventas.filter(fecha__gte=fecha_inicio)
        if fecha_fin:
            ventas = ventas.filter(fecha__lte=fecha_fin)
        
        serializer = VentaSerializer(ventas, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def comisiones(self, request, pk=None):
        """Obtiene el resumen de comisiones de un vendedor"""
        vendedor = self.get_object()
        comisiones = vendedor.comisiones.all()
        
        serializer = ComisionCalculadaSerializer(comisiones, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def activos(self, request):
        """Lista solo los vendedores activos"""
        vendedores = self.queryset.filter(activo=True)
        serializer = VendedorSimpleSerializer(vendedores, many=True)
        return Response(serializer.data)


class ReglaComisionViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar reglas de comisión"""
    queryset = ReglaComision.objects.all()
    serializer_class = ReglaComisionSerializer
    
    def get_queryset(self):
        """Filtra reglas por estado activo si se especifica"""
        queryset = super().get_queryset()
        activas = self.request.query_params.get('activas')
        
        if activas == 'true':
            queryset = queryset.filter(activa=True)
        elif activas == 'false':
            queryset = queryset.filter(activa=False)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def activar(self, request, pk=None):
        """Activa una regla de comisión"""
        regla = self.get_object()
        regla.activa = True
        regla.save()
        
        serializer = self.get_serializer(regla)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def desactivar(self, request, pk=None):
        """Desactiva una regla de comisión"""
        regla = self.get_object()
        regla.activa = False
        regla.save()
        
        serializer = self.get_serializer(regla)
        return Response(serializer.data)


class VentaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar ventas"""
    queryset = Venta.objects.select_related('vendedor').all()
    serializer_class = VentaSerializer
    
    def get_queryset(self):
        """Aplica filtros opcionales a las ventas"""
        queryset = super().get_queryset()
        
        # Filtro por vendedor
        vendedor_id = self.request.query_params.get('vendedor')
        if vendedor_id:
            queryset = queryset.filter(vendedor_id=vendedor_id)
        
        # Filtro por rango de fechas
        fecha_inicio = self.request.query_params.get('fecha_inicio')
        fecha_fin = self.request.query_params.get('fecha_fin')
        
        if fecha_inicio:
            queryset = queryset.filter(fecha__gte=fecha_inicio)
        if fecha_fin:
            queryset = queryset.filter(fecha__lte=fecha_fin)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Obtiene estadísticas generales de ventas"""
        ventas = self.get_queryset()
        
        stats = ventas.aggregate(
            total_ventas=Sum('monto'),
            total_comisiones=Sum('comision_calculada'),
            numero_ventas=Count('id'),
            promedio_venta=Avg('monto'),
            promedio_comision=Avg('comision_calculada')
        )
        
        # Convertir Decimal a float para JSON
        for key, value in stats.items():
            if value is not None:
                stats[key] = float(value) if isinstance(value, Decimal) else value
            else:
                stats[key] = 0
        
        return Response(stats)


class ComisionViewSet(viewsets.ViewSet):
    """ViewSet personalizado para cálculo de comisiones"""
    
    @action(detail=False, methods=['post'])
    def calcular(self, request):
        """
        Calcula comisiones para un período específico
        Parámetros: fecha_inicio, fecha_fin
        """
        fecha_inicio = request.data.get('fecha_inicio')
        fecha_fin = request.data.get('fecha_fin')
        
        if not fecha_inicio or not fecha_fin:
            return Response(
                {'error': 'Se requieren fecha_inicio y fecha_fin'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
            fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Formato de fecha inválido. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if fecha_inicio > fecha_fin:
            return Response(
                {'error': 'La fecha de inicio debe ser anterior a la fecha fin'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener ventas del período
        ventas = Venta.objects.filter(
            fecha__gte=fecha_inicio,
            fecha__lte=fecha_fin
        ).select_related('vendedor')
        
        # Agrupar por vendedor
        vendedores_data = []
        vendedores = Vendedor.objects.filter(
            ventas__fecha__gte=fecha_inicio,
            ventas__fecha__lte=fecha_fin
        ).distinct()
        
        for vendedor in vendedores:
            ventas_vendedor = ventas.filter(vendedor=vendedor)
            
            total_ventas = ventas_vendedor.aggregate(
                total=Sum('monto')
            )['total'] or Decimal('0.00')
            
            total_comision = ventas_vendedor.aggregate(
                total=Sum('comision_calculada')
            )['total'] or Decimal('0.00')
            
            numero_ventas = ventas_vendedor.count()
            
            promedio_venta = total_ventas / numero_ventas if numero_ventas > 0 else Decimal('0.00')
            promedio_comision = total_comision / numero_ventas if numero_ventas > 0 else Decimal('0.00')
            
            vendedor_data = {
                'vendedor_id': vendedor.id,
                'vendedor_nombre': vendedor.nombre,
                'vendedor_apellido': vendedor.apellido,
                'total_ventas': total_ventas,
                'total_comision': total_comision,
                'numero_ventas': numero_ventas,
                'promedio_venta': promedio_venta,
                'promedio_comision': promedio_comision,
                'ventas_detalle': VentaSerializer(ventas_vendedor, many=True).data
            }
            
            vendedores_data.append(vendedor_data)
            
            # Guardar en la base de datos
            ComisionCalculada.objects.create(
                vendedor=vendedor,
                fecha_inicio=fecha_inicio,
                fecha_fin=fecha_fin,
                total_ventas=total_ventas,
                total_comision=total_comision,
                numero_ventas=numero_ventas
            )
        
        serializer = ResumenComisionSerializer(vendedores_data, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def resumen(self, request):
        """
        Obtiene un resumen general de todas las comisiones
        Filtros opcionales: fecha_inicio, fecha_fin
        """
        comisiones = ComisionCalculada.objects.all()
        
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')
        
        if fecha_inicio:
            comisiones = comisiones.filter(fecha_inicio__gte=fecha_inicio)
        if fecha_fin:
            comisiones = comisiones.filter(fecha_fin__lte=fecha_fin)
        
        serializer = ComisionCalculadaSerializer(comisiones, many=True)
        return Response(serializer.data)
