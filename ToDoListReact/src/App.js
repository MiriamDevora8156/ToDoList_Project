// import React, { useEffect, useState } from 'react';
// import service from './service.js';
// import Login from './Login.js';

// function App() {
//   // --- States לניהול המשימה החדשה ---
//   const [newTodo, setNewTodo] = useState("");
//   const [priority, setPriority] = useState(1);
//   const [category, setCategory] = useState("כללי");
//   const [dueDate, setDueDate] = useState("");
  
//   // States לניהול הוספת קטגוריה חדשה מהירה
//   const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
//   const [newCategoryName, setNewCategoryName] = useState("");

//   // States לנתוני האפליקציה
//   const [todos, setTodos] = useState([]);
//   const [token, setToken] = useState(localStorage.getItem("token"));
//   const [stats, setStats] = useState(null);
//   const [filter, setFilter] = useState("הכל");
//   const [categories, setCategories] = useState(["כללי", "עבודה", "לימודים", "בית", "קניות"]);

//   // --- טעינת נתונים מהשרת ---
//   async function loadAppData() {
//     if (!token) return;
//     try {
//       const todosData = await service.getTasks();
      
//       // מיון: משימות שלא בוצעו קודם, ואז לפי תאריך יעד (הקרוב ביותר למעלה)
//       const sortedTodos = (todosData || []).sort((a, b) => {
//         const isDoneA = a.isComplete ?? a.IsComplete;
//         const isDoneB = b.isComplete ?? b.IsComplete;
//         if (isDoneA !== isDoneB) return isDoneA ? 1 : -1;

//         const dateA = new Date(a.dueDate || a.DueDate || "9999-12-31");
//         const dateB = new Date(b.dueDate || b.DueDate || "9999-12-31");
//         return dateA - dateB;
//       });

//       setTodos(sortedTodos);
      
//       const statsData = await service.getStats(); 
//       setStats(statsData);

//       // עדכון רשימת הקטגוריות הזמינות בסינון לפי מה שקיים ב-DB
//       const uniqueCats = [...new Set(todosData.map(t => t.categoryName || t.CategoryName || "כללי"))];
//       setCategories(prev => [...new Set([...prev, ...uniqueCats])]);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   }

//   useEffect(() => {
//     loadAppData();
//   }, [token]);

//   // --- פונקציות פעולה ---
//   async function createTodo(e) {
//     e.preventDefault();
//     if (!newTodo.trim()) return;

//     // בחירת הקטגוריה הסופית (אם המשתמש הקליד חדשה ולא אישר ב-V, עדיין ניקח אותה)
//     const finalCategory = isAddingNewCategory && newCategoryName.trim() ? newCategoryName : category;

//     const taskToSave = {
//       Name: newTodo,
//       IsComplete: false,
//       Priority: parseInt(priority),
//       CategoryName: finalCategory,
//       DueDate: dueDate ? new Date(dueDate).toISOString() : null
//     };

//     try {
//       await service.addTask(taskToSave);
//       setNewTodo("");
//       setDueDate("");
//       setPriority(1);
//       setIsAddingNewCategory(false);
//       setNewCategoryName("");
//       await loadAppData();
//     } catch (err) {
//       console.error("Save failed", err);
//     }
//   }

//   async function updateCompleted(todo, isComplete) {
//     const updatedTask = { 
//       ...todo, 
//       id: todo.id ?? todo.Id, 
//       isComplete: isComplete,
//       IsComplete: isComplete 
//     };
//     await service.setCompleted(updatedTask);
//     await loadAppData();
//   }

//   async function deleteTodo(id) {
//     await service.deleteTask(id);
//     await loadAppData();
//   }

//   const filteredTodos = filter === "הכל" 
//     ? todos 
//     : todos.filter(t => (t.categoryName ?? t.CategoryName) === filter);

//   if (!token) {
//     return <Login onLogin={() => setToken(localStorage.getItem("token"))} />;
//   }

//   return (
//     <section className="todoapp">
//       <header className="header" style={{ position: 'relative', paddingBottom: '20px' }}>
//         <button 
//           onClick={() => { localStorage.removeItem("token"); setToken(null); }} 
//           style={{ position: 'absolute', top: '10px', right: '10px', border: '1px solid #ededed', background: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '12px', color: '#999' }}
//         >
//           Logout
//         </button>

//         <h1>todos</h1>

