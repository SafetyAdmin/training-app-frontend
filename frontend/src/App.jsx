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
      category: "🔥 หมวดความปลอดภัย (Safety)", // ชื่อหมวด
      icon: "🔥",
      title: "หัวข้อวิชาที่ 1 ความรู้เกี่ยวกับความปลอดภัยในการทำงาน", 
      url: "https://youtu.be/jH4ZRU7Q4VA",  
      duration: "1 ชั่วโมง 25 นาที" 
    },
    { 
      id: "SF002", 
      category: "🔥 หมวดความปลอดภัย (Safety)", // ชื่อหมวด
      icon: "🔥",
      title: "หัวข้อวิชาที่ 2 กฎหมายความปลอดภัย อาชีวอนามัย และสภาพแวดล้อมในการทำงาน", 
      url: "https://youtu.be/czC6QY27rto", 
      duration: "1:43:54 วินาที" 
    },
    {
      id: "SF003",
      category: "🔥 หมวดความปลอดภัย (Safety)", // ชื่อหมวด
      icon: "🔥",
      title: "หัวข้อวิชาที่ 3   ข้อบังคับว่าด้วยความปลอดภัย อาชีวอนามัย และสภาพแวดล้อมในการทำงาน",
      url: "https://youtu.be/YF9Bef5Oq0Q",
      duration: "2:34:56 วินาที"
    },
    {
      id: "MC001",
      category: "🖥️ สถานีเรียนรู้", // ชื่อหมวด
      icon: " 🖥️",
      title: "สถานีเรียนรู้ที่ 1 อุปกรณ์คุ้มครองความปลอดภัยส่วนบุคคล",
      url: "https://www.youtube.com/watch?v=vIDQ97nn9tY&list=PLtFvwvJL41rIcfuq4DguTM-geticaMHvn&index=1",
      duration: "09:07 วินาที"
    },
    {
      id: "MC002",
      category: "🖥️ สถานีเรียนรู้", // ชื่อหมวด
      icon: " 🖥️",
      title: "สถานีเรียนรู้ที่ 2 สีและเครื่องหมายเพื่อความปลอดภัย",
      url: "https://www.youtube.com/watch?v=F4ysNeES1zE&list=PLtFvwvJL41rIcfuq4DguTM-geticaMHvn&index=2",
      duration: "08:18 วินาที"
    },
    {
      id: "MC003",
      category: "🖥️ สถานีเรียนรู้", // ชื่อหมวด
      icon: " 🖥️",
      title: "สถานีเรียนรู้ที่ 3 การปฏิบัติงานในที่อับอากาศ",
      url: "https://www.youtube.com/watch?v=pkbEetW3ic4&list=PLtFvwvJL41rIcfuq4DguTM-geticaMHvn&index=3",
      duration: "11:58 วินาที"
    }
    ,
    {
      id: "MC004",
      category: "🖥️ สถานีเรียนรู้", // ชื่อหมวด
      icon: " 🖥️",
      title: "สถานีเรียนรู้ที่ 4 อันตรายจากสารเคมี",
      url: "https://www.youtube.com/watch?v=-zJ5IQAdcOo&list=PLtFvwvJL41rIcfuq4DguTM-geticaMHvn&index=4",
      duration: "10:49 วินาที"
    }
  ];

  // 📌 2. ดึงรายชื่อหมวดหมู่ทั้งหมดออกมา (ไม่ให้ซ้ำ)
  const categories = [...new Set(courses.map(c => c.category))];

  if (!user) return <Login onLogin={(u) => setUser(u)} />;
  if (user.role === 'admin') return <Dashboard onLogout={() => setUser(null)} />;

  return (
    <div>
      <nav className="navbar">
        <div className="brand-logo">🏢 Training Portal</div>
        <div className="user-profile">
          <span>สวัสดี, <b>{user.name}</b></span>
          <button className="btn-logout" onClick={() => setUser(null)}>ออกจากระบบ</button>
        </div>
      </nav>

      <div className="dashboard-container">
        {!selectedCourse ? (
          <div>
            <div className="section-header">
              <h2>📚 เลือกบทเรียนของคุณ</h2>
              <p>กรุณาเลือกหลักสูตรเพื่อเริ่มการฝึกอบรม</p>
            </div>
            
            {/* 📌 3. วนลูปสร้าง Section ตามหมวดหมู่ */}
            {categories.map(catName => (
              <div key={catName} className="category-section">
                
                {/* หัวข้อหมวดหมู่สวยๆ */}
                <h3 className="category-title">
                  <span className="category-icon">{catName.split(' ')[0]}</span> 
                  {catName.replace(catName.split(' ')[0], '')}
                </h3>

                {/* Grid การ์ดของหมวดนั้นๆ */}
                <div className="course-grid">
                  {courses
                    .filter(c => c.category === catName) // กรองเฉพาะวิชาในหมวดนี้
                    .map(c => (
                      <div key={c.id} className="course-card" onClick={() => setSelectedCourse(c)}>
                        <div>
                          <div className="card-icon">{c.icon}</div>
                          <h3 className="card-title">{c.title}</h3>
                          <div className="card-meta">🕒 ความยาว: {c.duration}</div>
                        </div>
                        <button className="btn-start-course">เริ่มเรียนเลย ➜</button>
                      </div>
                    ))}
                </div>
              </div>
            ))}

          </div>
        ) : (
          // --- หน้าเล่นวิดีโอ (เหมือนเดิม) ---
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