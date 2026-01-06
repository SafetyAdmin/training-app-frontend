// src/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import './App.css';

const ALL_COURSES = [
  { id: 'SF001', name: 'ความปลอดภัย (Safety)' },
  { id: 'SF002', name: 'กฎหมาย (Law)' },
  { id: 'SF003', name: 'ข้อบังคับ (Rules)' }
];

const Dashboard = ({ onLogout }) => {
  // State หลัก
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State สำหรับจัดการหน้าจอ
  const [activeTab, setActiveTab] = useState('report'); 
  const [searchTerm, setSearchTerm] = useState('');
  
  // State สำหรับฟอร์มเพิ่มพนักงาน
  const [newEmpId, setNewEmpId] = useState('');
  const [newEmpName, setNewEmpName] = useState('');

  // ✅ STATE ใหม่: สำหรับ Modal ยืนยัน (แทน window.confirm)
  const [confirmModal, setConfirmModal] = useState(null); // { title, message, onConfirm }

  // ✅ STATE ใหม่: สำหรับแจ้งเตือน (Toast)
  const [notification, setNotification] = useState(null); // { type: 'success'|'error', message }

  // ฟังก์ชันแสดงแจ้งเตือน (Toast)
  const showToast = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000); 
  };

  // 1. ดึงข้อมูล Report
  const fetchReport = () => {
    fetch('https://training-api-pvak.onrender.com/api/admin/report')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEmployees(data.data);
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.error("Error:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchReport();
    if (activeTab === 'report') {
      const interval = setInterval(fetchReport, 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // 2. ฟังก์ชันเพิ่มพนักงาน
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
    } catch (error) { showToast('error', "Error connecting server"); }
  };

  // 3. เตรียมการลบพนักงานรายคน
  const confirmDeleteEmployee = (id, name) => {
    setConfirmModal({
      title: '⚠️ ยืนยันการลบพนักงาน',
      message: `คุณต้องการลบ "${name}" (${id}) ใช่หรือไม่?\nข้อมูลการเรียนทั้งหมดจะหายไป`,
      action: async () => {
        try {
          // ✅ แก้ไข: ส่ง ID ไปที่ URL โดยตรง
          const res = await fetch(`https://training-api-pvak.onrender.com/api/admin/delete-employee/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
            // ไม่ต้องมี body แล้ว
          });
          
          const data = await res.json(); // อ่าน response เพื่อดู error message ถ้ามี

          if (res.ok && data.success) {
            showToast('success', "🗑️ ลบข้อมูลเรียบร้อย");
            fetchReport(); // ดึงข้อมูลใหม่ทันที
          } else {
            showToast('error', `❌ ลบไม่ได้: ${data.message || 'ไม่ทราบสาเหตุ'}`);
          }
        } catch (error) { 
            console.error(error);
            showToast('error', "Failed to delete (Server Error)"); 
        }
        setConfirmModal(null); 
      }
    });
  };

  // 4. เตรียมการรีเซ็ตรายคน
  const confirmReset = (employeeId, employeeName) => {
    setConfirmModal({
      title: '🔄 ยืนยันรีเซ็ตผลการเรียน',
      message: `คุณต้องการล้างประวัติการเรียนของ "${employeeName}" ทั้งหมดใช่หรือไม่?`,
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

  // 🔥 5. (กู้คืนมาแล้ว) ฟังก์ชันรีเซ็ตทั้งหมด (Reset All)
  const confirmResetAll = () => {
    setConfirmModal({
      title: '🧨 ล้างข้อมูลระบบทั้งหมด?',
      message: '⚠️ คำเตือน: คุณกำลังจะลบประวัติการเรียนของพนักงาน "ทุกคน" ในระบบ\n\nการกระทำนี้ไม่สามารถกู้คืนได้ ยืนยันที่จะทำรายการหรือไม่?',
      action: async () => {
        try {
          const res = await fetch('https://training-api-pvak.onrender.com/api/reset-all-progress', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          });
          if (res.ok) {
            showToast('success', "🗑️ ล้างระบบเรียบร้อยแล้ว");
            fetchReport();
          } else {
            showToast('error', "Failed to reset");
          }
        } catch (err) { showToast('error', "Server Error"); }
        setConfirmModal(null);
      }
    });
  };

  // 🖨️ ฟังก์ชันพิมพ์รายงาน (แถมให้กลับมาด้วยครับ)
  const handlePrint = () => {
    window.print(); // สั่งพิมพ์แบบปกติ (Browser Print)
  };

  // Logic ค้นหา
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
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', animation: 'fadeIn 0.3s'
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
                ยืนยันทำรายการ
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
                📋 สรุปผลการเรียน (Report)
            </button>
            <button 
                onClick={() => setActiveTab('manage')}
                style={{
                    padding:'10px 20px', borderRadius:'8px', border:'none', cursor:'pointer', fontWeight:'bold',
                    background: activeTab === 'manage' ? '#4f46e5' : 'transparent',
                    color: activeTab === 'manage' ? 'white' : '#6b7280'
                }}
            >
                👥 จัดการรายชื่อ (Add/Remove)
            </button>
        </div>

        {/* --- เนื้อหา TAB 1: REPORT --- */}
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
                
                {/* 🔥 คืนชีพปุ่ม Reset All ตรงนี้ครับ */}
                <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                    <div style={{color:'#6b7280', fontSize:'14px', marginRight:'10px', display: 'none'}}>
                        (ทั้งหมด: {employees.length})
                    </div>
                    
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
                        {ALL_COURSES.map(c => <th key={c.id} style={{textAlign:'center'}}>{c.name}</th>)}
                        <th style={{textAlign:'center'}}>รีเซ็ตผล</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={6} style={{padding:'2rem', textAlign:'center'}}>⏳ กำลังโหลด...</td></tr>
                        ) : filteredEmployees.map(emp => (
                        <tr key={emp.id}>
                            <td style={{textAlign:'center', fontWeight:'bold', color:'#64748b'}}>{emp.id}</td>
                            <td>{emp.name} <br/><span style={{fontSize:'0.8em', color:'#aaa'}}>ล่าสุด: {emp.lastSeen}</span></td>
                            {ALL_COURSES.map(c => {
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

        {/* --- เนื้อหา TAB 2: MANAGE EMPLOYEES --- */}
        {activeTab === 'manage' && (
          <div style={{ display:'grid', gridTemplateColumns: '1fr 2fr', gap:'20px' }}>
              
              <div className="card" style={{ background:'white', padding:'20px', borderRadius:'12px', height:'fit-content' }}>
                  <h3 style={{marginTop:0}}>➕ เพิ่มพนักงานใหม่</h3>
                  <form onSubmit={handleAddEmployee}>
                      <div style={{marginBottom:'15px'}}>
                          <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>รหัสพนักงาน</label>
                          <input 
                            type="text" className="input-field" 
                            placeholder="เช่น EMP999" 
                            value={newEmpId} onChange={e => setNewEmpId(e.target.value)}
                            required
                          />
                      </div>
                      <div style={{marginBottom:'15px'}}>
                          <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>ชื่อ-นามสกุล</label>
                          <input 
                            type="text" className="input-field" 
                            placeholder="เช่น นายรักงาน ขยันยิ่ง" 
                            value={newEmpName} onChange={e => setNewEmpName(e.target.value)}
                            required
                          />
                      </div>
                      <button type="submit" className="btn btn-primary" style={{width:'100%'}}>บันทึกข้อมูล</button>
                  </form>
              </div>

              <div className="card" style={{ background:'white', padding:'20px', borderRadius:'12px' }}>
                  <h3 style={{marginTop:0}}>🗑️ รายชื่อพนักงานในระบบ ({filteredEmployees.length})</h3>
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

      </div>
    </div>
  );
};

export default Dashboard;