//         {/* סטטיסטיקות מעוצבות */}
//         {stats && (
//           <div className="stats-container" style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '15px', fontSize: '14px', color: '#4d4d4d' }}>
//             <span>📊 סה"כ: <strong>{stats.totalTasks ?? stats.TotalTasks ?? 0}</strong></span>
//             <span>✅ בוצעו: <strong>{stats.completedTasks ?? stats.CompletedTasks ?? 0}</strong></span>
//             <span>⏳ ממתינות: <strong>{stats.pendingTasks ?? stats.PendingTasks ?? 0}</strong></span>
//             <span>🔥 דחוף: <strong>{stats.highPriorityTasks ?? stats.HighPriorityTasks ?? 0}</strong></span>
//           </div>
//         )}

//         {/* טופס הוספת משימה משולב */}
//         <form onSubmit={createTodo} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', background: '#fff', borderBottom: '1px solid #ededed' }}>
//           <input 
//             className="new-todo" 
//             placeholder="מה המשימה הבאה?" 
//             value={newTodo} 
//             onChange={(e) => setNewTodo(e.target.value)} 
//             style={{ flex: 1, border: 'none' }} 
//           />
          
//           <input 
//             type="date" 
//             value={dueDate} 
//             onChange={(e) => setDueDate(e.target.value)} 
//             style={{ height: '65px', padding: '0 10px', border: 'none', borderLeft: '1px solid #ededed', color: '#777', outline: 'none' }} 
//           />

//           {/* לוגיקת בחירת קטגוריה / הוספה מהירה */}
//           {!isAddingNewCategory ? (
//             <select 
//               value={category} 
//               onChange={(e) => { if (e.target.value === "NEW") setIsAddingNewCategory(true); else setCategory(e.target.value); }} 
//               style={{ height: '65px', padding: '0 10px', border: 'none', borderLeft: '1px solid #ededed', background: 'white', color: '#777', cursor: 'pointer', outline: 'none' }}
//             >
//               {categories.map(c => <option key={c} value={c}>{c}</option>)}
//               <option value="NEW" style={{color: '#2ecc71', fontWeight: 'bold'}}>+ חדש...</option>
//             </select>
//           ) : (
//             <div style={{ display: 'flex', alignItems: 'center', borderLeft: '1px solid #ededed', background: '#f9f9f9' }}>
//               <input 
//                 placeholder="שם קטגוריה..." 
//                 value={newCategoryName} 
//                 onChange={(e) => setNewCategoryName(e.target.value)} 
//                 style={{ height: '65px', width: '110px', padding: '0 10px', border: 'none', background: 'transparent' }} 
//                 autoFocus
//               />
//               <button type="button" onClick={() => setIsAddingNewCategory(false)} style={{ height: '65px', border: 'none', cursor: 'pointer', padding: '0 10px', background: 'transparent' }}>❌</button>
//             </div>
//           )}

//           <select 
//             value={priority} 
//             onChange={(e) => setPriority(e.target.value)} 
//             style={{ height: '65px', padding: '0 15px', border: 'none', borderLeft: '1px solid #ededed', background: 'white', fontSize: '18px', cursor: 'pointer', outline: 'none' }}
//           >
//             <option value="1">⚪</option>
//             <option value="2">🟡</option>
//             <option value="3">🔴</option>
//           </select>
          
//           <button type="submit" style={{ height: '65px', padding: '0 25px', background: '#fff', border: 'none', borderLeft: '1px solid #ededed', cursor: 'pointer', fontSize: '22px', color: '#2ecc71' }}>✔</button>
//         </form>

//         {/* סרגל סינון קטגוריות */}
//         <div className="filters-bar" style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '12px 0', background: '#f9f9f9', borderBottom: '1px solid #ededed', overflowX: 'auto' }}>
//           <button onClick={() => setFilter("הכל")} style={{ border: 'none', background: filter === "הכל" ? "#e5e5e5" : "transparent", padding: '4px 12px', borderRadius: '15px', cursor: 'pointer', fontSize: '12px' }}>הכל</button>
//           {categories.map(c => (
//             <button key={c} onClick={() => setFilter(c)} style={{ border: 'none', background: filter === c ? "#e5e5e5" : "transparent", padding: '4px 12px', borderRadius: '15px', cursor: 'pointer', fontSize: '12px' }}>{c}</button>
//           ))}
//         </div>
//       </header>

