import AIMascot from "../components/AIMascot";
//import AITaskPredictor from '../components/AITaskPredictor';
import React, { useState, useEffect } from "react";
import {
  getChores,
  createChore,
  updateChore,
  deleteChore,
} from "../services/api";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import VoiceCommands from "../components/VoiceCommands";
import {
  requestNotificationPermission,
  notifyChoreAssigned,
  notifyChoreCompletedByChild,
  notifyChoreApproved,
  notifyChoreOverdue,
  notifyDueDateReminder,
} from "../utils/notifications";

function Dashboard() {
  const [chores, setChores] = useState([]);
  const [children, setChildren] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newChore, setNewChore] = useState({
    title: "",
    description: "",
    assignedTo: "",
    points: 10,
    dueDate: "",
  });
  const [user, setUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadingChoreId, setUploadingChoreId] = useState(null);
  const [viewProof, setViewProof] = useState(null);
  const [rewards, setRewards] = useState(null);
  const navigate = useNavigate();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
      fetchChores();
      fetchChildren();
      fetchRewards();
      requestNotificationPermission();
      const interval = setInterval(checkOverdueChores, 60000);
      return () => clearInterval(interval);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchChores = async () => {
    try {
      const response = await getChores();
      setChores(response.data);
    } catch (error) {
      console.error("Error fetching chores:", error);
    }
  };

  const fetchChildren = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/users/children",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setChildren(response.data);
    } catch (error) {
      console.error("Error fetching children:", error);
    }
  };

  const fetchRewards = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/rewards", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRewards(response.data);
    } catch (error) {
      console.error("Error fetching rewards:", error);
    }
  };

  const checkOverdueChores = () => {
    const now = new Date();
    chores.forEach((chore) => {
      if (chore.dueDate && chore.status === "pending") {
        const dueDate = new Date(chore.dueDate);
        const hoursUntilDue = (dueDate - now) / (1000 * 60 * 60);
        if (hoursUntilDue > 0 && hoursUntilDue <= 1)
          notifyDueDateReminder(chore.title, 1);
        if (now > dueDate) notifyChoreOverdue(chore.title);
      }
    });
  };

  const handleCreateChore = async (e) => {
    e.preventDefault();
    try {
      await createChore(newChore);
      const child = children.find((c) => c._id === newChore.assignedTo);
      notifyChoreAssigned(newChore.title, child?.name || "Child");
      setNewChore({
        title: "",
        description: "",
        assignedTo: "",
        points: 10,
        dueDate: "",
      });
      setShowForm(false);
      fetchChores();
    } catch (error) {
      console.error("Error creating chore:", error);
    }
  };

  const handleImageSelect = (e, choreId) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        alert("Please upload an image or video file");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () =>
        setSelectedImage({ choreId, data: reader.result, name: file.name });
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProof = async (choreId) => {
    if (!selectedImage || selectedImage.choreId !== choreId) {
      alert("Please select an image first");
      return;
    }
    setUploadingChoreId(choreId);
    try {
      const chore = chores.find((c) => c._id === choreId);
      await updateChore(choreId, {
        status: "pending_approval",
        proofImage: selectedImage.data,
        proofImageName: selectedImage.name,
      });
      notifyChoreCompletedByChild(chore.title, user.name);
      setSelectedImage(null);
      fetchChores();
    } catch (error) {
      alert("Failed to upload proof");
    }
    setUploadingChoreId(null);
  };

  const handleApprove = async (choreId) => {
    try {
      const chore = chores.find((c) => c._id === choreId);
      await updateChore(choreId, { status: "completed" });
      notifyChoreApproved(chore.title, chore.points);
      fetchChores();
      fetchRewards();
    } catch (error) {
      console.error("Error approving chore:", error);
    }
  };

  const handleReject = async (choreId) => {
    prompt("Reason for rejection (optional):");
    try {
      await updateChore(choreId, {
        status: "pending",
        proofImage: null,
        proofImageName: null,
      });
      alert("Chore rejected. Child can resubmit with new proof.");
      fetchChores();
    } catch (error) {
      console.error("Error rejecting chore:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteChore(id);
      fetchChores();
    } catch (error) {
      console.error("Error deleting chore:", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleVoiceUpdate = (action) => {
    if (action === "refresh" || action === "completed") {
      fetchChores();
      fetchRewards();
    }
  };

  const getChildData = () => {
    if (!chores.length || !rewards) return null;
    const completedToday = chores.filter(
      (c) =>
        c.status === "completed" &&
        new Date(c.completedAt).toDateString() === new Date().toDateString(),
    );
    const totalPointsToday = completedToday.reduce(
      (sum, c) => sum + (c.points || 0),
      0,
    );
    const completionRate = Math.round(
      (chores.filter((c) => c.status === "completed").length / chores.length) *
        100,
    );
    return {
      taskCompletionRate: completionRate || 0,
      totalPointsToday: totalPointsToday || 0,
      studyTimeHours: 0,
      currentStreak: rewards.currentStreak || 0,
      ageGroup: user?.age || 12,
    };
  };

  const getChoreEmoji = (title) => {
    const lower = title.toLowerCase();
    if (
      lower.includes("clean") ||
      lower.includes("sweep") ||
      lower.includes("vacuum")
    )
      return "🧹";
    if (lower.includes("dish") || lower.includes("wash")) return "🍽️";
    if (lower.includes("dog") || lower.includes("walk")) return "🐕";
    if (lower.includes("bed") || lower.includes("room")) return "🛏️";
    if (lower.includes("laundry") || lower.includes("clothes")) return "👕";
    if (lower.includes("trash") || lower.includes("garbage")) return "🗑️";
    if (lower.includes("homework") || lower.includes("study")) return "📚";
    if (lower.includes("garden") || lower.includes("yard")) return "🌱";
    return "📋";
  };

  const isParent = user?.role === "parent";

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return {
          text: "✅ Completed",
          bg: isParent
            ? "linear-gradient(135deg, #00f5a0, #00d9f5)"
            : "#dcfce7",
          color: isParent ? "#003" : "#166534",
        };
      case "pending_approval":
        return {
          text: "⏳ Pending",
          bg: isParent
            ? "linear-gradient(135deg, #f7971e, #ffd200)"
            : "#fef9c3",
          color: isParent ? "#333" : "#854d0e",
        };
      default:
        return {
          text: "📋 Pending",
          bg: isParent
            ? "linear-gradient(135deg, #a18cd1, #fbc2eb)"
            : "#eff6ff",
          color: isParent ? "#333" : "#1e40af",
        };
    }
  };

  const getActionButton = (chore) => {
    if (user?.role === "child") {
      if (chore.status === "pending") {
        return (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => handleImageSelect(e, chore._id)}
              style={{ display: "none" }}
              id={`file-${chore._id}`}
            />
            <label
              htmlFor={`file-${chore._id}`}
              style={styles.uploadLabelChild}
            >
              📸 Choose Proof
            </label>
            {selectedImage && selectedImage.choreId === chore._id && (
              <button
                onClick={() => handleUploadProof(chore._id)}
                style={styles.submitProofBtnChild}
                disabled={uploadingChoreId === chore._id}
              >
                {uploadingChoreId === chore._id
                  ? "⏳ Uploading..."
                  : "✅ Submit"}
              </button>
            )}
          </div>
        );
      } else if (chore.status === "pending_approval") {
        return (
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <span
              style={{ color: "#d97706", fontWeight: "bold", fontSize: "13px" }}
            >
              ⏳ Waiting approval...
            </span>
            {chore.proofImage && (
              <button
                onClick={() => setViewProof(chore)}
                style={styles.viewProofBtnChild}
              >
                👁️ View
              </button>
            )}
          </div>
        );
      } else {
        return (
          <span
            style={{ color: "#059669", fontWeight: "bold", fontSize: "13px" }}
          >
            ✅ Completed & Approved!
          </span>
        );
      }
    } else {
      if (chore.status === "pending_approval") {
        return (
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {chore.proofImage && (
              <button
                onClick={() => setViewProof(chore)}
                style={styles.viewProofBtn}
              >
                👁️ View
              </button>
            )}
            <button
              onClick={() => handleApprove(chore._id)}
              style={styles.approveBtn}
            >
              ✅ Approve +{chore.points}pts
            </button>
            <button
              onClick={() => handleReject(chore._id)}
              style={styles.rejectBtn}
            >
              ❌ Reject
            </button>
          </div>
        );
      } else if (chore.status === "completed") {
        return (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span
              style={{ color: "#00f5a0", fontWeight: "bold", fontSize: "13px" }}
            >
              ✅ Approved
            </span>
            {chore.proofImage && (
              <button
                onClick={() => setViewProof(chore)}
                style={styles.viewProofBtn}
              >
                👁️ View
              </button>
            )}
          </div>
        );
      } else {
        return (
          <span style={{ color: "#a0aec0", fontSize: "13px" }}>
            Waiting for child...
          </span>
        );
      }
    }
  };

  // ====== PARENT DASHBOARD ======
  if (isParent) {
    return (
      <div style={styles.parentContainer}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.parentTitle}>🎯 Dashboard</h1>
            <p style={styles.parentSubtitle}>
              Welcome back,{" "}
              <span style={{ color: "#00f5a0", fontWeight: "700" }}>
                {user?.name}
              </span>
              !
            </p>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtnParent}>
            🚪 Logout
          </button>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          {[
            {
              icon: "📋",
              value: chores.length,
              label: "Total Chores",
              bg: "linear-gradient(135deg, #667eea, #764ba2)",
              glow: "rgba(102,126,234,0.4)",
            },
            {
              icon: "✅",
              value: chores.filter((c) => c.status === "completed").length,
              label: "Completed",
              bg: "linear-gradient(135deg, #00f5a0, #00d9f5)",
              glow: "rgba(0,245,160,0.4)",
            },
            {
              icon: "⏳",
              value: chores.filter((c) => c.status === "pending_approval")
                .length,
              label: "Pending Approval",
              bg: "linear-gradient(135deg, #f7971e, #ffd200)",
              glow: "rgba(247,151,30,0.4)",
            },
            {
              icon: "👶",
              value: children.length,
              label: "Children",
              bg: "linear-gradient(135deg, #ff6b6b, #ee0979)",
              glow: "rgba(255,107,107,0.4)",
            },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                ...styles.statCard,
                background: stat.bg,
                boxShadow: `0 8px 25px ${stat.glow}`,
              }}
            >
              <div style={styles.statIcon}>{stat.icon}</div>
              <div style={styles.statValue}>{stat.value}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
        {/* Chores */}
        <div style={styles.sectionHeader}>
          <div style={styles.sectionTitleWrapper}>
            <div style={styles.sectionDot}></div>
            <h2 style={styles.parentSectionTitle}>📋 Chores List</h2>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
            {showForm ? "✕ Cancel" : "+ Add New Chore"}
          </button>
        </div>

        {showForm && (
          <div style={styles.formCardParent}>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "white",
                marginBottom: "20px",
              }}
            >
              ➕ Create New Chore
            </h3>
            <form onSubmit={handleCreateChore}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabelParent}>Chore Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Clean bedroom"
                    value={newChore.title}
                    onChange={(e) =>
                      setNewChore({ ...newChore, title: e.target.value })
                    }
                    style={styles.formInputParent}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabelParent}>Assign To *</label>
                  <select
                    value={newChore.assignedTo}
                    onChange={(e) =>
                      setNewChore({ ...newChore, assignedTo: e.target.value })
                    }
                    style={styles.formInputParent}
                    required
                  >
                    <option value="">Select Child</option>
                    {children.map((child) => (
                      <option key={child._id} value={child._id}>
                        {child.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabelParent}>Points</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={newChore.points}
                    onChange={(e) =>
                      setNewChore({ ...newChore, points: e.target.value })
                    }
                    style={styles.formInputParent}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabelParent}>Due Date</label>
                  <input
                    type="datetime-local"
                    value={newChore.dueDate || ""}
                    onChange={(e) =>
                      setNewChore({ ...newChore, dueDate: e.target.value })
                    }
                    style={styles.formInputParent}
                  />
                </div>
                <div style={{ ...styles.formGroup, gridColumn: "1/-1" }}>
                  <label style={styles.formLabelParent}>Description</label>
                  <textarea
                    placeholder="Describe the task..."
                    value={newChore.description}
                    onChange={(e) =>
                      setNewChore({ ...newChore, description: e.target.value })
                    }
                    style={{
                      ...styles.formInputParent,
                      minHeight: "80px",
                      resize: "vertical",
                    }}
                  />
                </div>
              </div>
              <button type="submit" style={styles.submitBtnParent}>
                ✅ Create Chore
              </button>
            </form>
          </div>
        )}

        <div style={styles.choresGrid}>
          {chores.length === 0 ? (
            <div style={styles.emptyStateParent}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "white",
                  marginBottom: "8px",
                }}
              >
                No chores yet!
              </h3>
              <p style={{ fontSize: "14px", color: "#dc175c" }}>
                Create your first chore to get started
              </p>
            </div>
          ) : (
            chores.map((chore, index) => {
              const statusBadge = getStatusBadge(chore.status);
              const cardBgs = [
                "linear-gradient(135deg,#FFE5E5,#E0F7F6)",
                "linear-gradient(135deg,#FFFBE6,#FFE5E5)",
                "linear-gradient(135deg,#E0F7F6,#FFFBE6)",
                "linear-gradient(135deg,#F0E6FF,#FFE5E5)",
                "linear-gradient(135deg,#FFE5E5,#F0E6FF)",
              ];
              const cardGlows = [
                "rgba(255,107,107,0.15)",
                "rgba(255,217,61,0.15)",
                "rgba(78,205,196,0.1)",
                "rgba(199,125,255,0.1)",
                "rgba(255,143,171,0.1)",
              ];
              return (
                <div
                  key={chore._id}
                  style={{
                    ...styles.choreCardParent,
                    background: cardBgs[index % 5],
                    boxShadow: `0 8px 32px ${cardGlows[index % 5]}`,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "2px",
                      background:
                        chore.status === "completed"
                          ? "linear-gradient(90deg,#00f5a0,#00d9f5)"
                          : chore.status === "pending_approval"
                            ? "linear-gradient(90deg,#f7971e,#ffd200)"
                            : "linear-gradient(90deg,#667eea,#764ba2)",
                      borderRadius: "14px 14px 0 0",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "10px",
                      gap: "10px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "#212121",
                      }}
                    >
                      {getChoreEmoji(chore.title)} {chore.title}
                    </h3>
                    <span
                      style={{
                        background: statusBadge.bg,
                        color: statusBadge.color,
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: "700",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {statusBadge.text}
                    </span>
                  </div>
                  {chore.description && (
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#616161",
                        marginBottom: "16px",
                        lineHeight: "1.5",
                      }}
                    >
                      {chore.description}
                    </p>
                  )}
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                      marginBottom: "14px",
                    }}
                  >
                    <span style={styles.metaItemParent}>
                      ⭐ {chore.points} pts
                    </span>
                    <span style={styles.metaItemParent}>
                      👤 {chore.assignedTo?.name || "N/A"}
                    </span>
                    {chore.dueDate && (
                      <span style={styles.metaItemParent}>
                        📅 {new Date(chore.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                      alignItems: "center",
                      borderTop: "1px solid rgba(255,255,255,0.08)",
                      paddingTop: "12px",
                    }}
                  >
                    {getActionButton(chore)}
                    <button
                      onClick={() => handleDelete(chore._id)}
                      style={styles.deleteBtn}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {viewProof && (
          <div style={styles.modalOverlay} onClick={() => setViewProof(null)}>
            <div
              style={styles.modalParent}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "white",
                  marginBottom: "8px",
                }}
              >
                📸 {viewProof.title}
              </h2>
              <p style={{ color: "#a0aec0", marginBottom: "16px" }}>
                By: {viewProof.assignedTo?.name}
              </p>
              {viewProof.proofImage &&
                (viewProof.proofImage.startsWith("data:image") ? (
                  <img
                    src={viewProof.proofImage}
                    alt="Proof"
                    style={styles.proofImage}
                  />
                ) : (
                  <video
                    src={viewProof.proofImage}
                    controls
                    style={styles.proofImage}
                  />
                ))}
              <button
                onClick={() => setViewProof(null)}
                style={{
                  marginTop: "20px",
                  padding: "10px 24px",
                  background: "rgba(255,255,255,0.1)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ====== CHILD DASHBOARD ======
  return (
    <div style={styles.childContainer}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.childTitle}>🌟 My Dashboard</h1>
          <p style={styles.childSubtitle}>
            Hey{" "}
            <span style={{ color: "#7c3aed", fontWeight: "700" }}>
              {user?.name}
            </span>
            , let's get things done! 💪
          </p>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtnChild}>
          🚪 Logout
        </button>
      </div>

      {/* AI Mascot */}
      {getChildData() && <AIMascot childData={getChildData()} />}

      {/* Voice Commands */}
      <div style={styles.voiceSectionChild}>
        <VoiceCommands onTaskUpdate={handleVoiceUpdate} />
      </div>

      {/* Child Stats */}
      <div style={styles.statsGrid}>
        {[
          {
            icon: "📋",
            value: chores.length,
            label: "Total Tasks",
            bg: "linear-gradient(135deg, #C77DFF, #FF8FAB)",
            glow: "rgba(199,125,255,0.4)",
          },
          {
            icon: "✅",
            value: chores.filter((c) => c.status === "completed").length,
            label: "Completed",
            bg: "linear-gradient(135deg, #6BCF7F, #4ECDC4)",
            glow: "rgba(107,207,127,0.4)",
          },
          {
            icon: "⭐",
            value: rewards?.totalPoints || 0,
            label: "Total Points",
            bg: "linear-gradient(135deg, #FFD93D, #FF8FAB)",
            glow: "rgba(255,217,61,0.4)",
          },
          {
            icon: "🔥",
            value: rewards?.currentStreak || 0,
            label: "Day Streak",
            bg: "linear-gradient(135deg, #FF8FAB, #FF6B6B)",
            glow: "rgba(255,143,171,0.4)",
          },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              ...styles.statCardChild,
              background: stat.bg,
              boxShadow: `0 8px 25px ${stat.glow}`,
            }}
          >
            <div style={{ fontSize: "28px" }}>{stat.icon}</div>
            <div
              style={{
                fontSize: "32px",
                fontWeight: "900",
                color: "white",
                lineHeight: 1,
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.85)",
                fontWeight: "600",
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Child Chores */}
      <div style={styles.sectionHeader}>
        <div style={styles.sectionTitleWrapper}>
          <div
            style={{
              ...styles.sectionDot,
              background: "linear-gradient(135deg,#a78bfa,#7c3aed)",
              boxShadow: "0 0 10px rgba(167,139,250,0.8)",
            }}
          ></div>
          <h2 style={styles.childSectionTitle}>📋 My Chores</h2>
        </div>
      </div>

      <div style={styles.choresGridChild}>
        {chores.length === 0 ? (
          <div style={styles.emptyStateChild}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "8px",
              }}
            >
              No chores yet!
            </h3>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>
              Ask your parent to assign some tasks!
            </p>
          </div>
        ) : (
          chores.map((chore, index) => {
            const statusBadge = getStatusBadge(chore.status);
            const childCardBgs = [
              "linear-gradient(135deg, #ffffff, #f0f7ff)",
              "linear-gradient(135deg, #ffffff, #f5f3ff)",
              "linear-gradient(135deg, #ffffff, #ecfdf5)",
              "linear-gradient(135deg, #ffffff, #fff7ed)",
              "linear-gradient(135deg, #ffffff, #fef2f2)",
            ];
            const childBorderColors = [
              "#bfdbfe",
              "#ddd6fe",
              "#a7f3d0",
              "#fed7aa",
              "#fecaca",
            ];
            return (
              <div
                key={chore._id}
                style={{
                  ...styles.choreCardChild,
                  background: childCardBgs[index % 5],
                  borderLeft: `4px solid ${childBorderColors[index % 5]}`,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-5px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "10px",
                    gap: "10px",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "'Fredoka One', cursive",
                      color: "#FF6B6B",
                      fontSize: "18px",
                      margin: "0",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "20px" }}>
                      {getChoreEmoji(chore.title)}
                    </span>
                    {chore.title}
                  </h3>
                  <span
                    style={{
                      background: statusBadge.bg,
                      color: statusBadge.color,
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: "700",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      border: "1px solid rgba(0,0,0,0.1)",
                    }}
                  >
                    {statusBadge.text}
                  </span>
                </div>
                {chore.description && (
                  <p
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      color: "#666",
                      fontSize: "14px",
                      margin: "0 0 15px 0",
                      lineHeight: "1.4",
                    }}
                  >
                    {chore.description}
                  </p>
                )}
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginBottom: "14px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Fredoka One', cursive",
                      color: "#FFD93D",
                      fontSize: "14px",
                      fontWeight: "bold",
                      background: "rgba(255,217,61,0.1)",
                      padding: "4px 12px",
                      borderRadius: "20px",
                    }}
                  >
                    ⭐ {chore.points} pts
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "white",
                      background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
                      padding: "4px 12px",
                      borderRadius: "20px",
                    }}
                  >
                    👤 {chore.assignedTo?.name || "Me"}
                  </span>
                  {chore.dueDate && (
                    <span
                      style={{
                        fontFamily: "'Nunito', sans-serif",
                        color: "#666",
                        fontSize: "12px",
                        background: "rgba(0,0,0,0.05)",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontWeight: "500",
                      }}
                    >
                      📅 {new Date(chore.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                    alignItems: "center",
                    borderTop: "1px solid rgba(0,0,0,0.06)",
                    paddingTop: "12px",
                  }}
                >
                  {getActionButton(chore)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {viewProof && (
        <div style={styles.modalOverlay} onClick={() => setViewProof(null)}>
          <div style={styles.modalChild} onClick={(e) => e.stopPropagation()}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#1f2937",
                marginBottom: "8px",
              }}
            >
              📸 {viewProof.title}
            </h2>
            <p style={{ color: "#6b7280", marginBottom: "16px" }}>
              By: {viewProof.assignedTo?.name}
            </p>
            {viewProof.proofImage &&
              (viewProof.proofImage.startsWith("data:image") ? (
                <img
                  src={viewProof.proofImage}
                  alt="Proof"
                  style={styles.proofImage}
                />
              ) : (
                <video
                  src={viewProof.proofImage}
                  controls
                  style={styles.proofImage}
                />
              ))}
            <button
              onClick={() => setViewProof(null)}
              style={{
                marginTop: "20px",
                padding: "10px 24px",
                background: "#f3f4f6",
                color: "#374151",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  // ===== PARENT STYLES =====
  parentContainer: {
    padding: "40px",
    width: "100%",
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #FFE5E5 0%, #E0F7F6 50%, #FFE5E5 100%)",
  },
  parentTitle: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#FF6B6B",
    marginBottom: "4px",
    fontFamily: "'Fredoka One', cursive",
  },
  parentSubtitle: { fontSize: "16px", color: "#424242" },
  logoutBtnParent: {
    padding: "12px 24px",
    background: "linear-gradient(135deg,#FF6B6B,#FF5252)",
    color: "white",
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "16px",
    boxShadow: "0 4px 15px rgba(255,107,107,0.4)",
    transition: "all 0.3s ease",
  },
  aiSection: {
    marginBottom: "24px",
    borderRadius: "20px",
    overflow: "hidden",
    border: "1px solid rgba(102,126,234,0.3)",
    boxShadow: "0 0 30px rgba(102,126,234,0.2)",
    background:
      "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
  },
  formCardParent: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "24px",
    borderRadius: "16px",
    marginBottom: "24px",
  },
  formLabelParent: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#a0aec0",
    marginBottom: "6px",
    display: "block",
  },
  formInputParent: {
    padding: "10px 14px",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "8px",
    fontSize: "14px",
    color: "white",
    outline: "none",
    background: "rgba(255,255,255,0.08)",
    width: "100%",
  },
  submitBtnParent: {
    padding: "11px 24px",
    background: "linear-gradient(135deg,#00f5a0,#00d9f5)",
    color: "#0f0c29",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "800",
    fontSize: "14px",
  },
  choreCardParent: {
    padding: "24px",
    borderRadius: "24px",
    border: "2px solid rgba(255,255,255,0.8)",
    background: "rgba(255,255,255,0.95)",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
    backdropFilter: "blur(10px)",
    transition: "all 0.3s ease",
  },
  metaItemParent: {
    fontSize: "13px",
    color: "#424242",
    background: "rgba(255,107,107,0.1)",
    padding: "4px 12px",
    borderRadius: "20px",
    fontWeight: "600",
  },
  emptyStateParent: {
    gridColumn: "1/-1",
    textAlign: "center",
    padding: "60px 20px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  parentSectionTitle: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#FF6B6B",
    fontFamily: "'Fredoka One', cursive",
  },
  modalParent: {
    background: "linear-gradient(135deg,#1a1a2e,#16213e)",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "32px",
    borderRadius: "20px",
    maxWidth: "600px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
  },

  // ===== CHILD STYLES =====
  //childContainer: { padding:'30px', width:'100%', minHeight:'100vh', background:'linear-gradient(135deg, #7d2222 0%, #d41f1f 50%, # 100%)' },
  childContainer: {
    padding: "40px",
    width: "100%",
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #FFE5E5 0%, #FFFBE6 50%, #E0F7F6 100%)",
    position: "relative",
    overflow: "hidden",
  },
  childTitle: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#FF6B6B",
    marginBottom: "4px",
    fontFamily: "'Fredoka One', cursive",
  },
  childSubtitle: { fontSize: "14px", color: "#6b7280" },
  logoutBtnChild: {
    padding: "12px 24px",
    background: "linear-gradient(135deg,#C77DFF,#FF8FAB)",
    color: "white",
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "16px",
    boxShadow: "0 4px 15px rgba(199,125,255,0.4)",
    transition: "all 0.3s ease",
  },
  voiceSectionChild: {
    marginBottom: "24px",
    background: "#17cc5f",
    borderRadius: "16px",
    padding: "5px",
    boxShadow: "0 10px 30px rgba(124,58,237,0.3)",
  },
  statCardChild: {
    borderRadius: "16px",
    padding: "24px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "8px",
  },
  //choreCardChild: { background:'brown',padding:'20px', borderRadius:'14px', border:'1px solid rgba(0,0,0,0.06)', boxShadow:'0 4px 15px rgba(0,0,0,0.06)' },
  choreCardChild: {
    padding: "20px",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.4)",
    background: "rgba(255,255,255,0.7)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    transition: "0.3s",
  },
  metaItemChild: {
    fontSize: "12px",
    color: "#6b7280",
    background: "rgba(0,0,0,0.05)",
    padding: "3px 10px",
    borderRadius: "20px",
    fontWeight: "500",
  },
  emptyStateChild: {
    gridColumn: "1/-1",
    textAlign: "center",
    padding: "60px 20px",
    background: "white",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
  },
  choresGridChild: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px,1fr))",
    gap: "16px",
  },
  childSectionTitle: { fontSize: "20px", fontWeight: "800", color: "#1f2937" },
  modalChild: {
    background: "white",
    padding: "32px",
    borderRadius: "20px",
    maxWidth: "600px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
  },

  // ===== SHARED STYLES =====
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    flexWrap: "wrap",
    gap: "16px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))",
    gap: "16px",
    marginBottom: "30px",
  },
  statCard: {
    borderRadius: "16px",
    padding: "24px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "8px",
  },
  statIcon: { fontSize: "28px" },
  statValue: {
    fontSize: "32px",
    fontWeight: "900",
    color: "white",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  sectionTitleWrapper: { display: "flex", alignItems: "center", gap: "10px" },
  sectionDot: {
    width: "10px",
    height: "10px",
    background: "linear-gradient(135deg,#00f5a0,#00d9f5)",
    borderRadius: "50%",
    boxShadow: "0 0 10px rgba(0,245,160,0.8)",
  },
  addBtn: {
    padding: "10px 20px",
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
    boxShadow: "0 4px 15px rgba(102,126,234,0.4)",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))",
    gap: "16px",
    marginBottom: "20px",
  },
  formGroup: { display: "flex", flexDirection: "column" },
  choresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px,1fr))",
    gap: "16px",
  },
  viewProofBtn: {
    padding: "7px 12px",
    background: "rgba(99,102,241,0.3)",
    color: "#818cf8",
    border: "1px solid rgba(99,102,241,0.4)",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },
  viewProofBtnChild: {
    padding: "7px 12px",
    background: "#eff6ff",
    color: "#2563eb",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },
  approveBtn: {
    padding: "7px 14px",
    background: "linear-gradient(135deg,#00f5a0,#00d9f5)",
    color: "#0f0c29",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "12px",
  },
  rejectBtn: {
    padding: "7px 14px",
    background: "linear-gradient(135deg,#ff6b6b,#ee0979)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "12px",
  },
  deleteBtn: {
    padding: "7px 10px",
    background: "rgba(255,107,107,0.15)",
    color: "#ff6b6b",
    border: "1px solid rgba(255,107,107,0.3)",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    marginLeft: "auto",
  },
  uploadLabelChild: {
    padding: "7px 14px",
    background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "12px",
  },
  submitProofBtnChild: {
    padding: "7px 14px",
    background: "linear-gradient(135deg,#34d399,#059669)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "12px",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    backdropFilter: "blur(8px)",
  },
  proofImage: {
    maxWidth: "100%",
    maxHeight: "400px",
    borderRadius: "12px",
    marginTop: "16px",
    display: "block",
  },
};

export default Dashboard;
