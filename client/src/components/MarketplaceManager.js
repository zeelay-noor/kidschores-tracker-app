import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MarketplaceManager() {
  const [items, setItems] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [activeTab, setActiveTab] = useState('items');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cost: '',
    icon: '🎁',
    category: 'other',
    stock: -1
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [itemsRes, purchasesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/marketplace/parent/items', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/marketplace/parent/purchases', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setItems(itemsRes.data);
      setPurchases(purchasesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/marketplace/parent/items/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('✅ Reward updated!');
      } else {
        await axios.post(
          'http://localhost:5000/api/marketplace/parent/items',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('✅ Reward created!');
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        cost: '',
        icon: '🎁',
        category: 'other',
        stock: -1
      });
      fetchData();
    } catch (error) {
      console.error('Error saving item:', error);
      alert('❌ Error saving reward');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      description: item.description,
      cost: item.cost,
      icon: item.icon,
      category: item.category,
      stock: item.stock
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Delete this reward?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/marketplace/parent/items/${itemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Reward deleted!');
      fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('❌ Error deleting reward');
    }
  };

  const handlePurchaseAction = async (purchaseId, status, notes = '') => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/marketplace/parent/purchases/${purchaseId}`,
        { status, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`✅ Purchase ${status}!`);
      fetchData();
    } catch (error) {
      console.error('Error updating purchase:', error);
      alert('❌ Error updating purchase');
    }
  };

  const iconOptions = ['🎁', '🎮', '🍕', '🍦', '🎬', '📱', '🎵', '⚽', '🎨', '📚', '🚴', '🏖️'];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>🛒 Marketplace Manager</h1>
        <button onClick={() => setShowForm(!showForm)} style={styles.addButton}>
          ➕ {showForm ? 'Cancel' : 'Add Reward'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3>{editingId ? 'Edit Reward' : 'Create New Reward'}</h3>
          
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label>Icon:</label>
              <div style={styles.iconGrid}>
                {iconOptions.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({...formData, icon})}
                    style={{
                      ...styles.iconButton,
                      ...(formData.icon === icon ? styles.iconButtonActive : {})
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                style={styles.input}
                placeholder="e.g., 30 mins gaming"
              />
            </div>

            <div style={styles.formGroup}>
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                style={styles.input}
              >
                <option value="fun">🎮 Fun</option>
                <option value="food">🍕 Food</option>
                <option value="privilege">⭐ Privilege</option>
                <option value="toy">🧸 Toy</option>
                <option value="outing">🎡 Outing</option>
                <option value="other">🎁 Other</option>
              </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
              style={{...styles.input, minHeight: '80px'}}
              placeholder="Describe the reward..."
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label>Cost (Points) *</label>
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({...formData, cost: e.target.value})}
                required
                min="1"
                style={styles.input}
                placeholder="e.g., 50"
              />
            </div>

            <div style={styles.formGroup}>
              <label>Stock (-1 = Unlimited)</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                style={styles.input}
                placeholder="-1"
              />
            </div>
          </div>

          <button type="submit" style={styles.submitButton}>
            {editingId ? '💾 Update Reward' : '✨ Create Reward'}
          </button>
        </form>
      )}

      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('items')}
          style={{...styles.tab, ...(activeTab === 'items' ? styles.activeTab : {})}}
        >
          🎁 My Rewards ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('purchases')}
          style={{...styles.tab, ...(activeTab === 'purchases' ? styles.activeTab : {})}}
        >
          📦 Purchase Requests ({purchases.filter(p => p.status === 'pending').length})
        </button>
      </div>

      {activeTab === 'items' ? (
        <div style={styles.itemsGrid}>
          {items.length === 0 ? (
            <div style={styles.emptyState}>
              <h3>No rewards yet</h3>
              <p>Create rewards for your children to redeem!</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item._id} style={styles.itemCard}>
                <div style={styles.itemHeader}>
                  <span style={styles.itemIcon}>{item.icon}</span>
                  <div style={{...styles.statusBadge, background: item.isActive ? '#10b981' : '#6b7280'}}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <h3>{item.title}</h3>
                <p style={styles.itemDesc}>{item.description}</p>
                <div style={styles.itemMeta}>
                  <span>💰 {item.cost} points</span>
                  <span>📦 Stock: {item.stock === -1 ? '∞' : item.stock}</span>
                </div>
                <div style={styles.itemActions}>
                  <button onClick={() => handleEdit(item)} style={styles.editButton}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(item._id)} style={styles.deleteButton}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div style={styles.purchasesList}>
          {purchases.length === 0 ? (
            <div style={styles.emptyState}>
              <h3>No purchase requests</h3>
              <p>Children's purchases will appear here</p>
            </div>
          ) : (
            purchases.map(purchase => (
              <div key={purchase._id} style={styles.purchaseCard}>
                <div style={styles.purchaseHeader}>
                  <div>
                    <h3>{purchase.childId?.name}</h3>
                    <p style={styles.purchaseItem}>{purchase.rewardItemId?.title}</p>
                    <p style={styles.purchaseDate}>
                      {new Date(purchase.purchasedAt).toLocaleString()}
                    </p>
                  </div>
                  <div style={styles.purchaseStatus}>
                    <span style={styles.purchaseCost}>⭐ {purchase.cost}</span>
                    <span style={{...styles.statusBadge, background: 
                      purchase.status === 'pending' ? '#fbbf24' :
                      purchase.status === 'approved' ? '#10b981' :
                      purchase.status === 'fulfilled' ? '#8b5cf6' : '#ef4444'
                    }}>
                      {purchase.status}
                    </span>
                  </div>
                </div>

                {purchase.status === 'pending' && (
                  <div style={styles.purchaseActions}>
                    <button
                      onClick={() => handlePurchaseAction(purchase._id, 'approved')}
                      style={styles.approveButton}
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handlePurchaseAction(purchase._id, 'rejected', 'Not approved')}
                      style={styles.rejectButton}
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}

                {purchase.status === 'approved' && (
                  <button
                    onClick={() => handlePurchaseAction(purchase._id, 'fulfilled')}
                    style={styles.fulfilButton}
                  >
                    ✔️ Mark as Fulfilled
                  </button>
                )}

                {purchase.notes && (
                  <p style={styles.purchaseNotes}>📝 {purchase.notes}</p>
                )}
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' },
  addButton: { padding: '12px 24px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
  form: { background: 'gray', padding: '30px', borderRadius: '15px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
  formRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  input: { padding: '12px', borderRadius: '8px', border: '2px solid #e5e7eb', fontSize: '14px' },
  iconGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' },
  iconButton: { padding: '12px', fontSize: '24px', background: '#f3f4f6', border: '2px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' },
  iconButtonActive: { background: '#dbeafe', border: '2px solid #3b82f6' },
  submitButton: { width: '100%', padding: '15px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' },
  tabs: { display: 'flex', gap: '10px', marginBottom: '30px' },
  tab: { flex: 1, padding: '15px', background: '#f3f4f6', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: '600' },
  activeTab: { background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white' },
  itemsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  emptyState: { gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#6b7280' },
  itemCard: { background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
  itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  itemIcon: { fontSize: '40px' },
  statusBadge: { padding: '6px 12px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: 'bold' },
  itemDesc: { color: '#6b7280', fontSize: '14px', marginBottom: '15px' },
  itemMeta: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600', marginBottom: '15px' },
  itemActions: { display: 'flex', gap: '10px' },
  editButton: { flex: 1, padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  deleteButton: { flex: 1, padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  purchasesList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  purchaseCard: { background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
  purchaseHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px' },
  purchaseItem: { color: '#6b7280', fontSize: '14px', marginTop: '5px' },
  purchaseDate: { fontSize: '12px', color: '#9ca3af', marginTop: '5px' },
  purchaseStatus: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' },
  purchaseCost: { fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' },
  purchaseActions: { display: 'flex', gap: '10px', marginTop: '15px' },
  approveButton: { flex: 1, padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  rejectButton: { flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  fulfilButton: { width: '100%', padding: '12px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '15px' },
  purchaseNotes: { marginTop: '15px', padding: '10px', background: '#fef3c7', borderRadius: '8px', fontSize: '13px', fontStyle: 'italic' }
};

export default MarketplaceManager;