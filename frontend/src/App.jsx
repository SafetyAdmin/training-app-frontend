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
    { id: "SF001", category: "หมวดความปลอดภัย (Safety)", icon: "🔥", title: "ความรู้เกี่ยวกับความปลอดภัยในการทำงาน", url: "https://youtu.be/jH4ZRU7Q4VA", duration: "1 ชม. 25 น." },
    { id: "SF002", category: "หมวดความปลอดภัย (Safety)", icon: "🔥", title: "กฎหมายความปลอดภัย อาชีวอนามัย", url: "https://youtu.be/czC6QY27rto", duration: "1 ชม. 43 น." },
    { id: "SF003", category: "หมวดความปลอดภัย (Safety)", icon: "🔥", title: "ข้อบังคับว่าด้วยความปลอดภัย", url: "https://youtu.be/YF9Bef5Oq0Q", duration: "2 ชม. 34 น." },
    { id: "MC001", category: "สถานีเรียนรู้ (Stations)", icon: "🦺", title: "อุปกรณ์คุ้มครองความปลอดภัยส่วนบุคคล", url: "https://www.youtube.com/watch?v=vIDQ97nn9tY", duration: "09:07 น." },
    { id: "MC004", category: "สถานีเรียนรู้ (Stations)", icon: "☠️", title: "อันตรายจากสารเคมี", url: "https://www.youtube.com/watch?v=-zJ5IQAdcOo", duration: "10:49 น." },
    { id: "MC007", category: "สถานีเรียนรู้ (Stations)", icon: "⚡", title: "อันตรายจากไฟฟ้า", url: "https://www.youtube.com/watch?v=FoTdek_K-nY", duration: "10:24 น." },
    { id: "S501", category: "5ส เพื่อเพิ่มผลผลิต (5S)", icon: "🧹", title: "5ส เพื่อเพิ่มผลผลิต ตอนที่ 1", url: "https://www.youtube.com/watch?v=6lAoHEIRXLg", duration: "1 ชม. 48 น." },
    { id: "S502", category: "5ส เพื่อเพิ่มผลผลิต (5S)", icon: "🧹", title: "5ส เพื่อเพิ่มผลผลิต ตอนที่ 2", url: "https://www.youtube.com/watch?v=ZoLQu1Dlifw", duration: "1 ชม. 40 น." }
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
          <button className="icon-btn">🔍</button>
          <button className="icon-btn">🔔</button>
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