import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Marketplace() {
  const [items, setItems] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [activeTab, setActiveTab] = useState('shop');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [itemsRes, purchasesRes, rewardsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/marketplace/items', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/marketplace/purchases', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/rewards', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setItems(itemsRes.data);
      setPurchases(purchasesRes.data);
      setUserPoints(rewardsRes.data.totalPoints);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handlePurchase = async (itemId) => {
    const item = items.find(i => i._id === itemId);
    
    if (userPoints < item.cost) {
      alert(`Not enough points! You need ${item.cost} points but have ${userPoints}.`);
      return;
    }

    if (!window.confirm(`Purchase "${item.title}" for ${item.cost} points?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/marketplace/purchase',
        { itemId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`✅ ${response.data.message}`);
      setUserPoints(response.data.remainingPoints);
      fetchData();
    } catch (error) {
      console.error('Error purchasing:', error);
      alert(error.response?.data?.message || 'Purchase failed');
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      fun: '🎮',
      food: '🍕',
      privilege: '⭐',
      toy: '🧸',
      outing: '🎡',
      other: '🎁'
    };
    return icons[category] || '🎁';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#fbbf24',
      approved: '#10b981',
      rejected: '#ef4444',
      fulfilled: '#8b5cf6'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return <div style={styles.loading}>Loading marketplace...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>🛒 Reward Marketplace</h1>
        <div style={styles.pointsCard}>
          <span style={styles.pointsLabel}>Your Points:</span>
          <span style={styles.pointsValue}>⭐ {userPoints}</span>
        </div>
      </div>

      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('shop')}
          style={{
            ...styles.tab,
            ...(activeTab === 'shop' ? styles.activeTab : {})
          }}
        >
          🛍️ Shop
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            ...styles.tab,
            ...(activeTab === 'orders' ? styles.activeTab : {})
          }}
        >
          📦 My Orders ({purchases.length})
        </button>
      </div>

      {activeTab === 'shop' ? (
        <div style={styles.shopGrid}>
          {items.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🛒</div>
              <h3>No rewards available yet</h3>
              <p>Ask your parent to add some rewards!</p>
            </div>
          ) : (
            items.map(item => {
              const canAfford = userPoints >= item.cost;
              const outOfStock = item.stock === 0;

              return (
                <div key={item._id} style={styles.itemCard}>
                  <div style={styles.itemIcon}>{item.icon}</div>
                  <div style={styles.categoryBadge}>
                    {getCategoryIcon(item.category)} {item.category}
                  </div>
                  <h3 style={styles.itemTitle}>{item.title}</h3>
                  <p style={styles.itemDescription}>{item.description}</p>
                  
                  {item.stock !== -1 && (
                    <div style={styles.stockInfo}>
                      Stock: {item.stock} left
                    </div>
                  )}

                  <div style={styles.itemFooter}>
                    <div style={styles.cost}>
                      <span style={styles.costLabel}>Cost:</span>
                      <span style={styles.costValue}>⭐ {item.cost}</span>
                    </div>
                    <button
                      onClick={() => handlePurchase(item._id)}
                      disabled={!canAfford || outOfStock}
                      style={{
                        ...styles.buyButton,
                        ...(!canAfford || outOfStock ? styles.buyButtonDisabled : {})
                      }}
                    >
                      {outOfStock ? '❌ Out of Stock' : !canAfford ? '🔒 Not Enough Points' : '🛒 Buy Now'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div style={styles.ordersList}>
          {purchases.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📦</div>
              <h3>No orders yet</h3>
              <p>Start shopping to see your orders here!</p>
            </div>
          ) : (
            purchases.map(purchase => (
              <div key={purchase._id} style={styles.orderCard}>
                <div style={styles.orderHeader}>
                  <div>
                    <h3>{purchase.rewardItemId?.title}</h3>
                    <p style={styles.orderDate}>
                      {new Date(purchase.purchasedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div
                    style={{
                      ...styles.statusBadge,
                      background: getStatusColor(purchase.status)
                    }}
                  >
                    {purchase.status.toUpperCase()}
                  </div>
                </div>
                <p style={styles.orderDesc}>{purchase.rewardItemId?.description}</p>
                <div style={styles.orderFooter}>
                  <span style={styles.orderCost}>Cost: ⭐ {purchase.cost}</span>
                  {purchase.notes && (
                    <p style={styles.orderNotes}>📝 {purchase.notes}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '20px', maxWidth: '1400px', margin: '0 auto' },
  loading: { textAlign: 'center', padding: '60px', fontSize: '1.2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' },
  pointsCard: { background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', padding: '15px 30px', borderRadius: '15px', color: 'white', fontWeight: 'bold', boxShadow: '0 5px 15px rgba(251, 191, 36, 0.3)' },
  pointsLabel: { fontSize: '14px', marginRight: '10px' },
  pointsValue: { fontSize: '24px' },
  tabs: { display: 'flex', gap: '10px', marginBottom: '30px' },
  tab: { flex: 1, padding: '15px', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', transition: 'all 0.3s' },
  activeTab: { background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', transform: 'translateY(-2px)', boxShadow: '0 5px 15px rgba(59, 130, 246, 0.3)' },
  shopGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  emptyState: { gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#6b7280' },
  emptyIcon: { fontSize: '80px', marginBottom: '20px' },
  itemCard: { background: 'white', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition: 'transform 0.2s', cursor: 'pointer' },
  itemIcon: { fontSize: '60px', textAlign: 'center', marginBottom: '10px' },
  categoryBadge: { display: 'inline-block', background: '#e0e7ff', color: '#4f46e5', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', marginBottom: '10px' },
  itemTitle: { fontSize: '1.3rem', marginBottom: '10px', color: '#333' },
  itemDescription: { color: '#6b7280', fontSize: '14px', marginBottom: '15px', lineHeight: '1.5' },
  stockInfo: { background: '#fef3c7', color: '#92400e', padding: '5px 10px', borderRadius: '5px', fontSize: '12px', marginBottom: '10px', textAlign: 'center', fontWeight: '600' },
  itemFooter: { borderTop: '1px solid #e5e7eb', paddingTop: '15px' },
  cost: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  costLabel: { fontSize: '14px', color: '#6b7280' },
  costValue: { fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' },
  buyButton: { width: '100%', padding: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: 'all 0.3s' },
  buyButtonDisabled: { background: '#d1d5db', cursor: 'not-allowed', opacity: 0.6 },
  ordersList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  orderCard: { background: 'white', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' },
  orderDate: { fontSize: '12px', color: '#6b7280', marginTop: '5px' },
  statusBadge: { padding: '6px 16px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: 'bold' },
  orderDesc: { color: '#6b7280', fontSize: '14px', marginBottom: '15px' },
  orderFooter: { borderTop: '1px solid #e5e7eb', paddingTop: '10px' },
  orderCost: { fontSize: '16px', fontWeight: 'bold', color: '#f59e0b' },
  orderNotes: { marginTop: '10px', fontSize: '13px', color: '#4b5563', fontStyle: 'italic' }
};

export default Marketplace;