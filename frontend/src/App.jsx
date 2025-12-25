// frontend/src/App.jsx
import React, { useState } from 'react';
import TrainingVideoPlayer from './TrainingVideoPlayer';
import Dashboard from './Dashboard';
import Login from './Login';

function App() {
  const [user, setUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // 📌 รายการคอร์สพร้อม YouTube URL
  const courses = [
    { 
      id: "SF001", 
      title: "🔥 ความปลอดภัยในโรงงาน", 
      // ✅ ใส่ URL YouTube แบบเต็ม หรือ แบบสั้น
      url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",  
      duration: "30 วินาที" 
    },
    { 
      id: "SF002", 
      title: "⚠️ การใช้อุปกรณ์ป้องกันส่วนบุคคล (PPE)", 
      url: "https://youtu.be/dQw4w9WgXcQ", // ← URL แบบสั้นก็ได้
      duration: "5 นาที" 
    },
    { 
      id: "CPR001", 
      title: "🚑 การปฐมพยาบาลเบื้องต้น", 
      url: "https://www.youtube.com/watch?v=VZoyfQAg9ag",
      duration: "12 นาที" 
    },
    { 
      id: "FIRE001", 
      title: "🧯 การดับเพลิงและหนีไฟ", 
      url: "https://www.youtube.com/watch?v=example123", // ← เปลี่ยนเป็น ID วิดีโอจริงของคุณ
      duration: "8 นาที" 
    }
  ];

  // 1. ถ้ายังไม่ Login -> แสดงหน้า Login
  if (!user) {
    return <Login onLogin={(userData) => setUser(userData)} />;
  }

  // 2. ถ้า Login เป็น ADMIN -> แสดงหน้า Dashboard
  if (user.role === 'admin') {
    return <Dashboard onLogout={() => setUser(null)} />;
  }

  // 3. ถ้า Login เป็น Employee -> แสดงหน้าเรียน
  return (
    <div className="container">
      {/* Header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white'
      }}>
        <div>
          <h2 style={{ margin: 0 }}>🏢 Training Hub</h2>
          <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
            สวัสดีคุณ {user.name} ({user.id})
          </p>
        </div>
        <button 
          onClick={() => setUser(null)} 
          style={{
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid white',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ออกจากระบบ
        </button>
      </header>

      {/* Content */}
      {!selectedCourse ? (
        // หน้ารายการคอร์ส
        <div>
          <h3 style={{ marginBottom: '20px', color: '#334155' }}>
            📚 หลักสูตรที่ต้องเรียน ({courses.length} หลักสูตร)
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '20px' 
          }}>
            {courses.map(course => (
              <div 
                key={course.id} 
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                }}
              >
                {/* Thumbnail */}
                <div style={{ 
                  height: '160px', 
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
                  borderRadius: '8px', 
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px'
                }}>
                  📺
                </div>

                {/* Course Info */}
                <h4 style={{ 
                  margin: '0 0 10px 0', 
                  fontSize: '18px',
                  color: '#1e293b'
                }}>
                  {course.title}
                </h4>
                
                <p style={{ 
                  fontSize: '14px', 
                  color: '#64748b', 
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  🕒 {course.duration}
                </p>

                <button 
                  onClick={() => setSelectedCourse(course)} 
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                  onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
                >
                  ▶️ เข้าเรียน
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // หน้าเล่นวิดีโอ
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <button 
            onClick={() => setSelectedCourse(null)} 
            style={{
              marginBottom: '20px',
              padding: '10px 20px',
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              color: '#475569',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '500'
            }}
          >
            ← กลับไปหน้ารวม
          </button>
          
          <h2 style={{ 
            marginBottom: '10px',
            color: '#1e293b'
          }}>
            {selectedCourse.title}
          </h2>

          <div style={{
            fontSize: '14px',
            color: '#64748b',
            marginBottom: '20px',
            display: 'flex',
            gap: '15px'
          }}>
            <span>📌 รหัสคอร์ส: {selectedCourse.id}</span>
            <span>🕒 ระยะเวลา: {selectedCourse.duration}</span>
          </div>
          
          <TrainingVideoPlayer 
            videoUrl={selectedCourse.url}
            employeeId={user.id}
            employeeName={user.name}
            courseId={selectedCourse.id}
          />

          {/* เพิ่มคำแนะนำ */}
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: '#fef3c7',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#92400e'
          }}>
            💡 <b>คำแนะนำ:</b> กรุณาดูวิดีโอให้ครบถ้วนเพื่อให้ระบบบันทึกว่าคุณเรียนจบแล้ว
          </div>
        </div>
      )}
    </div>
  );
}

export default App;