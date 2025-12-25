// frontend/src/TrainingVideoPlayer.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';

const TrainingVideoPlayer = ({ videoUrl, employeeId, employeeName, courseId }) => {
  const [playedSeconds, setPlayedSeconds] = useState(0); // เวลาที่เล่นไปแล้ว (วินาที)
  const [totalDuration, setTotalDuration] = useState(0); // ความยาววิดีโอทั้งหมด
  const [isReady, setIsReady] = useState(false);
  const [statusMsg, setStatusMsg] = useState('⏳ กำลังโหลดข้อมูลเรียนเดิม...');
  const playerRef = useRef(null);
  
  // ตัวแปรสำหรับกันการ Save ถี่เกินไป
  const lastSaveTime = useRef(0);

  // 🔴 ส่วนที่เพิ่มใหม่: รีเซ็ตค่าทุกครั้งที่เปลี่ยนคลิป (videoUrl เปลี่ยน)
  useEffect(() => {
    setTotalDuration(0);
    setPlayedSeconds(0);
    setIsReady(false);
    setStatusMsg('🔄 กำลังโหลดวิดีโอใหม่...');
  }, [videoUrl]);

  // 1. โหลดเวลาเรียนล่าสุดเมื่อเปิดหน้าเว็บ (หรือเมื่อเปลี่ยนคอร์ส)
  useEffect(() => {
    if (!videoUrl) return; // ถ้าไม่มีลิ้งก์ไม่ต้องโหลด

    fetch(`https://training-api-pvak.onrender.com/api/get-progress?employeeId=${employeeId}&courseId=${courseId}`)
      .then(res => res.json())
      .then(data => {
        const savedTime = data.currentTime || 0;
        setPlayedSeconds(savedTime);
        setStatusMsg(`✅ ดึงข้อมูลสำเร็จ: เริ่มต่อที่วินาทีที่ ${Math.floor(savedTime)}`);
        
        // สั่งให้วิดีโอกระโดดไปเวลาเดิม (ถ้ามี)
        if (savedTime > 0 && playerRef.current) {
          playerRef.current.seekTo(savedTime, 'seconds');
        }
        setIsReady(true);
      })
      .catch(err => setStatusMsg('❌ ไม่สามารถดึงประวัติการเรียนได้'));
  }, [employeeId, courseId, videoUrl]); // เพิ่ม videoUrl ใน dependency

  // 2. ฟังก์ชันบันทึกเวลา (ยิงไปบอก Server ทุกๆ 5 วินาที)
  const handleProgress = (state) => {
    const currentSec = state.playedSeconds;
    setPlayedSeconds(currentSec); // อัปเดตหน้าจอทันที

    // ถ้าเวลาผ่านไปมากกว่า 5 วินาที ค่อยบันทึก 1 ที (ลดภาระ Server)
    if (Math.abs(currentSec - lastSaveTime.current) > 5) {
      saveProgress(currentSec, totalDuration);
      lastSaveTime.current = currentSec;
    }
  };

  // 3. ฟังก์ชันส่งข้อมูลเข้า Backend
  const saveProgress = async (currentTime, duration) => {
    try {
      await fetch('https://training-api-pvak.onrender.com/api/save-progress', {
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
    } catch (error) {
      console.error("Save failed", error);
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      {/* ส่วนแสดงสถานะ */}
      <div style={{ 
        background: '#f1f5f9', 
        padding: '10px', 
        borderRadius: '8px', 
        marginBottom: '10px',
        fontSize: '14px',
        color: '#334155'
      }}>
        ⏱️ <b>เวลาที่เรียน:</b> {Math.floor(playedSeconds)} / {Math.floor(totalDuration)} วินาที
        <br/>
        🔧 <b>สถานะระบบ:</b> <span style={{ color: statusMsg.includes('❌') ? 'red' : 'green' }}>{statusMsg}</span>
      </div>

      {/* แถบ Progress Bar แบบสร้างเอง */}
      <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden', marginBottom: '15px' }}>
        <div style={{ 
          width: `${totalDuration > 0 ? (playedSeconds / totalDuration) * 100 : 0}%`, 
          height: '100%', 
          background: '#2563eb',
          transition: 'width 0.3s'
        }} />
      </div>

      {/* ตัวเล่นวิดีโอ.. */}
      <div style={{ position: 'relative', paddingTop: '56.25%' }}>
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
          controls={true}
          onDuration={(duration) => setTotalDuration(duration)}
          onProgress={handleProgress}
          onReady={() => {
            if (playedSeconds > 0) {
              playerRef.current.seekTo(playedSeconds);
            }
          }}
        />
      </div>
    </div>
  );
};

export default TrainingVideoPlayer;