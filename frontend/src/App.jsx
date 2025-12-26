import React, { useState } from 'react';
import TrainingVideoPlayer from './TrainingVideoPlayer';
import Dashboard from './Dashboard';
import Login from './Login';

function App() {
  const [user, setUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const courses = [
    { 
      id: "SF001", 
      title: "🔥 ทดสอบวิดีโอ MP4 (ไฟล์มาตรฐาน)", 
      // 👇 ลิ้งก์นี้ต้องเล่นได้ 100% ถ้าไม่ได้คือคอมมีปัญหา
      url: "https://www.w3schools.com/html/mov_bbb.mp4",  
      duration: "10 วินาที" 
    },
    { 
      id: "SF002", 
      title: "⚠️ คอร์ส YouTube (อาจโดนบล็อก)", 
      url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ", 
      duration: "10 นาที" 
    }
  ];

  if (!user) return <Login onLogin={(u) => setUser(u)} />;
  if (user.role === 'admin') return <Dashboard onLogout={() => setUser(null)} />;

  return (
    <div className="container" style={{ padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Training Hub: สวัสดี {user.name}</h2>
        <button onClick={() => setUser(null)}>ออกจากระบบ</button>
      </header>

      {!selectedCourse ? (
        <div>
          <h3>📚 เลือกบทเรียน</h3>
          {courses.map(c => (
            <div key={c.id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px', borderRadius: '8px', cursor: 'pointer' }} onClick={() => setSelectedCourse(c)}>
              <h4>{c.title}</h4>
              <p>🕒 {c.duration}</p>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={() => setSelectedCourse(null)} style={{ marginBottom: '10px' }}>← กลับ</button>
          <h2>{selectedCourse.title}</h2>
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