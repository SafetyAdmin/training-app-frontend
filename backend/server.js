const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); // <--- บรรทัดนี้ต้องอยู่บนสุดๆ
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- 1. ส่วนเชื่อมต่อ Database ---
// ⚠️ อย่าลืมเอาลิ้งก์ที่คุณก๊อปปี้มาเมื่อกี้ มาวางทับตรงข้อความนี้นะครับ
// และอย่าลืมแก้ <password> เป็นรหัสผ่านของคุณด้วย
const MONGO_URI = 'mongodb+srv://haekwang:Hae347795@cluster0.rk7rvot.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected: เชื่อมต่อฐานข้อมูลสำเร็จ'))
  .catch(err => console.error('❌ MongoDB Error: เชื่อมต่อไม่ได้', err));

// --- 2. สร้าง Model (Schema) ---
const progressSchema = new mongoose.Schema({
  employeeId: String,
  employeeName: String, // [แก้ตรงนี้ 1] เพิ่มบรรทัดนี้
  courseId: String,
  lastWatchedTime: Number,
  isCompleted: Boolean,
  lastUpdated: { type: Date, default: Date.now }
});

const Progress = mongoose.model('Progress', progressSchema);

// --- 3. แก้ไข API save-progress: ให้รับค่า employeeName ด้วย ---
app.post('/api/save-progress', async (req, res) => {
  // [แก้ตรงนี้ 2] รับ employeeName เพิ่มเข้ามา
  const { employeeId, employeeName, courseId, currentTime, totalDuration } = req.body;

  try {
    let progress = await Progress.findOne({ employeeId, courseId });

    if (!progress) {
      progress = new Progress({
        employeeId,
        employeeName, // บันทึกชื่อลงไปตอนสร้างใหม่
        courseId,
        lastWatchedTime: currentTime,
        isCompleted: false
      });
    } else {
      // อัปเดตชื่อด้วย (เผื่อพนักงานเปลี่ยนชื่อ)
      progress.employeeName = employeeName; 
      
      if (currentTime > progress.lastWatchedTime) {
         progress.lastWatchedTime = currentTime;
      }
    }

    if (totalDuration && currentTime >= (totalDuration * 0.95)) {
      progress.isCompleted = true;
    }

    progress.lastUpdated = new Date();
    await progress.save();

    res.json({ success: true, message: 'Saved' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

// API: ดึงรายงาน (HR Dashboard)
app.get('/api/get-progress', async (req, res) => {
    try {
        const { employeeId, courseId } = req.query;

        // ค้นหาข้อมูลล่าสุดของคนนี้ ในคอร์สนี้
        const progress = await TrainingProgress.findOne({ 
            employeeId: employeeId, 
            courseId: courseId 
        }).sort({ timestamp: -1 }); // เอาอันล่าสุด

        if (progress) {
            // ถ้าเจอ ส่งเวลากลับไป
            res.json({ 
                currentTime: progress.currentTime, 
                totalDuration: progress.totalDuration 
            });
        } else {
            // ถ้าไม่เจอ (เพิ่งเรียนครั้งแรก) ให้ส่ง 0
            res.json({ currentTime: 0, totalDuration: 0 });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'ดึงข้อมูลไม่สำเร็จ' });
    }
});

// --- 4. Start Server ---
app.listen(3001, () => {
  console.log('Server running on port 3001');
});