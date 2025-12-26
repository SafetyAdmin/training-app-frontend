// src/App.jsx
import React, { useState } from 'react';
import './App.css'; // 🔥 อย่าลืม import CSS ไฟล์ใหม่
import TrainingVideoPlayer from './TrainingVideoPlayer';
import Dashboard from './Dashboard';
import Login from './Login';

function App() {
  const [user, setUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // ข้อมูลคอร์สเดิมของคุณ (YouTube + MP4)
  const courses = [
    { 
      id: "SF001", 
      title: "🔥 หัวข้อวิชาที่ 1 ความรู้เกี่ยวกับความปลอดภัยในการทำงาน", 
      url: "https://youtu.be/jH4ZRU7Q4VA",  
      duration: "1:25:57 วินาที" 
    },
    { 
      id: "SF002", 
      title: "🔥 หัวข้อวิชาที่ 2 กฎหมายความปลอดภัย อาชีวอนามัย และสภาพแวดล้อมในการทำงาน", 
      url: "https://youtu.be/czC6QY27rto", 
      duration: "1:43:54 วินาที" 
    },
    {
      id: "SF002",
      title: "🧪 ทดสอบไฟล์ MP4 (เผื่อ YouTube โดนบล็อก)",
      url: "https://www.w3schools.com/html/mov_bbb.mp4",
      duration: "10 วินาที"
    }
  ];

  if (!user) return <Login onLogin={(u) => setUser(u)} />;
  if (user.role === 'admin') return <Dashboard onLogout={() => setUser(null)} />;

  return (
    <div>
      {/* 1. Navbar แบบเรียบหรู */}
      <nav className="navbar">
        <div className="brand-logo">
          🏢 Training Portal
        </div>
        <div className="user-profile">
          <span>สวัสดี, <b>{user.name}</b></span>
          <button className="btn-logout" onClick={() => setUser(null)}>
            ออกจากระบบ
          </button>
        </div>
      </nav>

      <div className="dashboard-container">
        {!selectedCourse ? (
          // --- หน้า Dashboard (เลือกคอร์ส) ---
          <div>
            <div className="section-header">
              <h2>📚 เลือกบทเรียนของคุณ</h2>
              <p>กรุณาเลือกหลักสูตรเพื่อเริ่มการฝึกอบรม (ระบบจะบันทึกเวลาอัตโนมัติ)</p>
            </div>
            
            <div className="course-grid">
              {courses.map(c => (
                <div 
                  key={c.id} 
                  className="course-card" 
                  onClick={() => setSelectedCourse(c)}
                >
                  <div>
                    <div className="card-icon">{c.icon}</div>
                    <h3 className="card-title">{c.title}</h3>
                    <div className="card-meta">
                      🕒 ความยาว: {c.duration}
                    </div>
                  </div>
                  
                  <button className="btn-start-course">
                    เริ่มเรียนเลย ➜
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // --- หน้าเรียนวิดีโอ ---
          <div className="video-section">
            <div className="back-nav">
              <button className="btn-back" onClick={() => setSelectedCourse(null)}>
                ⬅️ กลับไปหน้าหลักสูตร
              </button>
            </div>
            
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h2 style={{marginTop:0, marginBottom:'1rem', fontSize:'1.5rem', color:'#1e293b'}}>
                {selectedCourse.icon} {selectedCourse.title}
              </h2>
              
              <TrainingVideoPlayer 
                videoUrl={selectedCourse.url}
                employeeId={user.id}
                employeeName={user.name}
                courseId={selectedCourse.id}
              />
              
              <div style={{marginTop:'1.5rem', padding:'1rem', background:'#fff7ed', borderRadius:'8px', border:'1px solid #fed7aa', color:'#9a3412', fontSize:'0.9rem'}}>
                💡 <b>ข้อแนะนำ:</b> ระบบจะบันทึกเวลาเรียนให้อัตโนมัติ หากดูไม่จบสามารถกลับมาดูต่อได้
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;