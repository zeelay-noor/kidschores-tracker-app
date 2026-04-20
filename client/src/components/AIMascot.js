import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AIMascot({ childData }) {
  const [message, setMessage] = useState('');
  const [mood, setMood] = useState('happy');
  const [animation, setAnimation] = useState('normal');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (childData) {
      fetchMotivationalMessage();
    }
  }, [childData]);

  const fetchMotivationalMessage = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/ai-mascot/message',
        {
          taskCompletionRate: childData.taskCompletionRate || 0,
          totalPointsToday: childData.totalPointsToday || 0,
          studyTimeHours: childData.studyTimeHours || 0,
          currentStreak: childData.currentStreak || 0,
          timeOfDay: getTimeOfDay(),
          ageGroup: childData.ageGroup || 10
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(response.data.message);
      setMood(response.data.mood);
      setAnimation(response.data.animation);
    } catch (error) {
      console.error('Error fetching message:', error);
      setMessage('Keep up the great work! 🌟');
      setMood('happy');
    }
    setLoading(false);
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  };

  const getMascotEmoji = () => {
    if (mood === 'celebrating') return '🎉';
    if (mood === 'encouraging') return '💪';
    return '😊';
  };

  return (
    <div style={styles.container}>
      <div 
        style={{
          ...styles.mascot,
          ...(animation === 'celebration' ? styles.celebrating : {})
        }}
      >
        <div style={styles.mascotFace}>{getMascotEmoji()}</div>
      </div>
      
      <div style={styles.messageBox}>
        {loading ? (
          <p style={styles.loading}>Thinking... 🤔</p>
        ) : (
          <p style={styles.message}>{message}</p>
        )}
      </div>

      <button onClick={fetchMotivationalMessage} style={styles.refreshBtn}>
        🔄 Get New Message
      </button>
    </div>
  );
}

const styles = {
  container: {
    background: 'linear-gradient(135deg, #955e5f 0%, #955e5f 100%)',
    borderRadius: '20px',
    padding: '30px',
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
    marginBottom: '30px'
  },
  mascot: {
    width: '120px',
    height: '120px',
    margin: '0 auto 20px',
    background: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
    transition: 'transform 0.3s ease'
  },
  celebrating: {
    animation: 'bounce 0.5s ease infinite'
  },
  mascotFace: {
    fontSize: '60px'
  },
  messageBox: {
    background: 'white',
    borderRadius: '15px',
    padding: '20px',
    marginBottom: '20px',
    minHeight: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  message: {
    fontSize: '18px',
    color: '#333',
    lineHeight: '1.6',
    margin: 0
  },
  loading: {
    fontSize: '16px',
    color: '#666',
    fontStyle: 'italic'
  },
  refreshBtn: {
    padding: '12px 24px',
    background: 'white',
    border: 'none',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s'
  }
};

export default AIMascot;