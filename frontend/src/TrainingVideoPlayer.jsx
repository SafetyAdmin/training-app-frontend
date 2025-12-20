// frontend/src/TrainingVideoPlayer.jsx
import React, { useState, useEffect } from 'react';

const TrainingVideoPlayer = ({ 
  videoUrl, 
  employeeId, 
  employeeName, 
  courseId 
}) => {
  const [elapsedTime, setElapsedTime] = useState(0); 
  const [startTime, setStartTime] = useState(0); // เวลาเริ่มต้นของวิดีโอ
  const [isCompleted, setIsCompleted] = useState(false); // สถานะเรียนจบหรือยัง

  // 1. ดึง ID วิดีโอจาก YouTube URL
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeId(videoUrl);

  // 2. โหลดข้อมูลเก่าจากเครื่อง (Local Storage) เมื่อเปิดหน้าเว็บ
  useEffect(() => {
    const savedData = localStorage.getItem(`progress_${employeeId}_${courseId}`);
    if (savedData) {
      const { time, completed } = JSON.parse(savedData);
      setStartTime(time); // ตั้งเวลาเริ่มให้ตรงกับที่ดูค้างไว้
      setElapsedTime(time);
      setIsCompleted(completed);
      console.log('🔄 โหลดข้อมูลเดิม:', time, 'วินาที | จบแล้ว:', completed);
    }
  }, [employeeId, courseId]);

  // 3. ฟังก์ชันบันทึกข้อมูล (ทั้งลงเครื่อง และส่งไปหลังบ้าน)
  const saveProgress = (currentTime, completed = false) => {
    // A. บันทึกลงเครื่อง (เพื่อให้กลับมาดูต่อได้)
    localStorage.setItem(`progress_${employeeId}_${courseId}`, JSON.stringify({
      time: currentTime,
      completed: completed
    }));

    // B. ส่งไปหลังบ้าน (ให้ Admin ดู)
    fetch('https://training-api-pvak.onrender.com/api/save-progress', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          employeeName,
          courseId,
          currentTime: currentTime,
          totalDuration: 600 // สมมติว่าคลิปยาว 10 นาที (ถ้าครบเวลาจะถือว่าผ่าน)
        })
    }).catch(err => console.error("Save Error:", err));
  };

  // 4. ระบบจับเวลา (ทำงานทุก 5 วินาที)
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => {
        const newTime = prev + 5;
        
        // ถ้าดูเกิน 10 นาที (600 วิ) ให้ถือว่าเรียนจบ
        let completedStatus = isCompleted;
        if (newTime >= 600 && !isCompleted) {
          completedStatus = true;
          setIsCompleted(true);
          alert("🎉 ยินดีด้วย! คุณผ่านการอบรมหลักสูตรนี้แล้ว");
        }

        saveProgress(newTime, completedStatus);
        return newTime;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isCompleted]); // เพิ่ม dependency เพื่อให้สถานะ completed อัปเดตถูกต้อง

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #ddd' }}>
      <div style={{ padding: '15px', background: isCompleted ? '#10b981' : '#2563eb', color: 'white', transition: '0.3s' }}>
        <h3 style={{ margin: 0 }}>
          {isCompleted ? '✅ เรียนจบหลักสูตรแล้ว' : '📺 ห้องเรียนออนไลน์'}
        </h3>
        <p style={{ margin: 0, opacity: 0.8 }}>หลักสูตร: {courseId}</p>
      </div>

      <div style={{ position: 'relative', paddingTop: '56.25%', background: 'black' }}>
        {videoId ? (
          <iframe
            // เพิ่ม ?start=... เพื่อสั่งให้ YouTube เล่นต่อจากวินาทีเดิม
            src={`https://www.youtube.com/embed/${videoId}?start=${startTime}&autoplay=1`}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <p><strong>ผู้เรียน:</strong> {employeeName} ({employeeId})</p>
                <p style={{ color: isCompleted ? 'green' : '#666', fontWeight: 'bold' }}>
                    ⏱️ เวลาที่บันทึกล่าสุด: {elapsedTime} วินาที
                </p>
            </div>
            {isCompleted && <span style={{fontSize: '30px'}}>🏅</span>}
        </div>
        
        <p style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
            * ระบบจะบันทึกเวลาดูคลิปของคุณไว้ในเครื่องนี้ หากปิดแล้วเปิดใหม่ วิดีโอจะเล่นต่อจากเดิม
        </p>
      </div>
    </div>
  );
};

export default TrainingVideoPlayer;