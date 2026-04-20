import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AITaskPredictor({ childAge = 10, performanceLevel = 5, children = [] }) {
  const [selectedChild, setSelectedChild] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [taskData, setTaskData] = useState({
    task_category: 1,
    task_difficulty: 1,
    task_points: 20,
    time_of_day: 2,
    day_of_week: new Date().getDay(),
    past_completion_rate: 0.75,
    current_streak: 3,
    total_tasks_assigned: 20
  });

  // Initialize selected child
  useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0]._id);
    }
  }, [children, selectedChild]);

  // Get current child's data
  const getCurrentChild = () => {
    if (selectedChild && children.length > 0) {
      return children.find(c => c._id === selectedChild);
    }
    return children[0];
  };
  
  const currentChild = getCurrentChild();
  const currentAge = currentChild?.age || childAge;
  const currentPerformance = performanceLevel;

  const predictCompletion = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/ml/predict',
        {
          child_age: currentAge,
          performance_level: currentPerformance,
          ...taskData
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPrediction(response.data);
    } catch (error) {
      console.error('Prediction error:', error);
      alert('Failed to get prediction');
    }
    setLoading(false);
  };

  const categories = [
    { value: 0, label: 'Bedroom' },
    { value: 1, label: 'Kitchen' },
    { value: 2, label: 'Outdoor' },
    { value: 3, label: 'Bathroom' },
    { value: 4, label: 'Pets' },
    { value: 5, label: 'Laundry' },
    { value: 6, label: 'School' }
  ];

  const difficulties = [
    { value: 0, label: 'Easy', color: '#10b981' },
    { value: 1, label: 'Medium', color: '#f59e0b' },
    { value: 2, label: 'Hard', color: '#ef4444' }
  ];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🤖 AI Task Success Predictor</h2>
      <p style={styles.subtitle}>Powered by XGBoost ML Model (99.2% Accurate)</p>

      {/* Child Selector */}
      {children.length > 0 && (
        <div style={styles.childSelector}>
          <div style={{gridColumn: '1 / -1'}}>
            <label style={styles.label}>Select Child:</label>
            <select 
              value={selectedChild || children[0]?._id}
              onChange={(e) => {
                setSelectedChild(e.target.value);
                setPrediction(null);
              }}
              style={styles.select}
            >
              {children.map(child => (
                <option key={child._id} value={child._id}>
                  {child.name}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.childInfo}>
            <span style={styles.infoChip}>👶 Age: {currentAge} years</span>
            <span style={styles.infoChip}>📊 Performance Level: {currentPerformance}</span>
          </div>
        </div>
      )}

      <div style={styles.inputSection}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Task Category:</label>
          <select 
            value={taskData.task_category}
            onChange={(e) => setTaskData({...taskData, task_category: parseInt(e.target.value)})}
            style={styles.select}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Difficulty:</label>
          <select 
            value={taskData.task_difficulty}
            onChange={(e) => setTaskData({...taskData, task_difficulty: parseInt(e.target.value)})}
            style={styles.select}
          >
            {difficulties.map(diff => (
              <option key={diff.value} value={diff.value}>{diff.label}</option>
            ))}
          </select>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Points:</label>
          <input 
            type="number"
            value={taskData.task_points}
            onChange={(e) => setTaskData({...taskData, task_points: parseInt(e.target.value)})}
            style={styles.input}
            min="5"
            max="60"
          />
        </div>

        {/* NEW: Past Completion Rate Slider */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Past Completion Rate: <strong>{Math.round(taskData.past_completion_rate * 100)}%</strong>
          </label>
          <input 
            type="range"
            value={taskData.past_completion_rate}
            onChange={(e) => setTaskData({...taskData, past_completion_rate: parseFloat(e.target.value)})}
            style={styles.slider}
            min="0"
            max="1"
            step="0.05"
          />
          <div style={styles.sliderLabels}>
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* NEW: Current Streak Slider */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Current Streak: <strong>{taskData.current_streak} days</strong>
          </label>
          <input 
            type="range"
            value={taskData.current_streak}
            onChange={(e) => setTaskData({...taskData, current_streak: parseInt(e.target.value)})}
            style={styles.slider}
            min="0"
            max="30"
            step="1"
          />
          <div style={styles.sliderLabels}>
            <span>0 days</span>
            <span>15 days</span>
            <span>30 days</span>
          </div>
        </div>

        {/* NEW: Total Tasks Assigned Slider */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Total Tasks Assigned: <strong>{taskData.total_tasks_assigned}</strong>
          </label>
          <input 
            type="range"
            value={taskData.total_tasks_assigned}
            onChange={(e) => setTaskData({...taskData, total_tasks_assigned: parseInt(e.target.value)})}
            style={styles.slider}
            min="1"
            max="100"
            step="1"
          />
          <div style={styles.sliderLabels}>
            <span>1</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        <button 
          onClick={predictCompletion}
          disabled={loading}
          style={styles.predictBtn}
        >
          {loading ? '🔄 Analyzing...' : '🎯 Predict Success Rate'}
        </button>
      </div>

      {prediction && (
        <div style={{
          ...styles.resultCard,
          background: prediction.will_complete 
            ? 'linear-gradient(135deg, #10b981, #059669)' 
            : 'linear-gradient(135deg, #ef4444, #dc2626)'
        }}>
          <div style={styles.resultIcon}>
            {prediction.will_complete ? '✅' : '❌'}
          </div>
          <h3 style={styles.resultTitle}>
            {prediction.will_complete ? 'High Success Probability' : 'Low Success Probability'}
          </h3>
          <p style={styles.childName}>
            For: {currentChild?.name || 'Child'} ({currentAge} years old)
          </p>
          <div style={styles.confidenceBar}>
            <div style={{
              ...styles.confidenceFill,
              width: `${prediction.confidence}%`
            }} />
          </div>
          <p style={styles.confidenceText}>
            {prediction.confidence.toFixed(1)}% Confidence
          </p>
          <p style={styles.recommendation}>
            {prediction.will_complete 
              ? '👍 This task is well-suited for the child!' 
              : '⚠️ Consider assigning an easier task or providing extra support.'}
          </p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    background: 'pink',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    marginBottom: '30px'
  },
  title: {
    fontSize: '24px',
    marginBottom: '5px',
    color: '#1f2937'
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '14px',
    marginBottom: '25px'
  },
  childSelector: {
    background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '25px',
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '15px'
  },
  childInfo: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    marginTop: '10px'
  },
  infoChip: {
    background: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  inputSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#374151'
  },
  select: {
    padding: '12px',
    borderRadius: '10px',
    border: '2px solid #e5e7eb',
    fontSize: '14px',
    cursor: 'pointer',
    backgroundColor: 'white'
  },
  input: {
    padding: '12px',
    borderRadius: '10px',
    border: '2px solid #e5e7eb',
    fontSize: '14px'
  },
  slider: {
    width: '100%',
    height: '8px',
    borderRadius: '5px',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    background: 'linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #10b981 100%)',
    marginTop: '8px'
  },
  sliderLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#9ca3af',
    marginTop: '5px'
  },
  predictBtn: {
    padding: '15px 30px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    gridColumn: '1 / -1',
    transition: 'transform 0.2s'
  },
  resultCard: {
    padding: '30px',
    borderRadius: '15px',
    textAlign: 'center',
    color: 'white',
    marginTop: '30px'
  },
  resultIcon: {
    fontSize: '60px',
    marginBottom: '15px'
  },
  resultTitle: {
    fontSize: '22px',
    marginBottom: '10px'
  },
  childName: {
    fontSize: '16px',
    opacity: 0.9,
    marginBottom: '20px'
  },
  confidenceBar: {
    background: 'rgba(255,255,255,0.3)',
    height: '30px',
    borderRadius: '15px',
    overflow: 'hidden',
    marginBottom: '10px'
  },
  confidenceFill: {
    background: 'white',
    height: '100%',
    transition: 'width 0.5s ease'
  },
  confidenceText: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '15px'
  },
  recommendation: {
    fontSize: '16px',
    opacity: '0.9'
  }
};

export default AITaskPredictor;