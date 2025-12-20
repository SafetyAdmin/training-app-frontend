// frontend/src/TrainingVideoPlayer.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';

const TrainingVideoPlayer = ({ 
  videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  employeeId = 'EMP001', 
  employeeName = 'ทดสอบ ระบบ', 
  courseId = 'COURSE001' 
}) => {
  const playerRef = useRef(null);
  
  // State ต่างๆ
  const [hasStarted, setHasStarted] = useState(false); // 🚩 ตัวแปรสำคัญ: เช็คว่ากดเริ่มหรือยัง
  const [isPlaying, setIsPlaying] = useState(false);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [maxWatched, setMaxWatched] = useState(0);
  const [startTime, setStartTime] = useState(0); // เวลาที่จะให้เริ่มเล่น
  
  // 1. โหลดข้อมูลเดิมจาก Cloud (ทำทันทีที่เปิดหน้า)
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const res = await fetch(`https://training-api-pvak.onrender.com/api/get-progress?employeeId=${employeeId}&courseId=${courseId}`);
        const data = await res.json();
        
        if (data && data.currentTime > 0) {
          setMaxWatched(data.currentTime);
          setStartTime(data.currentTime); // จำเวลาเดิมไว้ รอคนกดปุ่มเริ่ม
          console.log('🔄 พบประวัติการเรียน: วินาทีที่', data.currentTime);
        }
      } catch (err) { console.error('โหลดข้อมูลไม่สำเร็จ:', err); }
    };
    loadProgress();
  }, [employeeId, courseId]);

  // 2. ฟังก์ชันบันทึก
  const saveProgress = async (currentTime, totalTime) => {
    try {
      await fetch('https://training-api-pvak.onrender.com/api/save-progress', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId, employeeName, courseId,
          currentTime: Math.floor(currentTime),
          totalDuration: Math.floor(totalTime)
        })
      });
    } catch (err) { console.error(err); }
  };

  // 3. ระบบกันโกง + อัปเดตเวลา
  const handleProgress = (state) => {
    const current = state.playedSeconds;
    setPlayedSeconds(current);

    // กันข้าม: ถ้าปัจจุบัน มากกว่า ที่เคยดูเกิน 2 วินาที
    if (current > maxWatched + 2) {
       // ดีดกลับเงียบๆ
       if (playerRef.current) playerRef.current.seekTo(maxWatched, 'seconds');
    } else {
       // อัปเดตปกติ
       if (current > maxWatched) setMaxWatched(current);
    }
    
    // บันทึกทุก 5 วิ
    if (current > 0 && Math.floor(current) % 5 === 0) {
        saveProgress(current, duration);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      {/* Header */}
      <div style={{ padding: '20px', background: '#2563eb', color: 'white' }}>
        <h3 style={{ margin: 0 }}>📺 ห้องเรียนออนไลน์</h3>
      </div>

      <div style={{ position: 'relative', paddingTop: '56.25%', background: 'black' }}>
        
        {/* A. ถ้ายังไม่กดเริ่ม -> โชว์ปุ่มยักษ์ (แก้ปัญหาจอดำ) */}
        {!hasStarted ? (
          <div 
            onClick={() => setHasStarted(true)} // พอกดปุ๊บ จะเปลี่ยนไปโหมดเล่นวิดีโอ
            style={{ 
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
              background: 'rgba(0,0,0,0.8)', cursor: 'pointer', zIndex: 10
            }}
          >
            <div style={{ fontSize: '80px', color: 'white', marginBottom: '10px' }}>▶️</div>
            <button style={{ padding: '15px 30px', fontSize: '20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer' }}>
              แตะเพื่อเริ่มเรียน
            </button>
            {startTime > 0 && <p style={{color: '#ddd', marginTop: '15px'}}>⏱️ เล่นต่อจากนาทีที่ {Math.floor(startTime/60)}:{Math.floor(startTime%60)}</p>}
          </div>
        ) : (
          // B. ถ้ากดเริ่มแล้ว -> โหลด ReactPlayer
          <ReactPlayer
            ref={playerRef}
            url={videoUrl}
            width="100%"
            height="100%"
            style={{ position: 'absolute', top: 0, left: 0 }}
            
            playing={true}   // สั่งเล่นเลย (เพราะผ่านการกดปุ่มมาแล้ว Browser ยอมแน่นอน)
            controls={true}  // เปิดปุ่ม YouTube ปกติ (กันเหนียวให้เล่นได้ชัวร์)
            
            config={{
                youtube: {
                    playerVars: { 
                        start: Math.floor(startTime), // สั่ง YouTube ให้เริ่มที่เวลาเดิมตรงๆ
                        modestbranding: 1,
                        rel: 0
                    }
                }
            }}

            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onDuration={(d) => setDuration(d)}
            onProgress={handleProgress}
            onEnded={() => {
                saveProgress(duration, duration);
                alert("🎉 จบหลักสูตรเรียบร้อย!");
            }}
          />
        )}
      </div>

      {/* แผงควบคุมด้านล่าง */}
      <div style={{ padding: '20px', background: '#f8fafc' }}>
         <p><strong>ผู้เรียน:</strong> {employeeName}</p>
         
         {/* หลอดความคืบหน้า (Custom) */}
         <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden', marginTop: '10px' }}>
            <div style={{ width: `${(playedSeconds / duration) * 100}%`, background: '#2563eb', height: '100%', transition: 'width 0.3s' }}></div>
         </div>
         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginTop: '5px' }}>
            <span>▶️ เล่นไปแล้ว: {Math.floor(playedSeconds)} วิ</span>
            <span>🟩 เคยดูถึง: {Math.floor(maxWatched)} วิ</span>
         </div>
         
         <div style={{ marginTop: '15px', padding: '10px', background: '#fffbeb', borderLeft: '4px solid #f59e0b', fontSize: '13px', color: '#92400e' }}>
            🔒 <strong>ระบบ Anti-Skip:</strong> หากกดข้ามเกิน 2 วินาที วิดีโอจะดีดกลับที่เดิม
         </div>
      </div>
    </div>
  );
};

export default TrainingVideoPlayer;