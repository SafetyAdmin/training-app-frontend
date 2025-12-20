// frontend/src/TrainingVideoPlayer.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';

const TrainingVideoPlayer = ({ videoUrl, employeeId, employeeName, courseId }) => {
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [maxWatched, setMaxWatched] = useState(0); // จำเวลาสูงสุดที่ดูถึง

  // 1. โหลดข้อมูลเดิม (ถ้ามี)
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const res = await fetch(`https://training-api-pvak.onrender.com/api/get-progress?employeeId=${employeeId}&courseId=${courseId}`);
        const data = await res.json();
        if (data && data.currentTime > 0) {
          setMaxWatched(data.currentTime);
          console.log('🔄 เริ่มต่อจากวินาทีที่:', data.currentTime);
          // ตั้งเวลาให้กระโดดไปที่เดิม
          if (playerRef.current) {
            playerRef.current.seekTo(data.currentTime);
          }
        }
      } catch (err) { console.error(err); }
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
              employeeId,
              employeeName,
              courseId,
              currentTime: currentTime,
              totalDuration: totalTime
            })
        });
    } catch (err) { console.error(err); }
  };

  // 3. 👮‍♂️ ระบบตำรวจจับเวลา (Time Police)
  const handleProgress = (state) => {
    const current = state.playedSeconds;

    // ถ้าพยายามข้ามไปไกลกว่าที่เคยดู (เกิน 1 วินาที)
    if (current > maxWatched + 1) {
        // 🚫 ดีดกลับมาที่เดิมทันที!
        if (playerRef.current) {
            playerRef.current.seekTo(maxWatched, 'fraction');
        }
        console.log("👮‍♂️ จับได้ว่ากดข้าม! ดีดกลับไปที่ " + maxWatched);
    } else {
        // ✅ ถ้าดูตามปกติ ให้อัปเดตเวลาสูงสุด
        if (current > maxWatched) {
            setMaxWatched(current);
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
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
          
          controls={true} // ✅ เปิดปุ่ม YouTube ปกติ (เพื่อให้วิดีโอเล่นได้แน่นอน)
          
          onDuration={(d) => setDuration(d)}
          onProgress={handleProgress} // 👮‍♂️ ฝังระบบจับเวลาไว้ตรงนี้
          
          onStart={() => {
              // พอกดเริ่ม ให้เช็คว่าต้องข้ามไปที่เดิมไหม
              if(maxWatched > 0) playerRef.current.seekTo(maxWatched); 
          }}
          
          onEnded={() => {
              saveProgress(duration, duration);
              alert("🎉 ยินดีด้วย! เรียนจบหลักสูตรแล้ว");
          }}
        />
      </div>

      <div style={{ padding: '15px' }}>
        <p><strong>ผู้เรียน:</strong> {employeeName} ({employeeId})</p>
        <div style={{ background: '#fff3cd', color: '#856404', padding: '10px', borderRadius: '5px', fontSize: '13px', marginTop: '10px' }}>
            ⚠️ <strong>ระบบป้องกันการกดข้าม:</strong> หากท่านลากแถบวิดีโอไปข้างหน้า วิดีโอจะเด้งกลับมาที่เดิมอัตโนมัติ
        </div>
      </div>
    </div>
  );
};

export default TrainingVideoPlayer;