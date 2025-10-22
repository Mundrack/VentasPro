import { useTheme } from './ThemeContext';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <h1 className="navbar-logo">🔥 VentasPro</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Sistema de Gestión de Comisiones
          </p>
        </div>

        <div className="navbar-actions">
          {/* Tabs de navegación */}
          <div className="tabs">
            <button
              className={`tab-button ${activeTab === 'ventas' ? 'active' : ''}`}
              onClick={() => setActiveTab('ventas')}
            >
              💼 Gestión de Ventas
            </button>
            <button
              className={`tab-button ${activeTab === 'comisiones' ? 'active' : ''}`}
              onClick={() => setActiveTab('comisiones')}
            >
              📊 Cálculo de Comisiones
            </button>
          </div>

          {/* Botón de cambio de tema */}
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            aria-label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
          >
            {isDark ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
