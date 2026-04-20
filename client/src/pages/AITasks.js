import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AITasks() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('predict'); // 'predict' or 'add'
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
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    points: 20,
    dueDate: ''
  });

  useEffect(() => { fetchChildren(); }, []);

  const fetchChildren = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users/children', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChildren(response.data);
      if (response.data.length > 0) setSelectedChild(response.data[0]._id);
    } catch (error) { console.error('Error fetching children:', error); }
  };

  const getCurrentChild = () => children.find(c => c._id === selectedChild) || children[0];
  const currentChild = getCurrentChild();

  const predictCompletion = async () => {
    setLoading(true);
    setPrediction(null);
    setSaved(false);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/ml/predict',
        { child_age: currentChild?.age || 10, performance_level: 5, ...taskData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPrediction(response.data);
    } catch (error) {
      alert('Failed to get prediction. Make sure ML service is running on port 5002!');
    }
    setLoading(false);
  };

  const saveTask = async () => {
    if (!newTask.title) { alert('Please enter task title in Add Task tab first!'); setActiveTab('add'); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/chores', {
        title: newTask.title,
        description: newTask.description,
        assignedTo: selectedChild,
        points: newTask.points || taskData.task_points,
        dueDate: newTask.dueDate || undefined
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSaved(true);
      setNewTask({ title: '', description: '', points: 20, dueDate: '' });
      alert(`✅ Task "${newTask.title}" saved successfully for ${currentChild?.name}!`);
    } catch (error) {
      alert('Failed to save task!');
    }
    setSaving(false);
  };

  const categories = [
    { value: 0, label: '🛏️ Bedroom' }, { value: 1, label: '🍳 Kitchen' },
    { value: 2, label: '🌿 Garden' },  { value: 3, label: '🚿 Bathroom' },
    { value: 4, label: '🐾 Pets' },    { value: 5, label: '👕 Laundry' },
    { value: 6, label: '📚 Study' },   { value: 7, label: '🛒 Shopping' },
    { value: 8, label: '🍽️ Cooking' }, { value: 9, label: '🧹 Cleaning' },
  ];
  const difficulties = [
    { value: 0, label: '😊 Easy' },
    { value: 1, label: '😐 Medium' },
    { value: 2, label: '😤 Hard' },
  ];

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>🤖 AI Task Success Predictor</h1>
          <p style={styles.pageSubtitle}>Predict task success then save to dashboard!</p>
        </div>
        <div style={styles.badge}>✨ ML Powered</div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsWrapper}>
        <button
          onClick={() => setActiveTab('predict')}
          style={{ ...styles.tab, ...(activeTab === 'predict' ? styles.tabActive : {}) }}
        >
          🎯 Predict Success
        </button>
        <button
          onClick={() => setActiveTab('add')}
          style={{ ...styles.tab, ...(activeTab === 'add' ? styles.tabActive : {}) }}
        >
          ➕ Add Task Details
        </button>
      </div>

      {/* Main Card */}
      <div style={styles.mainCard}>

        {/* Child Selector - always visible */}
        <h3 style={styles.sectionLabel}>👶 Select Child</h3>
        <div style={styles.childGrid}>
          {children.map(child => (
            <div key={child._id}
              onClick={() => { setSelectedChild(child._id); setPrediction(null); setSaved(false); }}
              style={{ ...styles.childCard, ...(selectedChild === child._id ? styles.childCardActive : {}) }}
            >
              <div style={{
                ...styles.childAvatar,
                background: selectedChild === child._id
                  ? 'linear-gradient(135deg, #00f5a0, #00d9f5)'
                  : 'rgba(255,255,255,0.1)'
              }}>
                {child.name[0].toUpperCase()}
              </div>
              <div style={styles.childName}>{child.name}</div>
              <div style={styles.childAge}>Age: {child.age || 'N/A'}</div>
            </div>
          ))}
        </div>

        <div style={styles.divider}/>

        {/* ══════ TAB 1: PREDICT ══════ */}
        {activeTab === 'predict' && (
          <>
            <h3 style={styles.sectionLabel}>⚙️ Task Settings</h3>
            <div style={styles.settingsGrid}>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Task Category</label>
                <select value={taskData.task_category}
                  onChange={(e) => setTaskData({...taskData, task_category: parseInt(e.target.value)})}
                  style={styles.select}>
                  {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Difficulty</label>
                <select value={taskData.task_difficulty}
                  onChange={(e) => setTaskData({...taskData, task_difficulty: parseInt(e.target.value)})}
                  style={styles.select}>
                  {difficulties.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Points: <strong style={{color:'#00f5a0'}}>{taskData.task_points}</strong></label>
                <input type="range" value={taskData.task_points}
                  onChange={(e) => setTaskData({...taskData, task_points: parseInt(e.target.value)})}
                  style={styles.slider} min="5" max="100" step="5"/>
                <div style={styles.sliderLabels}><span>5</span><span>50</span><span>100</span></div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Past Completion Rate: <strong style={{color:'#00f5a0'}}>{Math.round(taskData.past_completion_rate * 100)}%</strong></label>
                <input type="range" value={taskData.past_completion_rate}
                  onChange={(e) => setTaskData({...taskData, past_completion_rate: parseFloat(e.target.value)})}
                  style={styles.slider} min="0" max="1" step="0.05"/>
                <div style={styles.sliderLabels}><span>0%</span><span>50%</span><span>100%</span></div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Current Streak: <strong style={{color:'#00f5a0'}}>{taskData.current_streak} days</strong></label>
                <input type="range" value={taskData.current_streak}
                  onChange={(e) => setTaskData({...taskData, current_streak: parseInt(e.target.value)})}
                  style={styles.slider} min="0" max="30" step="1"/>
                <div style={styles.sliderLabels}><span>0</span><span>15 days</span><span>30</span></div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Total Tasks Assigned: <strong style={{color:'#00f5a0'}}>{taskData.total_tasks_assigned}</strong></label>
                <input type="range" value={taskData.total_tasks_assigned}
                  onChange={(e) => setTaskData({...taskData, total_tasks_assigned: parseInt(e.target.value)})}
                  style={styles.slider} min="1" max="100" step="1"/>
                <div style={styles.sliderLabels}><span>1</span><span>50</span><span>100</span></div>
              </div>
            </div>

            <button onClick={predictCompletion} disabled={loading || !selectedChild}
              style={{...styles.predictBtn, opacity: loading ? 0.7 : 1}}>
              {loading ? '🔄 Analyzing with AI...' : '🎯 Predict Success Rate'}
            </button>
          </>
        )}

        {/* ══════ TAB 2: ADD TASK ══════ */}
        {activeTab === 'add' && (
          <>
            <h3 style={styles.sectionLabel}>➕ Task Details</h3>
            <div style={styles.addTaskGrid}>

              <div style={{...styles.inputGroup, gridColumn:'1/-1'}}>
                <label style={styles.inputLabel}>Task Title *</label>
                <input type="text" placeholder="e.g. Clean the kitchen"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  style={styles.textInput}/>
              </div>

              <div style={{...styles.inputGroup, gridColumn:'1/-1'}}>
                <label style={styles.inputLabel}>Description</label>
                <textarea placeholder="Describe the task..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  style={styles.textarea}/>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Points</label>
                <input type="number" value={newTask.points} min="5" max="100"
                  onChange={(e) => setNewTask({...newTask, points: parseInt(e.target.value)})}
                  style={styles.textInput}/>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Due Date (Optional)</label>
                <input type="datetime-local" value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  style={styles.textInput}/>
              </div>
            </div>

            {/* Hint */}
            <div style={styles.hintBox}>
              💡 <strong>Tip:</strong> Go to <strong>Predict Success</strong> tab first to check AI prediction, then come back here to save!
            </div>

            <button onClick={() => setActiveTab('predict')} style={styles.predictFirstBtn}>
              🎯 Go to Predict First
            </button>
          </>
        )}
      </div>

      {/* Result Card */}
      {prediction && (
        <div style={{
          ...styles.resultCard,
          background: prediction.will_complete || prediction.will_succeed
            ? 'linear-gradient(135deg, #0f3d2e, #1a5c40)'
            : 'linear-gradient(135deg, #3d0f0f, #5c1a1a)',
          borderColor: prediction.will_complete || prediction.will_succeed ? '#00f5a0' : '#ff6b6b'
        }}>
          <div style={{position:'absolute', top:0, left:0, right:0, height:'3px',
            background: prediction.will_complete || prediction.will_succeed
              ? 'linear-gradient(90deg, #00f5a0, #00d9f5)'
              : 'linear-gradient(90deg, #ff6b6b, #ee0979)',
            borderRadius:'16px 16px 0 0'}}/>

          <div style={styles.resultTop}>
            <div style={{fontSize:'52px'}}>
              {prediction.will_complete || prediction.will_succeed ? '✅' : '❌'}
            </div>
            <div>
              <h2 style={{...styles.resultTitle,
                color: prediction.will_complete || prediction.will_succeed ? '#00f5a0' : '#ff6b6b'}}>
                {prediction.will_complete || prediction.will_succeed
                  ? 'High Success Probability!' : 'Low Success Probability!'}
              </h2>
              <p style={{color:'#a0aec0', fontSize:'14px'}}>
                For: <strong style={{color:'white'}}>{currentChild?.name}</strong> (Age: {currentChild?.age})
              </p>
            </div>
          </div>

          {/* Confidence Bar */}
          <div style={{marginBottom:'24px'}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
              <span style={{color:'#a0aec0', fontSize:'14px'}}>Confidence Score</span>
              <span style={{color:'white', fontSize:'28px', fontWeight:'900'}}>
                {(prediction.confidence || prediction.success_probability)?.toFixed(1)}%
              </span>
            </div>
            <div style={{height:'12px', background:'rgba(255,255,255,0.1)', borderRadius:'6px', overflow:'hidden'}}>
              <div style={{
                height:'100%',
                width:`${prediction.confidence || prediction.success_probability}%`,
                background: prediction.will_complete || prediction.will_succeed
                  ? 'linear-gradient(90deg, #00f5a0, #00d9f5)'
                  : 'linear-gradient(90deg, #ff6b6b, #ee0979)',
                borderRadius:'6px', transition:'width 0.8s ease'
              }}/>
            </div>
          </div>

          {/* Stats */}
          <div style={styles.resultStats}>
            {[
              { icon:'✅', value:`${prediction.success_probability?.toFixed(1)}%`, label:'Success Chance', color:'#00f5a0' },
              { icon:'❌', value:`${prediction.fail_probability?.toFixed(1)}%`, label:'Fail Chance', color:'#ff6b6b' },
              { icon:'🎯', value:`${prediction.confidence?.toFixed(1)}%`, label:'Confidence', color:'#ffd200' },
            ].map((s, i) => (
              <div key={i} style={styles.resultStat}>
                <div style={{fontSize:'24px'}}>{s.icon}</div>
                <div style={{color:s.color, fontSize:'20px', fontWeight:'800'}}>{s.value}</div>
                <div style={{color:'#a0aec0', fontSize:'12px'}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Recommendation */}
          <div style={styles.recommendation}>
            {prediction.will_complete || prediction.will_succeed
              ? '👍 Great choice! This task is well-suited for this child.'
              : '⚠️ Consider assigning an easier task or providing extra support.'}
          </div>

          {/* Save Button */}
          <div style={styles.saveSection}>
            <p style={{color:'#a0aec0', fontSize:'13px', marginBottom:'12px', textAlign:'center'}}>
              {newTask.title
                ? `Ready to save: "${newTask.title}"`
                : '⚠️ Add task details in "Add Task Details" tab first!'}
            </p>
            <div style={{display:'flex', gap:'12px'}}>
              <button onClick={() => setActiveTab('add')} style={styles.addDetailsBtn}>
                ➕ Add Task Details
              </button>
              <button
                onClick={saveTask}
                disabled={saving || saved || !newTask.title}
                style={{
                  ...styles.saveBtn,
                  opacity: saving || !newTask.title ? 0.6 : 1,
                  background: saved
                    ? 'linear-gradient(135deg, #059669, #047857)'
                    : 'linear-gradient(135deg, #00f5a0, #00d9f5)'
                }}
              >
                {saved ? '✅ Saved!' : saving ? '⏳ Saving...' : '💾 Save Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding:'30px', width:'100%', minHeight:'100vh', background:'linear-gradient(135deg, #020c2df5 0%, #020c2df5 50%, #020c2df5 100%)' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', flexWrap:'wrap', gap:'16px' },
  pageTitle: { fontSize:'28px', fontWeight:'800', color:'white', marginBottom:'6px' },
  pageSubtitle: { fontSize:'14px', color:'#a0aec0' },
  badge: { background:'linear-gradient(135deg, #00f5a0, #00d9f5)', color:'#0f0c29', padding:'10px 20px', borderRadius:'20px', fontSize:'14px', fontWeight:'800', boxShadow:'0 4px 15px rgba(0,245,160,0.4)' },
  tabsWrapper: { display:'flex', gap:'12px', marginBottom:'24px' },
  tab: { padding:'12px 24px', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.03)', color:'#a0aec0', fontSize:'15px', fontWeight:'600', cursor:'pointer', transition:'all 0.2s' },
  tabActive: { background:'linear-gradient(135deg, #667eea, #764ba2)', color:'white', border:'1px solid transparent', boxShadow:'0 4px 15px rgba(102,126,234,0.4)' },
  mainCard: { background:'rgba(255,255,255,0.05)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'20px', padding:'30px', marginBottom:'24px' },
  sectionLabel: { fontSize:'16px', fontWeight:'700', color:'white', marginBottom:'16px' },
  childGrid: { display:'flex', gap:'12px', flexWrap:'wrap', marginBottom:'8px' },
  childCard: { padding:'16px 20px', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.1)', cursor:'pointer', textAlign:'center', background:'rgba(255,255,255,0.03)', minWidth:'100px', transition:'all 0.2s' },
  childCardActive: { border:'1px solid #00f5a0', background:'rgba(0,245,160,0.08)', boxShadow:'0 0 20px rgba(0,245,160,0.2)' },
  childAvatar: { width:'44px', height:'44px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#0f0c29', fontSize:'18px', fontWeight:'800', margin:'0 auto 8px' },
  childName: { color:'white', fontWeight:'700', fontSize:'14px' },
  childAge: { color:'#a0aec0', fontSize:'12px', marginTop:'4px' },
  divider: { height:'1px', background:'rgba(255,255,255,0.08)', margin:'24px 0' },
  settingsGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:'20px', marginBottom:'28px' },
  inputGroup: { display:'flex', flexDirection:'column' },
  inputLabel: { fontSize:'13px', fontWeight:'600', color:'#a0aec0', marginBottom:'8px' },
  select: { padding:'11px 14px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.15)', fontSize:'14px', cursor:'pointer', background:'rgba(255,255,255,0.08)', color:'white', outline:'none' },
  slider: { width:'100%', height:'6px', borderRadius:'5px', outline:'none', cursor:'pointer', appearance:'none', background:'linear-gradient(to right, #ff6b6b 0%, #ffd200 50%, #00f5a0 100%)', marginTop:'8px' },
  sliderLabels: { display:'flex', justifyContent:'space-between', fontSize:'11px', color:'#6b7280', marginTop:'6px' },
  predictBtn: { width:'100%', padding:'16px', background:'linear-gradient(135deg, #667eea, #764ba2)', color:'white', border:'none', borderRadius:'12px', fontSize:'16px', fontWeight:'800', cursor:'pointer', boxShadow:'0 4px 20px rgba(102,126,234,0.5)', transition:'all 0.2s' },
  addTaskGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'16px', marginBottom:'20px' },
  textInput: { padding:'11px 14px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.15)', fontSize:'14px', background:'rgba(255,255,255,0.08)', color:'white', outline:'none' },
  textarea: { padding:'11px 14px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.15)', fontSize:'14px', background:'rgba(255,255,255,0.08)', color:'white', outline:'none', minHeight:'80px', resize:'vertical' },
  hintBox: { background:'rgba(255,210,0,0.1)', border:'1px solid rgba(255,210,0,0.3)', borderRadius:'10px', padding:'14px 16px', color:'#ffd200', fontSize:'13px', marginBottom:'16px' },
  predictFirstBtn: { width:'100%', padding:'14px', background:'linear-gradient(135deg, #667eea, #764ba2)', color:'white', border:'none', borderRadius:'12px', fontSize:'15px', fontWeight:'700', cursor:'pointer' },
  resultCard: { padding:'30px', borderRadius:'16px', border:'1px solid', position:'relative', overflow:'hidden' },
  resultTop: { display:'flex', alignItems:'center', gap:'20px', marginBottom:'24px' },
  resultTitle: { fontSize:'22px', fontWeight:'800', marginBottom:'6px' },
  resultStats: { display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'16px', marginBottom:'24px' },
  resultStat: { background:'rgba(255,255,255,0.05)', borderRadius:'12px', padding:'16px', textAlign:'center', border:'1px solid rgba(255,255,255,0.08)' },
  recommendation: { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'16px', color:'#e2e8f0', fontSize:'15px', fontWeight:'500', textAlign:'center', lineHeight:'1.6', marginBottom:'20px' },
  saveSection: { borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:'20px' },
  addDetailsBtn: { flex:1, padding:'13px', background:'rgba(255,255,255,0.08)', color:'white', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'10px', fontSize:'14px', fontWeight:'600', cursor:'pointer' },
  saveBtn: { flex:1, padding:'13px', color:'#0f0c29', border:'none', borderRadius:'10px', fontSize:'14px', fontWeight:'800', cursor:'pointer', boxShadow:'0 4px 15px rgba(0,245,160,0.3)' },
};

export default AITasks;