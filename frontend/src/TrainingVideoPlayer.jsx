import React from 'react';

// รับค่ามาแค่ videoUrl ก็พอ (ตัวอื่นไม่ต้องรับ จะได้ไม่โดนฟ้องว่าไม่ได้ใช้)
const TrainingVideoPlayer = ({ videoUrl }) => {
  return (
    <div style={{ marginTop: '20px', padding: '20px', background: '#000', borderRadius: '10px', color: '#fff' }}>
      <h3>🧪 โหมดทดสอบ (HTML5 Video)</h3>
      <p style={{ fontSize: '12px', color: '#aaa' }}>ถ้าเล่นได้ = เน็ตโรงงานปกติ / ถ้าจอดำ = เน็ตบล็อกไฟล์นี้</p>
      
      {/* ตัวเล่นวิดีโอแบบพื้นฐานที่สุด */}
      <video 
        src={videoUrl} 
        controls 
        width="100%" 
        height="auto"
        style={{ borderRadius: '5px', marginTop: '10px' }}
      >
        Browser ของคุณไม่รองรับวิดีโอนี้
      </video>

      <div style={{ marginTop: '15px', fontSize: '12px', wordBreak: 'break-all' }}>
        🔗 <b>Source:</b> {videoUrl}
      </div>
    </div>
  );
};

export default TrainingVideoPlayer;