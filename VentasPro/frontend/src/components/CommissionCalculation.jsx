import { useState } from 'react';
import { comisionesAPI } from '../services/api';
import { formatCurrency, formatDate, getCurrentDate, handleAPIError } from '../utils/utils';

const CommissionCalculation = () => {
  // Estados
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultados, setResultados] = useState(null);
  const [expandedVendedor, setExpandedVendedor] = useState(null);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    fecha_inicio: '',
    fecha_fin: getCurrentDate()
  });

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calcular comisiones
  const handleCalculate = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.fecha_inicio || !formData.fecha_fin) {
      setError('Por favor, selecciona ambas fechas');
      return;
    }

    if (formData.fecha_inicio > formData.fecha_fin) {
      setError('La fecha de inicio debe ser anterior a la fecha fin');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await comisionesAPI.calcular({
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin
      });
      
      setResultados(response.data);
    } catch (err) {
      console.error('Error al calcular comisiones:', err);
      setError(handleAPIError(err));
      setResultados(null);
    } finally {
      setLoading(false);
    }
  };

  // Toggle para expandir/colapsar detalles de vendedor
  const toggleVendedorDetails = (vendedorId) => {
    setExpandedVendedor(prev => prev === vendedorId ? null : vendedorId);
  };

  // Calcular totales generales
  const calcularTotales = () => {
    if (!resultados || resultados.length === 0) return null;

    const totalVentas = resultados.reduce((sum, r) => sum + parseFloat(r.total_ventas), 0);
    const totalComisiones = resultados.reduce((sum, r) => sum + parseFloat(r.total_comision), 0);
    const totalNumeroVentas = resultados.reduce((sum, r) => sum + r.numero_ventas, 0);

    return {
      totalVentas,
      totalComisiones,
      totalNumeroVentas,
      promedioVenta: totalNumeroVentas > 0 ? totalVentas / totalNumeroVentas : 0,
      promedioComision: totalNumeroVentas > 0 ? totalComisiones / totalNumeroVentas : 0
    };
  };

  const totales = calcularTotales();

  return (
    <div className="main-container">
      {/* Mensajes de alerta */}
      {error && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Formulario de cálculo */}
      <div className="card mb-3">
        <div className="card-header">
          <h2 className="card-title">
            <span>📊</span> Calcular Comisiones por Período
          </h2>
        </div>

        <form onSubmit={handleCalculate}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="fecha_inicio">
                Fecha de Inicio *
              </label>
              <input
                type="date"
                id="fecha_inicio"
                name="fecha_inicio"
                className="form-input"
                value={formData.fecha_inicio}
                onChange={handleInputChange}
                max={formData.fecha_fin || getCurrentDate()}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="fecha_fin">
                Fecha de Fin *
              </label>
              <input
                type="date"
                id="fecha_fin"
                name="fecha_fin"
                className="form-input"
                value={formData.fecha_fin}
                onChange={handleInputChange}
                max={getCurrentDate()}
                min={formData.fecha_inicio}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '⏳ Calculando...' : '🧮 Calcular Comisiones'}
          </button>
        </form>
      </div>

      {/* Resumen general */}
      {totales && (
        <div className="card mb-3">
          <div className="card-header">
            <h2 className="card-title">
              <span>📈</span> Resumen General
            </h2>
            <span className="badge badge-success">
              Período: {formatDate(formData.fecha_inicio)} - {formatDate(formData.fecha_fin)}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ 
              padding: '1rem', 
              background: 'var(--bg-secondary)', 
              borderRadius: 'var(--radius-md)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Total Ventas
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
                {formatCurrency(totales.totalVentas)}
              </div>
            </div>

            <div style={{ 
              padding: '1rem', 
              background: 'var(--bg-secondary)', 
              borderRadius: 'var(--radius-md)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Total Comisiones
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success)' }}>
                {formatCurrency(totales.totalComisiones)}
              </div>
            </div>

            <div style={{ 
              padding: '1rem', 
              background: 'var(--bg-secondary)', 
              borderRadius: 'var(--radius-md)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Número de Ventas
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--info)' }}>
                {totales.totalNumeroVentas}
              </div>
            </div>

            <div style={{ 
              padding: '1rem', 
              background: 'var(--bg-secondary)', 
              borderRadius: 'var(--radius-md)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Promedio por Venta
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                {formatCurrency(totales.promedioVenta)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resultados por vendedor */}
      {loading && !resultados && (
        <div className="card">
          <div className="loading">
            <div className="spinner"></div>
            <p style={{ color: 'var(--text-secondary)' }}>Calculando comisiones...</p>
          </div>
        </div>
      )}

      {resultados && resultados.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3 className="empty-state-title">No hay ventas en este período</h3>
            <p className="empty-state-description">
              Intenta con un rango de fechas diferente
            </p>
          </div>
        </div>
      )}

      {resultados && resultados.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <span>👥</span> Detalle por Vendedor
            </h2>
            <span className="badge badge-info">{resultados.length} vendedores</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {resultados.map((resultado) => (
              <div 
                key={resultado.vendedor_id}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  transition: 'all var(--transition-normal)'
                }}
              >
                {/* Encabezado del vendedor */}
                <div 
                  style={{
                    padding: '1.25rem',
                    background: 'var(--bg-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onClick={() => toggleVendedorDetails(resultado.vendedor_id)}
                >
                  <div>
                    <h3 style={{ 
                      fontSize: '1.125rem', 
                      fontWeight: '600', 
                      color: 'var(--text-primary)',
                      marginBottom: '0.25rem'
                    }}>
                      {resultado.vendedor_nombre} {resultado.vendedor_apellido}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {resultado.numero_ventas} ventas • Comisión: {formatCurrency(resultado.total_comision)}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        Total Ventas
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)' }}>
                        {formatCurrency(resultado.total_ventas)}
                      </div>
                    </div>
                    <span style={{ fontSize: '1.5rem' }}>
                      {expandedVendedor === resultado.vendedor_id ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {/* Detalles expandibles */}
                {expandedVendedor === resultado.vendedor_id && (
                  <div style={{ padding: '1.25rem', background: 'var(--bg-card)' }}>
                    {/* Estadísticas */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                      gap: '1rem',
                      marginBottom: '1.5rem'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
                          Promedio/Venta
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                          {formatCurrency(resultado.promedio_venta)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
                          Promedio Comisión
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--success)' }}>
                          {formatCurrency(resultado.promedio_comision)}
                        </div>
                      </div>
                    </div>

                    {/* Tabla de ventas individuales */}
                    <h4 style={{ 
                      fontSize: '0.9375rem', 
                      fontWeight: '600', 
                      color: 'var(--text-primary)',
                      marginBottom: '1rem'
                    }}>
                      Detalle de Ventas
                    </h4>
                    <div className="table-container">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Fecha</th>
                            <th>Monto</th>
                            <th>Comisión</th>
                            <th>% Aplicado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resultado.ventas_detalle.map(venta => (
                            <tr key={venta.id}>
                              <td>#{venta.id}</td>
                              <td>{formatDate(venta.fecha)}</td>
                              <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                                {formatCurrency(venta.monto)}
                              </td>
                              <td style={{ fontWeight: '600', color: 'var(--success)' }}>
                                {formatCurrency(venta.comision_calculada)}
                              </td>
                              <td>
                                <span className="badge badge-info">
                                  {venta.porcentaje_aplicado}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionCalculation;
