// frontend/src/Login.jsx
import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // 1. เช็ค Admin (แก้ให้ key ตรงกันด้วยเพื่อความชัวร์)
    if (employeeId.toLowerCase() === 'admin') {
      onLogin({ employeeId: 'ADMIN', name: 'HR Admin', role: 'admin' });
      return;
    }

    try {
      // 2. ยิง API Login
      const res = await fetch('https://training-api-pvak.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: employeeId.trim() }) 
      });
      
      const data = await res.json();

      if (data.success) {
        // ✅ จุดที่แก้ไข: เปลี่ยนจาก id เป็น employeeId
        onLogin({ 
          employeeId: data.employeeId, // 🔥 แก้ตรงนี้ครับ
          name: data.name, 
          role: 'employee' 
        });
      } else {
        alert("⛔️ ไม่พบรหัสพนักงานนี้ในระบบ\nกรุณาติดต่อ HR เพื่อลงทะเบียน");
      }
    } catch (err) {
      console.error(err);
      alert("❌ เชื่อมต่อ Server ไม่ได้ (ตรวจสอบอินเทอร์เน็ต)");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#f1f5f9' 
    }}>
      <div style={{ 
        background: 'white', 
        padding: '40px', 
        borderRadius: '15px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
        width: '100%', 
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '50px', marginBottom: '10px' }}>🏭</div>
        <h2 style={{ color: '#1e293b', marginBottom: '5px' }}>Training Portal</h2>
        <p style={{ color: '#64748b', marginBottom: '30px' }}>ระบบอบรมพนักงานออนไลน์</p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569' }}>รหัสพนักงาน</label>
            <input
              type="text"
              placeholder="ระบุรหัส (เช่น EMP001)"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              style={{ 
                width: '100%', padding: '12px', marginTop: '5px',
                borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{ 
              padding: '14px', 
              background: isLoading ? '#94a3b8' : '#2563eb', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '16px', 
              fontWeight: 'bold', 
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginTop: '10px',
              transition: 'background 0.2s'
            }}
          >
            {isLoading ? '⏳ กำลังตรวจสอบ...' : 'เข้าสู่ห้องเรียน'}
          </button>

        </form>
        
        <p style={{ marginTop: '20px', fontSize: '12px', color: '#94a3b8' }}>
            * ระบบจะดึงชื่อ-สกุล อัตโนมัติเมื่อรหัสถูกต้อง
        </p>
      </div>
    </div>
  );
};

export default Login;