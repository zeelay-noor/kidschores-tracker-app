import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      {/* Left Panel */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <div style={styles.brandLogo}>🎯</div>
          <h1 style={styles.brandName}>ChoreTracker</h1>
          <p style={styles.brandTagline}>
            Smart task management for families
          </p>

          <div style={styles.featureList}>
            {[
              { icon: '🤖', title: 'AI-Powered Predictions', desc: 'Smart task completion analysis' },
              { icon: '🏆', title: 'Gamified Rewards', desc: 'Keep kids motivated with points' },
              { icon: '📊', title: 'Analytics Dashboard', desc: 'Track progress in real-time' },
              { icon: '👨‍👩‍👧', title: 'Family Management', desc: 'Manage all children easily' },
            ].map((feature, i) => (
              <div key={i} style={styles.featureItem}>
                <div style={styles.featureIcon}>{feature.icon}</div>
                <div>
                  <div style={styles.featureTitle}>{feature.title}</div>
                  <div style={styles.featureDesc}>{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={styles.formContainer}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Welcome back</h2>
            <p style={styles.formSubtitle}>Sign in to your account to continue</p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>📧</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>🔒</span>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              style={{...styles.submitBtn, opacity: loading ? 0.7 : 1}}
              disabled={loading}
            >
              {loading ? (
                <span>⏳ Signing in...</span>
              ) : (
                <span>Sign In →</span>
              )}
            </button>
          </form>

          <div style={styles.divider}>
            <span style={styles.dividerText}>Don't have an account?</span>
          </div>

          <Link to="/register" style={styles.registerBtn}>
            Create New Account
          </Link>

          {/* Demo Credentials */}
          <div style={styles.demoBox}>
            <div style={styles.demoTitle}>Demo Credentials</div>
            <div style={styles.demoItem}>
              <span style={styles.demoLabel}>👨‍👩‍👧 Parent:</span>
              <span style={styles.demoValue}>parent@test.com / 123456</span>
            </div>
            <div style={styles.demoItem}>
              <span style={styles.demoLabel}>👦 Child:</span>
              <span style={styles.demoValue}>child@test.com / 123456</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'var(--font, Inter, sans-serif)'
  },
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(135deg, #d88d1d 0%, #ed823a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 40px',
  },
  leftContent: {
    maxWidth: '420`px',
    color: 'white'
  },
  brandLogo: {
    fontSize: '56px',
    marginBottom: '16px',
    display: 'block'
  },
  brandName: {
    fontSize: '36px',
    fontWeight: '800',
    marginBottom: '12px',
    color: 'white'
  },
  brandTagline: {
    fontSize: '18px',
    opacity: 0.85,
    marginBottom: '48px',
    lineHeight: '1.6'
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  featureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    background: 'rgba(255,255,255,0.1)',
    padding: '16px',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.15)'
  },
  featureIcon: {
    fontSize: '28px',
    flexShrink: 0
  },
  featureTitle: {
    fontSize: '15px',
    fontWeight: '700',
    marginBottom: '4px',
    color: 'white'
  },
  featureDesc: {
    fontSize: '13px',
    opacity: 0.75,
    color: 'white'
  },
  rightPanel: {
    width: '480px',
    background: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px'
  },
  formContainer: {
    width: '100%',
    maxWidth: '380px'
  },
  formHeader: {
    marginBottom: '32px'
  },
  formTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: '8px'
  },
  formSubtitle: {
    fontSize: '15px',
    color: '#6b7280'
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '500'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    fontSize: '16px',
    zIndex: 1
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#1f2937',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit'
  },
  submitBtn: {
    width: '100%',
    padding: '13px',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '8px',
    boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  divider: {
    textAlign: 'center',
    margin: '24px 0',
    position: 'relative'
  },
  dividerText: {
    fontSize: '14px',
    color: '#9ca3af',
    background: 'white',
    padding: '0 12px'
  },
  registerBtn: {
    display: 'block',
    width: '100%',
    padding: '13px',
    background: 'white',
    color: '#2563eb',
    border: '1.5px solid #2563eb',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    textAlign: 'center',
    textDecoration: 'none',
    transition: 'all 0.2s'
  },
  demoBox: {
    marginTop: '24px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '16px'
  },
  demoTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '10px'
  },
  demoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px'
  },
  demoLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151'
  },
  demoValue: {
    fontSize: '12px',
    color: '#6b7280',
    fontFamily: 'monospace',
    background: 'white',
    padding: '2px 8px',
    borderRadius: '4px',
    border: '1px solid #e5e7eb'
  }
};

export default Login;