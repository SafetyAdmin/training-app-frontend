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

  // --- STATE: Custom Floating (ลากในเว็บ) ---
  const [isFloating, setIsFloating] = useState(false);
  const [floatRect, setFloatRect] = useState({ x: 0, y: 0, w: 480, h: 320 });

  // --- STATE: Native PiP (ลอยนอกเว็บ) ---
  const [isNativePiP, setIsNativePiP] = useState(false);

  // Refs Drag & Drop
  const dragRef = useRef(false);
  const resizeRef = useRef(false);
  const offsetRef = useRef({ x: 0, y: 0 });
  const startDimRef = useRef({ w: 0, h: 0 });

  const playerRef = useRef(null);
  const lastSaveTime = useRef(0);
  const currentVideoUrl = useRef(videoUrl);
  const maxWatchedTime = useRef(0); 
  const savedTimeRef = useRef(0);

  // 1. ตั้งค่าตำแหน่งเริ่มต้น (ขวาล่าง)
  useEffect(() => {
    if (isFloating) {
      setFloatRect({ x: window.innerWidth - 500, y: window.innerHeight - 350, w: 480, h: 300 });
    }
  }, [isFloating]);

  // 2. Mouse Event Listeners (สำหรับลาก)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragRef.current) {
        setFloatRect(prev => ({ ...prev, x: e.clientX - offsetRef.current.x, y: e.clientY - offsetRef.current.y }));
      }
      if (resizeRef.current) {
        const newW = Math.max(300, startDimRef.current.w + (e.clientX - offsetRef.current.x));
        const newH = Math.max(200, startDimRef.current.h + (e.clientY - offsetRef.current.y));
        setFloatRect(prev => ({ ...prev, w: newW, h: newH }));
      }
    };
    const handleMouseUp = () => { dragRef.current = false; resizeRef.current = false; };

    if (isFloating) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isFloating]);

  const startDrag = (e) => { e.preventDefault(); dragRef.current = true; offsetRef.current = { x: e.clientX - floatRect.x, y: e.clientY - floatRect.y }; };
  const startResize = (e) => { e.preventDefault(); e.stopPropagation(); resizeRef.current = true; offsetRef.current = { x: e.clientX, y: e.clientY }; startDimRef.current = { w: floatRect.w, h: floatRect.h }; };

  // --- Logic Save Time ---
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

  const handleProgress = (state) => {
    if (showResumeBtn) return;
    const currentSec = state.playedSeconds;
    if (currentSec > maxWatchedTime.current + 5) {
      if (playerRef.current) playerRef.current.seekTo(maxWatchedTime.current, 'seconds');
      setStatusMsg('🚫 ห้ามกดข้าม!'); return; 
    }
    if (currentSec > maxWatchedTime.current) maxWatchedTime.current = currentSec;
    setPlayedSeconds(currentSec);
    if (Math.abs(currentSec - lastSaveTime.current) >= 5) {
      saveProgress(currentSec, totalDuration); lastSaveTime.current = currentSec;
    }
  };

  useEffect(() => {
    if (currentVideoUrl.current !== videoUrl) {
      setPlaying(false); setTotalDuration(0); setPlayedSeconds(0);
      maxWatchedTime.current = 0; savedTimeRef.current = 0; lastSaveTime.current = 0;
      setIsReady(false); setShowResumeBtn(false); setIsFloating(false); setIsNativePiP(false);
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

  const handleManualResume = () => { setShowResumeBtn(false); if(playerRef.current) playerRef.current.seekTo(savedTimeRef.current); setTimeout(()=>setPlaying(true),300); };
  const handleStartNew = () => { setShowResumeBtn(false); savedTimeRef.current=0; maxWatchedTime.current=0; if(playerRef.current) playerRef.current.seekTo(0); setPlaying(true); };
  const handleEnded = () => { saveProgress(totalDuration,totalDuration); setStatusMsg('🎉 จบแล้ว!'); setPlaying(false); setIsFloating(false); setIsNativePiP(false); };

  // --- 🔥 Native PiP Toggle ---
  const toggleNativePiP = () => {
    setIsFloating(false);
    if (!playing) setPlaying(true);
    setTimeout(() => {
        setIsNativePiP(!isNativePiP);
    }, 500);
  };

  // --- STYLES ---
  const containerStyle = isFloating ? {
    position: 'fixed', left: `${floatRect.x}px`, top: `${floatRect.y}px`, width: `${floatRect.w}px`, height: `${floatRect.h}px`,
    zIndex: 9999, backgroundColor: 'black', borderRadius: '8px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '2px solid #4f46e5'
  } : {
    position: 'relative', paddingTop: '56.25%', background: '#000', borderRadius: '12px', overflow: 'hidden'
  };

  return (
    <div style={{ marginTop: '20px' }}>
      
      {/* Control Bar */}
      <div style={{ 
        background: '#f8fafc', padding: '15px', borderRadius: '12px', marginBottom: '15px', 
        border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'
      }}>
        <div style={{fontSize:'14px'}}>
           ⏱️ {Math.floor(playedSeconds)} / {Math.floor(totalDuration)} วิ &nbsp;|&nbsp; 
           <span style={{color: statusMsg.includes('🚫') ? 'red' : 'green', fontWeight:'bold'}}>{statusMsg}</span>
        </div>
        
        <div style={{display:'flex', gap:'10px'}}>
            <button onClick={() => { setIsFloating(!isFloating); setIsNativePiP(false); }}
              style={{background: isFloating ? '#ef4444' : 'white', color: isFloating ? 'white' : '#4f46e5', border: '1px solid #4f46e5', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}
            >
              {isFloating ? '❌ ปิดจอลอย' : '📺 จอลอย (ในเว็บ)'}
            </button>

            <button onClick={toggleNativePiP}
              style={{background: isNativePiP ? '#ef4444' : '#4f46e5', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}
            >
              {isNativePiP ? '❌ ปิดจอนอก' : '🚀 จอลอย (นอกเว็บ)'}
            </button>
        </div>
      </div>

      {/* --- VIDEO CONTAINER --- */}
      <div style={containerStyle}>
        
        {isFloating && (
            <div onMouseDown={startDrag} style={{
                height: '30px', background: '#333', cursor: 'move', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px', color: '#fff', fontSize: '12px', userSelect: 'none'
            }}><span>::: Drag to Move :::</span><span onClick={() => setIsFloating(false)} style={{cursor:'pointer', fontWeight:'bold', padding:'0 5px'}}>✕</span></div>
        )}

        <div style={isFloating ? {flex:1, position:'relative'} : {position:'absolute', top:0, left:0, width:'100%', height:'100%'}}>
            
            {showResumeBtn && (
                <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                    <h3 style={{ color: 'white', marginBottom: '10px' }}>ดูต่อจากเดิม?</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleManualResume} style={{background:'#22c55e', color:'white', border:'none', padding:'6px 12px', borderRadius:'4px', cursor:'pointer'}}>ใช่</button>
                        <button onClick={handleStartNew} style={{background:'transparent', color:'#aaa', border:'1px solid #555', padding:'6px 12px', borderRadius:'4px', cursor:'pointer'}}>ใหม่</button>
                    </div>
                </div>
            )}

            <div style={{pointerEvents: (dragRef.current || resizeRef.current) ? 'none' : 'auto', width:'100%', height:'100%'}}>
                <ReactPlayer
                    ref={playerRef}
                    url={videoUrl}
                    width="100%"
                    height="100%"
                    controls={true}
                    playing={playing} 
                    
                    pip={isNativePiP}
                    onEnablePIP={() => setIsNativePiP(true)}
                    onDisablePIP={() => setIsNativePiP(false)}

                    onDuration={(d) => setTotalDuration(d)}
                    onProgress={handleProgress}
                    onEnded={handleEnded}
                    onReady={() => setIsReady(true)}
                    
                    // 🔥🔥 แก้ไข Config ตรงนี้ (สำคัญมาก) 🔥🔥
                    config={{
                        youtube: {
                            playerVars: { 
                                showinfo: 0, 
                                modestbranding: 1, 
                                rel: 0, 
                                playsinline: 1, 
                                origin: window.location.origin // เพิ่ม origin
                            },
                            embedOptions: {
                                // 🔥 บังคับให้ iframe อนุญาต PiP
                                allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            }
                        },
                        file: {
                            attributes: {
                                controlsList: 'nodownload',
                                disablePictureInPicture: false
                            }
                        }
                    }}
                />
            </div>
        </div>

        {isFloating && (
            <div onMouseDown={startResize} style={{
                position: 'absolute', bottom: 0, right: 0, width: '15px', height: '15px', cursor: 'nwse-resize', zIndex: 100, background: 'linear-gradient(135deg, transparent 50%, #4f46e5 50%)'
            }} />
        )}
      </div>
      
      {(isFloating || isNativePiP) && (
          <div style={{width: '100%', paddingTop: '56.25%', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1'}}>
              <span style={{color:'#64748b'}}>📺 วิดีโอกำลังเล่นในโหมดจอลอย...</span>
          </div>
      )}

      {/* คำอธิบาย */}
      <div style={{marginTop:'10px', fontSize:'0.85rem', color:'#64748b'}}>
          💡 <b>เคล็ดลับ:</b> ถ้ากดปุ่มแล้วไม่ขึ้น ให้คลิกขวาที่วิดีโอ <b>2 ครั้ง</b> แล้วเลือก <b>"Picture in picture" (ภาพในภาพ)</b>
      </div>

    </div>
  );
};

export default TrainingVideoPlayer;