import { useState, useEffect } from 'react';
import { vendedoresAPI, ventasAPI } from '../services/api';
import { formatCurrency, formatDate, getCurrentDate, handleAPIError } from '../utils/utils';

const SalesManagement = () => {
  // Estados
  const [vendedores, setVendedores] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    vendedor: '',
    fecha: getCurrentDate(),
    monto: '',
    descripcion: ''
  });

  // Cargar vendedores al montar el componente
  useEffect(() => {
    fetchVendedores();
    fetchVentas();
  }, []);

  // Obtener vendedores activos
  const fetchVendedores = async () => {
    try {
      const response = await vendedoresAPI.getActivos();
      setVendedores(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error al cargar vendedores:', err);
      setError('No se pudieron cargar los vendedores');
      setVendedores([]);
    }
  };

  // Obtener todas las ventas
  const fetchVentas = async () => {
    setLoading(true);
    try {
      const response = await ventasAPI.getAll();
      setVentas(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      console.error('Error al cargar ventas:', err);
      setError(handleAPIError(err));
      setVentas([]);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Guardar nueva venta
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.vendedor) {
      setError('Por favor, selecciona un vendedor');
      return;
    }
    
    if (!formData.fecha) {
      setError('Por favor, selecciona una fecha');
      return;
    }
    
    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      setError('Por favor, ingresa un monto válido');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await ventasAPI.create({
        vendedor: formData.vendedor,
        fecha: formData.fecha,
        monto: parseFloat(formData.monto),
        descripcion: formData.descripcion || ''
      });
      
      setSuccess('¡Venta registrada exitosamente!');
      
      // Limpiar formulario
      setFormData({
        vendedor: '',
        fecha: getCurrentDate(),
        monto: '',
        descripcion: ''
      });
      
      // Recargar ventas
      await fetchVentas();
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error al guardar venta:', err);
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  // Eliminar venta
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta venta?')) {
      return;
    }

    try {
      await ventasAPI.delete(id);
      setSuccess('Venta eliminada exitosamente');
      await fetchVentas();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error al eliminar venta:', err);
      setError(handleAPIError(err));
    }
  };

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

      {success && (
        <div className="alert alert-success">
          <span>✓</span>
          <span>{success}</span>
        </div>
      )}

      {/* Formulario para agregar venta */}
      <div className="card mb-3">
        <div className="card-header">
          <h2 className="card-title">
            <span>➕</span> Agregar Nueva Venta
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="vendedor">
                Vendedor *
              </label>
              <select
                id="vendedor"
                name="vendedor"
                className="form-select"
                value={formData.vendedor}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccionar vendedor...</option>
                {vendedores.map(vendedor => (
                  <option key={vendedor.id} value={vendedor.id}>
                    {vendedor.nombre_completo}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="fecha">
                Fecha de Venta *
              </label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                className="form-input"
                value={formData.fecha}
                onChange={handleInputChange}
                max={getCurrentDate()}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="monto">
                Monto ($) *
              </label>
              <input
                type="number"
                id="monto"
                name="monto"
                className="form-input"
                value={formData.monto}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="descripcion">
              Descripción (opcional)
            </label>
            <input
              type="text"
              id="descripcion"
              name="descripcion"
              className="form-input"
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Ej: Venta de productos..."
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '⏳ Guardando...' : '💾 Guardar Venta'}
          </button>
        </form>
      </div>

      {/* Lista de ventas */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <span>📋</span> Lista de Ventas
          </h2>
          <span className="badge badge-info">{ventas.length} ventas</span>
        </div>

        {loading && ventas.length === 0 ? (
          <div className="loading">
            <div className="spinner"></div>
            <p style={{ color: 'var(--text-secondary)' }}>Cargando ventas...</p>
          </div>
        ) : ventas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3 className="empty-state-title">No hay ventas registradas</h3>
            <p className="empty-state-description">
              Agrega tu primera venta usando el formulario de arriba
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vendedor</th>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th>Comisión</th>
                  <th>% Aplicado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map(venta => (
                  <tr key={venta.id}>
                    <td>#{venta.id}</td>
                    <td>{venta.vendedor_completo}</td>
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
                    <td>
                      <button
                        onClick={() => handleDelete(venta.id)}
                        className="btn btn-danger"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesManagement;