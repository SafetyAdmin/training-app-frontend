// src/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import './App.css'; // ใช้ CSS เดียวกัน

const ALL_COURSES = [
  { id: 'SF001', name: 'ความปลอดภัยในการทำงาน' },
  { id: 'SF002', name: 'กฎหมายความปลอดภัย' },
  { id: 'SF003', name: 'ข้อบังคับความปลอดภัย' }
];

const Dashboard = ({ onLogout }) => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

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
    const interval = setInterval(fetchReport, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleReset = async (employeeId, employeeName) => {
    if (!window.confirm(`ยืนยันการลบประวัติของ: ${employeeName}?`)) return;
    try {
      await fetch('https://training-api-pvak.onrender.com/api/admin/reset-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId })
      });
      fetchReport();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const executeResetAll = async () => {
    try {
      const response = await fetch('https://training-api-pvak.onrender.com/api/reset-all-progress', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        fetchReport();
        alert("✅ ล้างข้อมูลเรียบร้อยแล้ว");
      } else {
        alert("❌ ลบไม่สำเร็จ");
      }
    } catch (error) {
      alert("❌ เชื่อมต่อ Server ไม่ได้");
    } finally {
      setShowConfirmReset(false);
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="brand-logo">📊 Admin Dashboard</div>
        <div className="user-profile">
          <span>ผู้ดูแลระบบ</span>
          <button className="btn-logout" onClick={onLogout}>ออกจากระบบ</button>
        </div>
      </nav>

      <div className="main-container">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem'}}>
            <h2 style={{margin:0, fontSize:'1.75rem'}}>สรุปผลการอบรม (Training Matrix)</h2>
            
            {/* ปุ่ม Reset All */}
            <div>
                {!showConfirmReset ? (
                    <button className="btn-danger" onClick={() => setShowConfirmReset(true)}>
                       🗑️ รีเซ็ตข้อมูลทั้งหมด
                    </button>
                ) : (
                    <div className="confirm-box">
                        <span style={{color:'#b91c1c', fontWeight:'bold', fontSize:'0.9rem'}}>⚠️ ยืนยันลบ "ทุกคน"?</span>
                        <button className="btn-confirm-yes" onClick={executeResetAll}>ยืนยัน</button>
                        <button className="btn-confirm-no" onClick={() => setShowConfirmReset(false)}>ยกเลิก</button>
                    </div>
                )}
            </div>
        </div>

        <div className="table-container">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: '1000px' }}>
              <thead>
                <tr>
                  <th style={{width:'10%'}}>รหัส</th>
                  <th style={{width:'20%', textAlign:'left'}}>ชื่อ-นามสกุล</th>
                  {ALL_COURSES.map(course => (
                    <th key={course.id} style={{textAlign:'center'}}>{course.name}</th>
                  ))}
                  <th style={{textAlign:'center'}}>ใช้งานล่าสุด</th>
                  <th style={{textAlign:'center'}}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={ALL_COURSES.length + 4} style={{padding:'2rem', textAlign:'center', color:'#64748b'}}>⏳ กำลังโหลดข้อมูล...</td></tr>
                ) : employees.map(emp => (
                  <tr key={emp.id}>
                    <td style={{fontWeight:'600', color:'#64748b', textAlign:'center'}}>{emp.id}</td>
                    <td style={{fontWeight:'500', color:'#1e293b'}}>{emp.name}</td>
                    
                    {ALL_COURSES.map(course => {
                      const status = emp.progress?.[course.id]; 
                      return (
                          <td key={course.id} style={{textAlign:'center'}}>
                            {(!status) ? (
                                <span className="status-badge status-none" title="ยังไม่เรียน">•</span>
                            ) : status.isCompleted ? (
                                <span className="status-badge status-completed" title="ผ่านแล้ว">✓</span>
                            ) : (
                                <span className="status-badge status-pending" title="กำลังเรียน">!</span>
                            )}
                          </td>
                      );
                    })}

                    <td style={{textAlign:'center', color:'#64748b', fontSize:'0.85rem'}}>{emp.lastSeen}</td>
                    <td style={{textAlign:'center'}}>
                        <div style={{display:'flex', justifyContent:'center'}}>
                            <button className="btn-reset" title="รีเซ็ตคนนี้" onClick={() => handleReset(emp.id, emp.name)}>
                                🔄
                            </button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;