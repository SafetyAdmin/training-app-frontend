import React, { useState, useEffect } from 'react';
import './App.css';

// 📌 รายชื่อวิชา (ต้องตรงกับ ID ใน App.jsx)
const ALL_COURSES = [
  { id: 'SF001', name: '🔥 หัวข้อวิชาที่ 1 ความรู้เกี่ยวกับความปลอดภัยในการทำงาน' },
  { id: 'SF002', name: '🔥 หัวข้อวิชาที่ 2 กฎหมายความปลอดภัย อาชีวอนามัย และสภาพแวดล้อมในการทำงาน' },
  { id: 'SF003', name: '🔥 หัวข้อวิชาที่ 3 ข้อบังคับว่าด้วยความปลอดภัย อาชีวอนามัย และสภาพแวดล้อมในการทำงาน' }
];

const Dashboard = ({ onLogout }) => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
    if (!window.confirm(`⚠️ ล้างประวัติการเรียนทั้งหมดของ: ${employeeName}?`)) return;
    
    try {
      await fetch('https://training-api-pvak.onrender.com/api/admin/reset-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId })
      });
      alert('✅ เรียบร้อย');
      fetchReport();
    } catch (error) {
      alert('❌ Error');
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="brand">📊 Admin Matrix Dashboard</div>
        <div className="user-profile">
          <span>ผู้ดูแลระบบ</span>
          <button className="btn-logout" onClick={onLogout}>ออกจากระบบ</button>
        </div>
      </nav>

      <div className="main-container" style={{ maxWidth: '100%' }}>
        <h2 className="page-title">สรุปผลการอบรม (Training Matrix)</h2>

        {/* ปุ่มรีเซ็ตวางไว้เหนือตาราง หรือข้างๆ หัวข้อ */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button
            onClick={handleResetAll}
            style={{
              backgroundColor: '#ef4444', // สีแดง
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            🗑️ รีเซ็ตข้อมูลทั้งหมด
          </button>
        </div>

        <div style={{ overflowX: 'auto', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '16px', textAlign: 'left' }}>รหัส</th>
                <th style={{ padding: '16px', textAlign: 'left', minWidth: '150px' }}>ชื่อ-นามสกุล</th>
                
                {ALL_COURSES.map(course => (
                  <th key={course.id} style={{ padding: '16px', textAlign: 'center' }}>
                    {course.name}
                  </th>
                ))}
                
                <th style={{ padding: '16px' }}>ใช้งานล่าสุด</th>
                <th style={{ padding: '16px' }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={ALL_COURSES.length + 4} style={{padding:'20px', textAlign:'center'}}>⏳ กำลังโหลด...</td></tr>
              ) : employees.map(emp => (
                <tr key={emp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px', fontWeight: 'bold', color: '#64748b' }}>{emp.id}</td>
                  <td style={{ padding: '16px', fontWeight: '600' }}>{emp.name}</td>
                  
                  {/* 📌 วนลูปเช็คสถานะแต่ละวิชา (แก้จุดที่ Error แล้ว) */}
                  {ALL_COURSES.map(course => {
                    // 🔥 ใช้ ?. (Optional Chaining) เพื่อกันพัง ถ้า progress ไม่มีข้อมูล
                    const status = emp.progress?.[course.id]; 
                    
                    if (!status) {
                      return <td key={course.id} style={{textAlign:'center', color:'#cbd5e1'}}>🔴</td>;
                    }
                    if (status.isCompleted) {
                      return <td key={course.id} style={{textAlign:'center', fontSize:'1.2rem'}}>✅</td>;
                    }
                    return <td key={course.id} style={{textAlign:'center'}}><span style={{background:'#fef3c7', color:'#b45309', padding:'4px 8px', borderRadius:'6px', fontSize:'0.8rem'}}>🟡</span></td>;
                  })}

                  <td style={{ padding: '16px', textAlign:'center', color: '#94a3b8', fontSize:'0.85rem' }}>{emp.lastSeen}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <button onClick={() => handleReset(emp.id, emp.name)} style={{ border:'1px solid #e2e8f0', background:'white', cursor:'pointer', padding:'6px 12px', borderRadius:'6px' }}>🔄</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ฟังก์ชันสำหรับปุ่ม Reset All
  const handleResetAll = async () => {
    // 1. แจ้งเตือนก่อนลบ (สำคัญมาก!)
    const isConfirmed = window.confirm(
      "⚠️ คำเตือน: คุณต้องการลบประวัติการเรียนของพนักงาน 'ทุกคน' ใช่ไหม?\n\nการกระทำนี้ไม่สามารถย้อนกลับได้!"
    );

    if (isConfirmed) {
      try {
        // 2. ยิง API ไปที่ Backend (เปลี่ยน URL ให้ตรงกับเครื่องคุณ)
        const response = await fetch('https://training-api-pvak.onrender.com/api/reset-all-progress', {
          method: 'DELETE', // หรือ POST แล้วแต่ที่เขียนใน Backend
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          alert("✅ ล้างข้อมูลเรียบร้อยแล้ว");
          // 3. โหลดข้อมูลตารางใหม่ (เรียกฟังก์ชันที่คุณใช้ดึงข้อมูลตอนแรก)
          // fetchEmployees(); หรือ window.location.reload();
          window.location.reload(); 
        } else {
          alert("❌ เกิดข้อผิดพลาด ไม่สามารถล้างข้อมูลได้");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("❌ เชื่อมต่อ Server ไม่ได้");
      }
    }
  };

export default Dashboard;