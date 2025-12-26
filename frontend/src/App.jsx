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
      title: "⚡ การปฐมพยาบาล (YouTube)", 
      url: "https://www.youtube.com/watch?v=VZoyfQAg9ag", 
      duration: "15 นาที" 
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
      {/* 1. Navbar สวยๆ ด้านบน */}
      <nav className="navbar">
        <div className="brand">
          🏭 Training Portal
        </div>
        <div className="user-profile">
          <span>สวัสดีคุณ <b>{user.name}</b></span>
          <button className="btn-logout" onClick={() => setUser(null)}>
            ออกจากระบบ
          </button>
        </div>
      </nav>

      <div className="main-container">
        {!selectedCourse ? (
          // --- หน้ารวมคอร์สแบบ Grid ---
          <div>
            <h2 className="page-title">📚 หลักสูตรที่คุณต้องเรียน</h2>
            <div className="course-grid">
              {courses.map(c => (
                <div 
                  key={c.id} 
                  className="course-card" 
                  onClick={() => setSelectedCourse(c)}
                >
                  <div className="card-header">
                    <h4>{c.title}</h4>
                    <span className="duration-badge">⏱️ {c.duration}</span>
                  </div>
                  <div className="card-footer">
                    <button className="btn-start-course">
                      เริ่มเรียนเลย 👉
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // --- หน้าเล่นวิดีโอ ---
          <div className="video-page-container">
            <button className="btn-back" onClick={() => setSelectedCourse(null)}>
              ⬅️ กลับไปหน้าหลักสูตร
            </button>
            
            <h2 style={{marginTop:0, marginBottom:'1rem', color:'#1e293b'}}>
              {selectedCourse.title}
            </h2>
            
            <TrainingVideoPlayer 
              videoUrl={selectedCourse.url}
              employeeId={user.id}
              employeeName={user.name}
              courseId={selectedCourse.id}
            />

            <div style={{marginTop:'1.5rem', padding:'1rem', background:'#fff7ed', borderRadius:'8px', border:'1px solid #fed7aa', color:'#9a3412', fontSize:'0.9rem'}}>
              💡 <b>คำแนะนำ:</b> ระบบจะบันทึกเวลาเรียนให้อัตโนมัติ (ห้ามกดข้าม) หากดูไม่จบสามารถกลับมาดูต่อวันหลังได้
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;