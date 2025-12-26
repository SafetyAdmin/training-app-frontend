import React from 'react';

// รับค่ามาให้ครบทุกตัว เพื่อกันไม่ให้ App.jsx ส่งมาแล้วไม่มีคนรับ
const TrainingVideoPlayer = ({ videoUrl, employeeId, employeeName, courseId }) => {
  
  // 🔥 บรรทัดนี้สำคัญมาก! (ห้ามลบ)
  // สั่ง console.log เพื่อหลอกระบบว่าเรา "ใช้งาน" ตัวแปรพวกนี้แล้ว (กัน Error: Unused vars)
  console.log('Debug Info:', { videoUrl, employeeId, employeeName, courseId });

  if (!videoUrl) return <div style={{color:'red'}}>❌ ไม่พบลิ้งก์วิดีโอ</div>;

  return (
    <div style={{ 
      marginTop: '20px', 
      padding: '20px', 
      background: '#000', 
      borderRadius: '10px', 
      color: '#fff',
      textAlign: 'center'
    }}>
      <h3 style={{ marginBottom: '15px' }}>🧪 โหมดทดสอบ (HTML5 Video)</h3>
      
      {/* ตัวเล่นวิดีโอแบบพื้นฐานที่สุด */}
      <video 
        src={videoUrl} 
        controls 
        width="100%" 
        height="auto"
        style={{ borderRadius: '5px', maxHeight: '500px' }}
      >
        Browser ของคุณไม่รองรับวิดีโอนี้
      </video>

      <div style={{ 
        marginTop: '15px', 
        fontSize: '12px', 
        color: '#aaa',
        borderTop: '1px solid #333',
        paddingTop: '10px'
      }}>
        🔗 <b>Source:</b> {videoUrl}
      </div>
    </div>
  );
};

export default TrainingVideoPlayer;