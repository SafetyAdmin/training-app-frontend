import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';

const TrainingVideoPlayer = ({ videoUrl, employeeId, employeeName, courseId }) => {
  const [playedSeconds, setPlayedSeconds] = useState(0); // เวลาที่เล่นไปแล้ว
  const [totalDuration, setTotalDuration] = useState(0); // ความยาวคลิป
  const [isReady, setIsReady] = useState(false);
  const [statusMsg, setStatusMsg] = useState('⏳ กำลังโหลดข้อมูล...');
  
  const playerRef = useRef(null);
  const lastSaveTime = useRef(0);
  const currentVideoUrl = useRef(videoUrl);

  // 1. ฟังก์ชันส่งเวลาไปบันทึกที่ Server
  const saveProgress = async (currentTime, duration) => {
    if (!currentTime || currentTime < 1) return;
    try {
      await fetch('https://training-api-pvak.onrender.com/api/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId, employeeName, courseId,
          currentTime, totalDuration: duration
        })
      });
      setStatusMsg(`✅ บันทึกแล้ว: ${Math.floor(currentTime)} วินาที`);
    } catch (error) {
      console.error("Save failed", error);
    }
  };

  // 2. เมื่อเปลี่ยนวิดีโอ -> ให้รีเซ็ตค่าต่างๆ
  useEffect(() => {
    if (currentVideoUrl.current !== videoUrl) {
      setTotalDuration(0);
      setPlayedSeconds(0);
      setIsReady(false);
      setStatusMsg('🔄 กำลังเปลี่ยนวิดีโอ...');
      currentVideoUrl.current = videoUrl;
    }
  }, [videoUrl]);

  // 3. เมื่อโหลด Component -> ให้ไปดึงเวลาเดิมจาก Server
  useEffect(() => {
    if (!videoUrl) return;
    
    setStatusMsg('⏳ กำลังดึงประวัติการเรียน...');
    fetch(`https://training-api-pvak.onrender.com/api/get-progress?employeeId=${employeeId}&courseId=${courseId}`)
      .then(res => res.json())
      .then(data => {
        const savedTime = data.currentTime || 0;
        setPlayedSeconds(savedTime);
        if (savedTime > 0) {
          setStatusMsg(`✅ พบประวัติเดิม: เริ่มต่อที่ ${Math.floor(savedTime)} วินาที`);
        } else {
          setStatusMsg('✅ เริ่มเรียนใหม่');
        }
        setIsReady(true);
      })
      .catch(() => setStatusMsg('⚠️ ดึงประวัติไม่ได้ (เริ่มใหม่ 0)'));
  }, [employeeId, courseId, videoUrl]);

  // 4. ฟังก์ชันที่ทำงานตลอดเวลาที่วิดีโอเล่น
  const handleProgress = (state) => {
    const currentSec = state.playedSeconds;
    setPlayedSeconds(currentSec);

    // บันทึกทุกๆ 5 วินาที
    if (Math.abs(currentSec - lastSaveTime.current) >= 5) {
      saveProgress(currentSec, totalDuration);
      lastSaveTime.current = currentSec;
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      {/* กล่องแสดงสถานะ */}
      <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '8px', marginBottom: '10px', fontSize: '14px', color: '#334155' }}>
        ⏱️ <b>เวลาที่เรียน:</b> {Math.floor(playedSeconds)} / {Math.floor(totalDuration)} วินาที <br/>
        🔧 <b>สถานะ:</b> {statusMsg}
      </div>

      {/* แถบ Progress Bar สีฟ้า */}
      <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
        <div style={{ 
          width: `${totalDuration > 0 ? (playedSeconds / totalDuration) * 100 : 0}%`, 
          height: '100%', 
          background: '#2563eb', 
          transition: 'width 0.3s' 
        }} />
      </div>

      {/* ตัวเล่นวิดีโอ (รองรับ YouTube และ MP4) */}
      <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
          controls={true}
          onDuration={(d) => setTotalDuration(d)}
          onProgress={handleProgress}
          onReady={() => {
            setIsReady(true);
            // กระโดดไปเวลาเดิม (ถ้ามี)
            if (playedSeconds > 0 && playerRef.current) {
              playerRef.current.seekTo(playedSeconds, 'seconds');
            }
          }}
        />
      </div>
    </div>
  );
};

export default TrainingVideoPlayer;