const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 1. เชื่อมต่อ Database
const MONGO_URI = 'mongodb+srv://haekwang:Hae347795@cluster0.rk7rvot.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// 2. สร้าง Model (Schema)
const progressSchema = new mongoose.Schema({
  employeeId: String,
  employeeName: String,
  courseId: String,
  lastWatchedTime: Number,
  isCompleted: Boolean,
  lastUpdated: { type: Date, default: Date.now }
});

// ประกาศตัวแปรชื่อ Progress
const Progress = mongoose.model('Progress', progressSchema);

// 3. API Save
app.post('/api/save-progress', async (req, res) => {
  const { employeeId, employeeName, courseId, currentTime, totalDuration } = req.body;
  try {
    // ใช้ตัวแปร Progress (ถูกต้อง)
    let progress = await Progress.findOne({ employeeId, courseId });

    if (!progress) {
      progress = new Progress({
        employeeId, employeeName, courseId,
        lastWatchedTime: currentTime,
        isCompleted: false
      });
    } else {
      progress.employeeName = employeeName;
      progress.lastWatchedTime = currentTime;
    }

    if (totalDuration && currentTime >= (totalDuration * 0.95)) {
      progress.isCompleted = true;
    }

    progress.lastUpdated = new Date();
    await progress.save();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

// 4. API Get (ตัวปัญหาที่แก้แล้ว)
app.get('/api/get-progress', async (req, res) => {
    try {
        const { employeeId, courseId } = req.query;

        // ✅ แก้แล้ว: เปลี่ยนจาก TrainingProgress เป็น Progress ให้ตรงกับข้างบน
        const progress = await Progress.findOne({ 
            employeeId: employeeId, 
            courseId: courseId 
        }).sort({ lastUpdated: -1 });

        if (progress) {
            res.json({ 
                currentTime: progress.lastWatchedTime || 0, 
                totalDuration: 0 
            });
        } else {
            res.json({ currentTime: 0, totalDuration: 0 });
        }
    } catch (err) {
        console.error("Get Error:", err);
        res.status(500).json({ error: 'Error' });
    }
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});