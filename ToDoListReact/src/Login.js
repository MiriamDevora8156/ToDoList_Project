import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
const endpoint = isRegister ? "register" : "login";
    try {
const response = await axios.post(`http://localhost:5030/${endpoint}`, { 
    username, 
    password 
});
      if (!isRegister && response.data.token) {
        localStorage.setItem("token", response.data.token); // שמירת הטוקן
        onLogin();
      } else if (isRegister) {
        alert("נרשמת בהצלחה! כעת התחבר");
        setIsRegister(false);
      }
    } catch (err) {
      alert("שגיאה בפעולה, בדוק שם משתמש וסיסמה");
    }
  };

  return (
    <div className="login-container">
      <h2>{isRegister ? "הרשמה" : "התחברות"}</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="שם משתמש" onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="סיסמה" onChange={e => setPassword(e.target.value)} />
        <button type="submit">{isRegister ? "הירשם" : "היכנס"}</button>
      </form>
      <button onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? "כבר יש לי חשבון" : "צור חשבון חדש"}
      </button>
    </div>
  );
}

export default Login;