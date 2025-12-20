// frontend/src/TrainingVideoPlayer.jsx
import React, { useState, useEffect } from 'react';

const TrainingVideoPlayer = ({ 
  videoUrl, 
  employeeId, 
  employeeName, 
  courseId 
}) => {
  const [elapsedTime, setElapsedTime] = useState(0); // จับเวลาที่เปิดหน้าจอนี้

  // ฟังก์ชันแปลงลิ้งก์ YouTube ให้เป็นรหัสวิดีโอ (เช่น VZoyfQAg9ag)
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeId(videoUrl);

  // ฟังก์ชันส่งเวลาไปหลังบ้าน (ส่งทุกๆ 5 วินาที)
  useEffect(() => {
    const interval = setInterval(() => {
      // เพิ่มเวลาทีละ 5 วินาที (จำลองการเรียน)
      setElapsedTime(prev => {
        const newTime = prev + 5;
        saveProgressToBackend(newTime);
        return newTime;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const saveProgressToBackend = async (currentTime) => {
    try {
      // ✅ ลิ้งก์ API ที่ถูกต้อง
      await fetch('https://training-api-pvak.onrender.com/api/save-progress', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          employeeName,
          courseId,
          currentTime: currentTime,
          totalDuration: 600 // ค่าสมมติ (10 นาที) เพราะ Iframe ดึงเวลาจริงยาก
        })
      });
      console.log('บันทึกเวลาเรียน:', currentTime);
    } catch (err) {
      console.error("บันทึกไม่สำเร็จ:", err);
    }
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #ddd' }}>
      <div style={{ padding: '15px', background: '#2563eb', color: 'white' }}>
        <h3 style={{ margin: 0 }}>📺 ห้องเรียนออนไลน์</h3>
        <p style={{ margin: 0, opacity: 0.8 }}>หลักสูตร: {courseId}</p>
      </div>

      <div style={{ position: 'relative', paddingTop: '56.25%', background: 'black' }}>
        {videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            ❌ ลิ้งก์วิดีโอไม่ถูกต้อง
          </div>
        )}
      </div>

      <div style={{ padding: '15px' }}>
        <p><strong>ผู้เรียน:</strong> {employeeName} ({employeeId})</p>
        <p style={{ color: 'green' }}>⏱️ เวลาที่เรียนไปแล้ว: {elapsedTime} วินาที</p>
        <p style={{ fontSize: '12px', color: '#666' }}>*ระบบจะบันทึกเวลาอัตโนมัติตราบเท่าที่คุณเปิดหน้านี้ไว้</p>
      </div>
    </div>
  );
};

export default TrainingVideoPlayer;