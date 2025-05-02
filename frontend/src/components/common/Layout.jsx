import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useTheme } from '../../context/ThemeContext';

const Layout = ({ children }) => {
  const { darkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      <Navbar toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden pt-16">
        <Sidebar isOpen={sidebarOpen} />
        
        <main className={`flex-1 transition-all duration-300 relative overflow-y-auto p-4 ${
          sidebarOpen ? 'md:ml-64' : 'md:ml-0'
        } ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;