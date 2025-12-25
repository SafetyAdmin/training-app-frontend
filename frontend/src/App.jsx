// frontend/src/App.jsx
import React, { useState } from 'react';
import TrainingVideoPlayer from './TrainingVideoPlayer';
import Dashboard from './Dashboard';
import Login from './Login';

function App() {
  const [user, setUser] = useState(null); // เก็บข้อมูลผู้ใช้ที่ Login
  const [selectedCourse, setSelectedCourse] = useState(null);

  const courses = [
    { 
      id: "SF001", 
      title: "🔥 ทดสอบวิดีโอใหม่", 
      // 👇 ลองใช้ลิ้งก์นี้ชั่วคราวครับ (คลิปมาตรฐานที่เปิดได้ทุกเว็บแน่นอน)
      url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",  
      duration: "10 นาที" 
    },
    { 
      id: "SF002", 
      title: "🔥 ความปลอดภัยในโรงงาน", 
      // ใส่ชื่อไฟล์ที่คุณเอาไปวางใน public/videos/
      url: "https://www.youtube.com/watch?v=VZoyfQAg9ag",  
      duration: "10 นาที" 
    },
    { 
      id: "CPR002", 
      title: "🐻 การปฐมพยาบาล", 
      // ถ้าไม่มีไฟล์ ลองใช้ลิ้งก์เทสของ w3schools ได้ (อันนี้เล่นได้ชัวร์)
      url: "https://www.youtube.com/watch?v=VZoyfQAg9ag", 
      duration: "15 นาที" 
    },
    // ...
  ];

  // 1. ถ้ายังไม่ Login -> แสดงหน้า Login
  if (!user) {
    return <Login onLogin={(userData) => setUser(userData)} />;
  }

  // 2. ถ้า Login เป็น ADMIN -> แสดงหน้า Dashboard อย่างเดียว
  if (user.role === 'admin') {
    return <Dashboard onLogout={() => setUser(null)} />;
  }

  // 3. ถ้า Login เป็น Employee -> แสดงหน้าเรียน (User Interface)
  return (
    <div className="container">
      {/* Header สำหรับพนักงาน */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#2563eb' }}>🏢 Training Hub</h2>
          <p style={{ margin: 0, color: '#666' }}>สวัสดีคุณ {user.name} ({user.id})</p>
        </div>
        <button onClick={() => setUser(null)} className="btn btn-outline">
          ออกจากระบบ
        </button>
      </header>

      {/* เนื้อหาการเรียน */}
      {!selectedCourse ? (
        // หน้ารวมคอร์ส (Course Grid)
        <div>
          <h3 style={{ marginBottom: '20px' }}>📌 หลักสูตรของคุณ</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {courses.map(course => (
              <div key={course.id} className="card">
                <div style={{ height: '140px', background: '#e2e8f0', borderRadius: '8px', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>
                  📺
                </div>
                <h4 style={{ margin: '0 0 10px 0' }}>{course.title}</h4>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '15px' }}>
                  🕒 ระยะเวลา: {course.duration}
                </p>
                <button 
                  onClick={() => setSelectedCourse(course)} 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                >
                  เข้าเรียน
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // หน้าเล่นวิดีโอ (Video Player)
        <div className="card">
          <button 
            onClick={() => setSelectedCourse(null)} 
            className="btn" 
            style={{ marginBottom: '15px', paddingLeft: 0, color: '#666' }}
          >
            ← กลับไปหน้ารวม
          </button>
          
          <h2 style={{ marginBottom: '15px' }}>{selectedCourse.title}</h2>
          
          <TrainingVideoPlayer 
            videoUrl={selectedCourse.url}
            employeeId={user.id}
            employeeName={user.name}
            courseId={selectedCourse.id}
          />
        </div>
      )}
    </div>
  );
}

export default App;