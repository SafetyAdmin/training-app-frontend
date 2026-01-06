// src/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import './App.css';

const Dashboard = ({ onLogout }) => {
  // --- STATE หลัก ---
  const [employees, setEmployees] = useState([]);
  const [allCourses, setAllCourses] = useState([]); // เก็บรายชื่อคอร์สจาก DB
  const [isLoading, setIsLoading] = useState(true);
  
  // --- STATE UI ---
  const [activeTab, setActiveTab] = useState('report'); // 'report' | 'manage' | 'courses'
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null); // Toast Message
  const [confirmModal, setConfirmModal] = useState(null); // Custom Modal

  // --- STATE FORMS ---
  const [newEmpId, setNewEmpId] = useState('');
  const [newEmpName, setNewEmpName] = useState('');
  const [newCourse, setNewCourse] = useState({
      id: '', title: '', category: 'ทั่วไป', icon: '📺', url: '', duration: ''
  });

  // --- HELPER FUNCTIONS ---
  const showToast = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- API FETCHING ---

  // 1. ดึงข้อมูล Report (พนักงาน + ผลการเรียน)
  const fetchReport = () => {
    fetch('https://training-api-pvak.onrender.com/api/admin/report')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEmployees(data.data);
          setIsLoading(false);
        }
      })
      .catch(err => console.error("Error fetching report:", err));
  };

  // 2. ดึงรายชื่อคอร์ส (Course List)
  const fetchCourses = () => {
      fetch('https://training-api-pvak.onrender.com/api/courses')
        .then(res => res.json())
        .then(data => {
            if (data.success) setAllCourses(data.data);
        })
        .catch(err => console.error("Error fetching courses:", err));
  };

  // Initial Load & Interval
  useEffect(() => {
    fetchReport();
    fetchCourses();

    // Auto Refresh เฉพาะหน้า Report
    if (activeTab === 'report') {
      const interval = setInterval(() => {
          fetchReport();
          fetchCourses(); // อัปเดตคอร์สด้วยเผื่อมีการเพิ่มลด
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);


  // --- ACTIONS: EMPLOYEES ---

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmpId || !newEmpName) return showToast('error', "กรุณากรอกข้อมูลให้ครบ");

    try {
      const res = await fetch('https://training-api-pvak.onrender.com/api/admin/add-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: newEmpId.trim(), name: newEmpName.trim() })
      });
      const data = await res.json();
      
      if (data.success) {
        showToast('success', "✅ เพิ่มพนักงานเรียบร้อย");
        setNewEmpId('');
        setNewEmpName('');
        fetchReport(); 
      } else {
        showToast('error', "❌ " + data.message);
      }
    } catch (error) { showToast('error', "Server Error"); }
  };

  const confirmDeleteEmployee = (id, name) => {
    setConfirmModal({
      title: '⚠️ ยืนยันการลบพนักงาน',
      message: `คุณต้องการลบ "${name}" (${id}) ใช่หรือไม่?\nข้อมูลการเรียนทั้งหมดจะหายไป`,
      action: async () => {
        try {
          // ✅ ใช้ URL Parameter (แก้ปัญหา Body ใน Delete)
          const res = await fetch(`https://training-api-pvak.onrender.com/api/admin/delete-employee/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          });
          if (res.ok) {
            showToast('success', "🗑️ ลบข้อมูลเรียบร้อย");
            fetchReport();
          } else {
            showToast('error', "ลบไม่สำเร็จ");
          }
        } catch (error) { showToast('error', "Server Error"); }
        setConfirmModal(null); 
      }
    });
  };

  // --- ACTIONS: COURSES ---

  const handleAddCourse = async (e) => {
      e.preventDefault();
      try {
        const res = await fetch('https://training-api-pvak.onrender.com/api/admin/add-course', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(newCourse)
        });
        const data = await res.json();
        if (data.success) {
            showToast('success', "✅ เพิ่มคอร์สสำเร็จ");
            setNewCourse({ id: '', title: '', category: 'ทั่วไป', icon: '📺', url: '', duration: '' }); // Reset Form
            fetchCourses();
        } else {
            showToast('error', "❌ " + data.message);
        }
      } catch (err) { showToast('error', "Server Error"); }
  };

  const confirmDeleteCourse = (id, title) => {
      setConfirmModal({
          title: '🎬 ยืนยันลบคอร์สเรียน',
          message: `ต้องการลบวิชา "${title}" (${id}) หรือไม่?`,
          action: async () => {
              try {
                  const res = await fetch(`https://training-api-pvak.onrender.com/api/admin/delete-course/${id}`, { method: 'DELETE' });
                  if(res.ok) {
                      showToast('success', "ลบคอร์สเรียบร้อย");
                      fetchCourses();
                  }
              } catch(err) { showToast('error', "Server Error"); }
              setConfirmModal(null);
          }
      });
  };

  // --- ACTIONS: RESET PROGRESS ---

  const confirmReset = (employeeId, employeeName) => {
    setConfirmModal({
      title: '🔄 ยืนยันรีเซ็ตผลการเรียน',
      message: `ล้างประวัติการเรียนของ "${employeeName}" ทั้งหมด?`,
      action: async () => {
        try {
          await fetch('https://training-api-pvak.onrender.com/api/admin/reset-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeId })
          });
          showToast('success', "รีเซ็ตข้อมูลเรียบร้อย");
          fetchReport();
        } catch (error) { console.error(error); }
        setConfirmModal(null);
      }
    });
  };

  const confirmResetAll = () => {
    setConfirmModal({
      title: '🧨 ล้างข้อมูลระบบทั้งหมด?',
      message: '⚠️ คำเตือน: ประวัติการเรียนของพนักงาน "ทุกคน" จะหายไป\nยืนยันที่จะทำรายการหรือไม่?',
      action: async () => {
        try {
          const res = await fetch('https://training-api-pvak.onrender.com/api/reset-all-progress', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          });
          if (res.ok) {
            showToast('success', "🗑️ ล้างระบบเรียบร้อยแล้ว");
            fetchReport();
          }
        } catch (err) { showToast('error', "Server Error"); }
        setConfirmModal(null);
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // --- FILTER LOGIC ---
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="brand-logo">📊 Admin Control Panel</div>
        <div className="user-profile">
          <button className="btn-logout" onClick={onLogout}>ออกจากระบบ</button>
        </div>
      </nav>

      {/* ✅ Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: notification.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white', padding: '15px 25px', borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', animation: 'fadeIn 0.3s', fontWeight: 'bold'
        }}>
          {notification.message}
        </div>
      )}

      {/* ✅ Custom Modal Overlay */}
      {confirmModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', padding: '25px', borderRadius: '12px',
            maxWidth: '400px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginTop: 0, color: '#1f2937' }}>{confirmModal.title}</h3>
            <p style={{ color: '#4b5563', whiteSpace: 'pre-line', lineHeight: '1.5' }}>{confirmModal.message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={() => setConfirmModal(null)}
                style={{
                  background: 'white', border: '1px solid #d1d5db', padding: '8px 16px',
                  borderRadius: '6px', cursor: 'pointer', color: '#374151'
                }}
              >
                ยกเลิก
              </button>
              <button 
                onClick={confirmModal.action}
                style={{
                  background: '#ef4444', border: 'none', padding: '8px 16px',
                  borderRadius: '6px', cursor: 'pointer', color: 'white', fontWeight: 'bold'
                }}
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="main-container">
        
        {/* Tab Menu */}
        <div style={{ display:'flex', gap:'10px', marginBottom:'20px', borderBottom:'1px solid #e5e7eb', paddingBottom:'10px' }}>
            <button 
                onClick={() => setActiveTab('report')}
                style={{
                    padding:'10px 20px', borderRadius:'8px', border:'none', cursor:'pointer', fontWeight:'bold',
                    background: activeTab === 'report' ? '#4f46e5' : 'transparent',
                    color: activeTab === 'report' ? 'white' : '#6b7280'
                }}
            >
                📋 สรุปผล (Report)
            </button>
            <button 
                onClick={() => setActiveTab('manage')}
                style={{
                    padding:'10px 20px', borderRadius:'8px', border:'none', cursor:'pointer', fontWeight:'bold',
                    background: activeTab === 'manage' ? '#4f46e5' : 'transparent',
                    color: activeTab === 'manage' ? 'white' : '#6b7280'
                }}
            >
                👥 พนักงาน (Users)
            </button>
            <button 
                onClick={() => setActiveTab('courses')}
                style={{
                    padding:'10px 20px', borderRadius:'8px', border:'none', cursor:'pointer', fontWeight:'bold',
                    background: activeTab === 'courses' ? '#4f46e5' : 'transparent',
                    color: activeTab === 'courses' ? 'white' : '#6b7280'
                }}
            >
                🎬 คอร์สเรียน (Courses)
            </button>
        </div>

        {/* --- TAB 1: REPORT --- */}
        {activeTab === 'report' && (
          <>
             <div className="toolbar">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input 
                        type="text" className="search-input" placeholder="ค้นหาชื่อ หรือ รหัส..." 
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                    <button 
                      onClick={handlePrint}
                      style={{
                        background:'#3b82f6', color:'white', border:'none', padding:'8px 16px', 
                        borderRadius:'6px', cursor:'pointer', fontWeight:'bold'
                      }}
                    >
                      🖨️ Print
                    </button>

                    <button 
                      onClick={confirmResetAll}
                      style={{
                        background:'#ef4444', color:'white', border:'none', padding:'8px 16px', 
                        borderRadius:'6px', cursor:'pointer', fontWeight:'bold'
                      }}
                    >
                      🗑️ รีเซ็ตระบบ (All)
                    </button>
                </div>
             </div>

             <div className="table-container">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ minWidth: '1000px' }}>
                    <thead>
                        <tr>
                        <th style={{width:'10%'}}>รหัส</th>
                        <th style={{width:'20%', textAlign:'left'}}>พนักงาน</th>
                        {/* 🔥 Dynamic Table Header from DB */}
                        {allCourses.map(c => (
                            <th key={c.id} style={{textAlign:'center', fontSize:'0.85rem', maxWidth:'150px'}}>
                                {c.title.length > 20 ? c.title.substring(0, 20)+'...' : c.title}
                            </th>
                        ))}
                        <th style={{textAlign:'center'}}>รีเซ็ต</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={allCourses.length + 3} style={{padding:'2rem', textAlign:'center'}}>⏳ กำลังโหลด...</td></tr>
                        ) : filteredEmployees.map(emp => (
                        <tr key={emp.id}>
                            <td style={{textAlign:'center', fontWeight:'bold', color:'#64748b'}}>{emp.id}</td>
                            <td>{emp.name} <br/><span style={{fontSize:'0.8em', color:'#aaa'}}>เข้าล่าสุด: {emp.lastSeen}</span></td>
                            
                            {/* 🔥 Dynamic Progress Data */}
                            {allCourses.map(c => {
                                const p = emp.progress?.[c.id];
                                return (
                                    <td key={c.id} style={{textAlign:'center'}}>
                                        {!p ? <span className="status-badge status-none">⚪</span> :
                                         p.isCompleted ? <span className="status-badge status-completed">✅ ผ่าน</span> :
                                         <span className="status-badge status-pending">🟡 เรียนอยู่</span>}
                                    </td>
                                )
                            })}
                            
                            <td style={{textAlign:'center'}}>
                                <button className="btn-reset" onClick={() => confirmReset(emp.id, emp.name)}>🔄</button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
             </div>
          </>
        )}

        {/* --- TAB 2: MANAGE EMPLOYEES --- */}
        {activeTab === 'manage' && (
          <div style={{ display:'grid', gridTemplateColumns: '1fr 2fr', gap:'20px' }}>
              
              <div className="card" style={{ background:'white', padding:'20px', borderRadius:'12px', height:'fit-content' }}>
                  <h3 style={{marginTop:0}}>➕ เพิ่มพนักงานใหม่</h3>
                  <form onSubmit={handleAddEmployee}>
                      <div style={{marginBottom:'15px'}}>
                          <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>รหัสพนักงาน</label>
                          <input 
                            type="text" className="input-field" placeholder="เช่น EMP999" 
                            value={newEmpId} onChange={e => setNewEmpId(e.target.value)} required
                          />
                      </div>
                      <div style={{marginBottom:'15px'}}>
                          <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>ชื่อ-นามสกุล</label>
                          <input 
                            type="text" className="input-field" placeholder="เช่น นายรักงาน ขยันยิ่ง" 
                            value={newEmpName} onChange={e => setNewEmpName(e.target.value)} required
                          />
                      </div>
                      <button type="submit" className="btn btn-primary" style={{width:'100%'}}>บันทึกข้อมูล</button>
                  </form>
              </div>

              <div className="card" style={{ background:'white', padding:'20px', borderRadius:'12px' }}>
                  <h3 style={{marginTop:0}}>🗑️ รายชื่อพนักงาน ({filteredEmployees.length})</h3>
                  <input 
                    type="text" className="input-field" placeholder="ค้นหาเพื่อลบ..." 
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    style={{marginBottom:'10px'}}
                  />
                  
                  <div style={{maxHeight:'500px', overflowY:'auto'}}>
                    <table style={{width:'100%', borderCollapse:'collapse'}}>
                        <thead>
                            <tr style={{background:'#f3f4f6', textAlign:'left'}}>
                                <th style={{padding:'10px'}}>รหัส</th>
                                <th style={{padding:'10px'}}>ชื่อ</th>
                                <th style={{padding:'10px', textAlign:'center'}}>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map(emp => (
                                <tr key={emp.id} style={{borderBottom:'1px solid #eee'}}>
                                    <td style={{padding:'10px'}}>{emp.id}</td>
                                    <td style={{padding:'10px'}}>{emp.name}</td>
                                    <td style={{padding:'10px', textAlign:'center'}}>
                                        <button 
                                            onClick={() => confirmDeleteEmployee(emp.id, emp.name)}
                                            style={{
                                                background:'#fee2e2', color:'#ef4444', border:'none', 
                                                padding:'5px 10px', borderRadius:'6px', cursor:'pointer'
                                            }}
                                        >
                                            ลบออก
                                        </button>
                                    </td>
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
            <div style={{display:'grid', gridTemplateColumns:'1fr 2fr', gap:'20px'}}>
                {/* Form เพิ่มคอร์ส */}
                <div className="card" style={{ background:'white', padding:'20px', borderRadius:'12px', height:'fit-content' }}>
                    <h3 style={{marginTop:0}}>➕ เพิ่มคอร์สวิดีโอ</h3>
                    <form onSubmit={handleAddCourse}>
                        <div style={{marginBottom:'10px'}}>
                             <label>รหัสวิชา</label>
                             <input className="input-field" placeholder="เช่น SF001" value={newCourse.id} onChange={e=>setNewCourse({...newCourse, id: e.target.value})} required />
                        </div>
                        <div style={{marginBottom:'10px'}}>
                             <label>ชื่อวิชา</label>
                             <input className="input-field" placeholder="ชื่อวิชา" value={newCourse.title} onChange={e=>setNewCourse({...newCourse, title: e.target.value})} required />
                        </div>
                        <div style={{marginBottom:'10px'}}>
                             <label>หมวดหมู่</label>
                             <input className="input-field" placeholder="เช่น ความปลอดภัย" value={newCourse.category} onChange={e=>setNewCourse({...newCourse, category: e.target.value})} required />
                        </div>
                        <div style={{marginBottom:'10px'}}>
                             <label>YouTube URL</label>
                             <input className="input-field" placeholder="https://youtu.be/..." value={newCourse.url} onChange={e=>setNewCourse({...newCourse, url: e.target.value})} required />
                        </div>
                        <div style={{marginBottom:'10px'}}>
                             <label>ความยาว (Text)</label>
                             <input className="input-field" placeholder="เช่น 10:00 นาที" value={newCourse.duration} onChange={e=>setNewCourse({...newCourse, duration: e.target.value})} />
                        </div>
                        <button className="btn btn-primary" style={{width:'100%'}}>บันทึกคอร์ส</button>
                    </form>
                </div>

                {/* List คอร์ส */}
                <div className="card" style={{ background:'white', padding:'20px', borderRadius:'12px' }}>
                    <h3 style={{marginTop:0}}>🎬 รายการคอร์สปัจจุบัน ({allCourses.length})</h3>
                    <div style={{maxHeight:'600px', overflowY:'auto'}}>
                        {allCourses.length === 0 && <p style={{color:'#aaa', textAlign:'center'}}>ยังไม่มีข้อมูลคอร์ส</p>}
                        {allCourses.map(c => (
                            <div key={c.id} style={{borderBottom:'1px solid #eee', padding:'15px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <div>
                                    <div style={{fontWeight:'bold', fontSize:'1.1rem', color:'#374151'}}>{c.id}: {c.title}</div>
                                    <div style={{fontSize:'0.9rem', color:'#6b7280', marginTop:'5px'}}>
                                        📂 {c.category} &nbsp;|&nbsp; 🕒 {c.duration} &nbsp;|&nbsp; 🔗 <a href={c.url} target="_blank" rel="noreferrer">เปิดลิ้งก์</a>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => confirmDeleteCourse(c.id, c.title)} 
                                    style={{
                                        background:'#fee2e2', color:'#b91c1c', border:'none', 
                                        borderRadius:'6px', padding:'8px 12px', cursor:'pointer', fontWeight:'bold'
                                    }}
                                >
                                    ลบ
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;