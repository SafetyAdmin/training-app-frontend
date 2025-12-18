// frontend/src/TrainingVideoPlayer.jsx
import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player'; // ต้อง import ตัวนี้

const TrainingVideoPlayer = ({ videoUrl, employeeId, employeeName, courseId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);

  // ฟังก์ชันส่งข้อมูลไปหลังบ้าน
  const saveProgressToBackend = async (currentTime, totalDuration) => {
    try {
      // *** อย่าลืมเช็คลิ้งก์ API ให้ตรงกับ Backend ของคุณ (Render หรือ Localhost) ***
      await fetch('https://training-api-pvak.onrender.com/', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          employeeName,
          courseId,
          currentTime,
          totalDuration
        })
      });
      console.log('Saved:', currentTime);
    } catch (err) {
      console.error("Error saving progress:", err);
    }
  };

  // ส่งข้อมูลทุก 5 วินาทีเมื่อเล่นอยู่
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && duration > 0) {
        saveProgressToBackend(playedSeconds, duration);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, duration, playedSeconds]);

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ position: 'relative', paddingTop: '56.25%' /* อัตราส่วน 16:9 */ }}>
        <ReactPlayer
          url={videoUrl}
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
          controls={true}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onDuration={(d) => setDuration(d)}
          onProgress={(progress) => {
            setPlayedSeconds(progress.playedSeconds);
          }}
          onEnded={() => {
            saveProgressToBackend(duration, duration);
            alert("🎉 ยินดีด้วย! คุณเรียนจบบทเรียนนี้แล้ว");
          }}
        />
      </div>
      <div style={{ padding: '15px' }}>
        <p><strong>ผู้เรียน:</strong> {employeeName} ({employeeId})</p>
        <p style={{ fontSize: '12px', color: '#666' }}>ระบบบันทึกเวลาอัตโนมัติ (รองรับ YouTube)</p>
      </div>
    </div>
  );
};

export default TrainingVideoPlayer;