import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AIBot() {
  const [message, setMessage] = useState('');
  const [personalizedMsg, setPersonalizedMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sentimentText, setSentimentText] = useState('');
  const [sentimentResult, setSentimentResult] = useState(null);
  const [analyzingText, setAnalyzingText] = useState(false);

  useEffect(() => {
    fetchPersonalizedMessage();
  }, []);

  const fetchPersonalizedMessage = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Get user's rewards
      const rewardsResponse = await axios.get('http://localhost:5000/api/rewards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Get user's chores
      const choresResponse = await axios.get('http://localhost:5000/api/chores', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Calculate completion rate
      const allChores = choresResponse.data;
      const myChores = allChores.filter(c => c.assignedTo?._id === user.id || c.assignedTo === user.id);
      const completedChores = myChores.filter(c => c.status === 'completed').length;
      const totalChores = myChores.length;
      const completionRate = totalChores > 0 ? (completedChores / totalChores) * 100 : 0;
      
      // Smart AI message based on performance
      let aiMessage = '';
      let sentiment = '';
      
      if (totalChores === 0) {
        aiMessage = "Welcome! Start completing tasks to see your amazing progress! 🎯";
        sentiment = 'neutral';
      } else if (completionRate >= 80) {
        aiMessage = `🌟 Outstanding! You've completed ${completedChores}/${totalChores} tasks (${completionRate.toFixed(0)}%)! You're a superstar! Keep this incredible momentum going! 🚀`;
        sentiment = 'positive';
      } else if (completionRate >= 60) {
        aiMessage = `💪 Great work! You've done ${completedChores}/${totalChores} tasks (${completionRate.toFixed(0)}%). You're doing well! A little more effort and you'll be amazing! 🌟`;
        sentiment = 'positive';
      } else if (completionRate >= 40) {
        aiMessage = `📈 Good start! ${completedChores}/${totalChores} tasks completed (${completionRate.toFixed(0)}%). You're making progress! Let's push a bit harder to reach your goals! 💪`;
        sentiment = 'neutral';
      } else if (completionRate >= 20) {
        aiMessage = `⚡ You can do better! Only ${completedChores}/${totalChores} tasks done (${completionRate.toFixed(0)}%). Don't give up! Every small step counts. Start with one task today! 🎯`;
        sentiment = 'motivational';
      } else {
        aiMessage = `🔥 Time to shine! You have ${totalChores - completedChores} pending tasks. I believe in you! Start now and show everyone what you're capable of! You've got this! 💪🌟`;
        sentiment = 'motivational';
      }
      
      const rewards = rewardsResponse.data;
      
      setPersonalizedMsg({
        message: aiMessage,
        points: rewards?.totalPoints || 0,
        level: rewards?.level || 1,
        completionRate: completionRate.toFixed(1),
        completedTasks: completedChores,
        totalTasks: totalChores,
        sentiment: sentiment
      });
    } catch (error) {
      console.error('Error fetching personalized message:', error);
    }
  };

  const getEncouragement = async (type = 'chore') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/ai/encouragement?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(response.data.message);
    } catch (error) {
      console.error('Error getting encouragement:', error);
    }
    setLoading(false);
  };

  const analyzeSentiment = async () => {
    if (!sentimentText.trim()) {
      alert('Please enter some text to analyze');
      return;
    }

    setAnalyzingText(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/ai/analyze', 
        { text: sentimentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSentimentResult(response.data);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      alert('Failed to analyze sentiment. Make sure ML service is running!');
    }
    setAnalyzingText(false);
  };

  return (
    <div style={styles.container}>
      <h1>🤖 AI Encouragement Bot</h1>
      
      {personalizedMsg && (
        <div style={{
          ...styles.personalizedCard,
          background: personalizedMsg.sentiment === 'positive' 
            ? 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)'
            : personalizedMsg.sentiment === 'motivational'
            ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
            : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
        }}>
          <h2>🤖 AI Performance Analysis</h2>
          <p style={styles.bigText}>{personalizedMsg.message}</p>
          
          <div style={styles.progressBar}>
            <div style={{...styles.progressFill, width: `${personalizedMsg.completionRate}%`}}>
              <span style={styles.progressText}>{personalizedMsg.completionRate}%</span>
            </div>
          </div>
          
          <div style={styles.stats}>
            <div style={styles.stat}>
              <span style={styles.statValue}>{personalizedMsg.completedTasks}/{personalizedMsg.totalTasks}</span>
              <span style={styles.statLabel}>Tasks Completed</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statValue}>{personalizedMsg.points}</span>
              <span style={styles.statLabel}>Total Points</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statValue}>{personalizedMsg.level}</span>
              <span style={styles.statLabel}>Level</span>
            </div>
          </div>
        </div>
      )}

      <div style={styles.buttonGroup}>
        <button onClick={() => getEncouragement('chore')} style={styles.button}>
          Get Chore Motivation 💪
        </button>
        <button onClick={() => getEncouragement('study')} style={{...styles.button, background: '#9C27B0'}}>
          Get Study Motivation 📚
        </button>
      </div>

      {loading && <p style={styles.loading}>Getting encouragement...</p>}

      {message && (
        <div style={styles.messageCard}>
          <div style={styles.botIcon}>🤖</div>
          <p style={styles.messageText}>{message}</p>
        </div>
      )}

      {/* ML Sentiment Analyzer */}
      <div style={styles.mlSection}>
        <h2>🧠 ML Sentiment Analyzer</h2>
        <p style={styles.subtitle}>Powered by Logistic Regression Model (73.65% Accuracy)</p>
        
        <textarea
          placeholder="Enter your thoughts or feedback here... (e.g., 'I completed all my homework today!')"
          value={sentimentText}
          onChange={(e) => setSentimentText(e.target.value)}
          style={styles.textarea}
          rows="4"
        />
        
        <button 
          onClick={analyzeSentiment} 
          disabled={analyzingText}
          style={styles.analyzeBtn}
        >
          {analyzingText ? 'Analyzing...' : 'Analyze Sentiment 🔍'}
        </button>

        {sentimentResult && (
          <div style={{
            ...styles.resultCard,
            background: sentimentResult.sentiment === 'positive' 
              ? 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)'
              : 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
          }}>
            <h3>Analysis Results:</h3>
            <div style={styles.resultRow}>
              <span style={styles.resultLabel}>Sentiment:</span>
              <span style={styles.resultValue}>
                {sentimentResult.sentiment === 'positive' ? '😊 Positive' : '😔 Negative'}
              </span>
            </div>
            <div style={styles.resultRow}>
              <span style={styles.resultLabel}>Confidence:</span>
              <span style={styles.resultValue}>{sentimentResult.confidence}%</span>
            </div>
            <div style={styles.encouragementBox}>
              <p style={styles.encouragementText}>{sentimentResult.encouragement}</p>
            </div>
          </div>
        )}
      </div>

      <div style={styles.infoBox}>
        <h3>How the AI Bot Helps:</h3>
        <ul>
          <li>✨ Analyzes your task completion rate automatically</li>
          <li>🎯 Provides personalized messages based on performance</li>
          <li>🏆 Motivates you based on your progress</li>
          <li>💡 Gives encouragement when you need it most</li>
          <li>🧠 Uses Machine Learning to analyze sentiment (5 models trained)</li>
        </ul>
        
        <div style={styles.modelInfo}>
          <h4>ML Model Details:</h4>
          <p><strong>Best Model:</strong> Logistic Regression</p>
          <p><strong>Accuracy:</strong> 73.65%</p>
          <p><strong>Dataset:</strong> Sentiment140 (10,000 samples)</p>
          <p><strong>Models Compared:</strong> Logistic Regression, SVM, Random Forest, Naive Bayes, Decision Tree</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { background:'#1f2937',padding: '20px', maxWidth: '1500px', margin: '0 auto' },
  personalizedCard: { 
    color: 'white', 
    padding: '30px', 
    borderRadius: '15px', 
    marginBottom: '30px', 
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
  },
  bigText: { fontSize: '20px', fontWeight: '600', margin: '20px 0', lineHeight: '1.6' },
  progressBar: {
    width: '100%',
    height: '40px',
    background: 'rgba(255,255,255,0.3)',
    borderRadius: '20px',
    overflow: 'hidden',
    marginTop: '20px',
    marginBottom: '20px',
    position: 'relative'
  },
  progressFill: {
    height: '100%',
    background: 'rgba(255,255,255,0.9)',
    borderRadius: '20px',
    transition: 'width 1s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  progressText: {
    fontWeight: 'bold',
    color: '#1f2937',
    fontSize: '18px'
  },
  stats: { display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '20px', flexWrap: 'wrap' },
  stat: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  statValue: { fontSize: '32px', fontWeight: 'bold' },
  statLabel: { fontSize: '14px', opacity: 0.9, marginTop: '5px' },
  buttonGroup: { display: 'flex', gap: '15px', marginBottom: '30px' },
  button: { flex: 1, padding: '15px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', transition: 'transform 0.2s' },
  loading: { textAlign: 'center', color: '#666' },
  messageCard: { background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px' },
  botIcon: { fontSize: '60px' },
  messageText: { fontSize: '20px', fontWeight: '500', color: '#333' },
  mlSection: { background: '#f9f9f9', padding: '30px', borderRadius: '15px', marginBottom: '30px' },
  subtitle: { color: '#666', fontSize: '14px', marginBottom: '20px' },
  textarea: { width: '100%', padding: '15px', border: '2px solid #ddd', borderRadius: '10px', fontSize: '16px', fontFamily: 'Arial', resize: 'vertical' },
  analyzeBtn: { width: '100%', padding: '15px', background: '#FF6B6B', color: 'white', border: 'none', borderRadius: '10px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px', transition: 'background 0.3s' },
  resultCard: { color: 'white', padding: '25px', borderRadius: '15px', marginTop: '20px' },
  resultRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '18px' },
  resultLabel: { fontWeight: 'bold' },
  resultValue: { fontSize: '20px', fontWeight: 'bold' },
  encouragementBox: { marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px' },
  encouragementText: { fontSize: '18px', fontWeight: '500', margin: 0 },
  infoBox: { background: '#eb3939', padding: '20px', borderRadius: '10px' },
  modelInfo: { background: 'rgba(28, 209, 95, 0.6)', padding: '15px', borderRadius: '10px', marginTop: '15px' }
};

export default AIBot;