import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const parentNavItems = [
    { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
    { icon: '📊', label: 'Analytics', path: '/analytics' },
    { icon: '🏆', label: 'Leaderboard', path: '/leaderboard' },
    { icon: '🛍️', label: 'Marketplace', path: '/marketplace' },
    { icon: '💬', label: 'Messages', path: '/chat' },
    { icon: '🤖', label: 'AI Suggestions', path: '/ai-suggestions' },
  ];

  const childNavItems = [
    { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
    { icon: '🏆', label: 'Leaderboard', path: '/leaderboard' },
    { icon: '🛍️', label: 'Marketplace', path: '/marketplace' },
    { icon: '💬', label: 'Messages', path: '/chat' },
  ];

  const navItems = user?.role === 'parent' ? parentNavItems : childNavItems;

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🎯</div>
        <div>
          <div className="sidebar-logo-text">ChoreTracker</div>
          <div className="sidebar-logo-sub">Kids Task Manager</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Main Menu</div>
        
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}

        {/* Role Badge */}
        <div style={{marginTop: '20px'}}>
          <div className="nav-section-title">Account</div>
          <div style={{
            padding: '12px',
            background: user?.role === 'parent' ? 'var(--primary-light)' : 'var(--success-light)',
            borderRadius: 'var(--radius)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{fontSize: '20px'}}>
              {user?.role === 'parent' ? '👨‍👩‍👧' : '👦'}
            </span>
            <div>
              <div style={{
                fontSize: '12px',
                fontWeight: '700',
                color: user?.role === 'parent' ? 'var(--primary)' : 'var(--success)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {user?.role === 'parent' ? 'Parent Account' : 'Child Account'}
              </div>
              <div style={{fontSize: '11px', color: 'var(--gray-500)'}}>
                {user?.role === 'parent' ? 'Full Access' : 'Limited Access'}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {getInitials(user?.name)}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-username">{user?.name || 'User'}</div>
            <div className="sidebar-role">{user?.role || 'user'}</div>
          </div>
          <button 
            className="logout-btn"
            onClick={onLogout}
            title="Logout"
          >
            🚪
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;