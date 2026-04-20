import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Leaderboard() {
  const [activeTab, setActiveTab] = useState('allTime');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    fetchUserStats();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let endpoint = 'http://localhost:5000/api/leaderboard';
      
      if (activeTab === 'weekly') {
        endpoint += '/weekly';
      } else if (activeTab === 'monthly') {
        endpoint += '/monthly';
      }

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLeaderboardData(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
    setLoading(false);
  };

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      //const response = await axios.get('http://localhost:5000/api/leaderboard/stats', {
        //headers: { Authorization: `Bearer ${token}` }
      //});
      //setUserStats(response.data);
      try {
  const response = await axios.get('http://localhost:5000/api/leaderboard/stats', {
    headers: { Authorization: `Bearer ${token}` }
  });
  setUserStats(response.data);
} catch (error) {
  console.error('Error fetching user stats:', error);
  // Set default stats if error
  setUserStats({
    totalPoints: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    weeklyPoints: 0,
    monthlyPoints: 0,
    badges: [],
    championTitles: []
  });
}
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const getRankEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getStreakColor = (streak) => {
    if (streak >= 30) return '#f59e0b';
    if (streak >= 15) return '#ef4444';
    if (streak >= 7) return '#8b5cf6';
    if (streak >= 3) return '#3b82f6';
    return '#6b7280';
  };

  return (
    <div style={styles.container}>
      {/* User Stats Card */}
      {userStats && (
        <div style={styles.statsCard}>
          <h2 style={styles.statsTitle}>🏆 Your Performance</h2>
          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <div style={styles.statIcon}>⭐</div>
              <div style={styles.statValue}>{userStats.totalPoints}</div>
              <div style={styles.statLabel}>Total Points</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statIcon}>📊</div>
              <div style={styles.statValue}>Level {userStats.level}</div>
              <div style={styles.statLabel}>Current Level</div>
            </div>
            <div style={styles.statBox}>
              <div style={{...styles.statIcon, color: getStreakColor(userStats.currentStreak)}}>🔥</div>
              <div style={styles.statValue}>{userStats.currentStreak}</div>
              <div style={styles.statLabel}>Day Streak</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statIcon}>🏅</div>
              <div style={styles.statValue}>{userStats.badges?.length || 0}</div>
              <div style={styles.statLabel}>Badges Earned</div>
            </div>
          </div>

          {/* Badges Display */}
          {userStats.badges && userStats.badges.length > 0 && (
            <div style={styles.badgesSection}>
              <h3 style={styles.badgesTitle}>🎖️ Your Badges</h3>
              <div style={styles.badgesGrid}>
                {userStats.badges.slice(0, 6).map((badge, index) => (
                  <div key={index} style={styles.badge} title={badge.description}>
                    <span style={styles.badgeIcon}>{badge.icon || '🏅'}</span>
                    <span style={styles.badgeName}>{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Champion Titles */}
          {userStats.championTitles && userStats.championTitles.length > 0 && (
            <div style={styles.championsSection}>
              <h3 style={styles.championsTitle}>👑 Champion Titles</h3>
              <div style={styles.championsList}>
                {userStats.championTitles.slice(0, 3).map((title, index) => (
                  <div key={index} style={styles.championTitle}>
                    <span>{title.title}</span>
                    <span style={styles.championPoints}>{title.points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Tabs */}
      <div style={styles.leaderboardCard}>
        <h2 style={styles.leaderboardTitle}>🏆 Leaderboard</h2>
        
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('allTime')}
            style={{
              ...styles.tab,
              ...(activeTab === 'allTime' ? styles.activeTab : {})
            }}
          >
            🌟 All Time
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            style={{
              ...styles.tab,
              ...(activeTab === 'weekly' ? styles.activeTab : {})
            }}
          >
            📅 Weekly
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            style={{
              ...styles.tab,
              ...(activeTab === 'monthly' ? styles.activeTab : {})
            }}
          >
            📆 Monthly
          </button>
        </div>

        {loading ? (
          <div style={styles.loading}>Loading leaderboard...</div>
        ) : (
          <div style={styles.leaderboardList}>
            {leaderboardData.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🏆</div>
                <p>No data yet. Complete tasks to appear on the leaderboard!</p>
              </div>
            ) : (
              leaderboardData.map((entry, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.leaderboardEntry,
                    ...(entry.rank <= 3 ? styles.topThree : {})
                  }}
                >
                  <div style={styles.rankSection}>
                    <span style={styles.rank}>{getRankEmoji(entry.rank)}</span>
                  </div>
                  
                  <div style={styles.nameSection}>
                    <div style={styles.playerName}>{entry.name}</div>
                    {entry.rank === 1 && <span style={styles.crownIcon}>👑</span>}
                  </div>

                  <div style={styles.statsSection}>
                    {activeTab === 'allTime' && (
                      <>
                        <div style={styles.stat}>
                          <span style={styles.statIconSmall}>⭐</span>
                          <span>{entry.totalPoints}</span>
                        </div>
                        <div style={styles.stat}>
                          <span style={styles.statIconSmall}>🔥</span>
                          <span>{entry.currentStreak}</span>
                        </div>
                        <div style={styles.stat}>
                          <span style={styles.statIconSmall}>🏅</span>
                          <span>{entry.badges}</span>
                        </div>
                      </>
                    )}
                    {activeTab === 'weekly' && (
                      <>
                        <div style={styles.stat}>
                          <span style={styles.statIconSmall}>⭐</span>
                          <span>{entry.weeklyPoints}</span>
                        </div>
                        <div style={styles.stat}>
                          <span style={styles.statIconSmall}>✅</span>
                          <span>{entry.weeklyTasksCompleted}</span>
                        </div>
                      </>
                    )}
                    {activeTab === 'monthly' && (
                      <>
                        <div style={styles.stat}>
                          <span style={styles.statIconSmall}>⭐</span>
                          <span>{entry.monthlyPoints}</span>
                        </div>
                        <div style={styles.stat}>
                          <span style={styles.statIconSmall}>✅</span>
                          <span>{entry.monthlyTasksCompleted}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1500px',
    margin: '0 auto'
  },
  statsCard: {
    background: '#b1213c',
    borderRadius: '20px',
    padding: '30px',
    marginBottom: '30px',
    color: 'white',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
  },
  statsTitle: {
    fontSize: '2rem',
    marginBottom: '25px',
    textAlign: 'center'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statBox: {
    background: 'rgba(12, 113, 213, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '15px',
    padding: '20px',
    textAlign: 'center'
  },
  statIcon: {
    fontSize: '2.5rem',
    marginBottom: '10px'
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '5px'
  },
  statLabel: {
    fontSize: '0.9rem',
    opacity: 0.9
  },
  badgesSection: {
    marginTop: '20px'
  },
  badgesTitle: {
    fontSize: '1.3rem',
    marginBottom: '15px'
  },
  badgesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '10px'
  },
  badge: {
    background: 'rgba(229, 12, 12, 0.89)',
    borderRadius: '10px',
    padding: '10px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  badgeIcon: {
    fontSize: '1.5rem',
    display: 'block',
    marginBottom: '5px'
  },
  badgeName: {
    fontSize: '0.75rem',
    display: 'block'
  },
  championsSection: {
    marginTop: '20px'
  },
  championsTitle: {
    fontSize: '1.3rem',
    marginBottom: '15px'
  },
  championsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  championTitle: {
    background: 'rgba(167, 133, 133, 0.92)',
    borderRadius: '10px',
    padding: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  championPoints: {
    fontWeight: 'bold',
    fontSize: '0.9rem'
  },
  leaderboardCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
  },
  leaderboardTitle: {
    fontSize: '2rem',
    marginBottom: '25px',
    textAlign: 'center',
    color: '#333'
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '25px',
    borderBottom: '2px solid #f0f0f0',
    paddingBottom: '10px'
  },
  tab: {
    flex: 1,
    padding: '12px 20px',
    background: '#f3f4f6',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.3s',
    color: '#6b7280'
  },
  activeTab: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    transform: 'translateY(-2px)',
    boxShadow: '0 5px 15px rgba(102, 126, 234, 0.3)'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#6b7280',
    fontSize: '1.1rem'
  },
  leaderboardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  leaderboardEntry: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    background: '#e63499',
    borderRadius: '15px',
    transition: 'all 0.3s',
    cursor: 'pointer'
  },
  topThree: {
    background: 'linear-gradient(135deg, #f5c70d, #f5c70d)',
    boxShadow: '0 5px 15px rgba(251, 191, 36, 0.2)'
  },
  rankSection: {
    minWidth: '60px',
    textAlign: 'center'
  },
  rank: {
    fontSize: '1.8rem',
    fontWeight: 'bold'
  },
  nameSection: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  playerName: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#333'
  },
  crownIcon: {
    fontSize: '1.5rem'
  },
  statsSection: {
    display: 'flex',
    gap: '20px'
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#6b7280'
  },
  statIconSmall: {
    fontSize: '1.2rem'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6b7280'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '20px'
  }
};

export default Leaderboard;