//       {/* רשימת המשימות */}
//       <section className="main" style={{ display: "block" }}>
//         <ul className="todo-list">
//           {filteredTodos.map(todo => {
//             const id = todo.id ?? todo.Id;
//             const name = todo.name ?? todo.Name;
//             const isComplete = todo.isComplete ?? todo.IsComplete;
//             const prio = todo.priority ?? todo.Priority;
//             const cat = todo.categoryName ?? todo.CategoryName;
//             const dDate = todo.dueDate ?? todo.DueDate;

//             // לוגיקה למשימה שעבר זמנה
//             const isOverdue = dDate && new Date(dDate) < new Date().setHours(0,0,0,0) && !isComplete;

//             return (
//               <li className={`${isComplete ? "completed" : ""} ${isOverdue ? "overdue" : ""}`} key={id}>
//                 <div className="view" style={{ backgroundColor: isOverdue ? '#fff1f1' : 'transparent', transition: '0.3s' }}>
//                   <input 
//                     className="toggle" 
//                     type="checkbox" 
//                     checked={isComplete} 
//                     onChange={(e) => updateCompleted(todo, e.target.checked)} 
//                   />
//                   <label style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
//                     <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
//                       {prio === 3 && <span title="דחוף" style={{ marginRight: '8px' }}>🔥</span>}
//                       {prio === 2 && <span title="חשוב" style={{ marginRight: '8px' }}>⭐</span>}
                      
//                       <span style={{ 
//                         color: isOverdue ? '#d93025' : 'inherit',
//                         fontWeight: isOverdue ? '600' : 'normal'
//                       }}>
//                         {name}
//                         {isOverdue && <span style={{ fontSize: '10px', marginRight: '10px', color: '#d93025', fontStyle: 'italic' }}>⚠️ פג תוקף!</span>}
//                       </span>
//                     </div>
                    
//                     {/* תצוגת תאריך מעוצבת */}
//                     {dDate && (
//                       <span style={{ 
//                         fontSize: '11px', 
//                         marginRight: '10px', 
//                         background: isOverdue ? '#fce8e6' : '#fdfdfd', 
//                         color: isOverdue ? '#d93025' : '#999',
//                         padding: '3px 8px', 
//                         borderRadius: '6px', 
//                         border: isOverdue ? '1px solid #f5c2c7' : '1px solid #eee' 
//                       }}>
//                         📅 {new Date(dDate).toLocaleDateString('he-IL')}
//                       </span>
//                     )}
                    
//                     {/* תגית קטגוריה */}
//                     <span style={{ fontSize: '10px', padding: '2px 10px', borderRadius: '12px', background: '#eee', color: '#666', marginRight: '45px', fontWeight: 'bold', minWidth: '50px', textAlign: 'center' }}>
//                       {cat}
//                     </span>
//                   </label>
//                   <button className="destroy" onClick={() => deleteTodo(id)}></button>
//                 </div>
//               </li>
//             );
//           })}
//         </ul>
//       </section>
//     </section>
//   );
// }

// export default App;
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import service from './service.js';
import Login from './Login.js'; // הקובץ המקורי שלך נשאר
import { motion, AnimatePresence } from 'framer-motion';

// MUI Imports
import { 
  Container, Paper, Typography, TextField, Button, Select, MenuItem, 
  IconButton, Checkbox, Chip, Box, Grid, Card, CardContent, Divider, 
  Tooltip, Avatar, Stack, FormControl, InputLabel, ThemeProvider, createTheme, CssBaseline
} from '@mui/material';

// Icons
import { 
  DeleteOutline, EventNote, PriorityHigh, Logout, CheckCircle, 
  FiberManualRecord, Star, WarningAmber, AddRounded, 
  CategoryRounded, CloseRounded, AssignmentTurnedInRounded,
  TrendingUp, DoneAll, ReportProblem
} from '@mui/icons-material';

// יצירת ערכת נושא יוקרתית (Theme) - כולל עיצוב גלובלי ל-Login
const theme = createTheme({
  palette: {
    primary: { main: '#6366f1' }, // Indigo מודרני
    background: { default: '#f8fafc', paper: '#ffffff' },
    text: { primary: '#1e293b', secondary: '#64748b' },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    h4: { fontWeight: 800, letterSpacing: '-0.02em' },
  },
  shape: { borderRadius: 16 },
  components: {
    // עיצוב גלובלי שישפיע על הקומפוננטה Login.js מבחוץ
    MuiButton: { styleOverrides: { root: { borderRadius: 12, textTransform: 'none', fontWeight: 600 } } },
    MuiTextField: { styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: 12 } } } },
  }
});

