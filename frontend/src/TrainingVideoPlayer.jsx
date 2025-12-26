import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player'; // ✅ เปลี่ยนเป็นแบบมาตรฐาน (ลบ /lazy ออก)

const TrainingVideoPlayer = ({ videoUrl, employeeId, employeeName, courseId }) => {
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [statusMsg, setStatusMsg] = useState('⏳ กำลังโหลดข้อมูล...');
  const [videoError, setVideoError] = useState(null);
  
  const playerRef = useRef(null);
  const lastSaveTime = useRef(0);
  const currentVideoUrl = useRef(videoUrl);

  // ฟังก์ชันบันทึกเวลา
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

  // 1. จัดการเมื่อเปลี่ยนวิดีโอ
  useEffect(() => {
    if (currentVideoUrl.current !== videoUrl) {
      setTotalDuration(0);
      setPlayedSeconds(0);
      setIsReady(false);
      setVideoError(null);
      setStatusMsg('🔄 กำลังโหลดวิดีโอใหม่...');
      currentVideoUrl.current = videoUrl;
    }
  }, [videoUrl]);

  // 2. ดึงเวลาเดิมเมื่อเริ่ม
  useEffect(() => {
    if (!videoUrl) return;
    
    setStatusMsg('⏳ กำลังดึงประวัติการเรียน...');
    fetch(`https://training-api-pvak.onrender.com/api/get-progress?employeeId=${employeeId}&courseId=${courseId}`)
      .then(res => res.json())
      .then(data => {
        const savedTime = data.currentTime || 0;
        setPlayedSeconds(savedTime);
        if (savedTime > 0) {
          setStatusMsg(`✅ เริ่มต่อที่วินาทีที่ ${Math.floor(savedTime)}`);
        } else {
          setStatusMsg('✅ เริ่มเรียนใหม่');
        }
        setIsReady(true);
      })
      .catch(() => setStatusMsg('⚠️ ดึงประวัติไม่ได้ (เริ่มใหม่ 0)'));
  }, [employeeId, courseId, videoUrl]);

  // 3. ตัวจัดการขณะเล่น
  const handleProgress = (state) => {
    const currentSec = state.playedSeconds;
    setPlayedSeconds(currentSec);

    // บันทึกทุก 10 วินาที
    if (Math.abs(currentSec - lastSaveTime.current) >= 10) {
      saveProgress(currentSec, totalDuration);
      lastSaveTime.current = currentSec;
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      {/* กล่องสถานะ */}
      <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', marginBottom: '10px', fontSize: '14px', color: '#334155' }}>
        {videoError ? (
          <span style={{ color: 'red' }}>❌ {videoError}</span>
        ) : (
          <>
            ⏱️ <b>เวลา:</b> {Math.floor(playedSeconds)} / {Math.floor(totalDuration)} วิ | 
            🔧 <b>สถานะ:</b> {statusMsg}
          </>
        )}
      </div>

      {/* ตัวเล่นวิดีโอ */}
      <div style={{ position: 'relative', paddingTop: '56.25%', background: 'black' }}>
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
            if (playedSeconds > 0 && playerRef.current) {
              playerRef.current.seekTo(playedSeconds, 'seconds');
            }
          }}
          onError={(e) => {
            console.error('Video Error:', e);
            setVideoError('ไม่สามารถเล่นวิดีโอนี้ได้ (อาจถูกบล็อก หรือไฟล์เสีย)');
          }}
        />
      </div>
    </div>
  );
};

export default TrainingVideoPlayer;