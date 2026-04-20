import Analytics from './pages/Analytics';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ChildrenManagement from './pages/ChildrenManagement';
import Rewards from './pages/Rewards';
import StudyActivities from './pages/StudyActivities';
import AIBot from './pages/AIBot';
import Navbar from './components/Navbar';
import Leaderboard from './components/Leaderboard';
import Chat from './components/Chat';
import Marketplace from './components/Marketplace';
import MarketplaceManager from './components/MarketplaceManager';
import AISuggestions from './components/AISuggestions';
import AITasks from './pages/AITasks';

function AppLayout({ children }) {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('token');
  const isAuthPage = ['/login', '/register', '/'].includes(location.pathname);

  if (!isAuthenticated || isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div style={styles.appContainer}>
      <Navbar />
      <div style={styles.mainContent} data-main="true">
        {children}
      </div>
    </div>
  );
}

function App() {
  const isAuthenticated = localStorage.getItem('token');

  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/children" element={isAuthenticated ? <ChildrenManagement /> : <Navigate to="/login" />} />
          <Route path="/study" element={isAuthenticated ? <StudyActivities /> : <Navigate to="/login" />} />
          <Route path="/ai-bot" element={isAuthenticated ? <AIBot /> : <Navigate to="/login" />} />
          <Route path="/rewards" element={isAuthenticated ? <Rewards /> : <Navigate to="/login" />} />
          <Route path="/analytics" element={isAuthenticated ? <Analytics /> : <Navigate to="/login" />} />
          <Route path="/leaderboard" element={isAuthenticated ? <Leaderboard /> : <Navigate to="/login" />} />
          <Route path="/chat" element={isAuthenticated ? <Chat /> : <Navigate to="/login" />} />
          <Route path="/marketplace" element={isAuthenticated ? <Marketplace /> : <Navigate to="/login" />} />
          <Route path="/marketplace-manager" element={isAuthenticated ? <MarketplaceManager /> : <Navigate to="/login" />} />
          <Route path="/ai-suggestions" element={isAuthenticated ? <AITasks /> : <Navigate to="/login" />} />
          </Routes>
      </AppLayout>
    </Router>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f9fafb'
  },
  mainContent: {
    flex: 1,
    marginLeft: '260px',
    minHeight: '100vh',
    background: '#f9f1f1',  // ← YE CHANGE KARO (was #f9fafb)
    transition: 'margin-left 0.3s ease',
    overflow: 'auto',
    width: 'calc(100% - 260px)',
    padding: '30px'
  }
 
};

export default App;