import React from 'react';

// รับมาแค่ videoUrl ตัวเดียวพอ (ตัวอื่นลบทิ้งไปก่อน จะได้ไม่ Error)
const TrainingVideoPlayer = ({ videoUrl }) => {
  
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

      <div style={{ marginTop: '15px', fontSize: '12px', color: '#aaa' }}>
        🔗 <b>Source:</b> {videoUrl}
      </div>
    </div>
  );
};

export default TrainingVideoPlayer;