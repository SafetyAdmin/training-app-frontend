// src/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import './App.css';

const Dashboard = ({ user, activeTab: initialTab, onSelectCourse, onLogout }) => {

  // --- STATE ---
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(initialTab || 'summary');
  const [allCourses, setAllCourses] = useState([]); // ต้องมี state นี้สำหรับเก็บคอร์ส
  
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

  // ✅ 1. เพิ่ม useEffect โหลดข้อมูลคอร์สทั้งหมด (ถ้ายังไม่มี)
  useEffect(() => {
    fetch('https://training-api-pvak.onrender.com/api/courses?role=admin') // ส่ง role admin เพื่อดึงมาทุกคอร์ส
      .then(res => res.json())
      .then(data => {
        if(data.success) setAllCourses(data.data);
      });
  }, []);

  // ✅ 2. ฟังก์ชันกดติ๊กเปลี่ยนสิทธิ์ (Toggle Role)
  const toggleCourseRole = async (courseId, roleToToggle) => {
    // 1. หาคอร์สเป้าหมาย
    const course = allCourses.find(c => c.id === courseId);
    if (!course) return;

    // 2. คำนวณ Roles ใหม่
    let newRoles = [...(course.allowedRoles || ['staff', 'contractor'])]; // Default เก่า
    
    if (newRoles.includes(roleToToggle)) {
        // ถ้ามีอยู่แล้ว -> เอาออก (เช่น ติ๊กออก)
        newRoles = newRoles.filter(r => r !== roleToToggle);
    } else {
        // ถ้ายังไม่มี -> ใส่เพิ่ม (เช่น ติ๊กถูก)
        newRoles.push(roleToToggle);
    }

    // 3. อัปเดตหน้าจอทันที (Optimistic Update)
    const updatedCourses = allCourses.map(c => 
        c.id === courseId ? { ...c, allowedRoles: newRoles } : c
    );
    setAllCourses(updatedCourses);

    // 4. ส่งไปบันทึกที่ Server
    try {
        await fetch('https://training-api-pvak.onrender.com/api/admin/update-course-roles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseId, allowedRoles: newRoles })
        });
    } catch (err) {
        alert('บันทึกไม่สำเร็จ');
        // (Optional) โหลดข้อมูลกลับคืนถ้าพัง
    }
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
             {/* ... (ส่วน Toolbar เหมือนเดิม) ... */}
             <div className="toolbar">
                {/* ...โค้ด Toolbar เดิม... */}
             </div>

             <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th className="sticky-col" style={{minWidth: '250px', width:'250px'}}>
                        รายชื่อพนักงาน ({filteredEmployees.length})
                      </th>
                      
                      {allCourses.map(c => (
                        <th key={c.id} title={c.title} style={{textAlign:'center', minWidth: '80px', maxWidth:'100px'}}>
                           <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'4px'}}>
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
                              {emp.role === 'contractor' ? `ผู้รับเหมา: ${emp.company || '-'}` : `ID: {emp.id}`}
                            </div>
                           <div style={{fontSize:'0.7rem', color:'#cbd5e1'}}>
                              {emp.lastSeen === '-' ? '' : `เข้าล่าสุด: ${emp.lastSeen}`}
                           </div>
                        </td>

                        {allCourses.map(c => {
                            const p = emp.progress?.[c.id];
                            
                            // 🔥 ฟังก์ชันแปลงวันที่ให้เป็นภาษาไทยสั้นๆ (เช่น 9 ม.ค. 69)
                            const getThaiDate = (dateString) => {
                                if (!dateString) return "";
                                const date = new Date(dateString);
                                return date.toLocaleDateString('th-TH', {
                                    day: 'numeric', month: 'short', year: '2-digit',
                                    hour: '2-digit', minute: '2-digit'
                                });
                            };

                            return (
                                <td key={c.id}>
                                    <div className="status-cell">
                                        {!p ? (
                                           <div className="badge-dot badge-none" title={`วิชา ${c.id}: ยังไม่เริ่ม`}></div>
                                        ) : p.isCompleted ? (
                                           // ✅ จุดที่แก้: เพิ่มวันที่ใน Title
                                           <div 
                                              title={`✅ ผ่านแล้ว\n📅 เมื่อ: ${getThaiDate(p.lastUpdated)}`} 
                                              style={{color:'#10b981', display:'flex', alignItems:'center', cursor:'help'}}
                                           >
                                              <span style={{fontSize:'1.2rem', fontWeight:'bold'}}>✓</span>
                                           </div>
                                        ) : (
                                           <div className="badge-dot badge-learning" title={`🟡 กำลังเรียน (${Math.floor(p.lastWatched)} วินาที)\n📅 ล่าสุด: ${getThaiDate(p.lastUpdated)}`}></div>
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
         <div className="card">
            <h3>🎬 จัดการหลักสูตรและการเข้าถึง</h3>
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th className="sticky-col">ชื่อวิชา</th>
                            <th>หมวดหมู่</th>
                            {/* เพิ่มหัวตารางสิทธิ์ */}
                            <th style={{textAlign:'center', width:'100px'}}>Staff Only</th>
                            <th style={{textAlign:'center', width:'100px'}}>Contractor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allCourses.map(course => {
                            // เช็คสิทธิ์ปัจจุบันของคอร์สนี้
                            const roles = course.allowedRoles || ['staff', 'contractor'];
                            const isStaff = roles.includes('staff');
                            const isContractor = roles.includes('contractor');

                            return (
                                <tr key={course.id}>
                                    <td className="sticky-col">
                                        <div style={{fontWeight:'bold'}}>{course.title}</div>
                                        <div style={{fontSize:'0.8rem', color:'#64748b'}}>{course.id}</div>
                                    </td>
                                    <td>{course.category}</td>
                                    
                                    {/* Checkbox สำหรับ Staff */}
                                    <td style={{textAlign:'center'}}>
                                        <label className="switch">
                                            <input 
                                                type="checkbox" 
                                                checked={isStaff} 
                                                onChange={() => toggleCourseRole(course.id, 'staff')}
                                            />
                                            <span style={{cursor:'pointer', fontSize:'1.2rem'}}>
                                                {isStaff ? '✅' : '❌'}
                                            </span>
                                        </label>
                                    </td>

                                    {/* Checkbox สำหรับ Contractor */}
                                    <td style={{textAlign:'center'}}>
                                        <label className="switch">
                                            <input 
                                                type="checkbox" 
                                                checked={isContractor} 
                                                onChange={() => toggleCourseRole(course.id, 'contractor')}
                                            />
                                            <span style={{cursor:'pointer', fontSize:'1.2rem'}}>
                                                {isContractor ? '✅' : '❌'}
                                            </span>
                                        </label>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
         </div>
      )}
      </div>
    </div>
  );
};

export default Dashboard;