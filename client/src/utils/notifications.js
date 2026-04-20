// Request notification permission
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

// Show notification
export const showNotification = (title, options = {}) => {
  if (Notification.permission === "granted") {
    new Notification(title, {
      icon: '/logo192.png',
      badge: '/logo192.png',
      ...options
    });
  }
};

// 1. Chore assigned notification (to child)
export const notifyChoreAssigned = (choreName, childName) => {
  showNotification("📋 New Chore Assigned!", {
    body: `${childName}, you have a new chore: ${choreName}`,
    tag: 'chore-assigned'
  });
};

// 2. Chore completed by child (to parent)
export const notifyChoreCompletedByChild = (choreName, childName) => {
  showNotification("✅ Chore Completed!", {
    body: `${childName} has completed: ${choreName}. Please review!`,
    tag: 'chore-completed-child'
  });
};

// 3. Chore approved by parent (to child)
export const notifyChoreApproved = (choreName, points) => {
  showNotification("🎉 Chore Approved!", {
    body: `Great job! You earned ${points} points for completing "${choreName}"`,
    tag: 'chore-approved'
  });
};

// 4. Due date reminder (1 hour before)
export const notifyDueDateReminder = (choreName, hoursLeft) => {
  showNotification("⏰ Reminder!", {
    body: `"${choreName}" is due in ${hoursLeft} hour(s)! Don't forget!`,
    tag: 'due-reminder'
  });
};

// 5. Chore overdue/missed
export const notifyChoreOverdue = (choreName) => {
  showNotification("❌ Chore Overdue!", {
    body: `"${choreName}" was not completed on time. Don't worry, try to complete it now!`,
    tag: 'chore-overdue'
  });
};

// 6. Level up/Badge earned
export const notifyLevelUp = (newLevel) => {
  showNotification("🚀 Level Up!", {
    body: `Congratulations! You've reached Level ${newLevel}! Keep going!`,
    tag: 'level-up'
  });
};

export const notifyBadgeEarned = (badgeName) => {
  showNotification("🏅 New Badge Earned!", {
    body: `Amazing! You've earned the "${badgeName}" badge!`,
    tag: 'badge-earned'
  });
};

// OLD functions (backward compatibility)
export const notifyChoreCreated = (choreName) => {
  notifyChoreAssigned(choreName, "You");
};

export const notifyChoreCompleted = (choreName, points) => {
  notifyChoreApproved(choreName, points);
};

export const notifyStudyActivityCreated = (activityName) => {
  showNotification("📚 New Study Activity!", {
    body: `Time to study: ${activityName}`,
    tag: 'study-created'
  });
};