// src/Dashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
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
  const [activeTab, setActiveTab] = useState('report'); // 'report' หรือ 'manage'
  const [searchTerm, setSearchTerm] = useState('');
  
  // State สำหรับฟอร์มเพิ่มพนักงาน
  const [newEmpId, setNewEmpId] = useState('');
  const [newEmpName, setNewEmpName] = useState('');

  // 1. ดึงข้อมูล Report (รวมรายชื่อพนักงานและ Progress)
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
    // ถ้าอยู่หน้าจัดการคน ไม่ต้อง Auto Refresh บ่อย (เดี๋ยวพิมพ์ๆ อยู่แล้วหาย)
    if (activeTab === 'report') {
      const interval = setInterval(fetchReport, 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // 2. ฟังก์ชันเพิ่มพนักงาน
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmpId || !newEmpName) return alert("กรุณากรอกข้อมูลให้ครบ");

    try {
      const res = await fetch('https://training-api-pvak.onrender.com/api/admin/add-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: newEmpId.trim(), name: newEmpName.trim() })
      });
      const data = await res.json();
      
      if (data.success) {
        alert("✅ เพิ่มพนักงานเรียบร้อย");
        setNewEmpId('');
        setNewEmpName('');
        fetchReport(); // โหลดข้อมูลใหม่ทันที
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) { alert("Error connecting server"); }
  };

  // 3. ฟังก์ชันลบพนักงาน (ลาออก)
  const handleDeleteEmployee = async (id, name) => {
    if (!window.confirm(`⚠️ ยืนยันการลบพนักงาน?\n\nชื่อ: ${name}\nรหัส: ${id}\n\n(ข้อมูลการเรียนของคนนี้จะถูกลบทั้งหมด)`)) return;

    try {
      const res = await fetch('https://training-api-pvak.onrender.com/api/admin/delete-employee', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: id })
      });
      if (res.ok) {
        alert("🗑️ ลบข้อมูลเรียบร้อย");
        fetchReport();
      }
    } catch (error) { alert("Failed to delete"); }
  };

  // 4. ฟังก์ชัน Reset Progress (ของเดิม)
  const handleReset = async (employeeId, employeeName) => {
    if (!window.confirm(`ยืนยันรีเซ็ตการเรียนของ: ${employeeName}?`)) return;
    try {
      await fetch('https://training-api-pvak.onrender.com/api/admin/reset-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId })
      });
      fetchReport();
    } catch (error) { console.error(error); }
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

      <div className="main-container">
        
        {/* Tab Menu Selection */}
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

        {/* --- เนื้อหา TAB 1: REPORT (หน้าเดิม) --- */}
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
                <div style={{textAlign:'right', color:'#6b7280', fontSize:'14px'}}>
                    ทั้งหมด: {employees.length} คน
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
                                <button className="btn-reset" onClick={() => handleReset(emp.id, emp.name)}>🔄</button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
             </div>
          </>
        )}

        {/* --- เนื้อหา TAB 2: MANAGE EMPLOYEES (หน้าใหม่) --- */}
        {activeTab === 'manage' && (
          <div style={{ display:'grid', gridTemplateColumns: '1fr 2fr', gap:'20px' }}>
              
              {/* ฝั่งซ้าย: ฟอร์มเพิ่มคน */}
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

              {/* ฝั่งขวา: ตารางรายชื่อและปุ่มลบ */}
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
                                            onClick={() => handleDeleteEmployee(emp.id, emp.name)}
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