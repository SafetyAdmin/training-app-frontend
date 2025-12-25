// frontend/src/TrainingVideoPlayer.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';

const TrainingVideoPlayer = ({ videoUrl, employeeId, employeeName, courseId }) => {
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [statusMsg, setStatusMsg] = useState('⏳ กำลังโหลดข้อมูลเรียนเดิม...');
  const [videoError, setVideoError] = useState(null);
  const playerRef = useRef(null);
  const lastSaveTime = useRef(0);
  const currentVideoUrl = useRef(videoUrl);
  const isLoadingProgress = useRef(false);

  // ฟังก์ชันบันทึกเวลา
  const saveProgress = async (currentTime, duration) => {
    if (!currentTime || currentTime < 1) return;
    
    try {
      const response = await fetch('https://training-api-pvak.onrender.com/api/save-progress', {
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
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        setStatusMsg(`✅ บันทึกสำเร็จ: ${Math.floor(currentTime)}s (${Math.floor((currentTime/duration)*100)}%)`);
      } else {
        setStatusMsg(`⚠️ บันทึกไม่สำเร็จ - ลองใหม่อีกครั้ง`);
      }
      console.log(`✅ บันทึกแล้ว: ${Math.floor(currentTime)}s`);
    } catch (error) {
      console.error("❌ Save failed", error);
      setStatusMsg(`❌ ไม่สามารถบันทึกได้: ${error.message}`);
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
    setVideoError(null);
    setStatusMsg('🔄 กำลังโหลดวิดีโอใหม่...');
    lastSaveTime.current = 0;
  }, [videoUrl]);

  // โหลดเวลาเรียนล่าสุด
  useEffect(() => {
    if (!videoUrl || isLoadingProgress.current) return;
    
    isLoadingProgress.current = true;
    setStatusMsg('⏳ กำลังโหลดข้อมูล...');
    
    fetch(`https://training-api-pvak.onrender.com/api/get-progress?employeeId=${employeeId}&courseId=${courseId}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        const savedTime = data.currentTime || 0;
        setPlayedSeconds(savedTime);
        
        if (savedTime > 0) {
          setStatusMsg(`✅ พบประวัติเดิม: ${Math.floor(savedTime)} วินาที`);
        } else {
          setStatusMsg(`✅ เริ่มเรียนใหม่`);
        }
        
        setIsReady(true);
        isLoadingProgress.current = false;
      })
      .catch(err => {
        console.error('โหลดข้อมูลไม่สำเร็จ:', err);
        setStatusMsg(`⚠️ โหลดไม่สำเร็จ (${err.message}) - เริ่มใหม่ที่ 0 วินาที`);
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
        background: videoError ? '#fee2e2' : '#f1f5f9', 
        padding: '10px', 
        borderRadius: '8px', 
        marginBottom: '10px',
        fontSize: '14px',
        color: '#334155'
      }}>
        {videoError ? (
          <>
            ❌ <b>เกิดข้อผิดพลาด:</b> <span style={{ color: 'red' }}>{videoError}</span>
            <br/>
            🔗 <b>URL:</b> <span style={{ fontSize: '11px', wordBreak: 'break-all' }}>{videoUrl}</span>
          </>
        ) : (
          <>
            ⏱️ <b>เวลาที่เรียน:</b> {Math.floor(playedSeconds)} / {Math.floor(totalDuration)} วินาที
            <br/>
            📊 <b>ความคืบหน้า:</b> {totalDuration > 0 ? Math.floor((playedSeconds / totalDuration) * 100) : 0}%
            <br/>
            🔧 <b>สถานะระบบ:</b> <span style={{ color: statusMsg.includes('❌') || statusMsg.includes('⚠️') ? 'orange' : 'green' }}>{statusMsg}</span>
          </>
        )}
      </div>

      {/* Progress Bar */}
      {!videoError && (
        <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden', marginBottom: '15px' }}>
          <div style={{ 
            width: `${totalDuration > 0 ? (playedSeconds / totalDuration) * 100 : 0}%`, 
            height: '100%', 
            background: playedSeconds >= totalDuration * 0.9 ? '#10b981' : '#2563eb',
            transition: 'width 0.3s'
          }} />
        </div>
      )}

      {/* ตัวเล่นวิดีโอ */}
      <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
        {videoError ? (
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            textAlign: 'center',
            padding: '20px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
            <div style={{ fontSize: '18px', marginBottom: '10px' }}>ไม่สามารถเล่นวิดีโอได้</div>
            <div style={{ fontSize: '14px', opacity: 0.7 }}>{videoError}</div>
            <button 
              onClick={() => window.location.reload()}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              🔄 ลองใหม่
            </button>
          </div>
        ) : (
          <ReactPlayer
            ref={playerRef}
            url={videoUrl}
            width="100%"
            height="100%"
            style={{ position: 'absolute', top: 0, left: 0 }}
            controls={true}
            config={{
              file: {
                attributes: {
                  controlsList: 'nodownload',
                  onContextMenu: e => e.preventDefault()
                }
              }
            }}
            onDuration={(duration) => {
              console.log('📏 ความยาว:', duration, 'วินาที');
              setTotalDuration(duration);
              if (duration > 0) {
                setStatusMsg('✅ โหลดวิดีโอสำเร็จ');
              }
            }}
            onProgress={handleProgress}
            onEnded={handleEnded}
            onReady={() => {
              console.log('▶️ วิดีโอพร้อมเล่น');
              setIsReady(true);
              // กระโดดไปเวลาเดิมหลังจากวิดีโอโหลดเสร็จ
              if (playedSeconds > 0 && playerRef.current) {
                playerRef.current.seekTo(playedSeconds, 'seconds');
                setStatusMsg(`▶️ เริ่มเล่นต่อที่ ${Math.floor(playedSeconds)} วินาที`);
              }
            }}
            onError={(error) => {
              console.error('❌ วิดีโอ Error:', error);
              setVideoError('ไม่สามารถโหลดวิดีโอได้ กรุณาตรวจสอบ URL หรือลองใหม่อีกครั้ง');
              setStatusMsg('❌ เกิดข้อผิดพลาดในการโหลดวิดีโอ');
            }}
            onBuffer={() => {
              console.log('⏸️ กำลังบัฟเฟอร์...');
              setStatusMsg('⏸️ กำลังโหลด...');
            }}
            onBufferEnd={() => {
              console.log('▶️ บัฟเฟอร์เสร็จ');
              setStatusMsg('▶️ กำลังเล่น');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TrainingVideoPlayer;