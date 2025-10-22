from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Vendedor(models.Model):
    """Modelo para representar a los vendedores"""
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    fecha_ingreso = models.DateField(auto_now_add=True)
    activo = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'vendedores'
        verbose_name = 'Vendedor'
        verbose_name_plural = 'Vendedores'
        ordering = ['apellido', 'nombre']
    
    def __str__(self):
        return f"{self.nombre} {self.apellido}"


class ReglaComision(models.Model):
    """Modelo para definir las reglas de comisión"""
    nombre = models.CharField(max_length=100)
    monto_minimo = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Monto mínimo de venta para aplicar esta comisión"
    )
    porcentaje = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Porcentaje de comisión (ejemplo: 5.00 para 5%)"
    )
    activa = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reglas_comision'
        verbose_name = 'Regla de Comisión'
        verbose_name_plural = 'Reglas de Comisión'
        ordering = ['monto_minimo']
    
    def __str__(self):
        return f"{self.nombre} - {self.porcentaje}% (Min: ${self.monto_minimo})"


class Venta(models.Model):
    """Modelo para registrar las ventas"""
    vendedor = models.ForeignKey(
        Vendedor,
        on_delete=models.CASCADE,
        related_name='ventas'
    )
    fecha = models.DateField()
    monto = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    descripcion = models.TextField(blank=True, null=True)
    comision_calculada = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        editable=False
    )
    porcentaje_aplicado = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        editable=False
    )
    fecha_registro = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ventas'
        verbose_name = 'Venta'
        verbose_name_plural = 'Ventas'
        ordering = ['-fecha', '-fecha_registro']
    
    def __str__(self):
        return f"Venta #{self.id} - {self.vendedor} - ${self.monto}"
    
    def calcular_comision(self):
        """Calcula la comisión basada en las reglas activas"""
        reglas = ReglaComision.objects.filter(
            activa=True,
            monto_minimo__lte=self.monto
        ).order_by('-monto_minimo')
        
        if reglas.exists():
            regla = reglas.first()
            self.porcentaje_aplicado = regla.porcentaje
            self.comision_calculada = (self.monto * regla.porcentaje) / 100
        else:
            self.porcentaje_aplicado = Decimal('0.00')
            self.comision_calculada = Decimal('0.00')
    
    def save(self, *args, **kwargs):
        """Sobrescribe el método save para calcular la comisión automáticamente"""
        self.calcular_comision()
        super().save(*args, **kwargs)


class ComisionCalculada(models.Model):
    """Modelo para almacenar resúmenes de comisiones por período"""
    vendedor = models.ForeignKey(
        Vendedor,
        on_delete=models.CASCADE,
        related_name='comisiones'
    )
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    total_ventas = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00')
    )
    total_comision = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00')
    )
    numero_ventas = models.IntegerField(default=0)
    fecha_calculo = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'comisiones_calculadas'
        verbose_name = 'Comisión Calculada'
        verbose_name_plural = 'Comisiones Calculadas'
        ordering = ['-fecha_calculo']
    
    def __str__(self):
        return f"Comisión {self.vendedor} - ${self.total_comision}"
