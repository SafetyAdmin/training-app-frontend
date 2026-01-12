import React, { useState } from 'react';
import './App.css';

const Login = ({ onLogin }) => {
  const [userType, setUserType] = useState('staff'); // 'staff' | 'contractor'

  // form state
  const [empId, setEmpId] = useState('');
  
  // contractor form
  const [conName, setConName] = useState('');
  const [conIdCard, setConIdCard] = useState('');
  const [conCompany, setConCompany] = useState('');

  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (userType === 'staff') {
        if (!empId.trim()) { setError('กรุณากรอกรหัสพนักงาน'); return; }
        try {
            const res = await fetch('https://training-api-pvak.onrender.com/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeId: empId })
            });
            const data = await res.json();
            if (data.success) onLogin(data);
            else setError(data.message);
        } catch (err) { setError('เชื่อมต่อ Server ไม่ได้'); }
    } 
    else {
        if(!conName || !conIdCard || !conCompany) {
            setError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
            return;
        }
        try {
            const res = await fetch('https://training-api-pvak.onrender.com/api/contractor-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idCard: conIdCard, name: conName, company: conCompany })
            });
            const data = await res.json();
            if (data.success) onLogin(data);
            else setError(data.message);
        } catch (err) { setError('เกิดข้อผิดพลาด'); }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        
        <div className="login-header">
            <div className="login-icon-box">🏭</div>
            <h2 className="login-title">Safety Training</h2>
            <p className="login-subtitle">ระบบอบรมความปลอดภัยออนไลน์</p>
        </div>

        {/* Tab Switcher Styled */}
        <div className="login-tabs">
            <button 
                onClick={() => { setUserType('staff'); setError(''); }}
                className={`login-tab-btn ${userType === 'staff' ? 'active' : ''}`}
            >
                พนักงานประจำ
            </button>
            <button 
                onClick={() => { setUserType('contractor'); setError(''); }}
                className={`login-tab-btn ${userType === 'contractor' ? 'active' : ''}`}
            >
                ผู้รับเหมา
            </button>
        </div>

        <form onSubmit={handleLogin}>
          
          {/* ฟอร์มพนักงาน */}
          {userType === 'staff' && (
              <div style={{marginBottom:'20px'}}>
                <label className="login-form-label">รหัสพนักงาน</label>
                <input 
                    type="text" className="input-field" placeholder="AM,CO,PR....." autoFocus
                    value={empId} onChange={(e) => setEmpId(e.target.value)} 
                />
              </div>
          )}

          {/* ฟอร์มผู้รับเหมา */}
          {userType === 'contractor' && (
              <>
                <div style={{marginBottom:'15px'}}>
                    <label className="login-form-label">ชื่อ-นามสกุล</label>
                    <input type="text" className="input-field" placeholder="ชื่อจริง นามสกุล" value={conName} onChange={e=>setConName(e.target.value)} />
                </div>
                <div style={{marginBottom:'15px'}}>
                    <label className="login-form-label">เลขบัตรประชาชน / Passport</label>
                    <input type="text" className="input-field" placeholder="สำหรับอ้างอิงตัวบุคคล" value={conIdCard} onChange={e=>setConIdCard(e.target.value)} />
                </div>
                <div style={{marginBottom:'20px'}}>
                    <label className="login-form-label">บริษัท (สังกัด)</label>
                    <input type="text" className="input-field" placeholder="ชื่อบริษัทผู้รับเหมา" value={conCompany} onChange={e=>setConCompany(e.target.value)} />
                </div>
              </>
          )}

          {error && <div className="login-error">⚠️ {error}</div>}
          
          <button type="submit" className="btn btn-primary login-btn">
            {userType === 'staff' ? 'เข้าสู่ระบบ' : 'ลงทะเบียนเข้าอบรม'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default Login;