// src/App.jsx
import React, { useState, useMemo } from 'react';
import './App.css';
import TrainingVideoPlayer from './TrainingVideoPlayer';
import Dashboard from './Dashboard';
import Login from './Login';

function App() {
  const [user, setUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  // --- ข้อมูลคอร์ส (ชุดเดิม) ---
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

  // 1. ดึงชื่อหมวดหมู่ทั้งหมด
  const categories = useMemo(() => [...new Set(courses.map(c => c.category))], [courses]);

  // 2. จัดกลุ่มคอร์ส (Group by Category) เพื่อให้แสดงเป็นกล่องๆ แบบในรูป
  const groupedCourses = useMemo(() => {
    const groups = {};
    courses.forEach(course => {
      // ถ้าเลือกดูทั้งหมด หรือ ตรงกับหมวดที่เลือก
      if (activeCategory === 'All' || activeCategory === course.category) {
        if (!groups[course.category]) {
          groups[course.category] = [];
        }
        groups[course.category].push(course);
      }
    });
    return groups;
  }, [courses, activeCategory]);

  if (!user) return <Login onLogin={(u) => setUser(u)} />;
  if (user.role === 'admin') return <Dashboard onLogout={() => setUser(null)} />;

  return (
    <div>
      {/* --- 1. Navbar เหมือนในรูป --- */}
      <nav className="navbar">
        <div className="nav-left">
          <div className="brand-logo">SEC Learning Center</div>
          <div className="nav-menu">
            <span style={{color:'#4f46e5', borderBottom:'2px solid #4f46e5'}}>Class</span>
            <span>My Learning</span>
          </div>
        </div>
        <div className="nav-right">
          
          {/* ส่วนแสดงชื่อและตำแหน่ง */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2', marginRight: '8px'}}>
            <span style={{fontWeight: '600', color: '#374151', fontSize: '0.95rem'}}>
              {user.name} {/* ชื่อพนักงาน */}
            </span>
            <span style={{fontSize: '0.75rem', color: '#6b7280'}}>
              พนักงาน {/* หรือจะใส่ user.id ก็ได้ */}
            </span>
          </div>

          {/* วงกลมรูปโปรไฟล์ (คงเดิม) */}
          <div className="profile-circle" title={user.name}></div>
          
        </div>
      </nav>

      <div className="dashboard-container">
        
        {!selectedCourse ? (
          <>
            {/* --- 2. Filter Banner (ปุ่มม่วงๆ ด้านบน) --- */}
            <div className="category-filter-scroll">
              <div 
                className={`filter-card ${activeCategory === 'All' ? 'active' : ''}`}
                onClick={() => setActiveCategory('All')}
                style={{background: '#374151'}} /* ปุ่มแรกสีเข้ม */
              >
                <h4>Show All Resources</h4>
                <span>{courses.length} courses</span>
              </div>

              {categories.map(cat => (
                <div 
                  key={cat} 
                  className={`filter-card ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  <h4>{cat}</h4>
                  <span>{courses.filter(c => c.category === cat).length} courses</span>
                </div>
              ))}
            </div>

            <h3 className="section-title">Category Group</h3>

            {/* --- 3. Main Content (แบบ 2 คอลัมน์) --- */}
            <div className="groups-grid">
              {Object.keys(groupedCourses).map(groupName => (
                <div key={groupName} className="group-card">
                  {/* หัวข้อกลุ่ม */}
                  <div className="group-header">
                    <span>{groupName} &gt;</span>
                  </div>

                  {/* รายการวิชาในกลุ่มนี้ */}
                  {groupedCourses[groupName].map(course => (
                    <div key={course.id} className="course-list-item" onClick={() => setSelectedCourse(course)}>
                      
                      {/* รูปด้านซ้าย (ใช้ Icon แทน Thumbnail) */}
                      <div className="course-thumb" style={{
                         background: groupName.includes('Safety') ? '#fee2e2' : 
                                     groupName.includes('5S') ? '#dcfce7' : '#e0e7ff',
                         color: groupName.includes('Safety') ? '#ef4444' : 
                                groupName.includes('5S') ? '#166534' : '#4f46e5'
                      }}>
                        {course.icon}
                      </div>

                      {/* รายละเอียดด้านขวา */}
                      <div className="course-info">
                        <div className="course-title">{course.title}</div>
                        <div className="course-meta">
                          <span>Online</span>
                          <span>|</span>
                          <span>🕒 {course.duration}</span>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        ) : (
          // --- หน้าเล่นวิดีโอ (คงเดิมแต่ปรับธีมให้เข้ากัน) ---
          <div style={{marginTop:'2rem'}}>
            <button 
              onClick={() => setSelectedCourse(null)}
              style={{
                background:'white', border:'1px solid #e5e7eb', padding:'0.5rem 1rem', 
                borderRadius:'8px', cursor:'pointer', marginBottom:'1rem', fontWeight:'600'
              }}
            >
              ⬅️ Back to Class
            </button>
            
            <div style={{background:'white', padding:'2rem', borderRadius:'16px', boxShadow:'0 4px 6px rgba(0,0,0,0.05)'}}>
               <h2 style={{marginTop:0}}>{selectedCourse.icon} {selectedCourse.title}</h2>
               <TrainingVideoPlayer 
                  videoUrl={selectedCourse.url}
                  employeeId={user.id}
                  employeeName={user.name}
                  courseId={selectedCourse.id}
               />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;