import { useState } from 'react';
import { ThemeProvider } from './components/ThemeContext';
import Navbar from './components/Navbar';
import SalesManagement from './components/SalesManagement';
import CommissionCalculation from './components/CommissionCalculation';
import './styles/App.css';

function App() {
  const [activeTab, setActiveTab] = useState('ventas');

  return (
    <ThemeProvider>
      <div className="app">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main>
          {activeTab === 'ventas' ? (
            <SalesManagement />
          ) : (
            <CommissionCalculation />
          )}
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
