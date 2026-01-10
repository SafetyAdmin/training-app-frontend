// src/App.jsx
import React, { useState, useMemo, useEffect } from 'react';
import './App.css';
import TrainingVideoPlayer from './TrainingVideoPlayer';
import Dashboard from './Dashboard';
import Login from './Login';
import QuizModal from './QuizModal'; // 🔥 import เข้ามา

function App() {
  const [user, setUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('Class'); 
  const [myProgress, setMyProgress] = useState([]);    
  const [activeCategory, setActiveCategory] = useState('All');
  const [showQuiz, setShowQuiz] = useState(false); // ควบคุมการแสดง Quiz
  
  // ✅ สร้าง State สำหรับเก็บรายชื่อคอร์ส
  const [courses, setCourses] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  const handleVideoEnded = (courseId) => {
     const course = courses.find(c => c.id === courseId);
     
     // เช็คว่าคอร์สนี้มีคำถามไหม?
     if (course && course.questions && course.questions.length > 0) {
         setShowQuiz(true); // มีข้อสอบ -> เปิด Quiz Modal
     } else {
         // ไม่มีข้อสอบ -> จบเลย (เรียก API เดิมเพื่อเซฟ Completed)
         // (ปกติ TrainingVideoPlayer จะเซฟให้อัตโนมัติอยู่แล้ว แต่ต้องแก้ไม่ให้มันเซฟ Completed จนกว่าจะสอบผ่าน)
     }
  };

  // 🔥 ฟังก์ชันส่งคำตอบ
  const handleSubmitQuiz = async (answers) => {
      try {
          const res = await fetch('https://training-api-pvak.onrender.com/api/submit-quiz', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                  employeeId: user.employeeId,
                  courseId: selectedCourse.id,
                  answers: answers
              })
          });
          const data = await res.json();
          
          if (data.isPassed) {
              // ถ้าสอบผ่าน ให้รีเฟรชข้อมูล My Learning ใหม่เพื่อให้ขึ้นติ๊กถูก
              // (คุณอาจต้องย้าย Logic fetch My Learning มาไว้เป็นฟังก์ชันกลางเพื่อเรียกซ้ำได้)
          }
          return data;
      } catch (err) { console.error(err); return { isPassed: false }; }
  };

  // ✅ EFFECT 1: ดึงรายชื่อคอร์สจาก Server
  useEffect(() => {
    // ต้องรอให้ user login ก่อนถึงจะดึงคอร์ส (เพื่อจะได้รู้ role)
    if (!user) return; 

    // ส่ง ?role=... ไปที่ Server
    fetch(`https://training-api-pvak.onrender.com/api/courses?role=${user.role}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
            setCourses(data.data);
        }
        setIsLoadingCourses(false);
      })
      .catch(err => {
          console.error("Failed to load courses", err);
          setIsLoadingCourses(false);
      });
  }, [user]); // 🔥 ใส่ user ใน dependency array (พอ login ปุ๊บ โหลดปั๊บ)

  // ✅ EFFECT 2: ดึงประวัติการเรียน (My Progress)
  useEffect(() => {
    if (user && activeTab === 'MyLearning') {
      fetch(`https://training-api-pvak.onrender.com/api/my-learning/${user.employeeId}`) 
        .then(res => res.json())
        .then(data => {
          if (data.success) setMyProgress(data.data);
        })
        .catch(err => console.error("Error fetching my learning:", err));
    }
  }, [user, activeTab]);

  // 🔥 ฟังก์ชันเปลี่ยน Tab (แก้ปัญหา: กดแล้วไม่เปลี่ยนหน้า)
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSelectedCourse(null); // 🟢 สำคัญมาก! สั่งปิดวิดีโอทันที
  };

  // คำนวณหมวดหมู่
  const categories = useMemo(() => [...new Set(courses.map(c => c.category))], [courses]);

  // จัดกลุ่มคอร์ส
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

  // กรองคอร์สสำหรับ My Learning
  const myLearningCourses = useMemo(() => {
    if (activeTab !== 'MyLearning') return [];
    return courses.filter(course => {
      const record = myProgress.find(p => p.courseId === course.id);
      return record !== undefined; 
    }).map(course => {
       const record = myProgress.find(p => p.courseId === course.id);
       return { ...course, isCompleted: record.isCompleted, lastWatched: record.lastWatchedTime };
    });
  }, [courses, myProgress, activeTab]);

  // --- Render Section ---

  if (!user) return <Login onLogin={(u) => setUser(u)} />;
  if (user.role === 'admin') return <Dashboard onLogout={() => setUser(null)} />;

  return (
    <div>
      <nav className="navbar">
        <div className="nav-left">
          <div className="brand-logo">🏭 SEC Learning Center</div>
          
          {/* ✅ เมนูเปลี่ยนหน้า (เรียกใช้ handleTabChange) */}
          <div className="nav-menu">
            <span 
                onClick={() => handleTabChange('Class')} 
                style={activeTab === 'Class' ? {color:'#4f46e5', borderBottom:'2px solid #4f46e5'} : {}}
            >
                Class
            </span>
            <span 
                onClick={() => handleTabChange('MyLearning')} 
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
          <button 
            onClick={() => setUser(null)}
            style={{
              marginLeft: '10px', padding: '6px 12px', border: '1px solid #fee2e2',
              backgroundColor: '#fff1f2', color: '#ef4444', borderRadius: '6px',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500'
            }}
          >
            ออก
          </button>
        </div>
      </nav>

      <div className="dashboard-container">
        {!selectedCourse ? (
          <>
            {/* --- TAB: CLASS --- */}
            {activeTab === 'Class' && (
              <>
                {isLoadingCourses && (
                    <div style={{textAlign:'center', padding:'2rem', color:'#6b7280'}}>
                        ⏳ กำลังโหลดรายชื่อวิชาจากระบบ...
                    </div>
                )}

                {!isLoadingCourses && (
                    <div className="category-filter-scroll">
                    <div className={`filter-card ${activeCategory === 'All' ? 'active' : ''}`} onClick={() => setActiveCategory('All')} style={{background: '#02d6fcff'}}>
                        <h4>Show All Resources</h4><span>{courses.length} courses</span>
                    </div>
                    {categories.map(cat => (
                        <div key={cat} className={`filter-card ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
                        <h4>{cat}</h4><span>{courses.filter(c => c.category === cat).length} courses</span>
                        </div>
                    ))}
                    </div>
                )}

                {!isLoadingCourses && courses.length === 0 && (
                    <div style={{textAlign:'center', marginTop:'2rem'}}>🚫 ไม่พบวิชาในระบบ (กรุณาแจ้ง Admin)</div>
                )}

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
                          }}>{course.icon}</div>
                          <div className="course-info">
                            <div className="course-title">{course.title}</div>
                            <div className="course-meta"><span>Online</span><span>|</span><span>🕒 {course.duration}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* --- TAB: MY LEARNING --- */}
            {activeTab === 'MyLearning' && (
              <>
                <h3 className="section-title">My Learning History</h3>
                {myLearningCourses.length === 0 ? (
                  <div style={{textAlign:'center', padding:'4rem', color:'#94a3b8'}}>
                    <div style={{fontSize:'3rem', marginBottom:'1rem'}}>📭</div>
                    <p>คุณยังไม่ได้เริ่มเรียนวิชาใดเลย</p>
                    <button onClick={() => handleTabChange('Class')} className="btn-start-course" style={{maxWidth:'200px', margin:'1rem auto', padding:'10px', background:'#4f46e5', color:'white', border:'none', borderRadius:'6px', cursor:'pointer'}}>ไปที่หน้าคอร์สเรียน</button>
                  </div>
                ) : (
                  <div className="groups-grid">
                      <div className="group-card" style={{gridColumn:'1 / -1'}}>
                          <div className="group-header"><span>หลักสูตรที่คุณเรียนไปแล้ว</span></div>
                          {myLearningCourses.map(course => (
                            <div key={course.id} className="course-list-item" onClick={() => setSelectedCourse(course)}>
                              <div className="course-thumb" style={{background:'#f3f4f6', color:'#6b7280'}}>{course.icon}</div>
                              <div className="course-info" style={{flex:1}}>
                                <div className="course-title">{course.title}</div>
                                <div className="course-meta">
                                  {course.isCompleted ? <span className="status-badge status-completed">✅ ผ่านแล้ว</span> : <span className="status-badge status-pending">🟡 กำลังเรียน ({Math.floor(course.lastWatched)} วินาที)</span>}
                                </div>
                              </div>
                              <div style={{display:'flex', alignItems:'center'}}><button className="icon-btn">▶</button></div>
                            </div>
                          ))}
                      </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          /* --- VIDEO PLAYER PAGE --- */
          <div style={{marginTop:'2rem'}}>
            <button onClick={() => setSelectedCourse(null)} style={{background:'white', border:'1px solid #e5e7eb', padding:'0.5rem 1rem', borderRadius:'8px', cursor:'pointer', marginBottom:'1rem', fontWeight:'600'}}>⬅️ Back</button>
            <div style={{background:'white', padding:'2rem', borderRadius:'16px', boxShadow:'0 4px 6px rgba(0,0,0,0.05)'}}>
               <h2 style={{marginTop:0}}>{selectedCourse.icon} {selectedCourse.title}</h2>
               <TrainingVideoPlayer 
                 videoUrl={selectedCourse.url}
                 employeeId={user.employeeId}
                 employeeName={user.name}
                 courseId={selectedCourse.id}
                 hasExam={selectedCourse.questions && selectedCourse.questions.length > 0}
                 onVideoEnd={() => handleVideoEnded(selectedCourse.id)}
               />
               {/* 🔥 แสดง Quiz Modal ถ้า showQuiz = true */}
               {showQuiz && (
                   <QuizModal 
                       course={selectedCourse} 
                       onSubmit={handleSubmitQuiz}
                       onCancel={() => { setShowQuiz(false); setSelectedCourse(null); }} // สอบผ่าน/ปิด -> กลับหน้าหลัก
                   />
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;