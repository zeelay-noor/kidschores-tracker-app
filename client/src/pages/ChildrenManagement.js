import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ChildrenManagement() {
  const [children, setChildren] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newChild, setNewChild] = useState({ name: '', email: '', password: '' });

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
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/users/children', newChild, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewChild({ name: '', email: '', password: '' });
      setShowForm(false);
      fetchChildren();
    } catch (error) {
      console.error('Error adding child:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/users/children/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchChildren();
    } catch (error) {
      console.error('Error deleting child:', error);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Children Management</h2>
      <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
        {showForm ? 'Cancel' : 'Add Child'}
      </button>

      {showForm && (
        <form onSubmit={handleAddChild} style={styles.form}>
          <input
            type="text"
            placeholder="Child Name"
            value={newChild.name}
            onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
            style={styles.input}
            required
          />
          <input
            type="email"
            placeholder="Child Email"
            value={newChild.email}
            onChange={(e) => setNewChild({ ...newChild, email: e.target.value })}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={newChild.password}
            onChange={(e) => setNewChild({ ...newChild, password: e.target.value })}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.submitBtn}>Add Child</button>
        </form>
      )}

      <div style={styles.childrenList}>
        {children.length === 0 ? (
          <p>No children added yet.</p>
        ) : (
          children.map((child) => (
            <div key={child._id} style={styles.childCard}>
              <h3>{child.name}</h3>
              <p>Email: {child.email}</p>
              <button onClick={() => handleDelete(child._id)} style={styles.deleteBtn}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { background:'orange',padding: '20px' },
  addBtn: { padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px' },
  form: {padding: '20px', borderRadius: '10px', marginBottom: '20px' },
  input: { width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '5px' },
  submitBtn: { padding: '10px 20px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  childrenList: { marginTop: '20px' },
  childCard: { background: 'pink', padding: '15px', borderRadius: '10px', marginBottom: '10px' },
  deleteBtn: { padding: '8px 16px', background: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

export default ChildrenManagement;