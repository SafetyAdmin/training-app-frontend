// frontend/src/TrainingVideoPlayer.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';

const TrainingVideoPlayer = ({ 
  videoUrl, // รับค่าจาก App.jsx
  employeeId, 
  employeeName, 
  courseId 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [debugMsg, setDebugMsg] = useState(''); // ตัวแปรสำหรับ Debug

  // ฟังก์ชันส่งข้อมูลไปหลังบ้าน
  const saveProgressToBackend = async (currentTime, totalDuration) => {
    try {
      // ✅ ลิ้งก์ API ที่ถูกต้อง (ต้องลงท้ายด้วย /api/save-progress)
      const response = await fetch('https://training-api-pvak.onrender.com/api/save-progress', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          employeeName,
          courseId,
          currentTime: Math.floor(currentTime),
          totalDuration: Math.floor(totalDuration)
        })
      });
      console.log('Saved:', currentTime);
    } catch (err) {
      console.error("Error saving:", err);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && duration > 0) {
        saveProgressToBackend(playedSeconds, duration);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, duration, playedSeconds]);

  // ตรวจสอบลิ้งก์
  useEffect(() => {
    if (!videoUrl) {
      setDebugMsg('❌ ไม่พบลิ้งก์วิดีโอ (URL เป็นค่าว่าง)');
    } else {
      setDebugMsg(`✅ กำลังโหลด: ${videoUrl}`);
    }
  }, [videoUrl]);

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #ddd' }}>
      {/* ส่วนหัวแบบมีสีสัน (ถ้าหน้าจอไม่ขึ้นแบบนี้ แสดงว่ายังไม่ได้เซฟไฟล์ใหม่) */}
      <div style={{ padding: '15px', background: 'linear-gradient(90deg, #2563eb, #1d4ed8)', color: 'white' }}>
        <h3 style={{ margin: 0 }}>📺 ห้องเรียนออนไลน์</h3>
        <p style={{ margin: 0, opacity: 0.8 }}>หลักสูตร: {courseId}</p>
      </div>

      <div style={{ position: 'relative', paddingTop: '56.25%', background: 'black' }}>
        {videoUrl ? (
          <ReactPlayer
            url={videoUrl}
            width="100%"
            height="100%"
            style={{ position: 'absolute', top: 0, left: 0 }}
            controls={true}
            // เพิ่ม config เพื่อบังคับให้โหลด YouTube แบบชัวร์ๆ
            config={{
              youtube: {
                playerVars: { showinfo: 1 }
              }
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onDuration={(d) => setDuration(d)}
            onProgress={(p) => setPlayedSeconds(p.playedSeconds)}
            onEnded={() => saveProgressToBackend(duration, duration)}
            onError={(e) => setDebugMsg(`⚠️ เกิดข้อผิดพลาดในการโหลดวิดีโอ: ${e}`)}
          />
        ) : (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            ❌ ไม่มีวิดีโอ
          </div>
        )}
      </div>

      <div style={{ padding: '15px' }}>
        <p><strong>ผู้เรียน:</strong> {employeeName} ({employeeId})</p>
        
        {/* กล่อง Debug สีเหลือง: ช่วยบอกสาเหตุถ้าจอมืด */}
        <div style={{ marginTop: '10px', padding: '10px', background: '#fff3cd', borderRadius: '5px', fontSize: '12px', color: '#856404' }}>
          <strong>สถานะระบบ (Debug):</strong> {debugMsg} <br/>
          (ถ้ายังจอมืด ให้ลอง Refresh หน้าจอ 1 ครั้ง)
        </div>
      </div>
    </div>
  );
};

export default TrainingVideoPlayer;