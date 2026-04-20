import React, { useState, useEffect } from 'react';
import axios from 'axios';

function VoiceCommands({ onTaskUpdate }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = 'en-US';

    recognitionInstance.onstart = () => {
      console.log('Recognition started');
      // Speak welcome after mic starts
      setTimeout(() => {
        speak('Hello! I am listening. What would you like to do?');
      }, 200);
    };

    recognitionInstance.onresult = (event) => {
      const speechResult = event.results[0][0].transcript.toLowerCase();
      console.log('Heard:', speechResult);
      setTranscript(speechResult);
      processVoiceCommand(speechResult);
    };

    recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setFeedback('❌ Error: Could not understand. Please try again.');
      setIsListening(false);
      speak('Sorry, I could not understand. Please try again.');
    };

    recognitionInstance.onend = () => {
      console.log('Recognition ended');
      setIsListening(false);
    };

    setRecognition(recognitionInstance);
  }, []);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1.1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!recognition) {
      console.log('Recognition not available');
      return;
    }
    
    // Prevent multiple starts
    if (isListening) {
      console.log('Already listening');
      return;
    }

    console.log('Starting to listen...');
    setIsListening(true);
    setTranscript('');
    setFeedback('🎤 Listening... Speak your command now!');

    try {
      recognition.start();
    } catch (error) {
      console.error('Recognition start error:', error);
      setIsListening(false);
      setFeedback('❌ Error starting microphone');
    }
  };

  const stopListening = () => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (err) {
        console.error('Recognition stop error:', err);
      }
    }
    setIsListening(false);
  };

  const processVoiceCommand = async (command) => {
    setFeedback(`Processing: "${command}"`);
    console.log('Processing command:', command);

    try {
      // Command: "mark [task name] as done/complete"
      if (command.includes('mark') && (command.includes('done') || command.includes('complete'))) {
        const taskName = extractTaskName(command);
        await markTaskComplete(taskName);
        return;
      }

      // Command: "show my tasks" OR "view all tasks" OR "list tasks"
      if ((command.includes('show') || command.includes('view') || command.includes('list')) && command.includes('task')) {
        await showAllTasks();
        return;
      }

      // Command: "how many points do I have"
      if (command.includes('points') || command.includes('score')) {
        await checkPoints();
        return;
      }

      // Command: "what are my pending tasks"
      if (command.includes('pending') || command.includes('remaining') || command.includes('incomplete')) {
        await checkPendingTasks();
        return;
      }

      // Command: "refresh" OR "reload"
      if (command.includes('refresh') || command.includes('reload')) {
        setFeedback('✅ Refreshing tasks...');
        speak('Refreshing your task list!');
        if (onTaskUpdate) onTaskUpdate('refresh');
        return;
      }

      // Unknown command
      setFeedback('❓ Command not recognized. Try: "What are my pending tasks?"');
      speak('Sorry, I did not understand that command. Please try again.');

    } catch (error) {
      console.error('Command processing error:', error);
      setFeedback('❌ Error processing command');
      speak('Sorry, there was an error.');
    }
  };

  const extractTaskName = (command) => {
    const markIndex = command.indexOf('mark');
    const doneIndex = command.indexOf('done') !== -1 ? command.indexOf('done') : command.indexOf('complete');

    if (markIndex !== -1 && doneIndex !== -1) {
      const taskPart = command.substring(markIndex + 4, doneIndex).trim();
      return taskPart.replace(/\s+as\s*$/, '').trim();
    }

    return '';
  };

  const markTaskComplete = async (taskName) => {
    if (!taskName) {
      setFeedback('❌ Could not identify task name');
      speak('I could not understand which task. Please say the task name clearly.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Get all chores
      const choresRes = await axios.get('http://localhost:5000/api/chores', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Find matching chore
      const matchingChore = choresRes.data.find(chore =>
        chore.title.toLowerCase().includes(taskName) ||
        taskName.includes(chore.title.toLowerCase())
      );

      if (matchingChore) {
        // Mark as pending_approval (parent needs to approve)
        await axios.put(`http://localhost:5000/api/chores/${matchingChore._id}`,
          { status: 'pending_approval' },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Celebration feedback with points info
        setFeedback(`🎉 Great job! "${matchingChore.title}" marked as complete! You will earn ${matchingChore.points} points after parent approval! 🏆`);
        speak(`Awesome! ${matchingChore.title} has been marked as complete. You will earn ${matchingChore.points} points once your parent approves it. Great work!`);

        if (onTaskUpdate) onTaskUpdate('completed', matchingChore);
      } else {
        setFeedback(`❌ Task "${taskName}" not found`);
        speak(`Sorry, I could not find a task called ${taskName}. Please check the task name and try again.`);
      }

    } catch (error) {
      console.error('Error marking task complete:', error);
      setFeedback('❌ Error updating task');
      speak('Sorry, there was an error updating the task. Please try again.');
    }
  };

  const checkPoints = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/rewards', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const points = response.data?.totalPoints || 0;
      const level = response.data?.level || 1;

      setFeedback(`🏆 You have ${points} points and are at Level ${level}!`);
      speak(`You currently have ${points} points and you are at level ${level}. Keep up the great work!`);
    } catch (error) {
      console.error('Error checking points:', error);
      setFeedback('❌ Could not fetch points');
      speak('Sorry, I could not check your points right now. Please try again later.');
    }
  };

  const checkPendingTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/chores', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const pendingTasks = response.data.filter(chore => chore.status === 'pending');

      if (pendingTasks.length === 0) {
        setFeedback('🎉 Amazing! You have no pending tasks. All done!');
        speak('Congratulations! You have completed all your tasks. You are doing an amazing job!');
      } else {
        const taskNames = pendingTasks.map(task => task.title).join(', ');
        setFeedback(`📋 You have ${pendingTasks.length} pending tasks: ${taskNames}`);
        
        if (pendingTasks.length === 1) {
          speak(`You have 1 pending task: ${pendingTasks[0].title}. You can do it!`);
        } else if (pendingTasks.length === 2) {
          speak(`You have 2 pending tasks: ${pendingTasks[0].title} and ${pendingTasks[1].title}. Keep going!`);
        } else {
          speak(`You have ${pendingTasks.length} pending tasks. Check the screen for the complete list. You've got this!`);
        }
      }
    } catch (error) {
      console.error('Error checking pending tasks:', error);
      setFeedback('❌ Could not fetch pending tasks');
      speak('Sorry, I could not check your pending tasks right now. Please try again.');
    }
  };

  const showAllTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/chores', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const allTasks = response.data;
      const pending = allTasks.filter(t => t.status === 'pending').length;
      const pendingApproval = allTasks.filter(t => t.status === 'pending_approval').length;
      const completed = allTasks.filter(t => t.status === 'completed').length;

      setFeedback(`📊 Total: ${allTasks.length} | Pending: ${pending} | Waiting Approval: ${pendingApproval} | Completed: ${completed}`);
      speak(`You have ${allTasks.length} total tasks. ${pending} are pending, ${pendingApproval} are waiting for approval, and ${completed} are completed. Great progress!`);
      
      if (onTaskUpdate) onTaskUpdate('refresh');
    } catch (error) {
      console.error('Error showing tasks:', error);
      setFeedback('❌ Could not fetch tasks');
      speak('Sorry, I could not fetch your tasks right now. Please try again.');
    }
  };

  if (!isSupported) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <h3>⚠️ Voice Commands Not Supported</h3>
          <p>Your browser does not support voice recognition. Please use Chrome, Edge, or Safari.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2>🎤 Voice Commands</h2>
          <p style={styles.subtitle}>Control your tasks with your voice!</p>
        </div>

        <div style={styles.micContainer}>
          <button
            onClick={isListening ? stopListening : startListening}
            style={{
              ...styles.micButton,
              background: isListening
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : 'linear-gradient(135deg, #3b82f6, #2563eb)',
              animation: isListening ? 'pulse 1.5s infinite' : 'none'
            }}
          >
            {isListening ? '🛑' : '🎤'}
          </button>
          <p style={styles.buttonLabel}>
            {isListening ? 'Listening... Click to stop' : 'Click to speak'}
          </p>
        </div>

        {transcript && (
          <div style={styles.transcriptBox}>
            <strong>You said:</strong> "{transcript}"
          </div>
        )}

        {feedback && (
          <div style={{
            ...styles.feedbackBox,
            background: feedback.includes('✅') || feedback.includes('🎉') ? '#d1fae5' :
                       feedback.includes('❌') ? '#fee2e2' : '#dbeafe'
          }}>
            {feedback}
          </div>
        )}

        <div style={styles.commandsList}>
          <h3>📋 Available Commands:</h3>
          <ul style={styles.list}>
            <li><strong>"Mark [task name] as done"</strong></li>
            <li><strong>"Show my tasks" / "View all tasks"</strong></li>
            <li><strong>"How many points do I have"</strong></li>
            

    
          </ul>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: { padding: '20px', maxWidth: '800px', margin: '0 auto' },
  card: { background: 'yellow', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },
  header: { textAlign: 'center', marginBottom: '30px' },
  subtitle: { color: '#666', fontSize: '16px' },
  micContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '30px 0' },
  micButton: { width: '120px', height: '120px', borderRadius: '50%', border: 'none', fontSize: '50px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.2)', transition: 'transform 0.2s' },
  buttonLabel: { marginTop: '15px', fontSize: '14px', color: '#666', fontWeight: 'bold' },
  transcriptBox: { background: '#f3f4f6', padding: '15px', borderRadius: '10px', marginBottom: '15px', fontSize: '16px' },
  feedbackBox: { padding: '15px', borderRadius: '10px', marginBottom: '20px', fontSize: '16px', fontWeight: '500', textAlign: 'center' },
  commandsList: { marginTop: '30px' },
  list: { lineHeight: '2', fontSize: '15px' },
  exampleBox: { background: '#fef3c7', padding: '15px', borderRadius: '10px', marginTop: '20px' },
  errorCard: { background: '#fee2e2', padding: '30px', borderRadius: '15px', textAlign: 'center' }
};

export default VoiceCommands;