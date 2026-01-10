// src/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import './App.css';

const Dashboard = ({ user, activeTab: initialTab, onSelectCourse, onLogout }) => {

  // --- STATE ---
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(initialTab || 'summary');
  const [allCourses, setAllCourses] = useState([]);
  
  // 🔥 New Quiz State (Make sure these are defined)
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [tempQ, setTempQ] = useState({ question: '', options: ['','','',''], answer: 0 });
  
  // UI States
  const [notification, setNotification] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  // Forms
  const [newEmpId, setNewEmpId] = useState('');
  const [newEmpName, setNewEmpName] = useState('');
  const [newCourse, setNewCourse] = useState({
      id: '', title: '', category: 'ทั่วไป', icon: '📺', url: '', duration: ''
  });

  // 🔥 Helper function for adding questions
  const addQuestion = () => {
      if(!tempQ.question || tempQ.options.some(o => !o)) return alert("กรอกข้อมูลให้ครบ");
      setQuizQuestions([...quizQuestions, tempQ]);
      setTempQ({ question: '', options: ['','','',''], answer: 0 }); // Reset form
  };

  // ... (HELPERS and API functions remain the same) ...
  const showToast = (type, message) => { /* ... */ };
  const fetchReport = () => { /* ... */ };
  const fetchCourses = () => { /* ... */ };
  const toggleCourseRole = async (courseId, roleToToggle) => { /* ... */ };
  
  useEffect(() => { /* ... */ }, []);
  useEffect(() => { /* ... */ }, [activeTab]);

  // --- ACTIONS ---
  const handleAddEmployee = async (e) => { /* ... */ };
  const confirmDeleteEmployee = (id, name) => { /* ... */ };

  const handleAddCourse = async (e) => {
      e.preventDefault();
      // 🔥 Combine course info with questions
      const courseData = { ...newCourse, questions: quizQuestions }; 
      try {
        const res = await fetch('https://training-api-pvak.onrender.com/api/admin/add-course', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(courseData) // Send courseData instead of newCourse
        });
        const data = await res.json();
        if (data.success) {
            showToast('success', "✅ เพิ่มคอร์สสำเร็จ");
            setNewCourse({ id: '', title: '', category: 'ทั่วไป', icon: '📺', url: '', duration: '' });
            setQuizQuestions([]); // Clear questions after submit
            fetchCourses();
        } else { showToast('error', data.message); }
      } catch (err) { showToast('error', "Server Error"); }
  };

  const confirmDeleteCourse = (id, title) => { /* ... */ };
  const confirmReset = (employeeId, employeeName) => { /* ... */ };
  const confirmResetAll = () => { /* ... */ };
  const handlePrint = () => { /* ... */ };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* ... (Navbar, Toast, Modal, Tab Navigation) ... */}
      <nav className="navbar">...</nav>
      {notification && <div>...</div>}
      {confirmModal && <div>...</div>}
      
      <div className="main-container">
        <div className="tab-menu">...</div>

        {/* ... (Report Tab & Manage Employee Tab) ... */}
        {activeTab === 'report' && ( <>...</> )}
        {activeTab === 'manage' && ( <div>...</div> )}

        {/* --- TAB 3: MANAGE COURSES --- */}
        {activeTab === 'courses' && (
         <div className="manage-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            
            {/* 1. Form Create Course + Quiz */}
            <div className="card" style={{height:'fit-content'}}>
                <h3>➕ เพิ่มหลักสูตรใหม่</h3>
                <form onSubmit={handleAddCourse}>
                    {/* ... (Existing inputs for ID, Category, Title, URL, Duration) ... */}
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                        <div>
                            <label>รหัสวิชา</label>
                            <input className="input-field" value={newCourse.id} onChange={e => setNewCourse({...newCourse, id: e.target.value})} required placeholder="Ex. C01" />
                        </div>
                        <div>
                            <label>หมวดหมู่</label>
                            <input className="input-field" value={newCourse.category} onChange={e => setNewCourse({...newCourse, category: e.target.value})} required />
                        </div>
                    </div>
                    <div style={{marginTop:'10px'}}>
                        <label>ชื่อวิชา</label>
                        <input className="input-field" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} required />
                    </div>
                    <div style={{marginTop:'10px'}}>
                        <label>YouTube URL</label>
                        <input className="input-field" value={newCourse.url} onChange={e => setNewCourse({...newCourse, url: e.target.value})} required />
                    </div>
                    <div style={{marginTop:'10px', marginBottom:'20px'}}>
                        <label>ความยาว (นาที)</label>
                        <input className="input-field" value={newCourse.duration} onChange={e => setNewCourse({...newCourse, duration: e.target.value})} required placeholder="Ex. 15 นาที" />
                    </div>

                    {/* 🔥🔥 INSERT QUIZ BUILDER HERE 🔥🔥 */}
                    <div style={{borderTop:'1px solid #eee', paddingTop:'15px'}}>
                        <h4>📝 สร้างข้อสอบ (ถ้ามี)</h4>
                        
                        {/* List of added questions */}
                        {quizQuestions.length > 0 && (
                            <div style={{background:'#f9fafb', padding:'10px', borderRadius:'8px', marginBottom:'15px', maxHeight:'150px', overflowY:'auto'}}>
                                {quizQuestions.map((q, i) => (
                                    <div key={i} style={{fontSize:'0.85rem', marginBottom:'5px', borderBottom:'1px solid #eee', paddingBottom:'5px'}}>
                                        <b>{i+1}. {q.question}</b> <br/>
                                        <span style={{color:'#10b981'}}>เฉลย: {q.options[q.answer]}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add new question form */}
                        <div style={{background:'#f0f9ff', padding:'10px', borderRadius:'8px', border:'1px dashed #bae6fd'}}>
                            <input 
                                placeholder="โจทย์คำถาม..." 
                                value={tempQ.question} 
                                onChange={e=>setTempQ({...tempQ, question: e.target.value})} 
                                className="input-field" 
                                style={{marginBottom:'5px'}}
                            />
                            
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px'}}>
                                {tempQ.options.map((opt, idx) => (
                                    <div key={idx} style={{display:'flex', alignItems:'center', background:'white', borderRadius:'4px', padding:'0 5px'}}>
                                        <input 
                                            type="radio" 
                                            name="correct" 
                                            checked={tempQ.answer === idx} 
                                            onChange={()=>setTempQ({...tempQ, answer: idx})} 
                                            style={{marginRight:'5px'}}
                                        />
                                        <input 
                                            placeholder={`ตัวเลือก ${idx+1}`} 
                                            value={opt} 
                                            onChange={e=>{
                                                const newOpts = [...tempQ.options];
                                                newOpts[idx] = e.target.value;
                                                setTempQ({...tempQ, options: newOpts});
                                            }} 
                                            style={{border:'none', width:'100%', outline:'none', fontSize:'0.85rem'}}
                                        />
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={addQuestion} className="btn" style={{marginTop:'10px', width:'100%', background:'#0ea5e9', color:'white', fontSize:'0.8rem'}}>+ เพิ่มข้อนี้เข้าคอร์ส</button>
                        </div>
                    </div>
                    {/* 🔥🔥 END QUIZ BUILDER 🔥🔥 */}

                    <button type="submit" className="btn btn-primary" style={{width:'100%', marginTop:'20px', padding:'12px'}}>💾 บันทึกคอร์สเรียน</button>
                </form>
            </div>

            {/* 2. Course List Table (Existing code) */}
            <div className="card">
               <h3>🎬 รายชื่อวิชาทั้งหมด</h3>
               <div className="table-wrapper">
                   {/* ... (Existing table code) ... */}
               </div>
            </div>
         </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;