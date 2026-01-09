// src/TrainingVideoPlayer.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';

const TrainingVideoPlayer = ({ videoUrl, employeeId, employeeName, courseId }) => {
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [statusMsg, setStatusMsg] = useState('⏳ กำลังโหลดข้อมูล...');
  
  // Player Controls
  const [playing, setPlaying] = useState(false);
  const [showResumeBtn, setShowResumeBtn] = useState(false); 

  // ✅ PIP Mode (ใช้ State คุม Style)
  const [isFloating, setIsFloating] = useState(false);

  const playerRef = useRef(null);
  const lastSaveTime = useRef(0);
  const currentVideoUrl = useRef(videoUrl);
  const maxWatchedTime = useRef(0); 
  const savedTimeRef = useRef(0);

  // --- 1. Save Progress ---
  const saveProgress = async (currentTime, duration) => {
    if (!currentTime || currentTime < 1 || duration === 0) return;
    try {
      await fetch('https://training-api-pvak.onrender.com/api/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, employeeName, courseId, currentTime, totalDuration: duration })
      });
    } catch (error) { console.error("Save failed", error); }
  };

  // --- 2. Initial Load ---
  useEffect(() => {
    if (currentVideoUrl.current !== videoUrl) {
      setPlaying(false); setTotalDuration(0); setPlayedSeconds(0);
      maxWatchedTime.current = 0; savedTimeRef.current = 0; lastSaveTime.current = 0;
      setIsReady(false); setShowResumeBtn(false); 
      setIsFloating(false); // Reset Floating
      setStatusMsg('🔄 กำลังเปลี่ยนวิดีโอ...');
      currentVideoUrl.current = videoUrl;
    }
  }, [videoUrl]);

  useEffect(() => {
    if (!videoUrl || !employeeId) return;
    fetch(`https://training-api-pvak.onrender.com/api/get-progress?employeeId=${employeeId}&courseId=${courseId}`)
      .then(res => res.json())
      .then(data => {
        const savedTime = data.currentTime || 0;
        savedTimeRef.current = savedTime;
        maxWatchedTime.current = savedTime; 
        lastSaveTime.current = savedTime;
        setPlayedSeconds(savedTime);
        if (savedTime > 5) {
          setStatusMsg(`✅ พบประวัติเดิม: ${Math.floor(savedTime)} วินาที`);
          setShowResumeBtn(true);
        } else {
          setStatusMsg('✅ เริ่มเรียนใหม่');
          setPlaying(true);
        }
        setIsReady(true);
      })
      .catch(() => setStatusMsg('⚠️ ดึงข้อมูลไม่ได้'));
  }, [employeeId, courseId, videoUrl]);

  // --- 3. Handlers ---
  const handleManualResume = () => {
    setShowResumeBtn(false);
    if (playerRef.current) playerRef.current.seekTo(savedTimeRef.current, 'seconds');
    setTimeout(() => setPlaying(true), 300);
  };

  const handleStartNew = () => {
    setShowResumeBtn(false);
    savedTimeRef.current = 0; maxWatchedTime.current = 0;
    if (playerRef.current) playerRef.current.seekTo(0);
    setPlaying(true);
  };

  const handleProgress = (state) => {
    if (showResumeBtn) return;
    const currentSec = state.playedSeconds;
    if (currentSec > maxWatchedTime.current + 5) {
      if (playerRef.current) playerRef.current.seekTo(maxWatchedTime.current, 'seconds');
      setStatusMsg('🚫 ห้ามกดข้าม!');
      return; 
    }
    if (currentSec > maxWatchedTime.current) maxWatchedTime.current = currentSec;
    setPlayedSeconds(currentSec);

    if (Math.abs(currentSec - lastSaveTime.current) >= 5) {
      saveProgress(currentSec, totalDuration);
      lastSaveTime.current = currentSec;
    }
  };

  // ✅ Toggle Floating Mode (สลับโหมดจอลอย)
  const toggleFloating = () => {
    setIsFloating(!isFloating);
  };

  // 🔥 Style สำหรับโหมดปกติ vs โหมดลอย
  const containerStyle = isFloating ? {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '400px',
    height: '225px',
    zIndex: 9999,
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.3s ease-in-out',
    border: '2px solid #4f46e5'
  } : {
    position: 'relative',
    paddingTop: '56.25%', // 16:9 Aspect Ratio
    background: '#000',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.3s ease-in-out'
  };

  return (
    <div style={{ marginTop: '20px' }}>
      
      {/* Control Bar */}
      <div style={{ 
        background: '#f8fafc', padding: '15px', borderRadius: '12px', marginBottom: '15px', 
        border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{fontSize:'14px'}}>
           ⏱️ {Math.floor(playedSeconds)} / {Math.floor(totalDuration)} วิ &nbsp;|&nbsp; 
           <span style={{color: statusMsg.includes('🚫') ? 'red' : 'green', fontWeight:'bold'}}>{statusMsg}</span>
        </div>
        
        {/* ปุ่มสลับโหมด */}
        <button 
          onClick={toggleFloating}
          style={{
            background: isFloating ? '#ef4444' : '#4f46e5',
            color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px',
            cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px'
          }}
        >
          {isFloating ? '❌ ปิดจอลอย' : '📺 เปิดจอลอย (Mini Player)'}
        </button>
      </div>

      {/* Video Container (เปลี่ยน Style ตาม State) */}
      <div style={containerStyle}>
        
        {/* ปุ่มปิดเฉพาะตอนลอย */}
        {isFloating && (
            <button 
                onClick={() => setIsFloating(false)}
                style={{
                    position: 'absolute', top: '5px', right: '5px', zIndex: 100,
                    background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none',
                    borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer'
                }}
            >
                ✕
            </button>
        )}

        {/* Resume Overlay */}
        {showResumeBtn && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99,
            backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
          }}>
            <h3 style={{ color: 'white', marginBottom: '10px', fontSize: isFloating ? '1rem' : '1.5rem' }}>
              ดูต่อจากเดิม?
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleManualResume} style={{background:'#22c55e', color:'white', border:'none', padding:'8px 16px', borderRadius:'4px', cursor:'pointer'}}>▶ ใช่</button>
              <button onClick={handleStartNew} style={{background:'transparent', color:'#aaa', border:'1px solid #555', padding:'8px 16px', borderRadius:'4px', cursor:'pointer'}}>เริ่มใหม่</button>
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
          onEnded={() => { saveProgress(totalDuration, totalDuration); setStatusMsg('🎉 จบแล้ว!'); setPlaying(false); setIsFloating(false); }}
          onReady={() => setIsReady(true)}
          config={{
            youtube: { playerVars: { showinfo: 1, modestbranding: 1, rel: 0, playsinline: 1 } }
          }}
        />
      </div>
      
      {/* Placeholder (พื้นที่ว่าง) เวลาจอลอยออกไป หน้าเว็บจะได้ไม่กระตุก */}
      {isFloating && (
          <div style={{
              width: '100%', paddingTop: '56.25%', 
              background: '#f1f5f9', borderRadius: '12px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px dashed #cbd5e1'
          }}>
              <span style={{color:'#64748b'}}>📺 วิดีโอกำลังเล่นในโหมดจอลอย...</span>
          </div>
      )}

    </div>
  );
};

export default TrainingVideoPlayer;