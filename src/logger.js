export const addActivityLog = (user, type, action, result, severity) => {
  const username = user?.username || "System";
  const initials = username.substring(0, 2).toUpperCase();
  
  const newLog = {
    id: Date.now() + Math.random(),
    user: username,
    initials,
    action,
    type,
    result,
    severity,
    time: new Date().toISOString()
  };

  let logs = [];
  try {
    const saved = localStorage.getItem("activityLogs");
    if (saved) logs = JSON.parse(saved);
  } catch (e) {
    console.error("Failed to parse logs", e);
  }
  
  // if completely empty, let's just initialize it with our new log, Activity.jsx handles the rest
  logs.unshift(newLog);
  localStorage.setItem("activityLogs", JSON.stringify(logs));
};
