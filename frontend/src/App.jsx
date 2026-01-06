// src/App.jsx
import React, { useState, useMemo, useEffect } from 'react';
import './App.css';
import TrainingVideoPlayer from './TrainingVideoPlayer';
import Dashboard from './Dashboard';
import Login from './Login';

function App() {
  const [user, setUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // ✅ STATE ใหม่: ควบคุมแท็บ และ เก็บข้อมูลประวัติการเรียน
  const [activeTab, setActiveTab] = useState('Class'); // 'Class' หรือ 'MyLearning'
  const [myProgress, setMyProgress] = useState([]);    // เก็บข้อมูลที่ดึงมาจาก API
  const [activeCategory, setActiveCategory] = useState('All');

  // ข้อมูลคอร์ส (ชุดเดิม)
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

  const categories = useMemo(() => [...new Set(courses.map(c => c.category))], [courses]);

  // ✅ EFFECT: ดึงข้อมูล My Learning เมื่อกดแท็บ หรือเมื่อ User เปลี่ยน
  useEffect(() => {
    if (user && activeTab === 'MyLearning') {
      fetch(`https://training-api-pvak.onrender.com/api/my-learning/${user.employeeId}`) // แก้ URL ให้ตรงกับ Server
        .then(res => res.json())
        .then(data => {
          if (data.success) setMyProgress(data.data);
        })
        .catch(err => console.error("Error fetching my learning:", err));
    }
  }, [user, activeTab]);

  // จัดกลุ่มคอร์ส (สำหรับหน้า Class ปกติ)
  const groupedCourses = useMemo(() => {
    const groups = {};
    courses.forEach(course => {
      if (activeCategory === 'All' || activeCategory === course.category) {
        if (!groups[course.category]) groups[course.category] = [];
        groups[course.category].push(course);
      }
    });
    return groups;
  }, [courses, activeCategory]);

  // ✅ LOGIC: กรองคอร์สสำหรับหน้า My Learning
  const myLearningCourses = useMemo(() => {
    if (activeTab !== 'MyLearning') return [];
    // เอาคอร์สทั้งหมด มาเช็คว่า id นี้มีอยู่ในประวัติการเรียนไหม
    return courses.filter(course => {
      const record = myProgress.find(p => p.courseId === course.id);
      return record !== undefined; // ถ้ามีประวัติ แสดงว่าเคยเรียน
    }).map(course => {
       // แปะสถานะเพิ่มเข้าไปใน object course เพื่อเอาไปโชว์
       const record = myProgress.find(p => p.courseId === course.id);
       return { ...course, isCompleted: record.isCompleted, lastWatched: record.lastWatchedTime };
    });
  }, [courses, myProgress, activeTab]);


  if (!user) return <Login onLogin={(u) => setUser(u)} />;
  if (user.role === 'admin') return <Dashboard onLogout={() => setUser(null)} />;

  return (
    <div>
      {/* --- Navbar --- */}
      <nav className="navbar">
        <div className="nav-left">
          <div className="brand-logo">Learning Center</div>
          
          {/* ✅ แก้ไข: เมนูสลับแท็บได้จริง */}
          <div className="nav-menu">
            <span 
              onClick={() => setActiveTab('Class')}
              style={activeTab === 'Class' ? {color:'#4f46e5', borderBottom:'2px solid #4f46e5'} : {}}
            >
              Class
            </span>
            <span 
              onClick={() => setActiveTab('MyLearning')}
              style={activeTab === 'MyLearning' ? {color:'#4f46e5', borderBottom:'2px solid #4f46e5'} : {}}
            >
              My Learning
            </span>
          </div>
        </div>

        <div className="nav-right">
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2', marginRight: '8px'}}>
            <span style={{fontWeight: '600', color: '#374151', fontSize: '0.95rem'}}>{user.name}</span>
            <span style={{fontSize: '0.75rem', color: '#6b7280'}}>พนักงาน</span>
          </div>
          <div className="profile-circle" title={user.name}></div>
        </div>
      </nav>

      <div className="dashboard-container">
        {!selectedCourse ? (
          <>
            {/* 📌 กรณีอยู่หน้า Class (หน้าปกติ) */}
            {activeTab === 'Class' && (
              <>
                {/* Filter Banner */}
                <div className="category-filter-scroll">
                  <div 
                    className={`filter-card ${activeCategory === 'All' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('All')}
                    style={{background: '#374151'}}
                  >
                    <h4>Show All Resources</h4>
                    <span>{courses.length} courses</span>
                  </div>
                  {categories.map(cat => (
                    <div key={cat} className={`filter-card ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
                      <h4>{cat}</h4>
                      <span>{courses.filter(c => c.category === cat).length} courses</span>
                    </div>
                  ))}
                </div>

                <h3 className="section-title">Category Group</h3>

                <div className="groups-grid">
                  {Object.keys(groupedCourses).map(groupName => (
                    <div key={groupName} className="group-card">
                      <div className="group-header"><span>{groupName} &gt;</span></div>
                      {groupedCourses[groupName].map(course => (
                        <div key={course.id} className="course-list-item" onClick={() => setSelectedCourse(course)}>
                          <div className="course-thumb" style={{
                             background: groupName.includes('Safety') ? '#fee2e2' : groupName.includes('5S') ? '#dcfce7' : '#e0e7ff',
                             color: groupName.includes('Safety') ? '#ef4444' : groupName.includes('5S') ? '#166534' : '#4f46e5'
                          }}>
                            {course.icon}
                          </div>
                          <div className="course-info">
                            <div className="course-title">{course.title}</div>
                            <div className="course-meta">
                              <span>Online</span><span>|</span><span>🕒 {course.duration}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 📌 กรณีอยู่หน้า My Learning (หน้าใหม่) */}
            {activeTab === 'MyLearning' && (
              <>
                <h3 className="section-title">My Learning History</h3>
                
                {myLearningCourses.length === 0 ? (
                  <div style={{textAlign:'center', padding:'4rem', color:'#94a3b8'}}>
                    <div style={{fontSize:'3rem', marginBottom:'1rem'}}>📭</div>
                    <p>คุณยังไม่ได้เริ่มเรียนวิชาใดเลย</p>
                    <button onClick={() => setActiveTab('Class')} className="btn-start-course" style={{maxWidth:'200px', margin:'1rem auto'}}>ไปที่หน้าคอร์สเรียน</button>
                  </div>
                ) : (
                  <div className="groups-grid">
                     <div className="group-card" style={{gridColumn:'1 / -1'}}>
                        <div className="group-header"><span>หลักสูตรที่คุณเรียนไปแล้ว</span></div>
                        {myLearningCourses.map(course => (
                          <div key={course.id} className="course-list-item" onClick={() => setSelectedCourse(course)}>
                            <div className="course-thumb" style={{background:'#f3f4f6', color:'#6b7280'}}>
                              {course.icon}
                            </div>
                            <div className="course-info" style={{flex:1}}>
                              <div className="course-title">{course.title}</div>
                              <div className="course-meta">
                                {course.isCompleted ? (
                                  <span className="status-badge status-completed">✅ ผ่านแล้ว</span>
                                ) : (
                                  <span className="status-badge status-pending">🟡 กำลังเรียน ({Math.floor(course.lastWatched)} วินาที)</span>
                                )}
                              </div>
                            </div>
                            <div style={{display:'flex', alignItems:'center'}}>
                               <button className="icon-btn">▶</button>
                            </div>
                          </div>
                        ))}
                     </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          // --- หน้าเล่นวิดีโอ ---
          <div style={{marginTop:'2rem'}}>
            <button 
              onClick={() => setSelectedCourse(null)}
              style={{background:'white', border:'1px solid #e5e7eb', padding:'0.5rem 1rem', borderRadius:'8px', cursor:'pointer', marginBottom:'1rem', fontWeight:'600'}}
            >
              ⬅️ Back
            </button>
            <div style={{background:'white', padding:'2rem', borderRadius:'16px', boxShadow:'0 4px 6px rgba(0,0,0,0.05)'}}>
               <h2 style={{marginTop:0}}>{selectedCourse.icon} {selectedCourse.title}</h2>
               <TrainingVideoPlayer 
                  videoUrl={selectedCourse.url}
                  employeeId={user.employeeId} /* ⚠️ แก้ไขให้ใช้ employeeId */
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

  

 