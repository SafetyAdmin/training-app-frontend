// frontend/src/TrainingVideoPlayer.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';

const TrainingVideoPlayer = ({ videoUrl, employeeId, employeeName, courseId }) => {
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playedSeconds, setPlayedSeconds] = useState(0); // เวลาที่ดูไปแล้วจริง
  const [duration, setDuration] = useState(0); // ความยาวคลิปทั้งหมด
  const [isReady, setIsReady] = useState(false); // เช็คว่าวิดีโอโหลดเสร็จยัง
  
  // ตัวแปรกันโกง: จำว่าดูได้ไกลสุดถึงวินาทีที่เท่าไหร่
  const [maxWatched, setMaxWatched] = useState(0); 

  // 1. โหลดข้อมูลเก่าจาก Cloud เมื่อเข้ามาครั้งแรก
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const res = await fetch(`https://training-api-pvak.onrender.com/api/get-progress?employeeId=${employeeId}&courseId=${courseId}`);
        const data = await res.json();
        
        if (data && data.currentTime > 0) {
          setMaxWatched(data.currentTime); // อนุญาตให้ดูย้อนหลังได้ถึงจุดที่เคยดู
          console.log('🔄 โหลดข้อมูลเดิม:', data.currentTime);
          
          // สั่งให้วิดีโอกระโดดไปจุดเดิมเมื่อพร้อม
          if (playerRef.current) {
            playerRef.current.seekTo(data.currentTime);
          }
        }
      } catch (err) {
        console.error("โหลดข้อมูลไม่สำเร็จ", err);
      }
    };
    loadProgress();
  }, [employeeId, courseId]);

  // 2. ฟังก์ชันบันทึกเวลา (ทำงานทุก 10 วินาที หรือเมื่อหยุด)
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
        console.log("💾 บันทึก:", currentTime.toFixed(0));
    } catch (err) { console.error(err); }
  };

  // 3. ฟังก์ชันตรวจสอบการกดข้าม (Anti-Cheat Logic) 🚫
  const handleProgress = (state) => {
    const current = state.playedSeconds;
    
    // ถ้ายังโหลดไม่เสร็จ อย่าเพิ่งเช็ค
    if (!isReady) return;

    // ถ้าพยายามกดข้ามไปไกลกว่าที่เคยดู (เกิน 2 วินาที)
    if (current > maxWatched + 2) {
        // ดีดกลับมาที่เดิม
        playerRef.current.seekTo(maxWatched);
        alert("⚠️ กรุณาดูวิดีโอตามลำดับ ห้ามกดข้าม!");
    } else {
        // ถ้าดูปกติ ให้อัปเดตเวลาสูงสุดที่ดูได้
        if (current > maxWatched) {
            setMaxWatched(current);
            setPlayedSeconds(current);
        }
        
        // บันทึกทุกๆ 10 วินาที (เพื่อลดภาระ Server)
        if (Math.floor(current) % 10 === 0 && current > 0) {
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
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
          controls={true} // เปิดปุ่ม Play/Pause
          
          // Event Handlers
          onReady={() => setIsReady(true)}
          onDuration={(d) => setDuration(d)}
          onProgress={handleProgress} // เช็คเวลาทุกวินาที
          onStart={() => {
              // พอกดเริ่ม ให้ดีดไปเวลาล่าสุดทันที (กันลืม)
              if(maxWatched > 0) playerRef.current.seekTo(maxWatched); 
          }}
          onEnded={() => {
              saveProgress(duration, duration);
              alert("🎉 เรียนจบหลักสูตรแล้ว!");
          }}
        />
      </div>

      <div style={{ padding: '15px' }}>
        <p><strong>ผู้เรียน:</strong> {employeeName}</p>
        <p style={{ color: '#666', fontSize: '12px' }}>
            ⏱️ เวลาล่าสุด: {playedSeconds.toFixed(0)} / {duration.toFixed(0)} วินาที <br/>
            🚫 ระบบป้องกันการกดข้ามอัตโนมัติ
        </p>
      </div>
    </div>
  );
};

export default TrainingVideoPlayer;