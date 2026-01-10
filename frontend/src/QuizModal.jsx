// src/QuizModal.jsx
import React, { useState } from 'react';

const QuizModal = ({ course, onSubmit, onCancel }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState(Array(course.questions.length).fill(null));
  const [showScore, setShowScore] = useState(false);
  const [result, setResult] = useState(null);

  const handleChoice = (choiceIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = choiceIndex;
    setAnswers(newAnswers);
  };

  const submitExam = async () => {
    // ส่งคำตอบไปให้ Parent Component จัดการ (หรือยิง API ตรงนี้ก็ได้)
    const resultData = await onSubmit(answers);
    setResult(resultData);
    setShowScore(true);
  };

  if (showScore) {
    return (
      <div className="modal-overlay">
        <div className="card" style={{textAlign:'center', padding:'2rem', width:'100%', maxWidth:'400px'}}>
            <div style={{fontSize:'3rem'}}>{result.isPassed ? '🎉' : '😢'}</div>
            <h2>{result.isPassed ? 'ยินดีด้วย! คุณสอบผ่าน' : 'เสียใจด้วย คุณสอบไม่ผ่าน'}</h2>
            <p style={{fontSize:'1.2rem', fontWeight:'bold'}}>
                คะแนน: {result.score} / {result.total}
            </p>
            {result.isPassed ? (
                <button onClick={onCancel} className="btn btn-primary" style={{marginTop:'1rem'}}>ปิดหน้าต่าง</button>
            ) : (
                <button onClick={() => { setShowScore(false); setCurrentQ(0); setAnswers(Array(course.questions.length).fill(null)); }} className="btn" style={{marginTop:'1rem', background:'#ef4444', color:'white'}}>
                    ทำข้อสอบใหม่
                </button>
            )}
        </div>
      </div>
    );
  }

  const q = course.questions[currentQ];

  return (
    <div className="modal-overlay" style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.8)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:2000}}>
      <div className="card" style={{width:'90%', maxWidth:'500px', background:'white', padding:'20px', borderRadius:'12px'}}>
        
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
            <h3 style={{margin:0}}>📝 แบบทดสอบ: ข้อ {currentQ + 1}/{course.questions.length}</h3>
            {/* <button onClick={onCancel}>❌</button> */}
        </div>

        <div style={{marginBottom:'20px', fontSize:'1.1rem', fontWeight:'bold'}}>{q.question}</div>

        <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {q.options.map((opt, idx) => (
                <button 
                    key={idx}
                    onClick={() => handleChoice(idx)}
                    style={{
                        padding:'12px', textAlign:'left', borderRadius:'8px', border:'1px solid #ddd',
                        background: answers[currentQ] === idx ? '#e0e7ff' : 'white',
                        color: answers[currentQ] === idx ? '#4f46e5' : '#333',
                        borderColor: answers[currentQ] === idx ? '#4f46e5' : '#ddd',
                        cursor:'pointer', fontWeight: answers[currentQ] === idx ? 'bold' : 'normal'
                    }}
                >
                    {idx+1}. {opt}
                </button>
            ))}
        </div>

        <div style={{marginTop:'20px', display:'flex', justifyContent:'space-between'}}>
            <button 
                disabled={currentQ === 0}
                onClick={() => setCurrentQ(currentQ - 1)}
                className="btn" style={{background:'#f3f4f6'}}
            >
                ⬅️ ก่อนหน้า
            </button>

            {currentQ === course.questions.length - 1 ? (
                <button 
                    disabled={answers.includes(null)}
                    onClick={submitExam}
                    className="btn btn-primary"
                >
                    ส่งคำตอบ ✅
                </button>
            ) : (
                <button 
                    onClick={() => setCurrentQ(currentQ + 1)}
                    className="btn btn-primary"
                >
                    ถัดไป ➡️
                </button>
            )}
        </div>

      </div>
    </div>
  );
};

export default QuizModal;