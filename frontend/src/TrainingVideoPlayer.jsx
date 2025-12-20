// frontend/src/TrainingVideoPlayer.jsx
import React, { useState, useEffect } from 'react';

const TrainingVideoPlayer = ({ 
  videoUrl, 
  employeeId, 
  employeeName, 
  courseId 
}) => {
  const [elapsedTime, setElapsedTime] = useState(0); 
  const [startTime, setStartTime] = useState(0); 
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // เพิ่มสถานะกำลังโหลด

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeId(videoUrl);

  // 1. ✅ ดึงข้อมูลจาก SERVER (Cloud) แทน LocalStorage
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        // ยิงไปถาม Server ว่าคนนี้เรียนถึงไหนแล้ว
        const response = await fetch(
            `https://training-api-pvak.onrender.com/api/get-progress?employeeId=${employeeId}&courseId=${courseId}`
        );
        const data = await response.json();

        if (data && data.currentTime > 0) {
          setStartTime(data.currentTime); // ตั้งเวลาเริ่ม
          setElapsedTime(data.currentTime);
          
          // เช็คว่าเคยเรียนจบหรือยัง (ถ้าดูเกิน 95% ถือว่าจบ)
          if (data.totalDuration > 0 && data.currentTime >= (data.totalDuration * 0.95)) {
             setIsCompleted(true);
          }
          console.log('☁️ โหลดจาก Cloud:', data.currentTime);
        }
      } catch (err) {
        console.error("โหลดข้อมูลเก่าไม่ได้:", err);
      } finally {
        setIsLoading(false); // โหลดเสร็จแล้ว ให้แสดงวิดีโอได้
      }
    };

    fetchProgress();
  }, [employeeId, courseId]);

  // 2. ฟังก์ชันบันทึก (ส่งไป Server เหมือนเดิม)
  const saveProgressToBackend = async (currentTime) => {
    try {
      await fetch('https://training-api-pvak.onrender.com/api/save-progress', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          employeeName,
          courseId,
          currentTime: currentTime,
          totalDuration: 600 // (10 นาที)
        })
      });
    } catch (err) {
      console.error("Save Error:", err);
    }
  };

  // 3. ระบบจับเวลา
  useEffect(() => {
    if (isLoading) return; // ถ้ากำลังโหลดข้อมูลเก่า อย่าเพิ่งจับเวลา

    const interval = setInterval(() => {
      setElapsedTime(prev => {
        const newTime = prev + 5;
        
        // เช็คว่าจบหรือยัง
        if (newTime >= 600 && !isCompleted) {
          setIsCompleted(true);
          alert("🎉 ยินดีด้วย! คุณผ่านการอบรมหลักสูตรนี้แล้ว");
        }

        saveProgressToBackend(newTime);
        return newTime;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isLoading, isCompleted]);

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #ddd' }}>
      <div style={{ padding: '15px', background: isCompleted ? '#10b981' : '#2563eb', color: 'white' }}>
        <h3 style={{ margin: 0 }}>
          {isCompleted ? '✅ เรียนจบหลักสูตรแล้ว' : '📺 ห้องเรียนออนไลน์'}
        </h3>
        <p style={{ margin: 0, opacity: 0.8 }}>หลักสูตร: {courseId}</p>
      </div>

      <div style={{ position: 'relative', paddingTop: '56.25%', background: 'black' }}>
        {isLoading ? (
           // แสดงข้อความระหว่างรอโหลดข้อมูลจาก Cloud
           <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
             ⏳ กำลังดึงข้อมูลการเรียน...
           </div>
        ) : videoId ? (
          <iframe
            // ?start=... คือพระเอกที่ทำให้วิดีโอกระโดดไปจุดเดิม
            src={`https://www.youtube.com/embed/${videoId}?start=${startTime}&autoplay=1`}
            title="YouTube video player"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <div style={{ color: 'white' }}>❌ ลิ้งก์วิดีโอไม่ถูกต้อง</div>
        )}
      </div>

      <div style={{ padding: '15px' }}>
        <p><strong>ผู้เรียน:</strong> {employeeName} ({employeeId})</p>
        <p style={{ color: isCompleted ? 'green' : '#666', fontWeight: 'bold' }}>
            ⏱️ เวลาที่บันทึกล่าสุด: {elapsedTime} วินาที
        </p>
        <p style={{ fontSize: '12px', color: '#f59e0b' }}>
            ☁️ ระบบซิงค์ข้อมูลออนไลน์: เปลี่ยนเครื่องเรียนก็ต่อที่เดิมได้ทันที
        </p>
      </div>
    </div>
  );
};

export default TrainingVideoPlayer;