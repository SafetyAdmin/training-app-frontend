// frontend/src/Login.jsx
import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [isHrMode, setIsHrMode] = useState(false); // โหมด HR หรือไม่
  const [formData, setFormData] = useState({ id: '', name: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isHrMode) {
      // 🔒 รหัสลับสำหรับ HR (ตั้งง่ายๆ ว่า admin123)
      if (formData.password === 'admin123') {
        onLogin({ role: 'admin', name: 'HR Manager' });
      } else {
        alert('รหัสผ่าน Admin ไม่ถูกต้อง!');
      }
    } else {
      // 👤 ล็อกอินพนักงาน
      if (formData.id && formData.name) {
        onLogin({ role: 'employee', id: formData.id, name: formData.name });
      } else {
        alert('กรุณากรอกข้อมูลให้ครบ');
      }
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <div className="card" style={{ width: '400px', textAlign: 'center' }}>
        <h2 style={{ color: '#2563eb', marginBottom: '10px' }}>
          {isHrMode ? '🛡️ Admin Portal' : '🚀 Training Portal'}
        </h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          {isHrMode ? 'กรุณาใส่รหัสผ่านผู้ดูแลระบบ' : 'ระบบอบรมพนักงานออนไลน์'}
        </p>
        
        <form onSubmit={handleSubmit}>
          {!isHrMode && (
            <>
              <input name="id" className="input-field" placeholder="รหัสพนักงาน (เช่น EMP001)" onChange={handleChange} />
              <input name="name" className="input-field" placeholder="ชื่อ-นามสกุล" onChange={handleChange} />
            </>
          )}
          
          {isHrMode && (
            <input type="password" name="password" className="input-field" placeholder="Admin Password" onChange={handleChange} />
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            {isHrMode ? 'เข้าสู่ระบบ Admin' : 'เข้าสู่ห้องเรียน'}
          </button>
        </form>

        <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
          <button 
            onClick={() => setIsHrMode(!isHrMode)} 
            style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '14px' }}
          >
            {isHrMode ? '← กลับไปหน้าพนักงาน' : 'สำหรับเจ้าหน้าที่ HR (Admin Only)'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;