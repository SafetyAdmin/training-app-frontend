// src/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import './App.css';

const Dashboard = ({ onLogout }) => {
  // --- STATE ---
  const [employees, setEmployees] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('report'); 
  const [searchTerm, setSearchTerm] = useState('');
  
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
      fetch('https://training-api-pvak.onrender.com/api/courses')
        .then(res => res.json())
        .then(data => {
            if (data.success) setAllCourses(data.data);
        })
        .catch(err => console.error("Course Error:", err));
  };

  useEffect(() => {
    fetchReport();
    fetchCourses();
    if (activeTab === 'report') {
      const interval = setInterval(() => { fetchReport(); fetchCourses(); }, 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // --- ACTIONS ---

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
            setNewCourse({ id: '', title: '', category: 'ทั่วไป', icon: '📺', url: '', duration: '' });
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

  // 🔥 ฟังก์ชันพิมพ์ (แก้ Sandbox)
  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=900');
    if (!printWindow) return alert("Pop-up ถูกบล็อก!");

    const tableContent = document.querySelector('.table-wrapper')?.outerHTML || "<h1>ไม่พบข้อมูลตาราง</h1>";
    printWindow.document.write(`
      <html>
        <head>
          <title>Training Report</title>
          <style>
             body { font-family: 'Sarabun', sans-serif; padding: 20px; }
             h2 { text-align: center; margin-bottom: 20px; }
             /* Force Styling for Print */
             .table-wrapper { box-shadow: none !important; border: 1px solid #000 !important; max-height: none !important; overflow: visible !important; }
             table { width: 100%; border-collapse: collapse; }
             th, td { border: 1px solid #000 !important; padding: 5px; font-size: 10px; color: black !important; text-align: center; }
             th { background-color: #eee !important; -webkit-print-color-adjust: exact; }
             .sticky-col { position: static !important; box-shadow: none !important; border-right: 1px solid #000 !important; text-align: left !important; }
             .badge-dot { border: 1px solid #000; display: inline-block; width: 8px; height: 8px; border-radius: 50%; }
             .badge-pass { background-color: black !important; }
             .btn-reset { display: none; }
          </style>
        </head>
        <body>
          <h2>สรุปผลการฝึกอบรม</h2>
          <p>วันที่: ${new Date().toLocaleString('th-TH')}</p>
          ${tableContent}
          <script>setTimeout(() => { window.print(); }, 500);</script>
        </body>
      </html>
    `);
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
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: notification.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white', padding: '12px 24px', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', animation: 'fadeIn 0.3s', fontWeight: '600'
        }}>
          {notification.message}
        </div>
      )}

      {/* Modal */}
      {confirmModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', padding: '25px', borderRadius: '12px',
            maxWidth: '400px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginTop: 0, color: '#1f2937' }}>{confirmModal.title}</h3>
            <p style={{ color: '#4b5563', whiteSpace: 'pre-line', marginBottom: '20px' }}>{confirmModal.message}</p>
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
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                >
                    {tab === 'report' ? '📋 สรุปผล' : tab === 'manage' ? '👥 จัดการคน' : '🎬 จัดการคอร์ส'}
                </button>
            ))}
        </div>

        {/* --- TAB 1: REPORT --- */}
        {activeTab === 'report' && (
          <>
             <div className="toolbar">
                {/* 1. กล่องค้นหา */}
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input 
                        type="text" 
                        className="search-input" 
                        placeholder="ค้นหารายชื่อ หรือ รหัสพนักงาน..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                {/* 2. ปุ่มกดขวามือ */}
                <div className="toolbar-actions">
                    <button 
                      onClick={handlePrint}
                      className="btn btn-print"
                    >
                      🖨️ Print Report
                    </button>

                    <button 
                      onClick={confirmResetAll}
                      className="btn btn-danger"
                    >
                      🗑️ Reset All
                    </button>
                </div>
             </div>

             <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th className="sticky-col" style={{minWidth: '220px', textAlign:'left', paddingLeft:'15px'}}>
                        พนักงาน ({filteredEmployees.length})
                      </th>
                      {allCourses.map(c => (
                        <th key={c.id} title={c.title} style={{textAlign:'center', minWidth: '90px'}}>
                           <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'4px'}}>
                              <span style={{fontSize:'1.2rem'}}>{c.icon}</span>
                              <span style={{fontSize:'0.75rem', maxWidth:'100px', overflow:'hidden', textOverflow:'ellipsis', cursor:'help'}}>
                                {c.title.length > 12 ? c.title.substring(0, 12) + '...' : c.title}
                              </span>
                           </div>
                        </th>
                      ))}
                      <th style={{textAlign:'center', minWidth:'60px'}}>Reset</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                        <tr><td colSpan={allCourses.length + 2} style={{padding:'3rem', textAlign:'center'}}>⏳ กำลังโหลด...</td></tr>
                    ) : filteredEmployees.map(emp => (
                      <tr key={emp.id}>
                        <td className="sticky-col" style={{textAlign:'left', paddingLeft:'15px'}}>
                           <div style={{fontWeight:'600', color:'#334155'}}>{emp.name}</div>
                           <div style={{fontSize:'0.75rem', color:'#94a3b8'}}>{emp.id}</div>
                           <div style={{fontSize:'0.7rem', color:'#cbd5e1'}}>ล่าสุด: {emp.lastSeen}</div>
                        </td>
                        {allCourses.map(c => {
                            const p = emp.progress?.[c.id];
                            return (
                                <td key={c.id} style={{textAlign:'center'}}>
                                    <div className="status-cell">
                                        {!p ? <div className="badge-dot badge-none" title="ยังไม่เริ่ม"></div> :
                                         p.isCompleted ? <div style={{color:'#10b981', fontSize:'1.2rem'}} title="ผ่านแล้ว">✅</div> :
                                         <div className="badge-dot badge-learning" title="เรียนอยู่"></div>}
                                    </div>
                                </td>
                            )
                        })}
                        <td style={{textAlign:'center'}}>
                           <button className="btn-reset" onClick={() => confirmReset(emp.id, emp.name)} title="รีเซ็ต">🔄</button>
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
              <div className="card" style={{ height:'fit-content' }}>
                  <h3 style={{marginTop:0}}>➕ เพิ่มพนักงาน</h3>
                  <form onSubmit={handleAddEmployee}>
                      <div style={{marginBottom:'10px'}}>
                          <label style={{fontSize:'0.9rem', fontWeight:'bold'}}>รหัสพนักงาน</label>
                          <input className="input-field" placeholder="เช่น EMP001" value={newEmpId} onChange={e => setNewEmpId(e.target.value)} required />
                      </div>
                      <div style={{marginBottom:'15px'}}>
                          <label style={{fontSize:'0.9rem', fontWeight:'bold'}}>ชื่อ-นามสกุล</label>
                          <input className="input-field" placeholder="ชื่อจริง นามสกุล" value={newEmpName} onChange={e => setNewEmpName(e.target.value)} required />
                      </div>
                      <button type="submit" className="btn btn-primary" style={{width:'100%'}}>บันทึก</button>
                  </form>
              </div>

              <div className="card">
                  <h3 style={{marginTop:0}}>🗑️ รายชื่อในระบบ</h3>
                  <input className="input-field" placeholder="ค้นหา..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{marginBottom:'10px'}} />
                  <div style={{maxHeight:'500px', overflowY:'auto'}}>
                    <table style={{width:'100%'}}>
                        <thead><tr style={{background:'#f1f5f9', textAlign:'left'}}><th style={{padding:'10px'}}>รหัส</th><th>ชื่อ</th><th>ลบ</th></tr></thead>
                        <tbody>
                            {filteredEmployees.map(emp => (
                                <tr key={emp.id} style={{borderBottom:'1px solid #eee'}}>
                                    <td style={{padding:'10px'}}>{emp.id}</td>
                                    <td>{emp.name}</td>
                                    <td><button onClick={() => confirmDeleteEmployee(emp.id, emp.name)} style={{background:'#fee2e2', color:'red', border:'none', borderRadius:'6px', padding:'4px 8px', cursor:'pointer'}}>ลบ</button></td>
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
            <div className="manage-grid">
                <div className="card" style={{ height:'fit-content' }}>
                    <h3 style={{marginTop:0}}>➕ เพิ่มคอร์ส</h3>
                    <form onSubmit={handleAddCourse}>
                        {['id', 'title', 'category', 'url', 'duration'].map(field => (
                            <div key={field} style={{marginBottom:'10px'}}>
                                <input className="input-field" placeholder={field.toUpperCase()} value={newCourse[field]} onChange={e=>setNewCourse({...newCourse, [field]: e.target.value})} required={field!=='duration'} />
                            </div>
                        ))}
                        <button className="btn btn-primary" style={{width:'100%'}}>บันทึก</button>
                    </form>
                </div>
                <div className="card">
                    <h3 style={{marginTop:0}}>🎬 รายการคอร์ส</h3>
                    <div style={{maxHeight:'600px', overflowY:'auto'}}>
                        {allCourses.map(c => (
                            <div key={c.id} style={{borderBottom:'1px solid #eee', padding:'10px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <div>
                                    <div style={{fontWeight:'bold'}}>{c.id}: {c.title}</div>
                                    <div style={{fontSize:'0.8rem', color:'#666'}}>📂 {c.category}</div>
                                </div>
                                <button onClick={() => confirmDeleteCourse(c.id, c.title)} style={{background:'#fee2e2', color:'red', border:'none', borderRadius:'6px', padding:'4px 8px', cursor:'pointer'}}>ลบ</button>
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