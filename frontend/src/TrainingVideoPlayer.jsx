import React from 'react';

const TrainingVideoPlayer = ({ videoUrl, employeeId, employeeName, courseId }) => {
  // log ค่าออกมาดู เพื่อไม่ให้ระบบฟ้องว่ามีตัวแปรไม่ได้ใช้
  console.log('Playing:', videoUrl, 'User:', employeeId, employeeName, courseId);

  return (
    <div style={{ marginTop: '20px', padding: '20px', background: '#000', borderRadius: '10px' }}>
      <h3 style={{ color: '#fff', marginBottom: '15px' }}>🧪 โหมดทดสอบ (HTML5 Video)</h3>
      
      {/* ตัวเล่นวิดีโอแบบพื้นฐานที่สุด (ไม่ใช้ Library) */}
      <video 
        src={videoUrl} 
        controls 
        width="100%" 
        style={{ maxHeight: '500px', borderRadius: '5px' }}
      >
        Browser ของคุณไม่รองรับวิดีโอนี้
      </video>

      {/* แสดงลิ้งก์ให้เห็นชัดๆ */}
      <div style={{ marginTop: '15px', padding: '10px', background: '#333', color: '#0f0', fontSize: '12px', borderRadius: '5px', wordBreak: 'break-all' }}>
        🔗 <b>Source URL:</b> {videoUrl}
      </div>
    </div>
  );
};

export default TrainingVideoPlayer;