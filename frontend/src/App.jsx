import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ProductsView from './components/ProductsView';
import CategoriesView from './components/CategoriesView';
import SuppliersView from './components/SuppliersView';
import TransactionsView from './components/TransactionsView';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  
  // Base URL pointing to the Laravel Backend API
  const apiBaseUrl = 'http://localhost:8000/api';

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView apiBaseUrl={apiBaseUrl} setActiveView={setActiveView} />;
      case 'products':
        return <ProductsView apiBaseUrl={apiBaseUrl} />;
      case 'categories':
        return <CategoriesView apiBaseUrl={apiBaseUrl} />;
      case 'suppliers':
        return <SuppliersView apiBaseUrl={apiBaseUrl} />;
      case 'transactions':
        return <TransactionsView apiBaseUrl={apiBaseUrl} />;
      default:
        return <DashboardView apiBaseUrl={apiBaseUrl} setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      {renderActiveView()}
    </div>
  );
}

export default App;
