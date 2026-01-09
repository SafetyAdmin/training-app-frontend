// src/TrainingVideoPlayer.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';

const TrainingVideoPlayer = ({ videoUrl, employeeId, employeeName, courseId }) => {
  // --- STATE ---
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [statusMsg, setStatusMsg] = useState('⏳ กำลังโหลดข้อมูล...');
  
  const [playing, setPlaying] = useState(false);
  const [showResumeBtn, setShowResumeBtn] = useState(false); 

  // ✅ STATE สำหรับ Native PiP
  const [pipMode, setPipMode] = useState(false);

  const playerRef = useRef(null);
  const lastSaveTime = useRef(0);
  const currentVideoUrl = useRef(videoUrl);
  const maxWatchedTime = useRef(0); 
  const savedTimeRef = useRef(0);

  // --- 1. SAVE PROGRESS ---
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

  // --- 2. LOGIC (เหมือนเดิม) ---
  useEffect(() => {
    if (currentVideoUrl.current !== videoUrl) {
      setPlaying(false); setTotalDuration(0); setPlayedSeconds(0);
      maxWatchedTime.current = 0; savedTimeRef.current = 0; lastSaveTime.current = 0;
      setIsReady(false); setShowResumeBtn(false); setPipMode(false);
      setStatusMsg('🔄 กำลังเปลี่ยนวิดีโอ...');
      currentVideoUrl.current = videoUrl;
    }
  }, [videoUrl]);

  useEffect(() => {
    if (!videoUrl || !employeeId) return;
    fetch(`https://training-api-pvak.onrender.com/api/get-progress?employeeId=${employeeId}&courseId=${courseId}`)
      .then(res => res.json()).then(data => {
        const savedTime = data.currentTime || 0;
        savedTimeRef.current = savedTime; maxWatchedTime.current = savedTime; lastSaveTime.current = savedTime;
        setPlayedSeconds(savedTime);
        if (savedTime > 5) { setStatusMsg(`✅ ประวัติเดิม: ${Math.floor(savedTime)} วิ`); setShowResumeBtn(true); }
        else { setStatusMsg('✅ เริ่มเรียนใหม่'); setPlaying(true); }
        setIsReady(true);
      }).catch(() => setStatusMsg('⚠️ ดึงข้อมูลไม่ได้'));
  }, [employeeId, courseId, videoUrl]);

  const handleManualResume = () => {
    setShowResumeBtn(false); if(playerRef.current) playerRef.current.seekTo(savedTimeRef.current); setTimeout(()=>setPlaying(true),300);
  };
  const handleStartNew = () => {
    setShowResumeBtn(false); savedTimeRef.current=0; maxWatchedTime.current=0; if(playerRef.current) playerRef.current.seekTo(0); setPlaying(true);
  };

  const handleProgress = (state) => {
    if (showResumeBtn) return;
    const currentSec = state.playedSeconds;
    // Anti-Cheat
    if (currentSec > maxWatchedTime.current + 5) {
      if (playerRef.current) playerRef.current.seekTo(maxWatchedTime.current, 'seconds');
      setStatusMsg('🚫 ห้ามกดข้าม!'); return; 
    }
    if (currentSec > maxWatchedTime.current) maxWatchedTime.current = currentSec;
    setPlayedSeconds(currentSec);
    // Auto Save
    if (Math.abs(currentSec - lastSaveTime.current) >= 5) {
      saveProgress(currentSec, totalDuration); lastSaveTime.current = currentSec;
    }
  };

  const handleEnded = () => {
    saveProgress(totalDuration, totalDuration);
    setStatusMsg('🎉 เรียนจบแล้ว!');
    setPlaying(false);
    setPipMode(false); // ออกจาก PiP เมื่อจบ
  };

  // ✅ ฟังก์ชันสลับ Native PiP
  const togglePip = () => {
    setPipMode(!pipMode);
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
        
        {/* ปุ่มเปิด PiP */}
        <button 
          onClick={togglePip}
          style={{
            background: pipMode ? '#ef4444' : '#4f46e5',
            color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px',
            cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px'
          }}
        >
          {pipMode ? '❌ ปิดจอลอย' : '📺 เปิดจอลอย (Picture-in-Picture)'}
        </button>
      </div>

      <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '15px' }}>
        <div style={{ width: `${totalDuration > 0 ? (playedSeconds / totalDuration) * 100 : 0}%`, height: '100%', background: '#4f46e5', transition: 'width 0.3s' }} />
      </div>

      {/* Video Container */}
      <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000', borderRadius: '12px', overflow: 'hidden' }}>
        
        {/* Resume Overlay (แสดงเฉพาะตอนไม่ได้ลอย) */}
        {showResumeBtn && !pipMode && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99,
            backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
          }}>
            <h3 style={{ color: 'white', marginBottom: '10px' }}>ดูต่อจากเดิม?</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleManualResume} style={{background:'#22c55e', color:'white', border:'none', padding:'8px 16px', borderRadius:'4px', cursor:'pointer'}}>ใช่</button>
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
          
          // ✅ เปิดใช้งาน Native PiP
          pip={pipMode}
          // เมื่อ User กดเปิดปิดที่ตัว Player เอง ให้ Sync State กลับมา
          onEnablePIP={() => setPipMode(true)}
          onDisablePIP={() => setPipMode(false)}

          onDuration={(d) => setTotalDuration(d)}
          onProgress={handleProgress}
          onEnded={handleEnded}
          onReady={() => setIsReady(true)}
          config={{
            youtube: { playerVars: { showinfo: 1, modestbranding: 1, rel: 0, playsinline: 1 } }
          }}
        />
      </div>
      
      {/* คำอธิบาย */}
      {pipMode && (
          <div style={{marginTop:'10px', padding:'10px', background:'#ecfdf5', color:'#065f46', borderRadius:'8px', textAlign:'center', border:'1px solid #a7f3d0'}}>
             ✅ วิดีโอกำลังลอยอยู่เหนือหน้าจออื่น (คุณสามารถพับหน้าเว็บนี้ลงได้โดยวิดีโอไม่หาย)
          </div>
      )}

    </div>
  );
};

export default TrainingVideoPlayer;