import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';

const TrainingVideoPlayer = ({ videoUrl, employeeId, employeeName, courseId }) => {
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [statusMsg, setStatusMsg] = useState('⏳ กำลังโหลดข้อมูล...');
  
  // ✅ NEW: เพิ่ม state ควบคุมการเล่นและปุ่ม Resume
  const [playing, setPlaying] = useState(false);
  const [showResumeBtn, setShowResumeBtn] = useState(false); 

  const playerRef = useRef(null);
  const lastSaveTime = useRef(0);
  const currentVideoUrl = useRef(videoUrl);
  
  // ตัวแปรสำคัญ: จำว่า "ดูถึงวินาทีที่เท่าไหร่แล้ว"
  const maxWatchedTime = useRef(0); 
  const savedTimeRef = useRef(0); // เก็บค่าเวลาเดิมไว้ใช้ตอนกดปุ่ม

  // 1. ฟังก์ชันส่งเวลาไปบันทึก
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

  // 2. รีเซ็ตค่าเมื่อเปลี่ยนคลิป
  useEffect(() => {
    if (currentVideoUrl.current !== videoUrl) {
      setTotalDuration(0);
      setPlayedSeconds(0);
      maxWatchedTime.current = 0;
      savedTimeRef.current = 0;
      setIsReady(false);
      setShowResumeBtn(false); // ซ่อนปุ่มก่อน
      setPlaying(false); // หยุดเล่น
      setStatusMsg('🔄 กำลังเปลี่ยนวิดีโอ...');
      currentVideoUrl.current = videoUrl;
    }
  }, [videoUrl]);

  // 3. โหลดเวลาเดิมจาก Server
  useEffect(() => {
    if (!videoUrl) return;
    
    setStatusMsg('⏳ กำลังดึงประวัติการเรียน...');
    fetch(`https://training-api-pvak.onrender.com/api/get-progress?employeeId=${employeeId}&courseId=${courseId}`)
      .then(res => res.json())
      .then(data => {
        const savedTime = data.currentTime || 0;
        setPlayedSeconds(savedTime);
        savedTimeRef.current = savedTime;
        
        // อนุญาตให้ข้ามได้ถึงแค่จุดที่เคยเรียนมาแล้ว
        maxWatchedTime.current = savedTime; 

        if (savedTime > 0) {
          setStatusMsg(`✅ พบประวัติเดิม: ${Math.floor(savedTime)} วินาที (กรุณากดปุ่มดูต่อ)`);
          // ✅ NEW: แทนที่จะ seek เลย ให้โชว์ปุ่มแทน
          setShowResumeBtn(true);
        } else {
          setStatusMsg('✅ เริ่มเรียนใหม่ (ห้ามกดข้าม)');
          setShowResumeBtn(false);
        }
        setIsReady(true);
      })
      .catch(() => setStatusMsg('⚠️ ดึงประวัติไม่ได้ (เริ่มใหม่ 0)'));
  }, [employeeId, courseId, videoUrl]);

  // ✅ NEW: ฟังก์ชันกดปุ่ม Resume (พระเอกของเรา)
  const handleManualResume = () => {
    setPlaying(true); // 1. สั่งเล่น
    setShowResumeBtn(false); // 2. ซ่อนปุ่ม

    // 3. เทคนิคแก้จอดำ: รอ 0.2 วิ แล้วค่อย Seek
    setTimeout(() => {
      if (playerRef.current) {
        playerRef.current.seekTo(savedTimeRef.current, 'seconds');
      }
    }, 200);
  };

  // ✅ NEW: ฟังก์ชันเริ่มใหม่
  const handleStartNew = () => {
    setPlaying(true);
    setShowResumeBtn(false);
    if (playerRef.current) {
      playerRef.current.seekTo(0);
    }
  };

  // 4. ฟังก์ชันกันโกง & บันทึกเวลา
  const handleProgress = (state) => {
    // ถ้ายังอยู่ในโหมดรอปุ่ม Resume อย่าเพิ่งทำงาน
    if (showResumeBtn) return;

    const currentSec = state.playedSeconds;

    // ⛔ LOGIC กันโกง
    if (currentSec > maxWatchedTime.current + 2) {
      if (playerRef.current) {
        playerRef.current.seekTo(maxWatchedTime.current, 'seconds');
      }
      setStatusMsg('🚫 ห้ามกดข้าม! กรุณาดูวิดีโอให้จบ');
      return; 
    }

    // อัปเดตเวลาล่าสุด
    if (currentSec > maxWatchedTime.current) {
      maxWatchedTime.current = currentSec;
    }

    setPlayedSeconds(currentSec);

    // บันทึกทุก 0 วินาที
    if (Math.abs(currentSec - lastSaveTime.current) >= 0) {
      saveProgress(currentSec, totalDuration);
      lastSaveTime.current = currentSec;
    }
  };

  const handleEnded = () => {
    saveProgress(totalDuration, totalDuration);
    setStatusMsg('🎉 เรียนจบแล้ว! บันทึกเรียบร้อย');
    setPlaying(false);
  };

  return (
    <div style={{ marginTop: '20px' }}>
      {/* ส่วนแสดงสถานะ */}
      <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '8px', marginBottom: '10px', fontSize: '14px', color: '#334155' }}>
        ⏱️ <b>เวลาที่เรียน:</b> {Math.floor(playedSeconds)} / {Math.floor(totalDuration)} วินาที <br/>
        🔧 <b>สถานะ:</b> <span style={{color: statusMsg.includes('🚫') ? 'red' : 'green'}}>{statusMsg}</span>
      </div>

      {/* Progress Bar ด้านบน */}
      <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
        <div style={{ 
          width: `${totalDuration > 0 ? (playedSeconds / totalDuration) * 100 : 0}%`, 
          height: '100%', 
          background: playedSeconds >= totalDuration * 0.99 ? '#10b981' : '#2563eb', 
          transition: 'width 0.3s' 
        }} />
      </div>

      {/* พื้นที่ Video Player */}
      <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
        
        {/* ✅ NEW: Overlay ปุ่ม Resume */}
        {showResumeBtn && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 99,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
          }}>
            <h3 style={{ color: 'white', marginBottom: '15px' }}>
              พบประวัติเดิม: นาทีที่ {Math.floor(savedTimeRef.current / 60)}:{Math.floor(savedTimeRef.current % 60)}
            </h3>
            <button 
              onClick={handleManualResume}
              style={{
                background: '#e50914', color: 'white', border: 'none',
                padding: '12px 24px', fontSize: '16px', borderRadius: '4px',
                cursor: 'pointer', marginBottom: '10px', fontWeight: 'bold'
              }}
            >
              ▶ ดูต่อจากเดิม
            </button>
            <button 
              onClick={handleStartNew}
              style={{
                background: 'transparent', color: '#aaa', border: '1px solid #555',
                padding: '8px 16px', fontSize: '14px', borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              เริ่มใหม่
            </button>
          </div>
        )}

        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
          controls={true}
          playing={playing} // ✅ ควบคุม Play/Pause ผ่าน state
          onDuration={(d) => setTotalDuration(d)}
          onProgress={handleProgress}
          onEnded={handleEnded}
          onReady={() => {
             setIsReady(true);
             // ⛔ เอา seekTo ออกจากตรงนี้ เพื่อป้องกันจอดำ ให้ปุ่มกดทำงานแทน
          }}
          config={{
            youtube: { playerVars: { showinfo: 1, modestbranding: 1, rel: 0 } },
            file: { attributes: { controlsList: 'nodownload', playsInline: true } } // playsInline สำคัญสำหรับ iOS
          }}
        />
      </div>
    </div>
  );
};

export default TrainingVideoPlayer;