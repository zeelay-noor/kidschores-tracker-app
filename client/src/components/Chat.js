import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function Chat() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [children, setChildren] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [selectedChild, setSelectedChild] = useState('');
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchChats();
      fetchUnreadCount();
      
      if (JSON.parse(userData).role === 'parent') {
        fetchChildren();
      }

      // Poll for new messages every 5 seconds
      const interval = setInterval(() => {
        fetchChats();
        fetchUnreadCount();
        if (selectedChat) {
          fetchChatMessages(selectedChat._id);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/chat', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

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

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/chat/unread/count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchChatMessages = async (chatId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedChat(response.data);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  const handleCreateChat = async () => {
    if (!selectedChild) {
      alert('Please select a child');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/chat/create',
        { childId: selectedChild },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSelectedChat(response.data);
      setShowNewChat(false);
      setSelectedChild('');
      fetchChats();
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/chat/${selectedChat._id}/message`,
        { message },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedChat(response.data);
      setMessage('');
      fetchChats();
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getChatName = (chat) => {
    if (user?.role === 'parent') {
      return chat.childId?.name || 'Unknown';
    } else {
      return chat.parentId?.name || 'Unknown';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div style={styles.container}>
      <div style={styles.chatContainer}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h2>💬 Messages</h2>
            {unreadCount > 0 && (
              <span style={styles.unreadBadge}>{unreadCount}</span>
            )}
          </div>

          {user?.role === 'parent' && (
            <button onClick={() => setShowNewChat(!showNewChat)} style={styles.newChatBtn}>
              ➕ New Chat
            </button>
          )}

          {showNewChat && (
            <div style={styles.newChatForm}>
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                style={styles.select}
              >
                <option value="">Select Child</option>
                {children.map(child => (
                  <option key={child._id} value={child._id}>{child.name}</option>
                ))}
              </select>
              <button onClick={handleCreateChat} style={styles.createBtn}>Create</button>
            </div>
          )}

          <div style={styles.chatsList}>
            {chats.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No chats yet</p>
                {user?.role === 'parent' && <p>Start a new conversation!</p>}
              </div>
            ) : (
              chats.map(chat => {
                const hasUnread = chat.messages.some(
                  msg => msg.senderId !== user?._id && !msg.read
                );

                return (
                  <div
                    key={chat._id}
                    onClick={() => {
                      setSelectedChat(chat);
                      fetchChatMessages(chat._id);
                    }}
                    style={{
                      ...styles.chatItem,
                      ...(selectedChat?._id === chat._id ? styles.activeChatItem : {}),
                      ...(hasUnread ? styles.unreadChatItem : {})
                    }}
                  >
                    <div style={styles.chatItemHeader}>
                      <span style={styles.chatName}>{getChatName(chat)}</span>
                      <span style={styles.chatTime}>{formatTime(chat.lastMessageTime)}</span>
                    </div>
                    {chat.choreId && (
                      <div style={styles.choreTag}>📋 {chat.choreId.title}</div>
                    )}
                    <div style={styles.lastMessage}>
                      {chat.lastMessage || 'No messages yet'}
                    </div>
                    {hasUnread && <div style={styles.unreadDot}></div>}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div style={styles.chatArea}>
          {selectedChat ? (
            <>
              <div style={styles.chatHeader}>
                <div>
                  <h3>{getChatName(selectedChat)}</h3>
                  {selectedChat.choreId && (
                    <span style={styles.choreLabel}>📋 About: {selectedChat.choreId.title}</span>
                  )}
                </div>
              </div>

              <div style={styles.messagesArea}>
                {selectedChat.messages.length === 0 ? (
                  <div style={styles.emptyMessages}>
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  selectedChat.messages.map((msg, index) => {
                    const isOwn = msg.senderId === user?._id;
                    return (
                      <div
                        key={index}
                        style={{
                          ...styles.messageContainer,
                          justifyContent: isOwn ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div
                          style={{
                            ...styles.message,
                            ...(isOwn ? styles.ownMessage : styles.otherMessage)
                          }}
                        >
                          <div style={styles.messageSender}>
                            {msg.senderName} ({msg.senderRole})
                          </div>
                          <div style={styles.messageText}>{msg.message}</div>
                          <div style={styles.messageTime}>{formatTime(msg.timestamp)}</div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} style={styles.inputArea}>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  style={styles.input}
                />
                <button type="submit" style={styles.sendBtn}>
                  📤 Send
                </button>
              </form>
            </>
          ) : (
            <div style={styles.noChatSelected}>
              <div style={styles.noChatIcon}>💬</div>
              <h3>Select a chat to start messaging</h3>
              <p>Choose a conversation from the left sidebar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {padding: '20px', maxWidth: '1400px', margin: '0 auto' },
  chatContainer: { display: 'flex', height: '80vh', background: 'rgb(239, 208, 116)', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', overflow: 'hidden' },
  sidebar: {width: '350px', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' },
  sidebarHeader: { padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  unreadBadge: { background: '#f01818', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  newChatBtn: { margin: '10px 20px', padding: '12px', background: 'linear-gradient(135deg, #3b82f6, #10b981)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
  newChatForm: { background:'yellow',padding: '10px 20px', display: 'flex', gap: '10px' },
  select: { flex: 1, padding: '8px', borderRadius: '5px', border: '1px solid #ddd' },
  createBtn: { padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  chatsList: { flex: 1, overflowY: 'auto' },
  emptyState: { padding: '40px 20px', textAlign: 'center', color: '#6b7280' },
  chatItem: { padding: '15px 20px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background 0.2s', position: 'relative' },
  activeChatItem: { background: '#7e8c96', borderLeft: '4px solid #3b82f6' },
  unreadChatItem: { background: '#8050796e' },
  chatItemHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' },
  chatName: { fontWeight: 'bold', fontSize: '15px' },
  chatTime: { fontSize: '12px', color: '#6b7280' },
  choreTag: { fontSize: '11px', color: '#6366f1', background: '#e0e7ff', padding: '2px 8px', borderRadius: '10px', display: 'inline-block', marginBottom: '5px' },
  lastMessage: { fontSize: '13px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  unreadDot: { position: 'absolute', right: '20px', top: '50%', width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%' },
  chatArea: {flex: 1, display: 'flex', flexDirection: 'column' },
  chatHeader: { padding: '20px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' },
  choreLabel: { fontSize: '13px', color: '#6366f1' },
  messagesArea: { background:'yellow',flex: 1, overflowY: 'auto', padding: '20px', background: '#fafafa' },
  emptyMessages: { textAlign: 'center', padding: '60px 20px', color: '#6b7280' },
  messageContainer: { display: 'flex', marginBottom: '15px' },
  message: { maxWidth: '70%', padding: '12px 16px', borderRadius: '15px', wordWrap: 'break-word' },
  ownMessage: { background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white' },
  otherMessage: { background: 'white', color: '#333', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  messageSender: { fontSize: '11px', fontWeight: 'bold', marginBottom: '4px', opacity: 0.8 },
  messageText: { fontSize: '14px', lineHeight: '1.5' },
  messageTime: { fontSize: '10px', marginTop: '4px', opacity: 0.7 },
  inputArea: { padding: '20px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '10px', background: 'white' },
  input: { flex: 1, padding: '12px 16px', borderRadius: '25px', border: '1px solid #e5e7eb', fontSize: '14px' },
  sendBtn: { padding: '12px 24px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' },
  noChatSelected: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#6b7280' },
  noChatIcon: { fontSize: '80px', marginBottom: '20px' }
};

export default Chat;