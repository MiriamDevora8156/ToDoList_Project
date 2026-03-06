import axios from 'axios';

const apiUrl = "https://your-api-service-name.onrender.com";
// const apiUrl = "http://localhost:5030";

// 1. הוספת הטוקן לכל בקשה באופן אוטומטי
axios.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. טיפול בשגיאת 401 (טוקן לא בתוקף)
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default {
  getTasks: async () => {
    const result = await axios.get(`${apiUrl}/items`);
    return result.data;
  },

  addTask: async (taskObject) => {
    // taskObject כבר מכיל PascalCase (Name, Priority וכו') מה-App.js
    const result = await axios.post(`${apiUrl}/items`, taskObject);
    return result.data;
  },

  setCompleted: async (task) => {
    // חילוץ ה-ID בצורה בטוחה (תומך ב-id וגם ב-Id)
    const taskId = task.id ?? task.Id;
    
    // שליחת האובייקט לכתובת הנכונה
    const result = await axios.put(`${apiUrl}/items/${taskId}`, task);
    return result.data;
  },

  deleteTask: async (id) => {
    await axios.delete(`${apiUrl}/items/${id}`);
  },

  getStats: async () => {
    const result = await axios.get(`${apiUrl}/items/stats`);
    return result.data;
  }
};