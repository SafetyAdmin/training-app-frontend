// src/App.jsx
import React, { useState } from 'react';
import './App.css';
import TrainingVideoPlayer from './TrainingVideoPlayer';
import Dashboard from './Dashboard';
import Login from './Login';

function App() {
  const [user, setUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // --- ข้อมูลคอร์ส (คงเดิม) ---
  const courses = [
    { id: "SF001", category: "🔥 หมวดความปลอดภัย (Safety)", icon: "🔥", title: "หัวข้อวิชาที่ 1 ความรู้เกี่ยวกับความปลอดภัยในการทำงาน", url: "https://youtu.be/jH4ZRU7Q4VA", duration: "1 ชม. 25 น." },
    { id: "SF002", category: "🔥 หมวดความปลอดภัย (Safety)", icon: "🔥", title: "หัวข้อวิชาที่ 2 กฎหมายความปลอดภัย อาชีวอนามัย", url: "https://youtu.be/czC6QY27rto", duration: "1 ชม. 43 น." },
    { id: "SF003", category: "🔥 หมวดความปลอดภัย (Safety)", icon: "🔥", title: "หัวข้อวิชาที่ 3 ข้อบังคับว่าด้วยความปลอดภัย", url: "https://youtu.be/YF9Bef5Oq0Q", duration: "2 ชม. 34 น." },
    { id: "MC001", category: "🖥️ สถานีเรียนรู้", icon: "🦺", title: "สถานีเรียนรู้ที่ 1 อุปกรณ์คุ้มครองความปลอดภัยส่วนบุคคล", url: "https://www.youtube.com/watch?v=vIDQ97nn9tY&t=5s", duration: "09:07 น." },
    { id: "MC002", category: "🖥️ สถานีเรียนรู้", icon: "⚠️", title: "สถานีเรียนรู้ที่ 2 สีและเครื่องหมายเพื่อความปลอดภัย", url: "https://www.youtube.com/watch?v=F4ysNeES1zE", duration: "08:18 น." },
    { id: "MC003", category: "🖥️ สถานีเรียนรู้", icon: "🕳️", title: "สถานีเรียนรู้ที่ 3 การปฏิบัติงานในที่อับอากาศ", url: "https://www.youtube.com/watch?v=pkbEetW3ic4", duration: "11:58 น." },
    { id: "MC004", category: "🖥️ สถานีเรียนรู้", icon: "☠️", title: "สถานีเรียนรู้ที่ 4 อันตรายจากสารเคมี", url: "https://www.youtube.com/watch?v=-zJ5IQAdcOo&t=1s", duration: "10:49 น." },
    { id: "MC005", category: "🖥️ สถานีเรียนรู้", icon: "📢", title: "สถานีเรียนรู้ที่ 5 การสื่อสารความเป็นอันตราย", url: "https://www.youtube.com/watch?v=kwSFo2w-V5w", duration: "09:30 น." },
    { id: "MC006", category: "🖥️ สถานีเรียนรู้", icon: "🔒", title: "สถานีเรียนรู้ที่ 6 การตัดแยกอุปกรณ์", url: "https://www.youtube.com/watch?v=YacumV_Zg7M", duration: "08:26 น." },
    { id: "MC007", category: "🖥️ สถานีเรียนรู้", icon: "⚡", title: "สถานีเรียนรู้ที่ 7 อันตรายจากไฟฟ้า", url: "https://www.youtube.com/watch?v=FoTdek_K-nY", duration: "10:24 น." },
    { id: "MC008", category: "🖥️ สถานีเรียนรู้", icon: "⚙️", title: "สถานีเรียนรู้ที่ 8 ความปลอดภัยในการทำงานกับเครื่องจักร", url: "https://www.youtube.com/watch?v=hb8b9XWCLCc", duration: "10:24 น." },
    { id: "MC009", category: "🖥️ สถานีเรียนรู้", icon: "🔥", title: "สถานีเรียนรู้ที่ 9 ความปลอดภัยในงานเชื่อม", url: "https://www.youtube.com/watch?v=3Ip4kW1UwKQ", duration: "10:20 น." },
    { id: "MC010", category: "🖥️ สถานีเรียนรู้", icon: "📦", title: "สถานีเรียนรู้ที่ 10 การยกย้ายวัสดุสิ่งของด้วยแรงคน", url: "https://www.youtube.com/watch?v=ZTQGeb2s_Z0", duration: "08:13 น." },
    { id: "MC011", category: "🖥️ สถานีเรียนรู้", icon: "🏗️", title: "สถานีเรียนรู้ที่ 11 การทำงานบนที่สูง", url: "https://www.youtube.com/watch?v=HfMtHovAVTk", duration: "10:45 น." },
    { id: "S501", category: "🗑️ 5ส เพื่อเพิ่มผลผลิต", icon: "🧹", title: "5ส เพื่อเพิ่มผลผลิต สำหรับอุตสาหกรรม ตอนที่ 1", url: "https://www.youtube.com/watch?v=6lAoHEIRXLg", duration: "1 ชม. 48 น." },
    { id: "S502", category: "🗑️ 5ส เพื่อเพิ่มผลผลิต", icon: "🧹", title: "5ส เพื่อเพิ่มผลผลิต สำหรับอุตสาหกรรม ตอนที่ 2", url: "https://www.youtube.com/watch?v=ZoLQu1Dlifw", duration: "1 ชม. 40 น." },
    { id: "S503", category: "🗑️ 5ส เพื่อเพิ่มผลผลิต", icon: "🧹", title: "5ส เพื่อเพิ่มผลผลิต สำหรับอุตสาหกรรม ตอนที่ 3", url: "https://www.youtube.com/watch?v=MCpZB8AdN7o", duration: "1 ชม. 48 น." }
  ];

  const categories = [...new Set(courses.map(c => c.category))];

  if (!user) return <Login onLogin={(u) => setUser(u)} />;
  if (user.role === 'admin') return <Dashboard onLogout={() => setUser(null)} />;

  return (
    <div>
      <nav className="navbar">
        <div className="brand-logo">🏢 Training Portal</div>
        <div className="user-profile">
          <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', lineHeight:'1.2'}}>
             <span style={{fontSize:'0.8rem', color:'#64748b'}}>พนักงาน</span>
             <b>{user.name}</b>
          </div>
          <button className="btn-logout" onClick={() => setUser(null)}>ออกจากระบบ</button>
        </div>
      </nav>

      <div className="dashboard-container">
        {!selectedCourse ? (
          <div>
            <div className="section-header">
              <h2>📚 คอร์สเรียนออนไลน์</h2>
              <p>พัฒนาทักษะและความปลอดภัยในการทำงานของคุณได้ที่นี่</p>
            </div>
            
            {categories.map(catName => (
              <div key={catName} className="category-section">
                <h3 className="category-title">
                  {catName}
                </h3>

                <div className="course-grid">
                  {courses
                    .filter(c => c.category === catName)
                    .map(c => (
                      <div key={c.id} className="course-card" onClick={() => setSelectedCourse(c)}>
                        <div>
                          <div className="card-icon">{c.icon}</div>
                          <h3 className="card-title">{c.title}</h3>
                          <div className="card-meta">
                             🕒 {c.duration} • 📹 วิดีโอ
                          </div>
                        </div>
                        <button className="btn-start-course">
                           เริ่มเรียน ➜
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="video-section">
            <div className="back-nav">
              <button className="btn-back" onClick={() => setSelectedCourse(null)}>
                ⬅️ กลับหน้ารวมคอร์ส
              </button>
            </div>
            
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <div style={{borderBottom:'1px solid #e2e8f0', paddingBottom:'1rem', marginBottom:'1.5rem'}}>
                  <h2 style={{margin:0, fontSize:'1.5rem', color:'#1e293b', display:'flex', alignItems:'center', gap:'0.5rem'}}>
                    <span style={{fontSize:'2rem'}}>{selectedCourse.icon}</span> 
                    {selectedCourse.title}
                  </h2>
              </div>
              
              <TrainingVideoPlayer 
                videoUrl={selectedCourse.url}
                employeeId={user.id}
                employeeName={user.name}
                courseId={selectedCourse.id}
              />

              <div style={{marginTop:'1.5rem', padding:'1rem', background:'#f0f9ff', borderRadius:'8px', border:'1px solid #bae6fd', color:'#0369a1', fontSize:'0.95rem', display:'flex', gap:'0.5rem'}}>
                ℹ️ <b>ข้อแนะนำ:</b> ระบบจะบันทึกเวลาเรียนให้อัตโนมัติ หากดูไม่จบสามารถกลับมาดูต่อได้
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;