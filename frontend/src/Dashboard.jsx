import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

const ALL_COURSES = [
  { id: 'SF001', name: 'ความปลอดภัยในการทำงาน (General Safety)' },
  { id: 'SF002', name: 'กฎหมายความปลอดภัย (Safety Law)' },
  { id: 'SF003', name: 'ข้อบังคับ จป. (Safety Rules)' }
];

const Dashboard = ({ onLogout }) => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // 🔍 ค้นหาพนักงาน
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // ดึงข้อมูล
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
    const interval = setInterval(fetchReport, 10000); // อัปเดตทุก 10 วิ
    return () => clearInterval(interval);
  }, []);

  // 🧮 คำนวณสถิติสำหรับผู้บริหาร/Audit
  const stats = useMemo(() => {
    const totalEmp = employees.length;
    const totalCourses = totalEmp * ALL_COURSES.length;
    
    let completedCount = 0;
    employees.forEach(emp => {
      ALL_COURSES.forEach(course => {
        if (emp.progress?.[course.id]?.isCompleted) {
          completedCount++;
        }
      });
    });

    const percent = totalCourses > 0 ? ((completedCount / totalCourses) * 100).toFixed(1) : 0;

    return {
      totalEmp,
      completedCount,
      totalCourses,
      percent
    };
  }, [employees]);

  // 🔍 ฟองก์ชันค้นหา
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ฟังก์ชันต่างๆ (Reset)
  const handleReset = async (employeeId, employeeName) => {
    if (!window.confirm(`ยืนยันลบประวัติของ: ${employeeName}?`)) return;
    try {
      await fetch('https://training-api-pvak.onrender.com/api/admin/reset-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId })
      });
      fetchReport();
    } catch (error) { console.error(error); }
  };

  const executeResetAll = async () => {
    try {
      const res = await fetch('https://training-api-pvak.onrender.com/api/reset-all-progress', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) { fetchReport(); alert("✅ ล้างข้อมูลเรียบร้อย"); }
    } catch (error) { alert("❌ Error"); } finally { setShowConfirmReset(false); }
  };

  // 🖨️ ฟังก์ชันสั่งพิมพ์
  // 🖨️ ฟังก์ชันสั่งพิมพ์แบบมืออาชีพ (เปิดหน้าต่างใหม่)
  const handlePrint = () => {
    // 1. เลือกส่วนที่จะพิมพ์ (ในที่นี้คือ main-container)
    const printContent = document.querySelector('.main-container').innerHTML;
    
    // 2. เปิดหน้าต่างใหม่
    const printWindow = window.open('', '', 'height=600,width=800');
    
    // 3. เขียน HTML ลงไปในหน้าต่างใหม่
    printWindow.document.write('<html><head><title>Training Audit Report</title>');
    
    // (สำคัญ) ดึง CSS เดิมมาใช้ด้วย เพื่อให้สวยเหมือนหน้าเว็บ
    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('');
        } catch (e) {
          return '';
        }
      })
      .join('');
    printWindow.document.write(`<style>${styles}</style>`);
    
    // เพิ่ม CSS เฉพาะกิจสำหรับหน้าต่างพิมพ์
    printWindow.document.write(`
      <style>
        body { background: white; padding: 20px; font-family: 'Sarabun', sans-serif; }
        .navbar, .btn-print, .btn-danger, .search-box, .status-badge { display: none !important; } /* ซ่อนปุ่ม */
        .table-container { box-shadow: none; border: 1px solid #000; }
        th, td { border: 1px solid #000; padding: 8px; color: black; }
        .print-footer { display: flex !important; margin-top: 50px; } /* โชว์ลายเซ็น */
      </style>
    `);
    
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    
    // 4. สั่งพิมพ์และปิดเมื่อเสร็จ
    printWindow.document.close();
    printWindow.focus();
    
    // รอโหลดรูป/ฟอนต์นิดนึงแล้วค่อยสั่งพิมพ์
    setTimeout(() => {
      printWindow.print();
      // printWindow.close(); // ถ้าอยากให้พิมพ์เสร็จแล้วปิดเลย ให้เอา comment ออก
    }, 500);
  };

  return (
    <div>
      <nav className="navbar">
        <div className="brand-logo">📊 Safety Training Matrix</div>
        <div className="user-profile">
          <span>ผู้ดูแลระบบ (Admin)</span>
          <button className="btn-logout" onClick={onLogout}>ออก</button>
        </div>
      </nav>

      <div className="main-container">
        <div className="section-header" style={{textAlign:'left', marginBottom:'1.5rem'}}>
          <h2 style={{margin:0}}>สรุปผลการฝึกอบรม (Training Summary)</h2>
          <p>ข้อมูล ณ วันที่: {new Date().toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' })}</p>
        </div>

        {/* 1. ส่วนแสดงสถิติ (KPIs Dashboard) */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{background:'#eff6ff', color:'#2563eb'}}>👥</div>
            <div className="stat-info">
              <h3>{stats.totalEmp}</h3>
              <p>พนักงานทั้งหมด (คน)</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{background:'#dcfce7', color:'#166534'}}>✅</div>
            <div className="stat-info">
              <h3>{stats.percent}%</h3>
              <p>ความสำเร็จภาพรวม</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{background:'#fff7ed', color:'#c2410c'}}>📚</div>
            <div className="stat-info">
              <h3>{stats.completedCount} / {stats.totalCourses}</h3>
              <p>หลักสูตรที่ผ่านแล้ว (รายการ)</p>
            </div>
          </div>
        </div>

        {/* 2. แถบเครื่องมือ (ค้นหา & ปุ่มพิมพ์) */}
        <div className="toolbar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              className="search-input"
              placeholder="ค้นหาชื่อ หรือ รหัสพนักงาน..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{display:'flex', gap:'10px'}}>
             <button className="btn-print" onClick={handlePrint}>
                🖨️ พิมพ์รายงาน (Audit Report)
             </button>

             {!showConfirmReset ? (
                <button className="btn-danger" onClick={() => setShowConfirmReset(true)}>
                    🗑️ รีเซ็ตระบบ
                </button>
             ) : (
                <div className="confirm-box">
                    <span>⚠️ ล้างข้อมูลทั้งหมด?</span>
                    <button className="btn-confirm-yes" onClick={executeResetAll}>ยืนยัน</button>
                    <button className="btn-confirm-no" onClick={() => setShowConfirmReset(false)}>ยกเลิก</button>
                </div>
             )}
          </div>
        </div>

        {/* 3. ตารางข้อมูล (Matrix Table) */}
        <div className="table-container">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: '1000px' }}>
              <thead>
                <tr>
                  <th style={{width:'10%'}}>รหัส</th>
                  <th style={{width:'20%', textAlign:'left'}}>พนักงาน</th>
                  {ALL_COURSES.map(course => (
                    <th key={course.id} style={{textAlign:'center'}}>{course.name}</th>
                  ))}
                  <th style={{textAlign:'center', width:'10%'}}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={ALL_COURSES.length + 3} style={{padding:'2rem', textAlign:'center'}}>⏳ กำลังโหลดข้อมูล...</td></tr>
                ) : filteredEmployees.map(emp => (
                  <tr key={emp.id}>
                    <td style={{fontWeight:'bold', textAlign:'center', color:'#64748b'}}>{emp.id}</td>
                    <td>
                      <div style={{fontWeight:'600'}}>{emp.name}</div>
                      <div style={{fontSize:'0.8rem', color:'#94a3b8'}}>เข้าล่าสุด: {emp.lastSeen}</div>
                    </td>
                    
                    {ALL_COURSES.map(course => {
                      const progress = emp.progress?.[course.id]; 
                      return (
                        <td key={course.id} style={{textAlign:'center', verticalAlign:'middle'}}>
                          {(!progress) ? (
                              <span className="status-badge status-none">ยังไม่เริ่ม</span>
                          ) : progress.isCompleted ? (
                              <div>
                                <span className="status-badge status-completed">✅ ผ่าน</span>
                                {/* ถ้า Database เก็บวันที่จบ ให้แสดงตรงนี้ (สมมติว่า lastWatched คือวันที่) */}
                                {/* <span className="date-label">05/01/26</span> */} 
                              </div>
                          ) : (
                              <span className="status-badge status-pending">🟡 กำลังเรียน</span>
                          )}
                        </td>
                      );
                    })}

                    <td style={{textAlign:'center'}}>
                        <button className="btn-reset" onClick={() => handleReset(emp.id, emp.name)} title="รีเซ็ตคนนี้">
                            🔄
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. ส่วนท้ายสำหรับพิมพ์ (Signature Area) - จะเห็นเฉพาะตอน Print */}
        <div className="print-footer">
            <div style={{textAlign:'center', width:'30%'}}>
                __________________________<br/>
                ( ผู้จัดทำรายงาน )<br/>
                เจ้าหน้าที่ความปลอดภัย (จป.)
            </div>
            <div style={{textAlign:'center', width:'30%'}}>
                __________________________<br/>
                ( ผู้อนุมัติ )<br/>
                ผู้จัดการโรงงาน
            </div>
            <div style={{textAlign:'center', width:'30%'}}>
                วันที่: _____/_____/_______
            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;