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
  
  // 🔥 Quiz State
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [tempQ, setTempQ] = useState({ question: '', options: ['','','',''], answer: 0 });
  
  // 🔥 Edit Mode State (เพิ่มใหม่)
  const [isEditing, setIsEditing] = useState(false);

  // UI States
  const [notification, setNotification] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  // Forms
  const [newEmpId, setNewEmpId] = useState('');
  const [newEmpName, setNewEmpName] = useState('');
  const [newCourse, setNewCourse] = useState({
      id: '', title: '', category: 'ทั่วไป', icon: '📺', url: '', duration: ''
  });

  // --- HELPERS ---
  const showToast = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // 🔥 Helper: Add Question to local state
  const addQuestion = () => {
      if(!tempQ.question || tempQ.options.some(o => !o)) return alert("กรอกข้อมูลให้ครบ");
      setQuizQuestions([...quizQuestions, tempQ]);
      setTempQ({ question: '', options: ['','','',''], answer: 0 }); // Reset form
  };

  // 🔥 Helper: Remove Question (เพิ่มใหม่)
  const removeQuestion = (index) => {
      const newQ = [...quizQuestions];
      newQ.splice(index, 1);
      setQuizQuestions(newQ);
  };

  // --- ACTIONS FOR EDITING (เพิ่มใหม่) ---
  const startEditCourse = (course) => {
      setIsEditing(true);
      setNewCourse({
          id: course.id,
          title: course.title,
          category: course.category,
          icon: course.icon,
          url: course.url,
          duration: course.duration
      });
      setQuizQuestions(course.questions || []);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // เลื่อนขึ้นไปหาฟอร์ม
  };

  const cancelEdit = () => {
      setIsEditing(false);
      setNewCourse({ id: '', title: '', category: 'ทั่วไป', icon: '📺', url: '', duration: '' });
      setQuizQuestions([]);
  };

  // --- API ---
  const fetchReport = () => {
    fetch('https://training-api-pvak.onrender.com/api/admin/report')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEmployees(data.data);
          setIsLoading(false);
        }
      })
      .catch(err => console.error("Report Error:", err));
  };

  const fetchCourses = () => {
      fetch('https://training-api-pvak.onrender.com/api/courses?role=admin')
        .then(res => res.json())
        .then(data => {
            if (data.success) setAllCourses(data.data);
        })
        .catch(err => console.error("Course Error:", err));
  };

  // 1. Load Data
  useEffect(() => {
    fetchReport();
    fetchCourses();
  }, []);

  // 2. Toggle Role
  const toggleCourseRole = async (courseId, roleToToggle) => {
    const course = allCourses.find(c => c.id === courseId);
    if (!course) return;

    let newRoles = [...(course.allowedRoles || ['staff', 'contractor'])];
    
    if (newRoles.includes(roleToToggle)) {
        newRoles = newRoles.filter(r => r !== roleToToggle);
    } else {
        newRoles.push(roleToToggle);
    }

    // Optimistic Update
    const updatedCourses = allCourses.map(c => 
        c.id === courseId ? { ...c, allowedRoles: newRoles } : c
    );
    setAllCourses(updatedCourses);

    try {
        await fetch('https://training-api-pvak.onrender.com/api/admin/update-course-roles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseId, allowedRoles: newRoles })
        });
    } catch (err) {
        alert('บันทึกไม่สำเร็จ');
    }
  };

  // --- MAIN ACTIONS ---

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://training-api-pvak.onrender.com/api/admin/add-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: newEmpId.trim(), name: newEmpName.trim() })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', "✅ เพิ่มพนักงานแล้ว");
        setNewEmpId(''); setNewEmpName(''); fetchReport(); 
      } else { showToast('error', data.message); }
    } catch (error) { showToast('error', "Server Error"); }
  };

  const confirmDeleteEmployee = (id, name) => {
    setConfirmModal({
      title: '⚠️ ลบพนักงาน',
      message: `ต้องการลบ "${name}" (${id}) ?\nข้อมูลการเรียนจะหายไปทั้งหมด`,
      action: async () => {
        try {
          const res = await fetch(`https://training-api-pvak.onrender.com/api/admin/delete-employee/${id}`, { method: 'DELETE' });
          if (res.ok) { showToast('success', "🗑️ ลบสำเร็จ"); fetchReport(); }
        } catch (error) { showToast('error', "Server Error"); }
        setConfirmModal(null); 
      }
    });
  };

  // 🔥 Modified Save Course (รองรับทั้ง Create และ Edit)
  const handleSaveCourse = async (e) => {
      e.preventDefault();
      const courseData = { ...newCourse, questions: quizQuestions }; 
      
      // เลือก Endpoint ตามโหมด
      const endpoint = isEditing 
          ? 'https://training-api-pvak.onrender.com/api/admin/edit-course'
          : 'https://training-api-pvak.onrender.com/api/admin/add-course';

      try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(courseData)
        });
        const data = await res.json();
        if (data.success) {
            showToast('success', isEditing ? "✅ แก้ไขข้อมูลเรียบร้อย" : "✅ เพิ่มคอร์สสำเร็จ");
            cancelEdit(); // Reset form & Exit edit mode
            fetchCourses();
        } else { showToast('error', data.message); }
      } catch (err) { showToast('error', "Server Error"); }
  };

  const confirmDeleteCourse = (id, title) => {
      setConfirmModal({
          title: '🎬 ลบคอร์สเรียน',
          message: `ยืนยันลบวิชา "${title}" (${id}) ?`,
          action: async () => {
              try {
                  await fetch(`https://training-api-pvak.onrender.com/api/admin/delete-course/${id}`, { method: 'DELETE' });
                  showToast('success', "ลบเรียบร้อย"); fetchCourses();
              } catch(err) { showToast('error', "Server Error"); }
              setConfirmModal(null);
          }
      });
  };

  const confirmReset = (employeeId, employeeName) => {
    setConfirmModal({
      title: '🔄 รีเซ็ตผลการเรียน',
      message: `ล้างประวัติของ "${employeeName}" ?`,
      action: async () => {
        try {
          await fetch('https://training-api-pvak.onrender.com/api/admin/reset-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeId })
          });
          showToast('success', "รีเซ็ตแล้ว"); fetchReport();
        } catch (error) { console.error(error); }
        setConfirmModal(null);
      }
    });
  };

  const confirmResetAll = () => {
    setConfirmModal({
      title: '🧨 ล้างข้อมูลระบบทั้งหมด',
      message: '⚠️ คำเตือน: ประวัติการเรียนของ "ทุกคน" จะหายไป\nยืนยันหรือไม่?',
      action: async () => {
        try {
          const res = await fetch('https://training-api-pvak.onrender.com/api/reset-all-progress', { method: 'DELETE' });
          if (res.ok) { showToast('success', "ล้างระบบเรียบร้อย"); fetchReport(); }
        } catch (err) { showToast('error', "Server Error"); }
        setConfirmModal(null);
      }
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=900');
    if (!printWindow) return alert("Pop-up ถูกบล็อก!");
    const tableContent = document.querySelector('.table-wrapper')?.outerHTML || "<h1>ไม่พบข้อมูลตาราง</h1>";
    printWindow.document.write(`<html><head><title>Report</title><style>table{width:100%;border-collapse:collapse;}th,td{border:1px solid #000;padding:5px;text-align:center;}</style></head><body>${tableContent}<script>setTimeout(()=>{window.print();},500);</script></body></html>`);
    printWindow.document.close();
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <nav className="navbar">
        <div className="brand-logo">📊 Admin Panel</div>
        <button className="btn-logout" onClick={onLogout}>ออกจากระบบ</button>
      </nav>

      {/* Toast */}
      {notification && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, background: notification.type === 'success' ? '#10b981' : '#ef4444', color: 'white', padding: '12px 24px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontWeight: '600' }}>
          {notification.message}
        </div>
      )}

      {/* Modal */}
      {confirmModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ marginTop: 0 }}>{confirmModal.title}</h3>
            <p style={{ whiteSpace: 'pre-line', marginBottom: '20px' }}>{confirmModal.message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setConfirmModal(null)} className="btn" style={{background:'white', border:'1px solid #d1d5db'}}>ยกเลิก</button>
              <button onClick={confirmModal.action} className="btn" style={{background:'#ef4444', color:'white'}}>ยืนยัน</button>
            </div>
          </div>
        </div>
      )}

      <div className="main-container">
        {/* Tab Navigation */}
        <div className="tab-menu">
            {['report', 'manage', 'courses'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`tab-btn ${activeTab === tab ? 'active' : ''}`}>
                    {tab === 'report' ? '📋 สรุปผล' : tab === 'manage' ? '👥 จัดการคน' : '🎬 จัดการคอร์ส'}
                </button>
            ))}
        </div>

        {/* --- TAB 1: REPORT --- */}
        {activeTab === 'report' && (
          <>
             <div className="toolbar">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input type="text" className="search-input" placeholder="ค้นหา..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="toolbar-actions">
                    <button onClick={handlePrint} className="btn btn-print">🖨️ Print</button>
                    <button onClick={confirmResetAll} className="btn btn-danger">🗑️ Reset All</button>
                </div>
             </div>

             <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th className="sticky-col" style={{minWidth: '250px'}}>รายชื่อพนักงาน ({filteredEmployees.length})</th>
                      {allCourses.map(c => (
                        <th key={c.id} style={{textAlign:'center', minWidth:'80px'}}>
                           <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                              <span style={{fontSize:'1.5rem'}}>{c.icon || '📺'}</span>
                              <span style={{fontSize:'0.75rem', color:'#64748b'}}>{c.id}</span>
                           </div>
                        </th>
                      ))}
                      <th style={{textAlign:'center', minWidth:'80px'}}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                        <tr><td colSpan={allCourses.length + 2} style={{padding:'3rem', textAlign:'center'}}>⏳ กำลังโหลดข้อมูล...</td></tr>
                    ) : filteredEmployees.map(emp => (
                      <tr key={emp.id}>
                        <td className="sticky-col">
                          <div style={{fontWeight:'600', color:'#334155'}}>{emp.name}</div>
                          <div style={{fontSize:'0.75rem', color: emp.role === 'contractor' ? '#d97706' : '#94a3b8'}}>
                              {emp.role === 'contractor' ? `ผู้รับเหมา: ${emp.company || '-'}` : `ID: ${emp.id}`}
                          </div>
                          <div style={{fontSize:'0.7rem', color:'#cbd5e1'}}>
                              {emp.lastSeen === '-' ? '' : `เข้าล่าสุด: ${emp.lastSeen}`}
                          </div>
                        </td>
                        {allCourses.map(c => {
                            const p = emp.progress?.[c.id];
                            // 🔥 ฟังก์ชันแปลงวันที่ (ปรับปรุงให้รองรับค่าว่าง)
                            const getThaiDate = (dateString) => {
                                if (!dateString) return "ไม่ระบุวันที่"; 
                                try {
                                    const date = new Date(dateString);
                                    if (isNaN(date.getTime())) return "วันที่ไม่ถูกต้อง";
                                    return date.toLocaleDateString('th-TH', {
                                        day: 'numeric', month: 'short', year: '2-digit',
                                        hour: '2-digit', minute: '2-digit', hour12: false
                                    });
                                } catch (e) { return "Error Date"; }
                            };
                            
                            let tooltipText = "";
                            if (!p) {
                                tooltipText = `วิชา ${c.id}: ยังไม่เริ่มเรียน`;
                            } else if (p.isCompleted) {
                                tooltipText = `✅ ผ่านแล้ว\n📅 เมื่อ: ${getThaiDate(p.lastUpdated)}`;
                            } else {
                                tooltipText = `🟡 กำลังเรียน (ได้ ${Math.floor(p.lastWatched || 0)} วินาที)\n📅 ล่าสุด: ${getThaiDate(p.lastUpdated)}`;
                            }
                            return (
                                <td key={c.id}>
                                    <div className="status-cell">
                                        {!p ? (
                                          <div className="badge-dot badge-none" title={tooltipText}></div>
                                        ) : p.isCompleted ? (
                                          <div title={tooltipText} style={{color:'#10b981', display:'flex', alignItems:'center', justifyContent:'center', cursor:'help', width:'100%', height:'100%'}}>
                                              <span style={{fontSize:'1.2rem', fontWeight:'bold'}}>✓</span>
                                          </div>
                                        ) : (
                                          <div className="badge-dot badge-learning" title={tooltipText} style={{cursor:'help'}}></div>
                                        )}
                                    </div>
                                </td>
                            )
                        })}
                        <td>
                          <button className="btn-reset" onClick={() => confirmReset(emp.id, emp.name)} title="รีเซ็ตผลการเรียน">
                            🔄
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </>
        )}

        {/* --- TAB 2: MANAGE EMPLOYEES --- */}
        {activeTab === 'manage' && (
          <div className="manage-grid">
              <div className="card" style={{height:'fit-content'}}>
                  <h3>➕ เพิ่มพนักงาน</h3>
                  <form onSubmit={handleAddEmployee}>
                      <div style={{marginBottom:'10px'}}>
                          <label>รหัสพนักงาน</label>
                          <input className="input-field" value={newEmpId} onChange={e => setNewEmpId(e.target.value)} required />
                      </div>
                      <div style={{marginBottom:'15px'}}>
                          <label>ชื่อ-นามสกุล</label>
                          <input className="input-field" value={newEmpName} onChange={e => setNewEmpName(e.target.value)} required />
                      </div>
                      <button type="submit" className="btn btn-primary" style={{width:'100%'}}>บันทึก</button>
                  </form>
              </div>
              <div className="card">
                  <h3>🗑️ รายชื่อในระบบ</h3>
                  <input className="input-field" placeholder="ค้นหา..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  <div style={{maxHeight:'500px', overflowY:'auto', marginTop:'10px'}}>
                    <table style={{width:'100%'}}>
                        <thead><tr style={{textAlign:'left'}}><th>รหัส</th><th>ชื่อ</th><th>ลบ</th></tr></thead>
                        <tbody>
                            {filteredEmployees.map(emp => (
                                <tr key={emp.id} style={{borderBottom:'1px solid #eee'}}>
                                    <td style={{padding:'8px'}}>{emp.id}</td>
                                    <td>{emp.name}</td>
                                    <td><button onClick={() => confirmDeleteEmployee(emp.id, emp.name)} style={{color:'red', border:'none', background:'none', cursor:'pointer'}}>ลบ</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
              </div>
          </div>
        )}

        {/* --- TAB 3: MANAGE COURSES --- */}
        {activeTab === 'courses' && (
            // ✅ เอา style ออก แล้วให้ CSS ใน App.css จัดการแทน
            <div className="manage-grid">
              <div className="sticky-form-card">
                <h3 style={{color: isEditing ? '#f59e0b' : '#333', marginTop: 0}}>
                  {isEditing ? `✏️ แก้ไขวิชา: ${newCourse.id}` : '➕ เพิ่มหลักสูตรใหม่'}
                </h3>
                  
                  <form onSubmit={handleSaveCourse}>
                      {/* ... (เนื้อหาฟอร์มเหมือนเดิมทุกอย่าง) ... */}
                      <div style={{display:'flex', flexWrap: 'wrap', gap:'10px'}}>
                        <div style={{flex: '1 1 150px'}}>
                          <label>รหัสวิชา</label>
                          <input className="input-field" value={newCourse.id} onChange={e => setNewCourse({...newCourse, id: e.target.value})} required disabled={isEditing} />
                        </div>
                        <div style={{flex: '1 1 150px'}}>
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

                      {/* Quiz Builder */}
                      <div style={{borderTop:'1px solid #eee', paddingTop:'15px'}}>
                          <h4>📝 สร้างข้อสอบ ({quizQuestions.length} ข้อ)</h4>
                          
                          {quizQuestions.length > 0 && (
                              <div style={{background:'#f9fafb', padding:'10px', borderRadius:'8px', marginBottom:'15px', maxHeight:'200px', overflowY:'auto'}}>
                                  {quizQuestions.map((q, i) => (
                                      <div key={i} style={{fontSize:'0.85rem', marginBottom:'5px', borderBottom:'1px solid #eee', paddingBottom:'5px', position:'relative'}}>
                                          <b>{i+1}. {q.question}</b> <br/>
                                          <span style={{color:'#10b981'}}>เฉลย: {q.options[q.answer]}</span>
                                          <button type="button" onClick={() => removeQuestion(i)} style={{position:'absolute', right:0, top:0, border:'none', background:'none', color:'red', cursor:'pointer'}}>🗑️</button>
                                      </div>
                                  ))}
                              </div>
                          )}

                          <div style={{background:'#f0f9ff', padding:'10px', borderRadius:'8px', border:'1px dashed #bae6fd'}}>
                              <input placeholder="โจทย์คำถาม..." value={tempQ.question} onChange={e=>setTempQ({...tempQ, question: e.target.value})} className="input-field" style={{marginBottom:'5px'}} />
                              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px'}}>
                                  {tempQ.options.map((opt, idx) => (
                                      <div key={idx} style={{display:'flex', alignItems:'center', background:'white', borderRadius:'4px', padding:'0 5px'}}>
                                          <input type="radio" name="correct" checked={tempQ.answer === idx} onChange={()=>setTempQ({...tempQ, answer: idx})} style={{marginRight:'5px'}} />
                                          <input placeholder={`ตัวเลือก ${idx+1}`} value={opt} onChange={e=>{
                                              const newOpts = [...tempQ.options];
                                              newOpts[idx] = e.target.value;
                                              setTempQ({...tempQ, options: newOpts});
                                          }} style={{border:'none', width:'100%', outline:'none', fontSize:'0.85rem'}} />
                                      </div>
                                  ))}
                              </div>
                              <button type="button" onClick={addQuestion} className="btn" style={{marginTop:'10px', width:'100%', background:'#0ea5e9', color:'white', fontSize:'0.8rem'}}>+ เพิ่มข้อนี้</button>
                          </div>
                      </div>

                      <div style={{marginTop: '20px'}}>
                          <button type="submit" className="btn btn-primary" style={{width: '100%', background: isEditing ? '#f59e0b' : '#4f46e5'}}>
                              {isEditing ? '💾 บันทึกการแก้ไข' : '💾 บันทึกคอร์สเรียน'}
                          </button>
                      </div>
                  </form>
              </div>

              {/* 2. Course List Table */}
              <div className="table-card-container">
                <div className="card" style={{margin: 0}}>
                  <h3>🎬 รายชื่อวิชาทั้งหมด</h3>
                  <div className="table-wrapper">
                    <table style={{width: '100%', minWidth: '600px'}}> {/* กำหนด minWidth ตารางเพื่อกันตัวอักษรซ้อนกัน */}
                      <thead>
                        <tr>
                          <th>ชื่อวิชา</th>
                          <th>หมวดหมู่</th>
                          <th style={{textAlign:'center'}}>Staff</th>
                          <th style={{textAlign:'center'}}>Sub</th>
                          <th style={{textAlign:'center'}}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                            {allCourses.map(course => (
                              <tr key={course.id}>
                                    <td>{course.title}</td>
                                    <td>{course.category}</td>
                                    <td style={{textAlign:'center'}}><input type="checkbox" checked={course.allowedRoles?.includes('staff')} readOnly /></td>
                                    <td style={{textAlign:'center'}}><input type="checkbox" checked={course.allowedRoles?.includes('contractor')} readOnly /></td>
                                    <td style={{textAlign:'center'}}>
                                        <button onClick={() => startEditCourse(course)}>✏️</button>
                                                <button onClick={() => confirmDeleteCourse(course.id, course.title)} style={{background:'#fee2e2', border:'none', borderRadius:'4px', cursor:'pointer', padding:'4px'}}>🗑️</button>
                                            </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
            </div>
          )}

      </div>
    </div>
  );
};

export default Dashboard;