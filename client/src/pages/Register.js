import React, { useState } from 'react';
import { register } from '../services/api';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'parent'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await register(formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.decorCircle1}></div>
      <div style={styles.decorCircle2}></div>
      
      <div style={styles.formBox}>
        <div style={styles.header}>
          <div style={styles.icon}>🏠</div>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Join us to start tracking chores!</p>
        </div>
        
        {error && <div style={styles.error}>❌ {error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>👤 Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>📧 Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>🔒 Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>👥 Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="parent">Parent</option>
              <option value="child">Child</option>
            </select>
          </div>
          
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? '⏳ Creating account...' : '🎉 Register'}
          </button>
        </form>
        
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Already have an account? 
            <a href="/login" style={styles.link}> Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fedbed 0%, #dfd1fa 100%)',
    position: 'relative',
    overflow: 'hidden',
    padding: '20px'
  },
  decorCircle1: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15), transparent)',
    borderRadius: '50%',
    top: '-100px',
    left: '-100px',
    animation: 'pulse 4s infinite'
  },
  decorCircle2: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15), transparent)',
    borderRadius: '50%',
    bottom: '-50px',
    right: '-50px',
    animation: 'pulse 3s infinite'
  },
  formBox: {
    background: 'white',
    padding: '50px 40px',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    width: '100%',
    maxWidth: '450px',
    position: 'relative',
    zIndex: 1,
    animation: 'fadeIn 0.6s ease'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  icon: {
    fontSize: '60px',
    marginBottom: '15px',
    animation: 'bounce 2s infinite'
  },
  title: {
    background: 'linear-gradient(135deg, #3b82f6, #10b981)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '10px'
  },
  subtitle: {
    color: '#666',
    fontSize: '16px'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#333',
    fontWeight: '600',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '15px',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    fontSize: '16px',
    background: '#f8faf9'
  },
  button: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: 'bold',
    marginTop: '10px',
    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
  },
  error: {
    color: '#ef4444',
    background: '#fee2e2',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: '500'
  },
  footer: {
    marginTop: '30px',
    textAlign: 'center'
  },
  footerText: {
    color: '#666',
    fontSize: '14px'
  },
  link: {
    color: '#3b82f6',
    fontWeight: 'bold',
    textDecoration: 'none'
  }
};

export default Register;