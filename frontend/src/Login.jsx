// src/Login.jsx
import React, { useState } from 'react';
import './App.css';

const Login = ({ onLogin }) => {
  // state สลับโหมด
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

    // 1. ล็อกอินแบบพนักงาน
    if (userType === 'staff') {
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
    
    // 2. ลงทะเบียน/เข้าเรียน แบบผู้รับเหมา
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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        
        <div style={{textAlign:'center', marginBottom:'1.5rem'}}>
            <div style={{fontSize:'3rem', marginBottom:'10px'}}>🏭</div>
            <h2 style={{margin:0, color:'#1e293b'}}>Safety Training</h2>
            <p style={{color:'#64748b'}}>ระบบอบรมความปลอดภัยก่อนเข้างาน</p>
        </div>

        {/* Tab Switcher */}
        <div style={{display:'flex', background:'#f1f5f9', padding:'4px', borderRadius:'8px', marginBottom:'20px'}}>
            <button 
                onClick={() => { setUserType('staff'); setError(''); }}
                style={{
                    flex:1, padding:'8px', borderRadius:'6px', border:'none', cursor:'pointer', fontWeight:'bold',
                    background: userType === 'staff' ? 'white' : 'transparent',
                    color: userType === 'staff' ? '#4f46e5' : '#64748b',
                    boxShadow: userType === 'staff' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s'
                }}
            >
                พนักงานประจำ
            </button>
            <button 
                onClick={() => { setUserType('contractor'); setError(''); }}
                style={{
                    flex:1, padding:'8px', borderRadius:'6px', border:'none', cursor:'pointer', fontWeight:'bold',
                    background: userType === 'contractor' ? 'white' : 'transparent',
                    color: userType === 'contractor' ? '#f59e0b' : '#64748b',
                    boxShadow: userType === 'contractor' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s'
                }}
            >
                ผู้รับเหมา
            </button>
        </div>

        <form onSubmit={handleLogin}>
          
          {/* ฟอร์มพนักงาน */}
          {userType === 'staff' && (
              <div style={{marginBottom:'15px'}}>
                <label style={{display:'block', marginBottom:'5px', fontWeight:'600', color:'#334155'}}>รหัสพนักงาน</label>
                <input 
                    type="text" className="input-field" placeholder="กรอกรหัสพนักงาน..." autoFocus
                    value={empId} onChange={(e) => setEmpId(e.target.value)} 
                />
              </div>
          )}

          {/* ฟอร์มผู้รับเหมา */}
          {userType === 'contractor' && (
              <>
                <div style={{marginBottom:'15px'}}>
                    <label style={{display:'block', marginBottom:'5px', fontWeight:'600', color:'#334155'}}>ชื่อ-นามสกุล</label>
                    <input type="text" className="input-field" placeholder="ชื่อจริง นามสกุล" value={conName} onChange={e=>setConName(e.target.value)} />
                </div>
                <div style={{marginBottom:'15px'}}>
                    <label style={{display:'block', marginBottom:'5px', fontWeight:'600', color:'#334155'}}>เลขบัตรประชาชน / Passport</label>
                    <input type="text" className="input-field" placeholder="ใช้สำหรับอ้างอิง" value={conIdCard} onChange={e=>setConIdCard(e.target.value)} />
                </div>
                <div style={{marginBottom:'15px'}}>
                    <label style={{display:'block', marginBottom:'5px', fontWeight:'600', color:'#334155'}}>บริษัท (สังกัด)</label>
                    <input type="text" className="input-field" placeholder="ชื่อบริษัทผู้รับเหมา" value={conCompany} onChange={e=>setConCompany(e.target.value)} />
                </div>
              </>
          )}

          {error && <div style={{color:'#ef4444', marginBottom:'15px', fontSize:'0.9rem', textAlign:'center'}}>⚠️ {error}</div>}
          
          <button type="submit" className="btn btn-primary" style={{width:'100%', padding:'12px', fontSize:'1rem'}}>
            {userType === 'staff' ? 'เข้าสู่ระบบ' : 'ลงทะเบียนเข้าอบรม'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default Login;