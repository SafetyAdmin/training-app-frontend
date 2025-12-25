// frontend/src/TrainingVideoPlayer.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';

const TrainingVideoPlayer = ({ videoUrl, employeeId, employeeName, courseId }) => {
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [statusMsg, setStatusMsg] = useState('⏳ กำลังโหลดข้อมูลเรียนเดิม...');
  const playerRef = useRef(null);
  const lastSaveTime = useRef(0);
  const currentVideoUrl = useRef(videoUrl);
  const isLoadingProgress = useRef(false);

  // ฟังก์ชันบันทึกเวลา
  const saveProgress = async (currentTime, duration) => {
    if (!currentTime || currentTime < 1) return; // ไม่บันทึกถ้าเวลาน้อยเกินไป
    
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
      console.log(`✅ บันทึกแล้ว: ${Math.floor(currentTime)}s`);
    } catch (error) {
      console.error("❌ Save failed", error);
    }
  };

  // 🔥 บันทึกก่อนเปลี่ยนวิดีโอ
  useEffect(() => {
    // ถ้า URL เปลี่ยนและมีเวลาเดิมให้บันทึก
    if (currentVideoUrl.current !== videoUrl && playedSeconds > 0 && totalDuration > 0) {
      console.log('🔄 เปลี่ยนวิดีโอ - บันทึกข้อมูลเดิมก่อน');
      saveProgress(playedSeconds, totalDuration);
    }
    
    currentVideoUrl.current = videoUrl;
    
    // รีเซ็ตค่า
    setTotalDuration(0);
    setPlayedSeconds(0);
    setIsReady(false);
    setStatusMsg('🔄 กำลังโหลดวิดีโอใหม่...');
    lastSaveTime.current = 0;
  }, [videoUrl]);

  // โหลดเวลาเรียนล่าสุด
  useEffect(() => {
    if (!videoUrl || isLoadingProgress.current) return;
    
    isLoadingProgress.current = true;
    
    fetch(`https://training-api-pvak.onrender.com/api/get-progress?employeeId=${employeeId}&courseId=${courseId}`)
      .then(res => res.json())
      .then(data => {
        const savedTime = data.currentTime || 0;
        setPlayedSeconds(savedTime);
        
        if (savedTime > 0) {
          setStatusMsg(`✅ ดึงข้อมูลสำเร็จ: เริ่มต่อที่วินาทีที่ ${Math.floor(savedTime)}`);
        } else {
          setStatusMsg(`✅ เริ่มเรียนใหม่`);
        }
        
        setIsReady(true);
        isLoadingProgress.current = false;
      })
      .catch(err => {
        setStatusMsg('❌ ไม่สามารถดึงประวัติการเรียนได้');
        setIsReady(true);
        isLoadingProgress.current = false;
      });
  }, [employeeId, courseId, videoUrl]);

  // บันทึกระหว่างเล่น
  const handleProgress = (state) => {
    const currentSec = state.playedSeconds;
    setPlayedSeconds(currentSec);

    // บันทึกทุก 5 วินาที
    if (Math.abs(currentSec - lastSaveTime.current) >= 5) {
      saveProgress(currentSec, totalDuration);
      lastSaveTime.current = currentSec;
    }
  };

  // 🔥 บันทึกเมื่อจบวิดีโอ
  const handleEnded = () => {
    console.log('🎬 วิดีโอจบแล้ว - บันทึกข้อมูล');
    saveProgress(totalDuration, totalDuration);
    setStatusMsg('✅ เรียนจบแล้ว!');
  };

  // 🔥 บันทึกก่อนออกจากหน้า
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (playedSeconds > 0 && totalDuration > 0) {
        // ใช้ sendBeacon เพราะทำงานได้แม้ปิดหน้า
        const data = JSON.stringify({
          employeeId,
          employeeName,
          courseId,
          currentTime: playedSeconds,
          totalDuration
        });
        
        navigator.sendBeacon(
          'https://training-api-pvak.onrender.com/api/save-progress',
          new Blob([data], { type: 'application/json' })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // บันทึกก่อน unmount
      if (playedSeconds > 0 && totalDuration > 0) {
        saveProgress(playedSeconds, totalDuration);
      }
    };
  }, [playedSeconds, totalDuration, employeeId, employeeName, courseId]);

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
        📊 <b>ความคืบหน้า:</b> {totalDuration > 0 ? Math.floor((playedSeconds / totalDuration) * 100) : 0}%
        <br/>
        🔧 <b>สถานะระบบ:</b> <span style={{ color: statusMsg.includes('❌') ? 'red' : 'green' }}>{statusMsg}</span>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden', marginBottom: '15px' }}>
        <div style={{ 
          width: `${totalDuration > 0 ? (playedSeconds / totalDuration) * 100 : 0}%`, 
          height: '100%', 
          background: playedSeconds >= totalDuration * 0.9 ? '#10b981' : '#2563eb',
          transition: 'width 0.3s'
        }} />
      </div>

      {/* ตัวเล่นวิดีโอ */}
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
          onEnded={handleEnded}
          onReady={() => {
            console.log('▶️ วิดีโอพร้อมเล่น');
            // กระโดดไปเวลาเดิมหลังจากวิดีโอโหลดเสร็จ
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