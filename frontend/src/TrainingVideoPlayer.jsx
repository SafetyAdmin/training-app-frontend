import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';

const TrainingVideoPlayer = ({ videoUrl, employeeId, employeeName, courseId }) => {
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [statusMsg, setStatusMsg] = useState('⏳ กำลังโหลดข้อมูล...');
  
  // State สำหรับควบคุมการเล่น
  const [playing, setPlaying] = useState(false);
  const [showResumeBtn, setShowResumeBtn] = useState(false); 

  const playerRef = useRef(null);
  const lastSaveTime = useRef(0);
  const currentVideoUrl = useRef(videoUrl);
  
  // Refs สำคัญ
  const maxWatchedTime = useRef(0); 
  const savedTimeRef = useRef(0); // เก็บค่าเวลาเดิมที่ดึงมาจาก Server

  // 1. ฟังก์ชันบันทึกเวลา (API)
  const saveProgress = async (currentTime, duration) => {
    // ป้องกันการบันทึกถ้าเวลายังเป็น 0 หรือ duration ยังไม่โหลด
    if (!currentTime || currentTime < 1 || duration === 0) return;

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
      // อัปเดตข้อความสถานะ (เฉพาะตอน Debug หรือให้ User อุ่นใจ)
      // setStatusMsg(`✅ บันทึกแล้ว: ${Math.floor(currentTime)} วินาที`);
    } catch (error) {
      console.error("Save failed", error);
    }
  };

  // 2. รีเซ็ตค่าเมื่อเปลี่ยนคลิปวิดีโอ
  useEffect(() => {
    if (currentVideoUrl.current !== videoUrl) {
      setPlaying(false); // หยุดเล่นก่อน
      setTotalDuration(0);
      setPlayedSeconds(0);
      maxWatchedTime.current = 0;
      savedTimeRef.current = 0;
      lastSaveTime.current = 0;
      setIsReady(false);
      setShowResumeBtn(false); 
      setStatusMsg('🔄 กำลังเปลี่ยนวิดีโอ...');
      currentVideoUrl.current = videoUrl;
    }
  }, [videoUrl]);

  // 3. ดึงประวัติเวลาเรียนจาก Server
  useEffect(() => {
    if (!videoUrl || !employeeId) return;
    
    setStatusMsg('⏳ กำลังดึงประวัติการเรียน...');
    fetch(`https://training-api-pvak.onrender.com/api/get-progress?employeeId=${employeeId}&courseId=${courseId}`)
      .then(res => res.json())
      .then(data => {
        const savedTime = data.currentTime || 0;
        
        // 🔥 จุดแก้ไขสำคัญ: อัปเดต Refs ทั้งหมดให้เท่ากับค่าที่ดึงมา
        savedTimeRef.current = savedTime;
        maxWatchedTime.current = savedTime; 
        lastSaveTime.current = savedTime; // เพื่อไม่ให้บันทึกซ้ำทันทีที่ Resume

        setPlayedSeconds(savedTime);

        if (savedTime > 5) { // ถ้าเคยดูเกิน 5 วิ ค่อยถาม Resume
          setStatusMsg(`✅ พบประวัติเดิม: ${Math.floor(savedTime)} วินาที`);
          setShowResumeBtn(true);
        } else {
          setStatusMsg('✅ เริ่มเรียนใหม่');
          setShowResumeBtn(false);
          setPlaying(true); // ถ้าไม่มีประวัติ ให้เล่นเลย
        }
      })
      .catch((err) => {
        console.error(err);
        setStatusMsg('⚠️ ไม่สามารถดึงประวัติได้ (เริ่มใหม่)');
        setPlaying(true);
      });
  }, [employeeId, courseId, videoUrl]);

  // 4. ฟังก์ชันกดปุ่ม "ดูต่อจากเดิม" (Resume)
  const handleManualResume = () => {
    setShowResumeBtn(false); // ซ่อนปุ่ม
    
    if (playerRef.current) {
      // Seek ไปยังเวลาเดิม
      playerRef.current.seekTo(savedTimeRef.current, 'seconds');
    }

    // รอสักนิดให้ Seek ทำงานก่อนค่อยสั่ง Play
    setTimeout(() => {
      setPlaying(true);
    }, 300);
  };

  // 5. ฟังก์ชันกดปุ่ม "เริ่มใหม่"
  const handleStartNew = () => {
    setShowResumeBtn(false);
    savedTimeRef.current = 0;
    maxWatchedTime.current = 0;
    lastSaveTime.current = 0;
    
    if (playerRef.current) {
      playerRef.current.seekTo(0);
    }
    setPlaying(true);
  };

  // 6. Loop ตรวจสอบความคืบหน้า (ทำงานทุกวินาทีที่วิดีโอเล่น)
  const handleProgress = (state) => {
    // ถ้าปุ่ม Resume ยังโชว์อยู่ ห้ามอัปเดตอะไรทั้งนั้น
    if (showResumeBtn) return;

    const currentSec = state.playedSeconds;

    // ⛔ LOGIC กันโกง: ถ้าเวลาปัจจุบัน กระโดดข้าม maxWatchedTime ไปเกิน 2 วินาที
    // (ยอมให้เกินได้นิดหน่อยเผื่อ Internet Lag)
    if (currentSec > maxWatchedTime.current + 5) {
      if (playerRef.current) {
        // ดีดกลับไปที่เดิม
        playerRef.current.seekTo(maxWatchedTime.current, 'seconds');
      }
      setStatusMsg('🚫 ห้ามกดข้าม! กรุณาดูวิดีโอตามลำดับ');
      return; 
    }

    // อัปเดตเวลาที่ดูสูงสุด
    if (currentSec > maxWatchedTime.current) {
      maxWatchedTime.current = currentSec;
    }

    setPlayedSeconds(currentSec);

    // ✅ บันทึกทุก 5 วินาที
    if (Math.abs(currentSec - lastSaveTime.current) >= 5) {
      saveProgress(currentSec, totalDuration);
      lastSaveTime.current = currentSec;
    }
  };

  const handleEnded = () => {
    saveProgress(totalDuration, totalDuration); // บันทึกว่าจบแล้ว (time = duration)
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
        
        {/* Overlay ปุ่ม Resume */}
        {showResumeBtn && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 99,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
          }}>
            <h3 style={{ color: 'white', marginBottom: '15px' }}>
              คุณดูค้างไว้ที่นาที {Math.floor(savedTimeRef.current / 60)}:{Math.floor(savedTimeRef.current % 60).toString().padStart(2, '0')}
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleManualResume}
                style={{
                  background: '#e50914', color: 'white', border: 'none',
                  padding: '12px 24px', fontSize: '16px', borderRadius: '4px',
                  cursor: 'pointer', fontWeight: 'bold'
                }}
              >
                ▶ ดูต่อจากเดิม
              </button>
              <button 
                onClick={handleStartNew}
                style={{
                  background: 'transparent', color: '#aaa', border: '1px solid #555',
                  padding: '12px 24px', fontSize: '16px', borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                เริ่มใหม่
              </button>
            </div>
          </div>
        )}

        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
          controls={true}
          playing={playing} 
          onDuration={(d) => setTotalDuration(d)}
          onProgress={handleProgress}
          onEnded={handleEnded}
          onReady={() => setIsReady(true)}
          config={{
            youtube: { playerVars: { showinfo: 1, modestbranding: 1, rel: 0 } },
            file: { attributes: { controlsList: 'nodownload', playsInline: true } }
          }}
        />
      </div>
    </div>
  );
};

export default TrainingVideoPlayer;