function App() {
  // --- לוגיקה מקורית (State) ---
  const [newTodo, setNewTodo] = useState("");
  const [priority, setPriority] = useState(1);
  const [category, setCategory] = useState("כללי");
  const [dueDate, setDueDate] = useState("");
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [todos, setTodos] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("הכל");
  const [categories, setCategories] = useState(["כללי", "עבודה", "לימודים", "בית", "קניות"]);

  // --- טעינת נתונים (לוגיקה מקורית ללא שינוי) ---
  const loadAppData = useCallback(async () => {
    if (!token) return;
    try {
      const todosData = await service.getTasks();
      const sortedTodos = (todosData || []).sort((a, b) => {
        const isDoneA = a.isComplete ?? a.IsComplete;
        const isDoneB = b.isComplete ?? b.IsComplete;
        if (isDoneA !== isDoneB) return isDoneA ? 1 : -1;
        const dateA = new Date(a.dueDate || a.DueDate || "9999-12-31");
        const dateB = new Date(b.dueDate || b.DueDate || "9999-12-31");
        return dateA - dateB;
      });
      setTodos(sortedTodos);
      const statsData = await service.getStats();
      setStats(statsData);
      const uniqueCats = [...new Set(todosData.map(t => t.categoryName || t.CategoryName || "כללי"))];
      setCategories(prev => [...new Set([...prev, ...uniqueCats])]);
    } catch (error) { console.error(error); }
  }, [token]);

  useEffect(() => { loadAppData(); }, [loadAppData]);

  // --- פונקציות פעולה מקוריות ---
  async function createTodo(e) {
    e.preventDefault();
    if (!newTodo.trim()) return;
    const finalCategory = isAddingNewCategory && newCategoryName.trim() ? newCategoryName : category;
    const taskToSave = {
      Name: newTodo, IsComplete: false, Priority: parseInt(priority),
      CategoryName: finalCategory, DueDate: dueDate ? new Date(dueDate).toISOString() : null
    };
    try {
      await service.addTask(taskToSave);
      setNewTodo(""); setDueDate(""); setPriority(1);
      setIsAddingNewCategory(false); setNewCategoryName("");
      await loadAppData();
    } catch (err) { console.error(err); }
  }

  async function updateCompleted(todo, isComplete) {
    const updatedTask = { ...todo, id: todo.id ?? todo.Id, isComplete, IsComplete: isComplete };
    await service.setCompleted(updatedTask);
    await loadAppData();
  }

  async function deleteTodo(id) {
    await service.deleteTask(id);
    await loadAppData();
  }

  const filteredTodos = useMemo(() => 
    filter === "הכל" ? todos : todos.filter(t => (t.categoryName ?? t.CategoryName) === filter)
  , [todos, filter]);

  // --- מסך כניסה מעוצב (עוטף את ה-Login המקורי שלך) ---
  // 1. הגדרת ה-Theme שתשפיע על כל שדות הקלט בתוך ה-Login
const loginTheme = createTheme({
  palette: {
    primary: { main: '#6366f1' },
  },
  typography: { fontFamily: '"Inter", sans-serif' },
  components: {
    // זה הסוד: אנחנו מגדירים עיצוב גלובלי לתגיות HTML רגילות בתוך ה-Theme
    MuiCssBaseline: {
      styleOverrides: `
        /* עיצוב שדות קלט רגילים (input) */
        input {
          width: 100%;
          padding: 12px 16px;
          margin-bottom: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background-color: #f8fafc;
          font-family: inherit;
          font-size: 14px;
          transition: all 0.2s ease;
          outline: none;
          box-sizing: border-box;
        }
        input:focus {
          border-color: #6366f1;
          background-color: #ffffff;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
        /* עיצוב כפתורים רגילים (button) */
        button {
          width: 100%;
          padding: 12px;
          background-color: #6366f1;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.1s active, background 0.2s;
          margin-top: 8px;
        }
        button:hover {
          background-color: #4f46e5;
        }
        button:active {
          transform: scale(0.98);
        }
      `,
    },
  },
});

if (!token) return (
  <ThemeProvider theme={loginTheme}>
    <CssBaseline /> {/* חשוב מאוד כדי שה-Global Styles יפעלו */}
    <Box sx={{ 
      minHeight: '100vh', display: 'flex', flex: 'warp', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', p: 3 
    }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Card sx={{ maxWidth: 400, width: '100%', borderRadius: 10, boxShadow: '0 30px 60px -12px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
          <Box sx={{ bgcolor: '#6366f1', p: 4, textAlign: 'center', color: 'white' }}>
             <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', m: '0 auto 12px', width: 50, height: 50 }}>
                <AssignmentTurnedInRounded />
             </Avatar>
             <Typography variant="h4" fontWeight="800">Focus.</Typography>
             <Typography variant="body2" sx={{ opacity: 0.8 }}>ניהול זמן חכם מתחיל כאן</Typography>
          </Box>
          <Box sx={{ p: 4 }}>
            {/* כאן ה-Login יוצג כשהאינפוטים שלו כבר מעוצבים לפי ה-CSS הגלובלי שהגדרנו */}
            <Login onLogin={() => setToken(localStorage.getItem("token"))} />
            <Typography variant="caption" sx={{ mt: 4, display: 'block', textAlign: 'center', color: 'text.secondary', opacity: 0.5 }}>
              © 2026 Focus Productivity Suite
            </Typography>
          </Box>
        </Card>
      </motion.div>
    </Box>
  </ThemeProvider>
);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', pb: 10, background: 'linear-gradient(180deg, #f1f5f9 0%, #f8fafc 100%)' }}>
        
        {/* Navbar יוקרתי */}
        <Box sx={{ bgcolor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 1100, borderBottom: '1px solid #e2e8f0', py: 1.5, mb: 4 }}>
          <Container maxWidth="lg">
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h4" sx={{ background: 'linear-gradient(90deg, #4f46e5, #9333ea)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentTurnedInRounded sx={{ color: '#6366f1', fontSize: 35 }} /> Focus.
              </Typography>
              <Button onClick={() => { localStorage.removeItem("token"); setToken(null); }} variant="outlined" color="inherit" startIcon={<Logout />} sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#e2e8f0' }}>
                Logout
              </Button>
            </Stack>
          </Container>
        </Box>

        <Container maxWidth="md">
          
          {/* Dashboard Stats - עיצוב משודרג לכרטיסיות */}
          {stats && (
            <Grid container spacing={3} mb={5}>
              {[
                { label: 'Total Tasks', val: stats.totalTasks ?? stats.TotalTasks, color: '#6366f1', icon: <TrendingUp /> },
                { label: 'Completed', val: stats.completedTasks ?? stats.CompletedTasks, color: '#10b981', icon: <DoneAll /> },
                { label: 'Urgent', val: stats.highPriorityTasks ?? stats.HighPriorityTasks, color: '#ef4444', icon: <ReportProblem /> }
              ].map((s, i) => (
                <Grid item xs={4} key={i}>
                  <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Paper elevation={0} sx={{ 
                      p: 3, borderRadius: 6, border: '1px solid #e2e8f0', textAlign: 'center',
                      background: 'white', position: 'relative', overflow: 'hidden'
                    }}>
                      <Box sx={{ color: s.color, opacity: 0.1, position: 'absolute', right: -10, top: -10, transform: 'scale(2)' }}>
                        {s.icon}
                      </Box>
                      <Typography variant="h4" sx={{ color: s.color, fontWeight: 900, mb: 0.5 }}>{s.val || 0}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2 }}>{s.label}</Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}

          {/* New Task Card */}
          <Card sx={{ borderRadius: 6, mb: 5, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', overflow: 'visible', border: '1px solid #e2e8f0' }}>
            <CardContent sx={{ p: 4 }}>
              <form onSubmit={createTodo}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={7}>
                    <TextField fullWidth placeholder="What's your next goal?" variant="standard" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} InputProps={{ disableUnderline: true, sx: { fontSize: '1.25rem', fontWeight: 600 } }} />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField fullWidth type="date" label="Due Date" InputLabelProps={{ shrink: true }} size="small" value={dueDate} onChange={(e) => setDueDate(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                  </Grid>
                  <Grid item xs={12}><Divider /></Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Priority</InputLabel>
                      <Select value={priority} label="Priority" onChange={(e) => setPriority(e.target.value)} sx={{ borderRadius: 3 }}>
                        <MenuItem value={1}>⚪ Low</MenuItem>
                        <MenuItem value={2}>🟡 Medium</MenuItem>
                        <MenuItem value={3}>🔴 Urgent</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    {!isAddingNewCategory ? (
                      <FormControl fullWidth size="small">
                        <InputLabel>Category</InputLabel>
                        <Select value={category} label="Category" onChange={(e) => e.target.value === "NEW" ? setIsAddingNewCategory(true) : setCategory(e.target.value)} sx={{ borderRadius: 3 }}>
                          {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                          <MenuItem value="NEW" sx={{ color: '#10b981', fontWeight: 'bold' }}>+ New Category</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Stack direction="row" spacing={1}>
                        <TextField fullWidth size="small" placeholder="Name..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} autoFocus />
                        <IconButton onClick={() => setIsAddingNewCategory(false)}><CloseRounded /></IconButton>
                      </Stack>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Button fullWidth variant="contained" type="submit" startIcon={<AddRounded />} sx={{ height: '40px', borderRadius: 3, boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)', textTransform: 'none' }}>
                      Add Task
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>

          {/* Filter Chips */}
          <Stack direction="row" spacing={1} mb={3} sx={{ overflowX: 'auto', py: 1 }}>
            <Chip label="All" onClick={() => setFilter("הכל")} color={filter === "הכל" ? "primary" : "default"} variant={filter === "הכל" ? "filled" : "outlined"} sx={{ fontWeight: 600 }} />
            {categories.map(c => (
              <Chip key={c} label={c} onClick={() => setFilter(c)} color={filter === c ? "primary" : "default"} variant={filter === c ? "filled" : "outlined"} />
            ))}
          </Stack>

          {/* Tasks List */}
          <AnimatePresence mode='popLayout'>
            {filteredTodos.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Box textAlign="center" py={8} sx={{ opacity: 0.5 }}>
                  <AssignmentTurnedInRounded sx={{ fontSize: 60, mb: 2 }} />
                  <Typography variant="h6">No tasks found</Typography>
                </Box>
              </motion.div>
            ) : (
              filteredTodos.map((todo) => {
                const isDone = todo.isComplete ?? todo.IsComplete;
                const dDate = todo.dueDate ?? todo.DueDate;
                const isOverdue = dDate && new Date(dDate) < new Date().setHours(0,0,0,0) && !isDone;

                return (
                  <motion.div key={todo.id ?? todo.Id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
                    <Paper sx={{ 
                      p: 2, mb: 2, borderRadius: 5, border: '1px solid #e2e8f0', 
                      display: 'flex', alignItems: 'center', transition: '0.3s',
                      bgcolor: isOverdue ? '#fff8f8' : 'white',
                      '&:hover': { boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', borderColor: '#cbd5e1' }
                    }}>
                      <Checkbox 
                        checked={isDone} onChange={(e) => updateCompleted(todo, e.target.checked)}
                        icon={<FiberManualRecord sx={{ color: '#e2e8f0' }} />}
                        checkedIcon={<CheckCircle sx={{ color: '#10b981' }} />}
                      />
                      <Box sx={{ flex: 1, ml: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {(todo.priority ?? todo.Priority) === 3 && <PriorityHigh sx={{ color: '#ef4444', fontSize: 18 }} />}
                          {(todo.priority ?? todo.Priority) === 2 && <Star sx={{ color: '#f59e0b', fontSize: 18 }} />}
                          <Typography sx={{ 
                            fontWeight: 600, textDecoration: isDone ? 'line-through' : 'none',
                            color: isDone ? 'text.secondary' : (isOverdue ? '#ef4444' : 'text.primary'),
                          }}>
                            {todo.name ?? todo.Name}
                          </Typography>
                          {isOverdue && <Tooltip title="Overdue"><WarningAmber sx={{ color: '#ef4444', fontSize: 16 }} /></Tooltip>}
                        </Stack>
                        <Stack direction="row" spacing={1} mt={0.5} alignItems="center">
                          <Chip label={todo.categoryName ?? todo.CategoryName} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                          {dDate && (
                            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: isOverdue ? '#ef4444' : 'text.secondary' }}>
                              <EventNote sx={{ fontSize: 14 }} /> {new Date(dDate).toLocaleDateString()}
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                      <IconButton onClick={() => deleteTodo(todo.id ?? todo.Id)} sx={{ color: '#cbd5e1', '&:hover': { color: '#ef4444' } }}>
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </Paper>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;