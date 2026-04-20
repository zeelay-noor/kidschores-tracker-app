import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { requestNotificationPermission, notifyStudyActivityCreated } from '../utils/notifications';

function StudyActivities() {
  const [activities, setActivities] = useState([]);
  const [children, setChildren] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: '',
    subject: '',
    description: '',
    assignedTo: '',
    duration: 30
  });
  const [user, setUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadingActivityId, setUploadingActivityId] = useState(null);
  const [viewProof, setViewProof] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchActivities();
      fetchChildren();
      requestNotificationPermission();
    }
  }, []);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/study', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchChildren = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/children', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setChildren(response.data);
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/study', newActivity, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      notifyStudyActivityCreated(newActivity.title);
      
      setNewActivity({ title: '', subject: '', description: '', assignedTo: '', duration: 30 });
      setShowForm(false);
      fetchActivities();
    } catch (error) {
      console.error('Error creating activity:', error);
    }
  };

  const handleImageSelect = (e, activityId) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        alert('Please upload an image or video file');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage({ activityId, data: reader.result, name: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProof = async (activityId) => {
    if (!selectedImage || selectedImage.activityId !== activityId) {
      alert('Please select an image first');
      return;
    }

    setUploadingActivityId(activityId);
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/study/${activityId}`, {
        status: 'pending_approval',
        proofImage: selectedImage.data,
        proofImageName: selectedImage.name
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSelectedImage(null);
      fetchActivities();
    } catch (error) {
      console.error('Error uploading proof:', error);
      alert('Failed to upload proof');
    }
    
    setUploadingActivityId(null);
  };

  const handleApprove = async (activityId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/study/${activityId}`, { 
        status: 'completed' 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Study activity approved! ✅');
      fetchActivities();
    } catch (error) {
      console.error('Error approving activity:', error);
    }
  };

  const handleReject = async (activityId) => {
    const reason = prompt('Reason for rejection (optional):');
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/study/${activityId}`, { 
        status: 'pending',
        proofImage: null,
        proofImageName: null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Activity rejected. Child can resubmit with new proof.');
      fetchActivities();
    } catch (error) {
      console.error('Error rejecting activity:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/study/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed':
        return { text: '✅ Completed', color: '#10b981' };
      case 'pending_approval':
        return { text: '⏳ Pending Approval', color: '#f59e0b' };
      default:
        return { text: '📋 Pending', color: '#6b7280' };
    }
  };

  const getActionButton = (activity) => {
    if (user?.role === 'child') {
      if (activity.status === 'pending') {
        return (
          <div>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => handleImageSelect(e, activity._id)}
              style={styles.fileInput}
              id={`file-${activity._id}`}
            />
            <label htmlFor={`file-${activity._id}`} style={styles.uploadLabel}>
              📸 Upload Homework/Notes
            </label>
            {selectedImage && selectedImage.activityId === activity._id && (
              <button 
                onClick={() => handleUploadProof(activity._id)} 
                style={styles.submitProofBtn}
                disabled={uploadingActivityId === activity._id}
              >
                {uploadingActivityId === activity._id ? '⏳ Uploading...' : '✅ Submit Proof'}
              </button>
            )}
          </div>
        );
      } else if (activity.status === 'pending_approval') {
        return (
          <div>
            <span style={{color: '#f59e0b', fontWeight: 'bold'}}>⏳ Waiting for parent review...</span>
            {activity.proofImage && (
              <button onClick={() => setViewProof(activity)} style={styles.viewProofBtn}>
                👁️ View Submitted Work
              </button>
            )}
          </div>
        );
      } else {
        return <span style={{color: '#10b981', fontWeight: 'bold'}}>✅ Completed & Approved!</span>;
      }
    } else if (user?.role === 'parent') {
      if (activity.status === 'pending_approval') {
        return (
          <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center'}}>
            {activity.proofImage && (
              <button onClick={() => setViewProof(activity)} style={styles.viewProofBtn}>
                👁️ View Work
              </button>
            )}
            <button onClick={() => handleApprove(activity._id)} style={styles.approveBtn}>
              ✅ Approve Work
            </button>
            <button onClick={() => handleReject(activity._id)} style={styles.rejectBtn}>
              ❌ Reject
            </button>
          </div>
        );
      } else if (activity.status === 'completed') {
        return (
          <div>
            <span style={{color: '#10b981', fontWeight: 'bold'}}>✅ Approved</span>
            {activity.proofImage && (
              <button onClick={() => setViewProof(activity)} style={styles.viewProofBtn}>
                👁️ View Work
              </button>
            )}
          </div>
        );
      } else {
        return <span style={{color: '#6b7280'}}>Waiting for child to complete...</span>;
      }
    }
  };

  return (
    <div style={styles.container}>
      <h1>📚 Study Activities</h1>

      {user?.role === 'parent' && (
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
          {showForm ? 'Cancel' : 'Add Study Activity'}
        </button>
      )}

      {showForm && (
        <form onSubmit={handleCreateActivity} style={styles.form}>
          <input
            type="text"
            placeholder="Activity Title (e.g., Math Homework Chapter 5)"
            value={newActivity.title}
            onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
            style={styles.input}
            required
          />
          <input
            type="text"
            placeholder="Subject (Math, Science, English...)"
            value={newActivity.subject}
            onChange={(e) => setNewActivity({ ...newActivity, subject: e.target.value })}
            style={styles.input}
            required
          />
          <textarea
            placeholder="Description (what needs to be done)"
            value={newActivity.description}
            onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
            style={styles.textarea}
          />
          
          <select
            value={newActivity.assignedTo}
            onChange={(e) => setNewActivity({ ...newActivity, assignedTo: e.target.value })}
            style={styles.input}
            required
          >
            <option value="">Select Child</option>
            {children.map((child) => (
              <option key={child._id} value={child._id}>
                {child.name} ({child.email})
              </option>
            ))}
          </select>
          
          <input
            type="number"
            placeholder="Duration (minutes)"
            value={newActivity.duration}
            onChange={(e) => setNewActivity({ ...newActivity, duration: e.target.value })}
            style={styles.input}
          />
          <button type="submit" style={styles.submitBtn}>Create Activity</button>
        </form>
      )}

      <div style={styles.activitiesContainer}>
        <h2>Activities List</h2>
        {activities.length === 0 ? (
          <p>No study activities found. Create your first activity!</p>
        ) : (
          activities.map((activity) => {
            const statusBadge = getStatusBadge(activity.status);
            return (
              <div key={activity._id} style={styles.activityCard}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px'}}>
                  <div>
                    <div style={styles.subjectBadge}>{activity.subject}</div>
                    <h3 style={{marginTop: '10px'}}>{activity.title}</h3>
                  </div>
                  <span style={{...styles.badge, background: statusBadge.color}}>
                    {statusBadge.text}
                  </span>
                </div>
                <p>{activity.description}</p>
                <p><strong>Duration:</strong> {activity.duration} minutes</p>
                <p><strong>Assigned to:</strong> {activity.assignedTo?.name || 'N/A'}</p>
                <div style={styles.actions}>
                  {getActionButton(activity)}
                  {user?.role === 'parent' && (
                    <button onClick={() => handleDelete(activity._id)} style={styles.deleteBtn}>Delete</button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Proof Viewer Modal */}
      {viewProof && (
        <div style={styles.modal} onClick={() => setViewProof(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>📚 Study Work: {viewProof.title}</h2>
            <p><strong>Subject:</strong> {viewProof.subject}</p>
            <p><strong>Submitted by:</strong> {viewProof.assignedTo?.name}</p>
            {viewProof.proofImage && (
              viewProof.proofImage.startsWith('data:image') ? (
                <img src={viewProof.proofImage} alt="Study Work" style={styles.proofImage} />
              ) : (
                <video src={viewProof.proofImage} controls style={styles.proofImage} />
              )
            )}
            <button onClick={() => setViewProof(null)} style={styles.closeBtn}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '20px', maxWidth: '1200px', margin: '0 auto' },
  addBtn: { padding: '12px 24px', background: 'linear-gradient(135deg, #9C27B0, #E91E63)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px' },
  form: { background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  input: { width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '5px' },
  textarea: { width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '5px', minHeight: '80px' },
  submitBtn: { padding: '10px 20px', background: 'linear-gradient(135deg, #3b82f6, #10b981)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  activitiesContainer: { marginTop: '30px' },
  activityCard: { background: 'pink', padding: '20px', borderRadius: '10px', marginBottom: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', position: 'relative' },
  subjectBadge: { display: 'inline-block', background: '#9C27B0', color: 'white', padding: '5px 12px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' },
  badge: { color: 'white', padding: '5px 12px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' },
  actions: { marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' },
  fileInput: { display: 'none' },
  uploadLabel: { padding: '8px 16px', background: '#8b5cf6', color: 'white', borderRadius: '5px', cursor: 'pointer', display: 'inline-block', fontWeight: 'bold' },
  submitProofBtn: { padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginLeft: '10px', fontWeight: 'bold' },
  viewProofBtn: { padding: '8px 16px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' },
  approveBtn: { padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  rejectBtn: { padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  deleteBtn: { padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { background: 'white', padding: '30px', borderRadius: '15px', maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' },
  proofImage: { maxWidth: '100%', maxHeight: '500px', borderRadius: '10px', marginTop: '20px' },
  closeBtn: { marginTop: '20px', padding: '10px 20px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

export default StudyActivities;