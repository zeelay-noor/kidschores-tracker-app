import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    const mainContent = document.querySelector('[data-main="true"]');
    if (mainContent) {
      mainContent.style.marginLeft = newCollapsed ? "70px" : "260px";
      mainContent.style.width = newCollapsed
        ? "calc(100% - 70px)"
        : "calc(100% - 260px)";
    }
  };

  const parentNavItems = [
    { icon: "🏠", label: "Dashboard", path: "/dashboard" },
    { icon: "🤖", label: "AI Tasks", path: "/ai-suggestions" },
    { icon: "👶", label: "Children", path: "/children" },
    { icon: "📚", label: "Study", path: "/study" },
    //{ icon: '🤖', label: 'AI Bot', path: '/ai-bot' },
    //{ icon: '🎁', label: 'Rewards', path: '/rewards' },
    { icon: "🏆", label: "Leaderboard", path: "/leaderboard" },
    { icon: "🛒", label: "Marketplace", path: "/marketplace-manager" },
    { icon: "📈", label: "Analytics", path: "/analytics" },
    { icon: "💬", label: "Chat", path: "/chat" },
  ];

  const childNavItems = [
    { icon: "🏠", label: "Dashboard", path: "/dashboard" },
    { icon: "📚", label: "Study", path: "/study" },
    { icon: "🤖", label: "AI Bot", path: "/ai-bot" },
    { icon: "🎁", label: "Rewards", path: "/rewards" },
    { icon: "🏆", label: "Leaderboard", path: "/leaderboard" },
    { icon: "🛒", label: "Shop", path: "/marketplace" },
    { icon: "💬", label: "Chat", path: "/chat" },
  ];

  const navItems = user?.role === "parent" ? parentNavItems : childNavItems;

  return (
    <div
      style={{
        ...styles.sidebar,
        width: collapsed ? "70px" : "260px",
      }}
    >
      {/* Logo */}
      <div style={styles.logoSection}>
        <div style={styles.logoIcon}>🎯</div>
        {!collapsed && (
          <div style={styles.logoText}>
            <div style={styles.logoName}>ChoreTracker</div>
            <div style={styles.logoSub}>Kids Task Manager</div>
          </div>
        )}
        <button style={styles.collapseBtn} onClick={handleCollapse}>
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Nav Items */}
      <nav style={styles.nav}>
        {!collapsed && <div style={styles.sectionTitle}>MAIN MENU</div>}

        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              ...styles.navItem,
              ...(isActive(item.path) ? styles.navItemActive : {}),
              justifyContent: collapsed ? "center" : "flex-start",
            }}
            title={collapsed ? item.label : ""}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            {!collapsed && <span style={styles.navLabel}>{item.label}</span>}
            {!collapsed && isActive(item.path) && (
              <span style={styles.activeDot}></span>
            )}
          </Link>
        ))}

        {/* Role Badge */}
        {!collapsed && (
          <div style={styles.roleBadge}>
            <div
              style={{
                ...styles.roleInner,
                background:
                  user?.role === "parent"
                    ? "rgba(37, 99, 235, 0.1)"
                    : "rgba(5, 150, 105, 0.1)",
              }}
            >
              <span style={{ fontSize: "20px" }}>
                {user?.role === "parent" ? "👨‍👩‍👧" : "👦"}
              </span>
              <div>
                <div
                  style={{
                    ...styles.roleTitle,
                    color: user?.role === "parent" ? "#2563eb" : "#059669",
                  }}
                >
                  {user?.role === "parent" ? "Parent Account" : "Child Account"}
                </div>
                <div style={styles.roleSubtitle}>
                  {user?.role === "parent" ? "Full Access" : "Limited Access"}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* User Footer */}
      <div style={styles.footer}>
        <div
          style={{
            ...styles.userCard,
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          <div style={styles.avatar}>{getInitials(user?.name)}</div>
          {!collapsed && (
            <>
              <div style={styles.userInfo}>
                <div style={styles.userName}>{user?.name || "User"}</div>
                <div style={styles.userRole}>{user?.role || "user"}</div>
              </div>
              <button
                style={styles.logoutBtn}
                onClick={handleLogout}
                title="Logout"
              >
                🚪
              </button>
            </>
          )}
        </div>

        {collapsed && (
          <button
            style={styles.logoutBtnCollapsed}
            onClick={handleLogout}
            title="Logout"
          >
            🚪
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)",
    borderRight: "2px solid #FFD93D",
    display: "flex",
    flexDirection: "column",
    zIndex: 1000,
    boxShadow: "4px 0 15px rgba(0,0,0,0.1)",
    transition: "width 0.3s ease",
    overflow: "hidden",
    backdropFilter: "blur(10px)",
  },
  logoSection: {
    display: "flex",
    alignItems: "center",
    padding: "24px 20px",
    borderBottom: "2px solid #FFD93D",
    gap: "16px",
    minHeight: "80px",
  },
  logoIcon: {
    width: "50px",
    height: "50px",
    background: "linear-gradient(135deg, #FF6B6B, #4ECDC4)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    flexShrink: 0,
    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
    animation: "bounce 2s infinite",
  },
  logoText: {
    flex: 1,
    minWidth: 0,
  },
  logoName: {
    fontSize: "18px",
    fontWeight: "700",
    fontFamily: "'Fredoka One', cursive",
    background: "linear-gradient(135deg, #FF6B6B, #4ECDC4)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    whiteSpace: "nowrap",
  },
  logoSub: {
    fontSize: "12px",
    color: "#757575",
    whiteSpace: "nowrap",
  },
  collapseBtn: {
    background: "linear-gradient(135deg, #FFD93D, #FF8FAB)",
    border: "none",
    borderRadius: "12px",
    width: "28px",
    height: "28px",
    cursor: "pointer",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: "#424242",
    transition: "all 0.3s ease",
  },
  nav: {
    flex: 1,
    padding: "16px 12px",
    overflowY: "auto",
    overflowX: "hidden",
  },
  sectionTitle: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#BDBDBD",
    letterSpacing: "0.1em",
    padding: "8px 12px",
    marginBottom: "8px",
    textTransform: "uppercase",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "16px",
    textDecoration: "none",
    color: "#757575",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginBottom: "4px",
    position: "relative",
    whiteSpace: "nowrap",
    fontFamily: "'Nunito', sans-serif",
  },
  navItemActive: {
    background: "linear-gradient(135deg, #FFE5E5, #E0F7F6)",
    color: "#FF6B6B",
    fontWeight: "700",
    boxShadow: "0 4px 8px rgba(255,107,107,0.2)",
    transform: "scale(1.02)",
  },
  navIcon: {
    fontSize: "20px",
    width: "24px",
    textAlign: "center",
    flexShrink: 0,
  },
  navLabel: {
    flex: 1,
  },
  activeDot: {
    width: "8px",
    height: "8px",
    background: "linear-gradient(135deg, #FF6B6B, #4ECDC4)",
    borderRadius: "50%",
    marginLeft: "auto",
    boxShadow: "0 0 8px rgba(255,107,107,0.5)",
  },
  roleBadge: {
    marginTop: "16px",
    padding: "0 2px",
  },
  roleInner: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px",
    borderRadius: "10px",
  },
  roleTitle: {
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  roleSubtitle: {
    fontSize: "11px",
    color: "#9ca3af",
    marginTop: "2px",
  },
  footer: {
    padding: "12px 10px",
    borderTop: "1px solid #f3f4f6",
  },
  userCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    background: "#f9fafb",
    borderRadius: "10px",
  },
  avatar: {
    width: "34px",
    height: "34px",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "13px",
    fontWeight: "700",
    flexShrink: 0,
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1f2937",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userRole: {
    fontSize: "11px",
    color: "#9ca3af",
    textTransform: "capitalize",
  },
  logoutBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    padding: "4px",
    borderRadius: "6px",
    flexShrink: 0,
    color: "#9ca3af",
    transition: "color 0.2s",
  },
  logoutBtnCollapsed: {
    display: "block",
    width: "100%",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    padding: "8px",
    borderRadius: "8px",
    textAlign: "center",
    marginTop: "8px",
    color: "#9ca3af",
  },
};

export default Navbar;
