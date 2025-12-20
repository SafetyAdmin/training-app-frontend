const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- 1. ส่วนเชื่อมต่อ Database ---
const MONGO_URI = 'mongodb+srv://haekwang:Hae347795@cluster0.rk7rvot.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected: เชื่อมต่อฐานข้อมูลสำเร็จ'))
  .catch(err => console.error('❌ MongoDB Error: เชื่อมต่อไม่ได้', err));

// --- 2. สร้าง Model (Schema) ---
const progressSchema = new mongoose.Schema({
  employeeId: String,
  employeeName: String,
  courseId: String,
  lastWatchedTime: Number,
  isCompleted: Boolean,
  lastUpdated: { type: Date, default: Date.now }
});

const Progress = mongoose.model('Progress', progressSchema);

// --- 3. API บันทึกข้อมูล (Save) ---
app.post('/api/save-progress', async (req, res) => {
  const { employeeId, employeeName, courseId, currentTime, totalDuration } = req.body;

  try {
    let progress = await Progress.findOne({ employeeId, courseId });

    if (!progress) {
      progress = new Progress({
        employeeId,
        employeeName,
        courseId,
        lastWatchedTime: currentTime,
        isCompleted: false
      });
    } else {
      progress.employeeName = employeeName; // อัปเดตชื่อล่าสุด
      
      // บันทึกเฉพาะเมื่อดูไกลกว่าเดิม (หรือจะบันทึกตลอดก็ได้ แล้วแต่ชอบ)
      // แนะนำให้บันทึกตลอดเพื่อให้ resume ได้แม่นยำที่สุด
      progress.lastWatchedTime = currentTime; 
    }

    if (totalDuration && currentTime >= (totalDuration * 0.95)) {
      progress.isCompleted = true;
    }

    progress.lastUpdated = new Date();
    await progress.save();

    res.json({ success: true, message: 'Saved' });

  } catch (error) {
    console.error("Save Error:", error);
    res.status(500).json({ success: false });
  }
});

// --- 4. API ดึงข้อมูล (Get) - แก้ไขแล้ว ---
app.get('/api/get-progress', async (req, res) => {
    try {
        const { employeeId, courseId } = req.query;

        // ✅ แก้ไข 1: ใช้ 'Progress' (ตัวแปรที่ประกาศไว้ข้างบน)
        const progress = await Progress.findOne({ 
            employeeId: employeeId, 
            courseId: courseId 
        }).sort({ lastUpdated: -1 }); // ✅ แก้ไข 2: ใช้ 'lastUpdated' ตาม Schema

        if (progress) {
            // ✅ แก้ไข 3: ส่งค่า lastWatchedTime กลับไปในชื่อ currentTime (เพื่อให้หน้าบ้านเข้าใจ)
            res.json({ 
                currentTime: progress.lastWatchedTime || 0, 
                totalDuration: 0 // (ใน DB ไม่ได้เก็บ duration ไว้ ส่ง 0 ไปก่อน หน้าบ้านจะรูจากวิดีโอเอง)
            });
        } else {
            // ถ้าไม่เคยเรียน ส่ง 0
            res.json({ currentTime: 0, totalDuration: 0 });
        }
    } catch (err) {
        console.error("Get Error:", err);
        res.status(500).json({ error: 'ดึงข้อมูลไม่สำเร็จ' });
    }
});

// --- 5. Start Server ---
app.listen(3001, () => {
  console.log('Server running on port 3001');
});