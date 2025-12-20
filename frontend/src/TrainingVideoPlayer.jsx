import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';

const TrainingVideoPlayer = ({ 
  videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // ตัวอย่าง YouTube URL
  employeeId = 'EMP001', 
  employeeName = 'ทดสอบ ระบบ', 
  courseId = 'COURSE001' 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [error, setError] = useState(null);
  const playerRef = useRef(null);

  // ตรวจสอบว่า URL เป็น YouTube ที่ถูกต้องหรือไม่
  const isValidYouTubeUrl = (url) => {
    return ReactPlayer.canPlay(url);
  };

  // ฟังก์ชันส่งข้อมูลไปหลังบ้าน
  const saveProgressToBackend = async (currentTime, totalDuration) => {
    try {
      // *** แก้ตรงนี้: ต้องเป็น /api/save-progress ให้ตรงกับ server.js ***
      const response = await fetch('https://training-api-pvak.onrender.com/api/save-progress', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          employeeName,
          courseId,
          currentTime: Math.floor(currentTime),
          totalDuration: Math.floor(totalDuration)
        })
      });
      
      if (!response.ok) {
        console.error('Failed to save progress:', response.status);
      } else {
        console.log('✅ บันทึกความคืบหน้า:', Math.floor(currentTime), '/', Math.floor(totalDuration));
      }
    } catch (err) {
      console.error("❌ Error saving progress:", err);
    }
  };

  // ส่งข้อมูลทุก 5 วินาทีเมื่อเล่นอยู่
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && duration > 0) {
        saveProgressToBackend(playedSeconds, duration);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, duration, playedSeconds, employeeId, courseId]);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '20px', 
          borderBottom: '1px solid #e0e0e0',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>📚 ระบบเรียนรู้ออนไลน์</h2>
          <p style={{ margin: 0, opacity: 0.9 }}>Course ID: {courseId}</p>
        </div>

        {/* Video Player */}
        {!isValidYouTubeUrl(videoUrl) ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#d32f2f' }}>
            <h3>⚠️ URL ไม่ถูกต้อง</h3>
            <p>กรุณาใช้ลิงก์ YouTube ในรูปแบบ:</p>
            <ul style={{ textAlign: 'left', display: 'inline-block' }}>
              <li>https://www.youtube.com/watch?v=VIDEO_ID</li>
              <li>https://youtu.be/VIDEO_ID</li>
            </ul>
          </div>
        ) : (
          <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
            <ReactPlayer
              ref={playerRef}
              url={videoUrl}
              width="100%"
              height="100%"
              style={{ position: 'absolute', top: 0, left: 0 }}
              controls={true}
              playing={isPlaying}
              config={{
                youtube: {
                  playerVars: { 
                    showinfo: 1,
                    modestbranding: 1
                  }
                }
              }}
              onPlay={() => {
                setIsPlaying(true);
                console.log('▶️ เริ่มเล่นวิดีโอ');
              }}
              onPause={() => {
                setIsPlaying(false);
                console.log('⏸️ หยุดวิดีโอชั่วคราว');
                // บันทึกทันทีเมื่อกด pause
                if (duration > 0) {
                  saveProgressToBackend(playedSeconds, duration);
                }
              }}
              onDuration={(d) => {
                setDuration(d);
                console.log('⏱️ ระยะเวลาวิดีโอ:', Math.floor(d), 'วินาที');
              }}
              onProgress={(progress) => {
                setPlayedSeconds(progress.playedSeconds);
              }}
              onEnded={() => {
                saveProgressToBackend(duration, duration);
                setIsPlaying(false);
                alert("🎉 ยินดีด้วย! คุณเรียนจบบทเรียนนี้แล้ว");
              }}
              onError={(e) => {
                setError('ไม่สามารถโหลดวิดีโอได้');
                console.error('Video error:', e);
              }}
            />
          </div>
        )}

        {error && (
          <div style={{ padding: '15px', background: '#ffebee', color: '#c62828', textAlign: 'center' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Info Section */}
        <div style={{ padding: '20px', background: '#f5f5f5' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '15px',
            marginBottom: '15px'
          }}>
            <div style={{ 
              background: 'white', 
              padding: '15px', 
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>ผู้เรียน</div>
              <div style={{ fontWeight: 'bold', color: '#333' }}>
                {employeeName}
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>ID: {employeeId}</div>
            </div>

            <div style={{ 
              background: 'white', 
              padding: '15px', 
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>ความคืบหน้า</div>
              <div style={{ fontWeight: 'bold', color: '#4caf50', fontSize: '18px' }}>
                {duration > 0 ? Math.round((playedSeconds / duration) * 100) : 0}%
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                {Math.floor(playedSeconds)} / {Math.floor(duration)} วินาที
              </div>
            </div>

            <div style={{ 
              background: 'white', 
              padding: '15px', 
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>สถานะ</div>
              <div style={{ fontWeight: 'bold', color: isPlaying ? '#2196f3' : '#666' }}>
                {isPlaying ? '▶️ กำลังเล่น' : '⏸️ หยุดชั่วคราว'}
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                บันทึกอัตโนมัติทุก 5 วินาที
              </div>
            </div>
          </div>

          <div style={{ 
            padding: '12px', 
            background: '#e3f2fd', 
            borderRadius: '6px',
            fontSize: '13px',
            color: '#1565c0'
          }}>
            💡 <strong>เคล็ดลับ:</strong> ระบบจะบันทึกความคืบหน้าอัตโนมัติขณะเรียน และเมื่อกด Pause
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        background: '#f5f5f5', 
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        <strong>Debug Info:</strong><br/>
        Video URL: {videoUrl}<br/>
        Can Play: {isValidYouTubeUrl(videoUrl) ? '✅ Yes' : '❌ No'}<br/>
        Duration: {Math.floor(duration)}s<br/>
        Current Time: {Math.floor(playedSeconds)}s
      </div>
    </div>
  );
};

export default TrainingVideoPlayer;