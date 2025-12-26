import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player'; // ✅ แก้จาก importJH เป็น import แล้ว

const TrainingVideoPlayer = ({ videoUrl, employeeId, employeeName, courseId }) => {
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [statusMsg, setStatusMsg] = useState('⏳ กำลังโหลดข้อมูล...');
  
  const playerRef = useRef(null);
  const lastSaveTime = useRef(0);
  const currentVideoUrl = useRef(videoUrl);
  
  // 🔥 ตัวแปรสำคัญ: จำว่า "ดูถึงวินาทีที่เท่าไหร่แล้ว" (ห้ามข้ามเกินนี้)
  const maxWatchedTime = useRef(0); 

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
      maxWatchedTime.current = 0; // รีเซ็ตตัวกันโกง
      setIsReady(false);
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
        
        // 🔥 สำคัญ: อนุญาตให้ข้ามได้ถึงแค่จุดที่เคยเรียนมาแล้ว
        maxWatchedTime.current = savedTime; 

        if (savedTime > 0) {
          setStatusMsg(`✅ พบประวัติเดิม: เริ่มต่อที่ ${Math.floor(savedTime)} วินาที`);
        } else {
          setStatusMsg('✅ เริ่มเรียนใหม่ (ห้ามกดข้าม)');
        }
        setIsReady(true);
      })
      .catch(() => setStatusMsg('⚠️ ดึงประวัติไม่ได้ (เริ่มใหม่ 0)'));
  }, [employeeId, courseId, videoUrl]);

  // 4. ฟังก์ชันกันโกง & บันทึกเวลา
  const handleProgress = (state) => {
    const currentSec = state.playedSeconds;

    // ⛔ LOGIC กันโกง: ถ้าเวลาปัจจุบัน มากกว่า เวลาที่เคยดูเกิน 2 วินาที (แปลว่ากดข้าม)
    if (currentSec > maxWatchedTime.current + 2) {
      // สั่งให้ Player เด้งกลับไปที่เดิมทันที
      if (playerRef.current) {
        playerRef.current.seekTo(maxWatchedTime.current, 'seconds');
      }
      setStatusMsg('🚫 ห้ามกดข้าม! กรุณาดูวิดีโอให้จบ');
      return; // จบการทำงาน ไม่บันทึกค่า
    }

    // ถ้าดูปกติ (ไม่โกง) -> อัปเดตเวลาล่าสุดที่ดูถึง
    if (currentSec > maxWatchedTime.current) {
      maxWatchedTime.current = currentSec;
    }

    setPlayedSeconds(currentSec);

    // บันทึกทุก 5 วินาที
    if (Math.abs(currentSec - lastSaveTime.current) >= 5) {
      saveProgress(currentSec, totalDuration);
      lastSaveTime.current = currentSec;
    }
  };

  // เมื่อดูจบ
  const handleEnded = () => {
    saveProgress(totalDuration, totalDuration);
    setStatusMsg('🎉 เรียนจบแล้ว! บันทึกเรียบร้อย');
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '8px', marginBottom: '10px', fontSize: '14px', color: '#334155' }}>
        ⏱️ <b>เวลาที่เรียน:</b> {Math.floor(playedSeconds)} / {Math.floor(totalDuration)} วินาที <br/>
        🔧 <b>สถานะ:</b> <span style={{color: statusMsg.includes('🚫') ? 'red' : 'green'}}>{statusMsg}</span>
      </div>

      <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
        <div style={{ 
          width: `${totalDuration > 0 ? (playedSeconds / totalDuration) * 100 : 0}%`, 
          height: '100%', 
          background: playedSeconds >= totalDuration * 0.99 ? '#10b981' : '#2563eb', 
          transition: 'width 0.3s' 
        }} />
      </div>

      <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
          controls={true} // ยังโชว์ปุ่มได้ แต่กดข้ามไม่ได้ (จะเด้งกลับ)
          onDuration={(d) => setTotalDuration(d)}
          onProgress={handleProgress}
          onEnded={handleEnded}
          onReady={() => {
            setIsReady(true);
            if (playedSeconds > 0 && playerRef.current) {
              playerRef.current.seekTo(playedSeconds, 'seconds');
            }
          }}
          config={{
            youtube: {
              playerVars: { showinfo: 1, modestbranding: 1, rel: 0 }
            },
            file: {
              attributes: { controlsList: 'nodownload' }
            }
          }}
        />
      </div>
    </div>
  );
};

export default TrainingVideoPlayer;