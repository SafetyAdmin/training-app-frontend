import React, { useState, useEffect } from 'react';
import './App.css'; // ใช้ธีมสวยๆ จากไฟล์ CSS เดิม

const Dashboard = ({ onLogout }) => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ฟังก์ชันดึงข้อมูลรายงาน
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
        console.error("Fetch error:", err);
        setIsLoading(false);
      });
  };

  // ดึงข้อมูลเมื่อเปิดหน้า และดึงใหม่ทุก 5 วินาที (Real-time)
  useEffect(() => {
    fetchReport();
    const interval = setInterval(fetchReport, 5000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 ฟังก์ชันกดปุ่มรีเซ็ต
  const handleReset = async (employeeId, employeeName) => {
    if (!window.confirm(`⚠️ ยืนยันการลบประวัติการเรียนของ:\n"${employeeName}"\n\nข้อมูลจะหายไปและต้องเริ่มเรียนใหม่?`)) {
      return;
    }

    try {
      const res = await fetch('https://training-api-pvak.onrender.com/api/admin/reset-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId })
      });
      const result = await res.json();
      
      if (result.success) {
        alert(`✅ รีเซ็ตข้อมูลคุณ ${employeeName} เรียบร้อยแล้ว`);
        fetchReport(); // ดึงข้อมูลใหม่ทันที
      } else {
        alert('❌ เกิดข้อผิดพลาด: ' + result.error);
      }
    } catch (error) {
      alert('❌ ไม่สามารถเชื่อมต่อ Server ได้');
    }
  };

  return (
    <div>
      {/* Navbar แบบเดียวกับหน้าเรียน */}
      <nav className="navbar">
        <div className="brand">
          📊 Admin Dashboard
        </div>
        <div className="user-profile">
          <span>ผู้ดูแลระบบ</span>
          <button className="btn-logout" onClick={onLogout}>
            ออกจากระบบ
          </button>
        </div>
      </nav>

      <div className="main-container">
        <h2 className="page-title">
           ติดตามสถานะการอบรม ({employees.length} คน)
        </h2>

        {/* ตารางแสดงผลแบบสวยงาม */}
        <div style={{ overflowX: 'auto', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                <th style={{ padding: '16px' }}>รหัส</th>
                <th style={{ padding: '16px' }}>ชื่อ-นามสกุล</th>
                <th style={{ padding: '16px' }}>หลักสูตรล่าสุด</th>
                <th style={{ padding: '16px' }}>สถานะ</th>
                <th style={{ padding: '16px' }}>ใช้งานล่าสุด</th>
                <th style={{ padding: '16px', textAlign: 'center' }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" style={{padding:'20px', textAlign:'center'}}>⏳ กำลังโหลดข้อมูล...</td></tr>
              ) : employees.map(emp => (
                <tr key={emp.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px', fontFamily: 'monospace', fontWeight: 'bold', color: '#475569' }}>
                    {emp.id}
                  </td>
                  <td style={{ padding: '16px', fontWeight: '600', color: '#1e293b' }}>
                    {emp.name}
                  </td>
                  <td style={{ padding: '16px', color: '#64748b' }}>
                    {emp.course !== '-' ? emp.course : <span style={{opacity:0.5}}>ยังไม่เริ่ม</span>}
                  </td>
                  <td style={{ padding: '16px' }}>
                    {/* Badge แสดงสถานะสวยๆ */}
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 12px',
                      borderRadius: '99px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      backgroundColor: emp.status.includes('ผ่าน') ? '#dcfce7' : emp.status.includes('กำลัง') ? '#fef9c3' : '#fee2e2',
                      color: emp.status.includes('ผ่าน') ? '#166534' : emp.status.includes('กำลัง') ? '#854d0e' : '#991b1b',
                    }}>
                      {emp.status.includes('ผ่าน') ? '✅ ผ่านแล้ว' : emp.status.includes('กำลัง') ? '🟡 กำลังเรียน' : '🔴 ยังไม่เรียน'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontSize: '0.9rem', color: '#94a3b8' }}>
                    {emp.lastSeen}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    {/* ปุ่มรีเซ็ต */}
                    <button 
                      onClick={() => handleReset(emp.id, emp.name)}
                      style={{
                        background: 'white',
                        border: '1px solid #cbd5e1',
                        color: '#475569',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                      onMouseEnter={(e) => { e.target.style.background = '#f1f5f9'; e.target.style.color = '#ef4444'; e.target.style.borderColor = '#ef4444'; }}
                      onMouseLeave={(e) => { e.target.style.background = 'white'; e.target.style.color = '#475569'; e.target.style.borderColor = '#cbd5e1'; }}
                    >
                      🔄 รีเซ็ต
                    </button>
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