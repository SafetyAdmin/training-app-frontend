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
const Progress = mongoose.model('Progress', progressSchema);

const employeeSchema = new mongoose.Schema({
  employeeId: String,
  name: String
});
const Employee = mongoose.model('Employee', employeeSchema);

// 3. API ต่างๆ
// 3.1 บันทึกเวลาเรียน
app.post('/api/save-progress', async (req, res) => {
  const { employeeId, employeeName, courseId, currentTime, totalDuration } = req.body;
  try {
    let progress = await Progress.findOne({ employeeId, courseId });
    if (!progress) {
      progress = new Progress({ employeeId, employeeName, courseId, lastWatchedTime: currentTime, isCompleted: false });
    } else {
      progress.employeeName = employeeName;
      progress.lastWatchedTime = currentTime;
    }
    if (totalDuration && currentTime >= (totalDuration * 0.95)) progress.isCompleted = true;
    progress.lastUpdated = new Date();
    await progress.save();
    res.json({ success: true });
  } catch (error) { res.status(500).json({ success: false }); }
});

// 3.2 ดึงเวลาเรียนเดิม
app.get('/api/get-progress', async (req, res) => {
    try {
        const { employeeId, courseId } = req.query;
        const progress = await Progress.findOne({ employeeId, courseId }).sort({ lastUpdated: -1 });
        res.json({ currentTime: progress ? progress.lastWatchedTime : 0 });
    } catch (err) { res.status(500).json({ error: 'Error' }); }
});

// 3.3 ล็อกอินพนักงาน
app.post('/api/login', async (req, res) => {
  const { employeeId } = req.body;
  try {
    const emp = await Employee.findOne({ employeeId });
    if (emp) res.json({ success: true, name: emp.name, employeeId: emp.employeeId });
    else res.json({ success: false, message: 'ไม่พบรหัสพนักงาน' });
  } catch (err) { res.status(500).json({ success: false }); }
});

// 3.4 ✅ ลงทะเบียนรายชื่อพนักงาน (Setup) - ตัวที่หายไป
app.get('/api/setup-employees', async (req, res) => {
    const employees = [
        { employeeId: 'EMP001', name: 'สมชาย ใจดี' },
        { employeeId: 'AM2503002', name: 'สุรเชษฐ์ เสือหลง' }
        // เพิ่มรายชื่อตรงนี้ได้เรื่อยๆ
    ];
    try {
        for (const data of employees) {
            await Employee.findOneAndUpdate({ employeeId: data.employeeId }, data, { upsert: true });
        }
        res.send('✅ นำเข้ารายชื่อพนักงานเรียบร้อยแล้ว! (Updated V.2)');
    } catch (err) { res.send('❌ Error: ' + err.message); }
});

// 4. Start Server
const PORT = process.env.PORT || 3001; // ใช้ PORT ของ Render ถ้ามี
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});