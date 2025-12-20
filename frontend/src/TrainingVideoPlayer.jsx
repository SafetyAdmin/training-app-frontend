// frontend/src/TrainingVideoPlayer.jsx
import React, { useState, useEffect } from 'react';

const TrainingVideoPlayer = ({ videoUrl, employeeId, employeeName, courseId }) => {
  const [startTime, setStartTime] = useState(0);      // เวลาเริ่ม (ดึงจาก Server)
  const [currentTime, setCurrentTime] = useState(0);  // เวลาปัจจุบัน (จับจากนาฬิกา)
  const [isLoading, setIsLoading] = useState(true);   // สถานะรอโหลดข้อมูลเก่า
  const [isCompleted, setIsCompleted] = useState(false);

  // 1. แปลงลิ้งก์ YouTube เป็น ID
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  const videoId = getYouTubeId(videoUrl);

  // 2. โหลดข้อมูลเก่าจาก Cloud ก่อน (สำคัญมาก! ต้องรอก่อนถึงจะแสดงวิดีโอ)
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(`https://training-api-pvak.onrender.com/api/get-progress?employeeId=${employeeId}&courseId=${courseId}`);
        const data = await res.json();
        
        if (data && data.currentTime > 0) {
          setStartTime(data.currentTime); // ตั้งค่าเวลาเริ่มให้วิดีโอ
          setCurrentTime(data.currentTime);
          console.log('🔄 พบข้อมูลเดิม เริ่มที่วินาทีที่:', data.currentTime);
        }
      } catch (err) {
        console.error("โหลดข้อมูลไม่สำเร็จ:", err);
      } finally {
        setIsLoading(false); // โหลดเสร็จแล้ว อนุญาตให้แสดงวิดีโอได้
      }
    };
    fetchProgress();
  }, [employeeId, courseId]);

  // 3. ระบบจับเวลา & บันทึก (ทำงานแยกกับวิดีโอ)
  useEffect(() => {
    if (isLoading) return; // ถ้ารอข้อมูลเก่าอยู่ อย่าเพิ่งนับเวลา

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 5; // เพิ่มทีละ 5 วินาที
        
        // บันทึกข้อมูลส่งไปหลังบ้าน
        saveProgressToBackend(newTime);
        
        // เช็คว่าจบหรือยัง (สมมติ 10 นาที = 600 วิ)
        if (newTime >= 600 && !isCompleted) {
           setIsCompleted(true);
           alert("🎉 ยินดีด้วย! คุณผ่านการอบรมแล้ว");
        }
        return newTime;
      });
    }, 5000); // ทำงานทุก 5 วินาที

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

  // ถ้ากำลังโหลดข้อมูลเก่า ให้ขึ้นรอ... (เพื่อกันไม่ให้วิดีโอเริ่มเล่นที่ 0)
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
            // สูตรลับ: controls=0 (ซ่อนปุ่ม), disablekb=1 (ปิดคีย์บอร์ด), start=เวลาเดิม
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
        
        {/* หลอดแสดงความคืบหน้า (สร้างเอง เพราะใน YouTube เราซ่อนไปแล้ว) */}
        <div style={{ background: '#e5e7eb', height: '10px', borderRadius: '5px', marginTop: '10px', overflow:'hidden' }}>
            <div style={{ width: `${(currentTime / 600) * 100}%`, background: '#2563eb', height: '100%', transition: 'width 0.5s' }}></div>
        </div>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            ⏱️ เวลาที่เรียน: {currentTime} / 600 วินาที
        </p>

        <div style={{ background: '#fff3cd', color: '#856404', padding: '10px', borderRadius: '5px', fontSize: '13px', marginTop: '15px' }}>
            🔒 <strong>ระบบล็อกการเรียน:</strong>
            <ul style={{margin: '5px 0 0 20px', padding:0}}>
                <li>แถบควบคุมถูกซ่อนเพื่อป้องกันการกดข้าม</li>
                <li>คลิกที่หน้าจอวิดีโอเพื่อ <strong>เล่น / หยุด</strong></li>
                <li>หากปิดไปแล้วกลับมาใหม่ วิดีโอจะเล่นต่อจากเดิมอัตโนมัติ</li>
            </ul>
        </div>
      </div>
    </div>
  );
};

export default TrainingVideoPlayer;