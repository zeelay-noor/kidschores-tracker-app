import React, { useState } from 'react';
import '../styles/FloatingMascot.css';

const FloatingMascot = () => {
  const [isOpen, setIsOpen] = useState(false);

  const messages = [
    "Great work! 🎉",
    "You're awesome! 💪",
    "Keep it up! 🚀",
    "Amazing effort! ⭐",
    "You've got this! 💫",
    "Well done! 🌟",
    "Super cool! 😎",
    "Fantastic! 🎊"
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="floating-mascot">
      <button 
        className="mascot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Click for encouragement"
      >
        <div className="mascot-avatar">
          <i className="fas fa-smile"></i>
        </div>
      </button>

      {isOpen && (
        <div className="mascot-popup">
          <div className="mascot-message">
            <p>{randomMessage}</p>
            <button 
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>
          <div className="mascot-pointer"></div>
        </div>
      )}
    </div>
  );
};

export default FloatingMascot;
