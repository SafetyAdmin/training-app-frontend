import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';

const TrainingVideoPlayer = ({ 
  videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  employeeId = 'EMP001', 
  employeeName = 'ทดสอบ ระบบ', 
  courseId = 'COURSE001' 
}) => {
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [maxWatched, setMaxWatched] = useState(0);
  const [skipWarning, setSkipWarning] = useState(false);
  const lastSaveTime = useRef(0);

  // 1. โหลดข้อมูลเดิมจาก Cloud
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const res = await fetch(`https://training-api-pvak.onrender.com/api/get-progress?employeeId=${employeeId}&courseId=${courseId}`);
        const data = await res.json();
        
        if (data && data.currentTime > 0) {
          setMaxWatched(data.currentTime);
          console.log('🔄 โหลดความคืบหน้า:', Math.floor(data.currentTime), 'วินาที');
          
          // รอให้วิดีโอพร้อมก่อน seek
          setTimeout(() => {
            if (playerRef.current) {
              playerRef.current.seekTo(data.currentTime, 'seconds');
            }
          }, 1000);
        }
      } catch (err) { 
        console.error('โหลดข้อมูลไม่สำเร็จ:', err); 
      }
    };
    
    if (isReady) {
      loadProgress();
    }
  }, [employeeId, courseId, isReady]);

  // 2. บันทึกข้อมูล
  const saveProgress = async (currentTime, totalTime) => {
    // ป้องกันการบันทึกซ้ำบ่อยเกินไป
    const now = Date.now();
    if (now - lastSaveTime.current < 3000) return; // บันทึกไม่เกิน 3 วินาที
    lastSaveTime.current = now;

    try {
      await fetch('https://training-api-pvak.onrender.com/api/save-progress', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          employeeName,
          courseId,
          currentTime: Math.floor(currentTime),
          totalDuration: Math.floor(totalTime)
        })
      });
      console.log('💾 บันทึก:', Math.floor(currentTime), '/', Math.floor(totalTime));
    } catch (err) { 
      console.error('บันทึกไม่สำเร็จ:', err); 
    }
  };

  // 3. ระบบกันโกง (แบบไม่ทำให้วิดีโอสะดุด)
  const handleProgress = (state) => {
    if (!isReady) return;
    
    const current = state.playedSeconds;
    setPlayedSeconds(current);

    // ตรวจสอบการข้าม (เกิน 5 วินาที)
    if (current > maxWatched + 5) {
      console.warn('⚠️ ตรวจพบการข้ามวิดีโอ!');
      setSkipWarning(true);
      setIsPlaying(false); // หยุดวิดีโอ
      
      setTimeout(() => {
        if (playerRef.current) {
          playerRef.current.seekTo(maxWatched, 'seconds');
        }
        setSkipWarning(false);
      }, 500);
    } else {
      // อัปเดตจุดสูงสุดที่ดูไปแล้ว
      if (current > maxWatched) {
        setMaxWatched(current);
      }
    }
  };

  // บันทึกทุก 10 วินาที
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && duration > 0 && playedSeconds > 0) {
        saveProgress(playedSeconds, duration);
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [isPlaying, duration, playedSeconds]);

  // บันทึกเมื่อกด Pause หรือออกจากหน้า
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (duration > 0 && playedSeconds > 0) {
        saveProgress(playedSeconds, duration);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [playedSeconds, duration]);

  const handlePlayPause = () => {
    if (isPlaying && duration > 0) {
      saveProgress(playedSeconds, duration);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (seconds) => {
    // อนุญาตให้ย้อนกลับได้เท่านั้น
    if (seconds <= maxWatched) {
      if (playerRef.current) {
        playerRef.current.seekTo(seconds, 'seconds');
      }
    } else {
      alert('🚫 ไม่สามารถกดข้ามไปข้างหน้าได้ กรุณาดูวิดีโอตามลำดับ');
    }
  };

  const progressPercent = duration > 0 ? (playedSeconds / duration) * 100 : 0;
  const maxWatchedPercent = duration > 0 ? (maxWatched / duration) * 100 : 0;

  return (
    <div style={{ 
      maxWidth: '900px', 
      margin: '20px auto', 
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '20px', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white' 
      }}>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>📺 ห้องเรียนออนไลน์</h3>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>หลักสูตร: {courseId}</p>
      </div>

      {/* Skip Warning */}
      {skipWarning && (
        <div style={{
          padding: '15px',
          background: '#fee2e2',
          borderLeft: '4px solid #dc2626',
          color: '#991b1b',
          fontWeight: 'bold'
        }}>
          🚫 ตรวจพบการข้ามวิดีโอ! กรุณาดูตามลำดับ
        </div>
      )}

      {/* Video Player */}
      <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
          
          playing={isPlaying}
          controls={true} // ✅ เปิด controls เพื่อให้วิดีโอเล่นได้
          
          config={{
            youtube: {
              playerVars: { 
                modestbranding: 1,
                rel: 0,
                showinfo: 0
              }
            }
          }}

          onReady={() => {
            console.log('✅ วิดีโอพร้อมแล้ว');
            setIsReady(true);
          }}
          onPlay={() => {
            setIsPlaying(true);
            console.log('▶️ เริ่มเล่น');
          }}
          onPause={() => {
            setIsPlaying(false);
            console.log('⏸️ หยุดชั่วคราว');
            if (duration > 0) {
              saveProgress(playedSeconds, duration);
            }
          }}
          onDuration={(d) => {
            setDuration(d);
            console.log('⏱️ ระยะเวลา:', Math.floor(d), 'วินาที');
          }}
          onProgress={handleProgress}
          onEnded={() => {
            saveProgress(duration, duration);
            setIsPlaying(false);
            alert("🎉 ยินดีด้วย! คุณเรียนจบหลักสูตรนี้แล้ว");
          }}
          onError={(e) => {
            console.error('❌ Video Error:', e);
          }}
        />
      </div>

      {/* Custom Controls */}
      <div style={{ padding: '20px', background: '#f8fafc' }}>
        {/* Play/Pause Button */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
          <button 
            onClick={handlePlayPause}
            style={{ 
              background: isPlaying ? '#ef4444' : '#10b981', 
              color: 'white', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              fontSize: '14px',
              transition: 'all 0.3s'
            }}
          >
            {isPlaying ? '⏸️ หยุด' : '▶️ เล่น'}
          </button>
          
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#64748b' }}>
            {Math.floor(playedSeconds)} / {Math.floor(duration)} วินาที ({Math.floor(progressPercent)}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ 
            position: 'relative',
            background: '#e2e8f0', 
            height: '12px', 
            borderRadius: '6px', 
            overflow: 'hidden',
            cursor: 'pointer'
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newTime = (clickX / rect.width) * duration;
            handleSeek(newTime);
          }}
          >
            {/* Max Watched (สีเขียวอ่อน) */}
            <div style={{ 
              position: 'absolute',
              width: `${maxWatchedPercent}%`, 
              background: '#86efac', 
              height: '100%',
              transition: 'width 0.3s'
            }}></div>
            
            {/* Current Position (สีน้ำเงิน) */}
            <div style={{ 
              position: 'absolute',
              width: `${progressPercent}%`, 
              background: '#3b82f6', 
              height: '100%',
              transition: 'width 0.3s'
            }}></div>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginTop: '5px',
            fontSize: '11px',
            color: '#94a3b8'
          }}>
            <span>🟦 ตำแหน่งปัจจุบัน</span>
            <span>🟩 ดูไปแล้ว (Max: {Math.floor(maxWatched)}s)</span>
          </div>
        </div>

        {/* Info Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px',
          marginTop: '15px'
        }}>
          <div style={{ 
            background: 'white', 
            padding: '12px', 
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '3px' }}>ผู้เรียน</div>
            <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{employeeName}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>ID: {employeeId}</div>
          </div>

          <div style={{ 
            background: 'white', 
            padding: '12px', 
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '3px' }}>สถานะ</div>
            <div style={{ 
              fontWeight: 'bold', 
              color: isPlaying ? '#10b981' : '#ef4444',
              fontSize: '16px'
            }}>
              {isPlaying ? '▶️ กำลังเล่น' : '⏸️ หยุดชั่วคราว'}
            </div>
          </div>
        </div>

        {/* Warning */}
        <div style={{ 
          marginTop: '15px',
          padding: '12px', 
          background: '#fef3c7', 
          borderRadius: '6px',
          fontSize: '12px',
          color: '#92400e',
          borderLeft: '3px solid #f59e0b'
        }}>
          🔒 <strong>ระบบป้องกันการข้าม:</strong> คุณต้องดูวิดีโอตามลำดับ ไม่สามารถข้ามไปข้างหน้าได้
        </div>
      </div>
    </div>
  );
};

export default TrainingVideoPlayer;