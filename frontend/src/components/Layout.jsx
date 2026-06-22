import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="layout-container">
      {user && <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}
      <div className={`main-wrapper ${user ? 'with-sidebar' : ''}`}>
        <Navbar toggleSidebar={toggleSidebar} showMenuButton={!!user} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
