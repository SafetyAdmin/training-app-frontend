// frontend/src/TrainingVideoPlayer.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';

const TrainingVideoPlayer = ({ videoUrl, employeeId, employeeName, courseId }) => {
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [maxWatched, setMaxWatched] = useState(0); 

  // 1. โหลดข้อมูลเดิมจาก Cloud
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const res = await fetch(`https://training-api-pvak.onrender.com/api/get-progress?employeeId=${employeeId}&courseId=${courseId}`);
        const data = await res.json();
        
        if (data && data.currentTime > 0) {
          setMaxWatched(data.currentTime);
          setPlayedSeconds(data.currentTime);
          console.log('🔄 ต่อที่เดิม:', data.currentTime);
          
          if (playerRef.current) {
            playerRef.current.seekTo(data.currentTime);
          }
        }
      } catch (err) { console.error(err); }
    };
    loadProgress();
  }, [employeeId, courseId]);

  // 2. บันทึกข้อมูล
  const saveProgress = async (currentTime, totalTime) => {
    try {
        await fetch('https://training-api-pvak.onrender.com/api/save-progress', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employeeId,
              employeeName,
              courseId,
              currentTime: currentTime,
              totalDuration: totalTime
            })
        });
    } catch (err) { console.error(err); }
  };

  // 3. ระบบกันโกง (ทำงานเมื่อวิดีโอเล่น)
  const handleProgress = (state) => {
    if (!isReady) return;
    const current = state.playedSeconds;

    // A. ถ้าพยายามข้ามไปไกลกว่าที่เคยดู (เกิน 3 วินาที) -> ดีดกลับ
    if (current > maxWatched + 3) {
        playerRef.current.seekTo(maxWatched); // ดีดกลับที่เดิม
    } else {
        // B. ถ้าดูปกติ -> อัปเดตเวลาล่าสุด
        if (current > maxWatched) {
            setMaxWatched(current);
            setPlayedSeconds(current);
        }
        
        // บันทึกทุก 5 วินาที
        if (Math.floor(current) % 5 === 0 && current > 0) {
             saveProgress(current, duration);
        }
    }
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #ddd' }}>
      <div style={{ padding: '15px', background: '#2563eb', color: 'white' }}>
        <h3 style={{ margin: 0 }}>📺 ห้องเรียนออนไลน์</h3>
        <p style={{ margin: 0, opacity: 0.8 }}>หลักสูตร: {courseId}</p>
      </div>

      <div style={{ position: 'relative', paddingTop: '56.25%', background: 'black' }}>
        {/* เลเยอร์ใสบังหน้าจอ: กันคลิกขวา หรือกดที่ตัววิดีโอโดยตรง */}
        <div 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '85%', zIndex: 10, cursor: 'not-allowed' }}
            onClick={(e) => { e.preventDefault(); alert("🚫 กรุณาใช้ปุ่มเล่น/หยุด ด้านล่าง"); }}
        ></div>

        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
          
          playing={isPlaying} // ควบคุมการเล่นผ่านตัวแปรนี้
          controls={false}    // ❌ ซ่อนปุ่ม YouTube ทิ้งไปเลย (สำคัญมาก)
          
          // ตั้งค่า YouTube เพิ่มเติมเพื่อปิดคีย์บอร์ด
          config={{
            youtube: {
              playerVars: { 
                controls: 0,     // ซ่อนแถบควบคุม
                disablekb: 1,    // ปิดคีย์บอร์ด (กันกดลูกศรข้าม)
                modestbranding: 1,
                rel: 0,
                fs: 0            // ปิด Fullscreen (เพื่อบังคับให้ดูในกรอบเรา)
              }
            }
          }}

          onReady={() => setIsReady(true)}
          onDuration={(d) => setDuration(d)}
          onProgress={handleProgress}
          onEnded={() => {
              saveProgress(duration, duration);
              alert("🎉 เรียนจบหลักสูตรแล้ว!");
          }}
        />
      </div>

      {/* 4. สร้างปุ่มควบคุมเอง (Custom Controls) */}
      <div style={{ padding: '15px', background: '#f8f9fa', borderTop: '1px solid #eee' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
            <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="btn"
                style={{ 
                    background: isPlaying ? '#ef4444' : '#10b981', 
                    color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
                }}
            >
                {isPlaying ? '⏸️ หยุดชั่วคราว' : '▶️ เล่นวิดีโอ'}
            </button>
            
            <div style={{ flex: 1, background: '#e5e7eb', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ 
                    width: `${(playedSeconds / duration) * 100}%`, 
                    background: '#3b82f6', height: '100%', transition: 'width 0.5s' 
                }}></div>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                {Math.floor(playedSeconds)} / {Math.floor(duration)} วินาที
            </span>
        </div>

        <p><strong>ผู้เรียน:</strong> {employeeName}</p>
        <p style={{ color: '#d97706', fontSize: '12px', margin: 0 }}>
            🔒 <strong>Anti-Skip Active:</strong> ระบบปิดแถบควบคุมเพื่อป้องกันการกดข้าม
        </p>
      </div>
    </div>
  );
};

export default TrainingVideoPlayer;