// frontend/src/Dashboard.jsx
import React, { useState, useEffect } from 'react';

const Dashboard = ({ onLogout }) => {
  const [report, setReport] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ดึงข้อมูลเมื่อเปิดหน้า
  useEffect(() => {
    fetch('https://training-api-pvak.onrender.com/api/admin/report')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setReport(data.data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1e293b' }}>📊 แดชบอร์ดผู้ดูแลระบบ</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>ติดตามสถานะการอบรมของพนักงาน</p>
        </div>
        <button 
          onClick={onLogout}
          style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
        >
          ออกจากระบบ
        </button>
      </div>

      {/* ตารางข้อมูล */}
      <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>⏳ กำลังโหลดข้อมูล...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f1f5f9' }}>
              <tr>
                <th style={{ padding: '15px', textAlign: 'left', color: '#475569' }}>รหัสพนักงาน</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#475569' }}>ชื่อ-นามสกุล</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#475569' }}>หลักสูตร</th>
                <th style={{ padding: '15px', textAlign: 'center', color: '#475569' }}>สถานะ</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#475569' }}>ใช้งานล่าสุด</th>
              </tr>
            </thead>
            <tbody>
              {report.map((row, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '15px' }}>{row.id}</td>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>{row.name}</td>
                  <td style={{ padding: '15px' }}>{row.course}</td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '5px 10px', 
                      borderRadius: '20px', 
                      fontSize: '12px',
                      background: row.status.includes('ผ่าน') ? '#dcfce7' : (row.status.includes('กำลัง') ? '#fef9c3' : '#fee2e2'),
                      color: row.status.includes('ผ่าน') ? '#166534' : (row.status.includes('กำลัง') ? '#854d0e' : '#991b1b')
                    }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: '15px', color: '#666', fontSize: '13px' }}>{row.lastSeen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;