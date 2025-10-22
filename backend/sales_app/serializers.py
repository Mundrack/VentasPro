from rest_framework import serializers
from .models import Vendedor, ReglaComision, Venta, ComisionCalculada


class VendedorSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Vendedor"""
    total_ventas = serializers.SerializerMethodField()
    total_comisiones = serializers.SerializerMethodField()
    
    class Meta:
        model = Vendedor
        fields = [
            'id', 'nombre', 'apellido', 'email', 'telefono',
            'fecha_ingreso', 'activo', 'total_ventas', 'total_comisiones'
        ]
        read_only_fields = ['fecha_ingreso']
    
    def get_total_ventas(self, obj):
        """Obtiene el total de ventas del vendedor"""
        return obj.ventas.count()
    
    def get_total_comisiones(self, obj):
        """Obtiene el total de comisiones del vendedor"""
        total = sum(venta.comision_calculada for venta in obj.ventas.all())
        return float(total)


class VendedorSimpleSerializer(serializers.ModelSerializer):
    """Serializer simple para el modelo Vendedor (sin datos calculados)"""
    nombre_completo = serializers.SerializerMethodField()
    
    class Meta:
        model = Vendedor
        fields = ['id', 'nombre', 'apellido', 'nombre_completo', 'email']
    
    def get_nombre_completo(self, obj):
        return f"{obj.nombre} {obj.apellido}"


class ReglaComisionSerializer(serializers.ModelSerializer):
    """Serializer para el modelo ReglaComision"""
    
    class Meta:
        model = ReglaComision
        fields = [
            'id', 'nombre', 'monto_minimo', 'porcentaje',
            'activa', 'fecha_creacion', 'fecha_modificacion'
        ]
        read_only_fields = ['fecha_creacion', 'fecha_modificacion']
    
    def validate_porcentaje(self, value):
        """Valida que el porcentaje esté entre 0 y 100"""
        if value < 0 or value > 100:
            raise serializers.ValidationError(
                "El porcentaje debe estar entre 0 y 100"
            )
        return value


class VentaSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Venta"""
    vendedor_nombre = serializers.CharField(
        source='vendedor.nombre',
        read_only=True
    )
    vendedor_apellido = serializers.CharField(
        source='vendedor.apellido',
        read_only=True
    )
    vendedor_completo = serializers.SerializerMethodField()
    
    class Meta:
        model = Venta
        fields = [
            'id', 'vendedor', 'vendedor_nombre', 'vendedor_apellido',
            'vendedor_completo', 'fecha', 'monto', 'descripcion',
            'comision_calculada', 'porcentaje_aplicado', 'fecha_registro'
        ]
        read_only_fields = [
            'comision_calculada', 'porcentaje_aplicado', 'fecha_registro'
        ]
    
    def get_vendedor_completo(self, obj):
        return f"{obj.vendedor.nombre} {obj.vendedor.apellido}"
    
    def validate_monto(self, value):
        """Valida que el monto sea positivo"""
        if value <= 0:
            raise serializers.ValidationError(
                "El monto debe ser mayor que cero"
            )
        return value


class ComisionCalculadaSerializer(serializers.ModelSerializer):
    """Serializer para el modelo ComisionCalculada"""
    vendedor_nombre = serializers.CharField(
        source='vendedor.nombre',
        read_only=True
    )
    vendedor_apellido = serializers.CharField(
        source='vendedor.apellido',
        read_only=True
    )
    promedio_venta = serializers.SerializerMethodField()
    promedio_comision = serializers.SerializerMethodField()
    
    class Meta:
        model = ComisionCalculada
        fields = [
            'id', 'vendedor', 'vendedor_nombre', 'vendedor_apellido',
            'fecha_inicio', 'fecha_fin', 'total_ventas', 'total_comision',
            'numero_ventas', 'promedio_venta', 'promedio_comision',
            'fecha_calculo'
        ]
        read_only_fields = ['fecha_calculo']
    
    def get_promedio_venta(self, obj):
        """Calcula el promedio por venta"""
        if obj.numero_ventas > 0:
            return float(obj.total_ventas / obj.numero_ventas)
        return 0.0
    
    def get_promedio_comision(self, obj):
        """Calcula el promedio de comisión por venta"""
        if obj.numero_ventas > 0:
            return float(obj.total_comision / obj.numero_ventas)
        return 0.0


class ResumenComisionSerializer(serializers.Serializer):
    """Serializer para resúmenes de comisiones personalizados"""
    vendedor_id = serializers.IntegerField()
    vendedor_nombre = serializers.CharField()
    vendedor_apellido = serializers.CharField()
    total_ventas = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_comision = serializers.DecimalField(max_digits=10, decimal_places=2)
    numero_ventas = serializers.IntegerField()
    promedio_venta = serializers.DecimalField(max_digits=10, decimal_places=2)
    promedio_comision = serializers.DecimalField(max_digits=10, decimal_places=2)
    ventas_detalle = VentaSerializer(many=True, read_only=True)
