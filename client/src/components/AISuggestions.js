import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AISuggestions() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [childData, setChildData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users/children', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChildren(response.data);
      
      if (response.data.length > 0) {
        setSelectedChild(response.data[0]._id);
        fetchSuggestions(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const fetchSuggestions = async (childId) => {
    if (!childId) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/ai/suggestions?childId=${childId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuggestions(response.data.suggestions);
      setChildData({
        name: response.data.childName,
        level: response.data.performanceLevel,
        points: response.data.totalPoints
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setLoading(false);
    }
  };

  const handleChildChange = (childId) => {
    setSelectedChild(childId);
    fetchSuggestions(childId);
  };

  const handleAcceptSuggestion = async (suggestion) => {
    if (!window.confirm(`Create task "${suggestion.title}" for ${childData.name}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/ai/accept',
        { suggestion, childId: selectedChild },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('✅ Task created successfully!');
      
      // Refresh suggestions
      fetchSuggestions(selectedChild);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('❌ Error creating task');
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Easy': '#10b981',
      'Medium': '#f59e0b',
      'Hard': '#ef4444'
    };
    return colors[difficulty] || '#6b7280';
  };

  const getDifficultyIcon = (difficulty) => {
    const icons = {
      'Easy': '🟢',
      'Medium': '🟡',
      'Hard': '🔴'
    };
    return icons[difficulty] || '⚪';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1>🤖 AI Task Suggestions</h1>
          <p style={styles.subtitle}>Smart recommendations based on age, skill level, and performance</p>
        </div>
      </div>

      <div style={styles.childSelector}>
        <label style={styles.label}>Select Child:</label>
        <select 
          value={selectedChild} 
          onChange={(e) => handleChildChange(e.target.value)}
          style={styles.select}
        >
          {children.map(child => (
            <option key={child._id} value={child._id}>{child.name}</option>
          ))}
        </select>
        
        {childData && (
          <div style={styles.childInfo}>
            <span style={styles.infoItem}>
              📊 Level {childData.level}
            </span>
            <span style={styles.infoItem}>
              ⭐ {childData.points} points
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div style={styles.loading}>
          <div style={styles.loadingSpinner}>🤖</div>
          <h3>AI is analyzing...</h3>
          <p>Generating personalized task suggestions</p>
        </div>
      ) : (
        <>
          {suggestions.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🤖</div>
              <h3>No suggestions available</h3>
              <p>The AI couldn't find suitable tasks. Try selecting a different child.</p>
            </div>
          ) : (
            <div style={styles.suggestionsGrid}>
              {suggestions.map((suggestion, index) => (
                <div key={index} style={styles.suggestionCard}>
                  <div style={styles.cardHeader}>
                    <div style={styles.cardNumber}>#{index + 1}</div>
                    <div 
                      style={{
                        ...styles.difficultyBadge,
                        background: getDifficultyColor(suggestion.difficulty)
                      }}
                    >
                      {getDifficultyIcon(suggestion.difficulty)} {suggestion.difficulty}
                    </div>
                  </div>

                  <h3 style={styles.taskTitle}>{suggestion.title}</h3>
                  
                  <div style={styles.categoryTag}>
                    📂 {suggestion.category}
                  </div>

                  <div style={styles.reasonBox}>
                    <span style={styles.reasonIcon}>💡</span>
                    <span style={styles.reasonText}>{suggestion.reason}</span>
                  </div>

                  <div style={styles.cardFooter}>
                    <div style={styles.pointsBadge}>
                      <span style={styles.pointsIcon}>⭐</span>
                      <span style={styles.pointsValue}>{suggestion.points} points</span>
                    </div>
                    
                    <button 
                      onClick={() => handleAcceptSuggestion(suggestion)}
                      style={styles.acceptButton}
                    >
                      ✅ Create Task
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={styles.infoBox}>
            <h4>🤖 How AI Suggestions Work:</h4>
            <ul style={styles.infoList}>
              <li>📊 Analyzes child's performance level and completed tasks</li>
              <li>🎯 Matches tasks to age and skill level</li>
              <li>🔄 Avoids suggesting recently completed tasks</li>
              <li>⬆️ Difficulty increases as child progresses</li>
              <li>💪 Encourages skill development and responsibility</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: { background:'pink',padding: '20px', maxWidth: '1400px', margin: '0 auto' },
  header: { marginBottom: '30px' },
  subtitle: { color: '#6b7280', marginTop: '10px', fontSize: '16px' },
  childSelector: { 
    background: 'white', 
    padding: '25px', 
    borderRadius: '15px', 
    marginBottom: '30px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap'
  },
  label: { fontSize: '16px', fontWeight: '600', color: '#333' },
  select: { 
    padding: '12px 20px', 
    borderRadius: '10px', 
    border: '2px solid #e5e7eb',
    fontSize: '15px',
    minWidth: '200px',
    cursor: 'pointer'
  },
  childInfo: { display: 'flex', gap: '15px', marginLeft: 'auto' },
  infoItem: { 
    background: 'linear-gradient(135deg, #667eea, #764ba2)', 
    color: 'white', 
    padding: '10px 20px', 
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '14px'
  },
  loading: { 
    textAlign: 'center', 
    padding: '80px 20px',
    background: 'white',
    borderRadius: '15px'
  },
  loadingSpinner: { fontSize: '80px', marginBottom: '20px', animation: 'pulse 2s infinite' },
  emptyState: { 
    textAlign: 'center', 
    padding: '80px 20px', 
    color: '#6b7280',
    background: 'white',
    borderRadius: '15px'
  },
  emptyIcon: { fontSize: '100px', marginBottom: '20px' },
  suggestionsGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
    gap: '25px',
    marginBottom: '40px'
  },
  suggestionCard: { 
    background: 'white', 
    borderRadius: '15px', 
    padding: '25px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'pointer',
    border: '2px solid transparent'
  },
  cardHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: '15px'
  },
  cardNumber: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '16px'
  },
  difficultyBadge: { 
    padding: '6px 14px', 
    borderRadius: '20px', 
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  taskTitle: { 
    fontSize: '1.4rem', 
    marginBottom: '12px', 
    color: '#1f2937',
    lineHeight: '1.3'
  },
  categoryTag: {
    display: 'inline-block',
    background: '#e0e7ff',
    color: '#4f46e5',
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '15px'
  },
  reasonBox: {
    background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    padding: '15px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px'
  },
  reasonIcon: { fontSize: '24px' },
  reasonText: { 
    fontSize: '14px', 
    color: '#92400e',
    fontWeight: '500',
    lineHeight: '1.4'
  },
  cardFooter: { 
    borderTop: '2px solid #f3f4f6', 
    paddingTop: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '15px'
  },
  pointsBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  pointsIcon: { fontSize: '24px' },
  pointsValue: { 
    fontSize: '18px', 
    fontWeight: 'bold',
    color: '#f59e0b'
  },
  acceptButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    transition: 'all 0.3s',
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
  },
  infoBox: {
    background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
    padding: '25px',
    borderRadius: '15px',
    border: '2px solid #3b82f6'
  },
  infoList: {
    marginTop: '15px',
    paddingLeft: '20px',
    lineHeight: '2',
    fontSize: '14px',
    color: '#1e3a8a'
  }
};

export default AISuggestions;