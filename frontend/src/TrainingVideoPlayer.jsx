// frontend/src/TrainingVideoPlayer.jsx
import React, { useState, useEffect } from 'react';

const TrainingVideoPlayer = ({ videoUrl, employeeId, employeeName, courseId }) => {
  const [startTime, setStartTime] = useState(0);      
  const [currentTime, setCurrentTime] = useState(0); 
  const [isLoading, setIsLoading] = useState(true);   
  const [isCompleted, setIsCompleted] = useState(false);
  const [debugMsg, setDebugMsg] = useState('⏳ กำลังเชื่อมต่อ Server...'); // เอาไว้ดูว่าดึงข้อมูลได้ไหม

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  const videoId = getYouTubeId(videoUrl);

  // 1. โหลดข้อมูลเก่า
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(`https://training-api-pvak.onrender.com/api/get-progress?employeeId=${employeeId}&courseId=${courseId}`);
        
        if (!res.ok) throw new Error("Server ไม่ตอบสนอง (อาจยังไม่อัปเดต Backend)");
        
        const data = await res.json();
        
        if (data && data.currentTime > 0) {
          // ✅ สูตรลับ: ต้องปัดเศษเป็นจำนวนเต็ม (Math.floor) เสมอ ไม่งั้น YouTube เอ๋อ
          const savedTime = Math.floor(data.currentTime);
          setStartTime(savedTime); 
          setCurrentTime(savedTime);
          setDebugMsg(`✅ ดึงข้อมูลสำเร็จ: เริ่มต่อที่วินาทีที่ ${savedTime}`);
        } else {
          setDebugMsg(`🆕 ไม่พบประวัติการเรียน (เริ่มใหม่)`);
        }
      } catch (err) {
        console.error("Error:", err);
        setDebugMsg(`❌ เกิดข้อผิดพลาด: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProgress();
  }, [employeeId, courseId]);

  // 2. จับเวลา (ใช้สูตรเดิม)
  useEffect(() => {
    if (isLoading) return; 

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 5;
        saveProgressToBackend(newTime);
        if (newTime >= 600 && !isCompleted) {
           setIsCompleted(true);
           alert("🎉 ยินดีด้วย! คุณผ่านการอบรมแล้ว");
        }
        return newTime;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isLoading, isCompleted]);

  const saveProgressToBackend = async (time) => {
    try {
      await fetch('https://training-api-pvak.onrender.com/api/save-progress', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId, employeeName, courseId,
          currentTime: time,
          totalDuration: 600
        })
      });
    } catch (err) { console.error(err); }
  };

  if (isLoading) {
    return <div className="card" style={{padding:'20px', textAlign:'center'}}>⏳ กำลังดึงข้อมูลการเรียนเดิม...</div>;
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #ddd' }}>
      <div style={{ padding: '15px', background: isCompleted ? '#10b981' : '#2563eb', color: 'white' }}>
        <h3 style={{ margin: 0 }}>{isCompleted ? '✅ อบรมเสร็จสิ้น' : '📺 ห้องเรียนออนไลน์'}</h3>
        <p style={{ margin: 0, opacity: 0.8 }}>หลักสูตร: {courseId}</p>
      </div>

      <div style={{ position: 'relative', paddingTop: '56.25%', background: 'black' }}>
        {videoId ? (
          <iframe
            // Key: ช่วยบังคับให้ React โหลด Iframe ใหม่เมื่อเวลาเปลี่ยน
            key={startTime} 
            src={`https://www.youtube.com/embed/${videoId}?start=${startTime}&autoplay=1&controls=0&disablekb=1&modestbranding=1&rel=0`}
            title="YouTube video player"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <div style={{color:'white', padding:'20px'}}>❌ ไม่พบวิดีโอ</div>
        )}
      </div>

      <div style={{ padding: '15px' }}>
        <p><strong>ผู้เรียน:</strong> {employeeName}</p>
        
        <div style={{ background: '#e5e7eb', height: '10px', borderRadius: '5px', marginTop: '10px', overflow:'hidden' }}>
            <div style={{ width: `${(currentTime / 600) * 100}%`, background: '#2563eb', height: '100%', transition: 'width 0.5s' }}></div>
        </div>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            ⏱️ เวลาที่เรียน: {currentTime} / 600 วินาที
        </p>

        {/* กล่อง Debug: จะบอกความจริงว่าทำไมไม่ต่อที่เดิม */}
        <div style={{ marginTop: '10px', padding: '5px 10px', background: '#f3f4f6', borderRadius: '4px', fontSize: '11px', color: '#6b7280', fontFamily: 'monospace' }}>
            🔧 Status: {debugMsg}
        </div>

        <div style={{ background: '#fff3cd', color: '#856404', padding: '10px', borderRadius: '5px', fontSize: '13px', marginTop: '15px' }}>
            🔒 <strong>ระบบล็อกการเรียน:</strong>
            <ul style={{margin: '5px 0 0 20px', padding:0}}>
                <li>แถบควบคุมถูกซ่อนเพื่อป้องกันการกดข้าม</li>
                <li>คลิกที่หน้าจอวิดีโอเพื่อ <strong>เล่น / หยุด</strong></li>
            </ul>
        </div>
      </div>
    </div>
  );
};

export default TrainingVideoPlayer;