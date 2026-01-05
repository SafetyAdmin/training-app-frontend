import React, { useState, useEffect } from 'react';
import './App.css';

// 📌 รายชื่อวิชา
const ALL_COURSES = [
  { id: 'SF001', name: '🔥 หัวข้อวิชาที่ 1 ความรู้เกี่ยวกับความปลอดภัยในการทำงาน' },
  { id: 'SF002', name: '🔥 หัวข้อวิชาที่ 2 กฎหมายความปลอดภัย อาชีวอนามัย และสภาพแวดล้อมในการทำงาน' },
  { id: 'SF003', name: '🔥 หัวข้อวิชาที่ 3 ข้อบังคับว่าด้วยความปลอดภัย อาชีวอนามัย และสภาพแวดล้อมในการทำงาน' }
];

const Dashboard = ({ onLogout }) => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // ✅ STATE 1: เพิ่มตัวแปรสำหรับปุ่มยืนยัน (แก้ปัญหา confirm error)
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

  // ฟังก์ชันรีเซ็ตรายบุคคล (ถ้ายืนยันผ่าน confirm ไม่ได้ ให้ลบเลยหรือใช้ console log แทน)
  const handleReset = async (employeeId, employeeName) => {
    // หมายเหตุ: ถ้า Sandbox บล็อก confirm ตรงนี้อาจจะไม่ทำงาน
    // ถ้าอยากให้ชัวร์อาจจะต้องตัดบรรทัด window.confirm ออก
    // if (!window.confirm(`⚠️ ล้างประวัติการเรียนทั้งหมดของ: ${employeeName}?`)) return;
    
    try {
      await fetch('https://training-api-pvak.onrender.com/api/admin/reset-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId })
      });
      // alert('✅ เรียบร้อย'); // alert อาจโดนบล็อกใน sandbox
      console.log(`Reset ${employeeName} success`);
      fetchReport();
    } catch (error) {
      console.error('Error resetting user', error);
    }
  };

  // ✅ FUNCTION: ฟังก์ชันลบทั้งหมด (ย้ายเข้ามาข้างใน และไม่ต้องใช้ window.confirm)
  const executeResetAll = async () => {
    try {
      const response = await fetch('https://training-api-pvak.onrender.com/api/reset-all-progress', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        // ❌ อย่าใช้ window.location.reload(); เพราะจะทำให้หลุด Login
        // ✅ ให้เรียกฟังก์ชันดึงข้อมูลใหม่แทน
        fetchReport(); 
        alert("✅ ล้างข้อมูลเรียบร้อยแล้ว");
      } else {
        console.error("Failed to reset");
        alert("❌ ลบไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ เชื่อมต่อ Server ไม่ได้");
    } finally {
      setShowConfirmReset(false); // ปิดปุ่มยืนยัน
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

        {/* ✅ UI: ปุ่มรีเซ็ตแบบใหม่ (แก้ปัญหา Sandbox Error) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            {!showConfirmReset ? (
                // 1. ปุ่มปกติ
                <button
                    onClick={() => setShowConfirmReset(true)}
                    style={{
                        backgroundColor: '#ef4444', color: 'white', border: 'none',
                        padding: '10px 20px', borderRadius: '5px', cursor: 'pointer',
                        fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                >
                    🗑️ รีเซ็ตข้อมูลทั้งหมด
                </button>
            ) : (
                // 2. ปุ่มยืนยัน (แสดงเมื่อกดปุ่มบน)
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fee2e2', padding: '5px 10px', borderRadius: '5px', border: '1px solid #ef4444' }}>
                    <span style={{ color: '#b91c1c', fontWeight: 'bold' }}>⚠️ ยืนยันลบ "ทุกคน"?</span>
                    
                    <button
                        onClick={executeResetAll}
                        style={{
                            backgroundColor: '#dc2626', color: 'white', border: 'none',
                            padding: '8px 15px', borderRadius: '4px', cursor: 'pointer'
                        }}
                    >
                        ยืนยัน
                    </button>
                    
                    <button
                        onClick={() => setShowConfirmReset(false)}
                        style={{
                            backgroundColor: '#9ca3af', color: 'white', border: 'none',
                            padding: '8px 15px', borderRadius: '4px', cursor: 'pointer'
                        }}
                    >
                        ยกเลิก
                    </button>
                </div>
            )}
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
                  
                  {ALL_COURSES.map(course => {
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

export default Dashboard;