// frontend/src/Dashboard.jsx
import React, { useEffect, useState } from 'react';

const Dashboard = ({ onLogout }) => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/progress-report')
      .then(res => res.json())
      .then(data => setReports(data))
      .catch(err => console.error(err));
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#1e293b' }}>📊 Admin Dashboard</h1>
        <button onClick={onLogout} className="btn btn-danger">ออกจากระบบ</button>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>รายงานผลการเรียนล่าสุด</h3>
        <table className="styled-table">
          <thead>
            <tr>
              <th>ชื่อ-นามสกุล</th>
              <th>รหัสพนักงาน</th>
              <th>รหัสวิชา</th>
              <th>เวลาที่เรียน</th>
              <th>สถานะ</th>
              <th>วันที่</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((item) => (
              <tr key={item._id}>
                <td style={{ fontWeight: 'bold' }}>{item.employeeName}</td>
                <td>{item.employeeId}</td>
                <td>{item.courseId}</td>
                <td>{formatTime(item.lastWatchedTime)} นาที</td>
                <td>
                  {item.isCompleted ? (
                    <span className="badge badge-success">✅ ผ่านแล้ว</span>
                  ) : (
                    <span className="badge badge-warning">⏳ กำลังเรียน</span>
                  )}
                </td>
                <td>{new Date(item.lastUpdated).toLocaleDateString('th-TH')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;