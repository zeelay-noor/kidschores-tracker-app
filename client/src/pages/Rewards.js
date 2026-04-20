import { notifyLevelUp, notifyBadgeEarned } from '../utils/notifications';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Rewards() {
  const [rewards, setRewards] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login first');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:5000/api/rewards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Rewards response:', response.data); // Debug log
      
      const newRewards = response.data;
      
      // Check for level up
      const oldLevel = localStorage.getItem('userLevel');
      if (oldLevel && parseInt(oldLevel) < newRewards.level) {
        notifyLevelUp(newRewards.level);
      }
      localStorage.setItem('userLevel', newRewards.level);
      
      // Check for new badges
      const oldBadgeCount = localStorage.getItem('badgeCount') || 0;
      if (newRewards.badges && newRewards.badges.length > oldBadgeCount) {
        const latestBadge = newRewards.badges[newRewards.badges.length - 1];
        notifyBadgeEarned(latestBadge.name);
      }
      if (newRewards.badges) {
        localStorage.setItem('badgeCount', newRewards.badges.length);
      }
      
      setRewards(newRewards);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      console.error('Error response:', error.response); // Debug log
      setError(error.response?.data?.message || 'Failed to load rewards');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingCard}>
          <h2>⏳ Loading rewards...</h2>
          <p>Please wait...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <h2>❌ Error</h2>
          <p>{error}</p>
          <button onClick={fetchRewards} style={styles.retryBtn}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  if (!rewards) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <h2>😕 No Rewards Data</h2>
          <p>Unable to load rewards. Please try again.</p>
          <button onClick={fetchRewards} style={styles.retryBtn}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>🏆 Rewards & Achievements</h1>
      
      <div style={styles.statsCard}>
        <h2>Total Points: {rewards.totalPoints || 0}</h2>
        <h2>Level: {rewards.level || 1}</h2>
      </div>

      <div style={styles.badgesSection}>
        <h3>Badges Earned:</h3>
        {!rewards.badges || rewards.badges.length === 0 ? (
          <p>No badges yet. Complete chores to earn badges!</p>
        ) : (
          <div style={styles.badgesList}>
            {rewards.badges.map((badge, index) => (
              <div key={index} style={styles.badge}>
                <span style={styles.badgeIcon}>{badge.icon || '🏅'}</span>
                <div>
                  <strong>{badge.name}</strong>
                  <p style={styles.badgeDate}>
                    {badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString() : 'Recently earned'}
                  </p>
                  {badge.description && (
                    <p style={styles.badgeDesc}>{badge.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.progressSection}>
        <h3>Progress to Next Level:</h3>
        <div style={styles.progressBar}>
          <div 
            style={{
              ...styles.progress, 
              width: `${((rewards.totalPoints || 0) % 100)}%`
            }}
          ></div>
        </div>
        <p>{(rewards.totalPoints || 0) % 100} / 100 points</p>
      </div>
    </div>
  );
}

const styles = {
  container: { 
    padding: '20px', 
    maxWidth: '1000px', 
    margin: '0 auto' 
  },
  loadingCard: {
    background: '#fb6',
    padding: '60px',
    borderRadius: '15px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  },
  errorCard: {
    background: '#fee2e2',
    padding: '40px',
    borderRadius: '15px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  },
  retryBtn: {
    marginTop: '20px',
    padding: '12px 24px',
    background: '#7dc821',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  statsCard: { 
    background: 'rgba(192, 17, 17, 0.8)', 
    color: 'white', 
    padding: '30px', 
    borderRadius: '15px', 
    textAlign: 'center', 
    marginBottom: '30px',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
  },
  badgesSection: { 
    background: 'rgba(211, 32, 145, 0.8)', 
    padding: '20px', 
    borderRadius: '10px', 
    marginBottom: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  },
  badgesList: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
    gap: '15px',
    marginTop: '15px'
  },
  badge: { 
    background: 'linear-gradient(135deg, #e0b60e, #eac11c)', 
    padding: '15px', 
    borderRadius: '10px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s'
  },
  badgeIcon: { 
    fontSize: '40px' 
  },
  badgeDate: {
    fontSize: '12px',
    color: '#6b7280',
    margin: '5px 0'
  },
  badgeDesc: {
    fontSize: '11px',
    color: '#4b5563',
    fontStyle: 'italic'
  },
  progressSection: { 
    background: 'rgba(24, 220, 171, 0.73)', 
    padding: '20px', 
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  },
  progressBar: { 
    width: '100%', 
    height: '30px', 
    background: '#e0e0e0', 
    borderRadius: '15px', 
    overflow: 'hidden', 
    marginTop: '10px' 
  },
  progress: { 
    height: '100%', 
    background: 'linear-gradient(90deg, #4CAF50 0%, #45a049 100%)', 
    transition: 'width 0.3s' 
  }
};

export default Rewards;