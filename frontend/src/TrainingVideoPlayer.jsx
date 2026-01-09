import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';

const TrainingVideoPlayer = ({ videoUrl, employeeId, employeeName, courseId }) => {
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [statusMsg, setStatusMsg] = useState('⏳ กำลังโหลดข้อมูล...');
  
  // State เดิม
  const [playing, setPlaying] = useState(false);
  const [showResumeBtn, setShowResumeBtn] = useState(false); 

  // ✅ NEW: เพิ่ม State สำหรับโหมด Popup (PiP)
  const [pipMode, setPipMode] = useState(false);

  const playerRef = useRef(null);
  const lastSaveTime = useRef(0);
  const currentVideoUrl = useRef(videoUrl);
  const maxWatchedTime = useRef(0); 
  const savedTimeRef = useRef(0);

  // ... (ฟังก์ชัน saveProgress เดิม ไม่ต้องแก้) ...
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

  // ... (useEffect ทั้ง 2 ตัวเดิม ไม่ต้องแก้) ...
  useEffect(() => {
    if (currentVideoUrl.current !== videoUrl) {
      setPlaying(false); setTotalDuration(0); setPlayedSeconds(0);
      maxWatchedTime.current = 0; savedTimeRef.current = 0; lastSaveTime.current = 0;
      setIsReady(false); setShowResumeBtn(false); setPipMode(false); // Reset PIP ด้วย
      setStatusMsg('🔄 กำลังเปลี่ยนวิดีโอ...');
      currentVideoUrl.current = videoUrl;
    }
  }, [videoUrl]);

  useEffect(() => {
    if (!videoUrl || !employeeId || !courseId) return;
    // ... (Logic ดึงข้อมูลเดิมเหมือนเดิม) ...
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
          setShowResumeBtn(false);
          setPlaying(true);
        }
        setIsReady(true);
      })
      .catch(() => setStatusMsg('⚠️ ดึงข้อมูลไม่ได้ (เริ่มใหม่)'));
  }, [employeeId, courseId, videoUrl]);

  // ... (Functions handle ต่างๆ เหมือนเดิม) ...
  const handleManualResume = () => {
    setShowResumeBtn(false);
    if (playerRef.current) playerRef.current.seekTo(savedTimeRef.current, 'seconds');
    setTimeout(() => setPlaying(true), 300);
  };

  const handleStartNew = () => {
    setShowResumeBtn(false);
    savedTimeRef.current = 0; maxWatchedTime.current = 0; lastSaveTime.current = 0;
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

  const handleEnded = () => {
    saveProgress(totalDuration, totalDuration);
    setStatusMsg('🎉 เรียนจบแล้ว!');
    setPlaying(false);
    // ออกจากโหมด PIP เมื่อจบ
    if(document.pictureInPictureElement) document.exitPictureInPicture();
  };

  // ✅ ฟังก์ชันสลับโหมด Popup
  const togglePip = () => {
    setPipMode(!pipMode);
  };

  return (
    <div style={{ marginTop: '20px' }}>
      
      {/* Header Status Bar & Controls */}
      <div style={{ 
        background: '#f8fafc', padding: '15px', borderRadius: '12px', marginBottom: '15px', 
        border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'
      }}>
        <div style={{ fontSize: '14px', color: '#334155' }}>
           ⏱️ <b>เวลา:</b> {Math.floor(playedSeconds)} / {Math.floor(totalDuration)} วิ 
           &nbsp;|&nbsp; 
           <span style={{color: statusMsg.includes('🚫') ? '#ef4444' : '#10b981', fontWeight: 'bold'}}>{statusMsg}</span>
        </div>

        {/* ✅ ปุ่มกด Popup */}
        <button 
          onClick={togglePip}
          style={{
            background: pipMode ? '#3b82f6' : 'white',
            color: pipMode ? 'white' : '#3b82f6',
            border: '1px solid #3b82f6',
            padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
            display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem'
          }}
        >
          {pipMode ? '⬇️ ดึงจอกลับ' : '📺 จอลอย (Popup)'}
        </button>
      </div>

      <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '15px' }}>
        <div style={{ 
          width: `${totalDuration > 0 ? (playedSeconds / totalDuration) * 100 : 0}%`, 
          height: '100%', 
          background: playedSeconds >= totalDuration * 0.99 ? '#10b981' : '#4f46e5', 
          transition: 'width 0.3s' 
        }} />
      </div>

      <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
        
        {showResumeBtn && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99,
            backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
          }}>
            <h3 style={{ color: 'white', marginBottom: '15px' }}>
              ประวัติเดิม: {Math.floor(savedTimeRef.current / 60)}:{Math.floor(savedTimeRef.current % 60).toString().padStart(2, '0')}
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleManualResume} style={{background:'#ef4444', color:'white', border:'none', padding:'10px 20px', borderRadius:'6px', cursor:'pointer', fontWeight:'bold'}}>▶ ดูต่อ</button>
              <button onClick={handleStartNew} style={{background:'transparent', color:'#aaa', border:'1px solid #555', padding:'10px 20px', borderRadius:'6px', cursor:'pointer'}}>เริ่มใหม่</button>
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
          
          // ✅ เปิดใช้งานโหมด PIP
          pip={pipMode}
          onEnablePIP={() => setPipMode(true)}
          onDisablePIP={() => setPipMode(false)}

          onDuration={(d) => setTotalDuration(d)}
          onProgress={handleProgress}
          onEnded={handleEnded}
          onReady={() => setIsReady(true)}
          config={{
            youtube: { 
              playerVars: { 
                showinfo: 1, modestbranding: 1, rel: 0, 
                fs: 1, // Fullscreen
                playsinline: 1 // เล่นในเว็บได้ไม่เด้งออก (มือถือ)
              } 
            }
          }}
        />
      </div>
    </div>
  );
};

export default TrainingVideoPlayer;