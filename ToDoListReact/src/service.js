import axios from 'axios';

const todoApiUrl = process.env.REACT_APP_TODO_API_URL;
const monitorApiUrl = process.env.REACT_APP_RENDER_MONITOR_URL;
// const apiUrl = "http://localhost:5030";

// 1. הוספת הטוקן לכל בקשה באופן אוטומטי
axios.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    // לפעמים הטוקן שמור עם מרכאות, בואי ננקה אותן
    const cleanToken = token.replace(/['"]+/g, '');
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
});

// 2. טיפול בשגיאת 401 (טוקן לא בתוקף)
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      // במקום window.location.reload() - תני ל-React לעשות את העבודה
      // ברגע שהטוקן ב-localStorage ימחק, ה-State ב-App יתעדכן והוא יציג את ה-Login
      console.log("Unauthorized - token removed");
    }
    return Promise.reject(error);
  }
);

export default {
  getTasks: async () => {
    const result = await axios.get(`${todoApiUrl}/items`);
    return result.data;
  },

  addTask: async (taskObject) => {
    // taskObject כבר מכיל PascalCase (Name, Priority וכו') מה-App.js
    const result = await axios.post(`${todoApiUrl}/items`, taskObject);
    return result.data;
  },

  setCompleted: async (task) => {
    // חילוץ ה-ID בצורה בטוחה (תומך ב-id וגם ב-Id)
    const taskId = task.id ?? task.Id;

    // שליחת האובייקט לכתובת הנכונה
    const result = await axios.put(`${todoApiUrl}/items/${taskId}`, task);
    return result.data;
  },

  deleteTask: async (id) => {
    await axios.delete(`${todoApiUrl}/items/${id}`);
  },

  getStats: async () => {
    const result = await axios.get(`${todoApiUrl}/items/stats`);
    return result.data;
  },

  // --- פונקציה חדשה (פונה לכתובת של ה-Node החדש) ---
  getRenderServices: async () => {
    const result = await axios.get(`${monitorApiUrl}/services`);
    return result.data;
  }
};