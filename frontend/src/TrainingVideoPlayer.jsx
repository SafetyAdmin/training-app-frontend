// frontend/src/TrainingVideoPlayer.jsx
import React, { useRef, useState, useEffect } from 'react';

const TrainingVideoPlayer = ({ videoUrl, employeeId, employeeName, courseId }) => {
  const videoRef = useRef(null);
  const [maxWatchedTime, setMaxWatchedTime] = useState(0); 

  // ฟังก์ชันส่งข้อมูลไปหลังบ้าน
  const saveProgressToBackend = async (currentTime, duration) => {
    try {
      await fetch('http://localhost:3001/api/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          employeeName,
          courseId,
          currentTime,
          totalDuration: duration
        })
      });
      console.log(`บันทึก: ${currentTime.toFixed(0)} / ${duration.toFixed(0)}`);
    } catch (err) {
      console.error("เชื่อมต่อไม่ได้:", err);
    }
  };

  // Logic กันโกง (Anti-Seeking)
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    // ถ้าพยายามข้ามไปไกลกว่าที่เคยดู (เกิน 1 วินาที)
    if (!video.seeking && video.currentTime > maxWatchedTime + 1) {
      video.currentTime = maxWatchedTime; 
      alert("⚠️ กรุณาดูวิดีโอตามลำดับ ห้ามกดข้าม");
    } else {
      // ถ้าดูปกติ ให้อัปเดตเวลาสูงสุดที่ดูถึง
      if (video.currentTime > maxWatchedTime) {
        setMaxWatchedTime(video.currentTime);
      }
    }
  };

  const handlePauseOrEnd = () => {
    if (videoRef.current) {
        saveProgressToBackend(videoRef.current.currentTime, videoRef.current.duration);
    }
  };

  // ส่งข้อมูลทุก 5 วินาที
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        saveProgressToBackend(videoRef.current.currentTime, videoRef.current.duration);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ background: 'black', width: '100%' }}>
        <video
          ref={videoRef}
          src={videoUrl}
          style={{ width: '100%', display: 'block', maxHeight: '500px' }}
          controls
          // ป้องกันคลิกขวา (พื้นฐาน)
          onContextMenu={(e) => e.preventDefault()}
          onTimeUpdate={handleTimeUpdate}
          onPause={handlePauseOrEnd}
          onEnded={() => {
              handlePauseOrEnd();
              alert("🎉 ยินดีด้วย! คุณเรียนจบทเรียนนี้แล้ว");
          }}
        />
      </div>
      <div style={{ padding: '15px' }}>
        <p><strong>ผู้เรียน:</strong> {employeeName} ({employeeId})</p>
        <p style={{ color: '#666', fontSize: '14px' }}>* ระบบบันทึกเวลาอัตโนมัติ ห้ามกดข้าม</p>
      </div>
    </div>
  );
};

export default TrainingVideoPlayer;