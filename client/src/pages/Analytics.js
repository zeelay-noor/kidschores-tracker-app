import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Analytics() {
  const [timeframe, setTimeframe] = useState('weekly');
  const [chores, setChores] = useState([]);
  const [studyActivities, setStudyActivities] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('all');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [choresRes, studyRes, childrenRes] = await Promise.all([
        axios.get('http://localhost:5000/api/chores', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/study', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/users/children', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setChores(choresRes.data);
      setStudyActivities(studyRes.data);
      setChildren(childrenRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const filterByTimeframe = (items) => {
    const now = new Date();
    let startDate;

    switch(timeframe) {
      case 'daily':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'monthly':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(0);
    }

    return items.filter(item => new Date(item.createdAt) >= startDate);
  };

  const filterByChild = (items) => {
    if (selectedChild === 'all') return items;
    return items.filter(item => 
      item.assignedTo?._id === selectedChild || item.assignedTo === selectedChild
    );
  };

  const getFilteredData = () => {
    let allChores = filterByTimeframe(chores);
    let allStudy = filterByTimeframe(studyActivities);
    
    allChores = filterByChild(allChores);
    allStudy = filterByChild(allStudy);

    return { chores: allChores, study: allStudy };
  };

  const getCompletionStats = () => {
    const { chores: filteredChores, study: filteredStudy } = getFilteredData();
    
    const totalChores = filteredChores.length;
    const completedChores = filteredChores.filter(c => c.status === 'completed').length;
    const pendingChores = filteredChores.filter(c => c.status === 'pending').length;
    const pendingApproval = filteredChores.filter(c => c.status === 'pending_approval').length;

    const totalStudy = filteredStudy.length;
    const completedStudy = filteredStudy.filter(s => s.status === 'completed').length;

    const completionRate = totalChores > 0 ? ((completedChores / totalChores) * 100).toFixed(1) : 0;

    return {
      totalTasks: totalChores + totalStudy,
      completedTasks: completedChores + completedStudy,
      completionRate,
      pendingChores,
      pendingApproval,
      totalChores,
      completedChores,
      totalStudy,
      completedStudy
    };
  };

  const getPointsData = () => {
    const { chores: filteredChores } = getFilteredData();
    const completedChores = filteredChores.filter(c => c.status === 'completed');
    
    const totalPoints = completedChores.reduce((sum, c) => sum + (c.points || 0), 0);
    
    return { totalPoints, tasksCompleted: completedChores.length };
  };

  const getActivityBreakdown = () => {
    const stats = getCompletionStats();
    
    return [
      { name: 'Chores Completed', value: stats.completedChores, color: '#10b981' },
      { name: 'Chores Pending', value: stats.pendingChores, color: '#6b7280' },
      { name: 'Pending Approval', value: stats.pendingApproval, color: '#f59e0b' },
      { name: 'Study Completed', value: stats.completedStudy, color: '#3b82f6' }
    ];
  };

  const getTrendData = () => {
    const { chores: filteredChores, study: filteredStudy } = getFilteredData();
    const days = timeframe === 'daily' ? 1 : timeframe === 'weekly' ? 7 : 30;
    
    const trendData = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const choresCompleted = filteredChores.filter(c => {
        const createdDate = new Date(c.createdAt);
        return c.status === 'completed' && createdDate >= dayStart && createdDate <= dayEnd;
      }).length;

      const studyCompleted = filteredStudy.filter(s => {
        const createdDate = new Date(s.createdAt);
        return s.status === 'completed' && createdDate >= dayStart && createdDate <= dayEnd;
      }).length;

      trendData.push({
        date: dateStr,
        chores: choresCompleted,
        study: studyCompleted,
        total: choresCompleted + studyCompleted
      });
    }

    return trendData;
  };

  const stats = getCompletionStats();
  const points = getPointsData();
  const breakdown = getActivityBreakdown();
  const trend = getTrendData();

  if (user?.role !== 'parent') {
    return (
      <div style={styles.container}>
        <h1>Analytics Dashboard</h1>
        <p>This page is only available for parents.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>📊 Analytics Dashboard</h1>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <label style={styles.label}>Timeframe:</label>
          <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} style={styles.select}>
            <option value="daily">Today</option>
            <option value="weekly">Last 7 Days</option>
            <option value="monthly">Last 30 Days</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>Child:</label>
          <select value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)} style={styles.select}>
            <option value="all">All Children</option>
            {children.map(child => (
              <option key={child._id} value={child._id}>{child.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'}}>
          <h3>Total Tasks</h3>
          <p style={styles.statValue}>{stats.totalTasks}</p>
        </div>

        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #10b981, #059669)'}}>
          <h3>Completed</h3>
          <p style={styles.statValue}>{stats.completedTasks}</p>
        </div>

        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #f59e0b, #d97706)'}}>
          <h3>Completion Rate</h3>
          <p style={styles.statValue}>{stats.completionRate}%</p>
        </div>

        <div style={{...styles.statCard, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'}}>
          <h3>Points Earned</h3>
          <p style={styles.statValue}>{points.totalPoints}</p>
        </div>
      </div>

      {/* Charts */}
      <div style={styles.chartsGrid}>
        {/* Trend Chart */}
        <div style={styles.chartCard}>
          <h2>📈 Activity Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="chores" stroke="#10b981" name="Chores" strokeWidth={2} />
              <Line type="monotone" dataKey="study" stroke="#3b82f6" name="Study" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown Pie Chart */}
        <div style={styles.chartCard}>
          <h2>📊 Task Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={breakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, value}) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {breakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div style={{...styles.chartCard, gridColumn: 'span 2'}}>
          <h2>📊 Completion Comparison</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: 'Chores', Completed: stats.completedChores, Pending: stats.pendingChores },
              { name: 'Study', Completed: stats.completedStudy, Pending: stats.totalStudy - stats.completedStudy }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Completed" fill="#10b981" />
              <Bar dataKey="Pending" fill="#6b7280" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Child Performance Table */}
      {selectedChild === 'all' && children.length > 0 && (
        <div style={styles.tableCard}>
          <h2>👥 Individual Child Performance</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Child Name</th>
                <th style={styles.th}>Total Tasks</th>
                <th style={styles.th}>Completed</th>
                <th style={styles.th}>Completion Rate</th>
                <th style={styles.th}>Points Earned</th>
              </tr>
            </thead>
            <tbody>
              {children.map(child => {
                const childChores = filterByTimeframe(chores).filter(c => 
                  c.assignedTo?._id === child._id || c.assignedTo === child._id
                );
                const childStudy = filterByTimeframe(studyActivities).filter(s => 
                  s.assignedTo?._id === child._id || s.assignedTo === child._id
                );
                const total = childChores.length + childStudy.length;
                const completed = childChores.filter(c => c.status === 'completed').length + 
                                childStudy.filter(s => s.status === 'completed').length;
                const rate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;
                const pts = childChores.filter(c => c.status === 'completed')
                  .reduce((sum, c) => sum + (c.points || 0), 0);

                return (
                  <tr key={child._id}>
                    <td style={styles.td}>{child.name}</td>
                    <td style={styles.td}>{total}</td>
                    <td style={styles.td}>{completed}</td>
                    <td style={styles.td}>{rate}%</td>
                    <td style={styles.td}>{pts}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '20px', maxWidth: '1400px', margin: '0 auto' },
  filters: { display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' },
  filterGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
  label: { fontWeight: 'bold', fontSize: '14px' },
  select: { padding: '8px 12px', borderRadius: '5px', border: '2px solid #ddd', fontSize: '14px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
  statCard: { color: 'white', padding: '30px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
  statValue: { fontSize: '48px', fontWeight: 'bold', margin: '10px 0' },
  chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '30px' },
  chartCard: { background: 'pink', padding: '20px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  tableCard: { background: 'yellow', padding: '20px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
  th: { background: '#f3f4f6', padding: '12px', textAlign: 'left', fontWeight: 'bold', borderBottom: '2px solid #ddd' },
  td: { padding: '12px', borderBottom: '1px solid #ddd' }
};

export default Analytics;