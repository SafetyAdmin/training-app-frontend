// update 
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

// 1. สร้าง Model พนักงาน
const employeeSchema = new mongoose.Schema({
  employeeId: String,
  name: String
});
const Employee = mongoose.model('Employee', employeeSchema);

// 2. API ล็อกอิน (ตรวจสอบว่ามีชื่อในระบบไหม)
app.post('/api/login', async (req, res) => {
  const { employeeId } = req.body;
  try {
    // ค้นหาในฐานข้อมูล
    const employee = await Employee.findOne({ employeeId: employeeId });
    
    if (employee) {
      // ✅ เจอ! ส่งชื่อกลับไปให้หน้าเว็บ
      res.json({ success: true, name: employee.name, employeeId: employee.employeeId });
    } else {
      // ❌ ไม่เจอ
      res.json({ success: false, message: 'ไม่พบรหัสพนักงานนี้ในระบบ' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. API สำหรับ "ลงทะเบียนพนักงานใหม่" (ใช้ครั้งเดียวเพื่อนำรายชื่อเข้าระบบ)
app.post('/api/register-employee', async (req, res) => {
  const { employeeId, name } = req.body;
  try {
    // เช็คก่อนว่ามีหรือยัง (กันซ้ำ)
    let emp = await Employee.findOne({ employeeId });
    if (!emp) {
      emp = new Employee({ employeeId, name });
      await emp.save();
      res.json({ success: true, message: `เพิ่มคุณ ${name} เรียบร้อย` });
    } else {
      res.json({ success: false, message: 'รหัสนี้มีอยู่แล้ว' });
    }
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// 4. API พิเศษ: เพิ่มพนักงานทีละเยอะๆ (Seed Data) - เอาไว้รันครั้งแรก
app.get('/api/setup-employees', async (req, res) => {
    // ⚠️ แก้รายชื่อพนักงานโรงงานของคุณตรงนี้ครับ ⚠️
    const factoryEmployees = [
        { employeeId: 'EMP001', name: 'สมชาย ใจดี' },
        { employeeId: 'EMP002', name: 'สมหญิง รักงาน' },
        { employeeId: 'AM2503002', name: 'สุรเชษฐ์ เสือหลง' },
        // ... ก๊อปปี้บรรทัดบนเพิ่มได้เรื่อยๆ ตามจำนวนพนักงานจริง ...
    ];

    try {
        for (const data of factoryEmployees) {
            // อัปเดตถ้ามีอยู่แล้ว / สร้างใหม่ถ้ายังไม่มี (Upsert)
            await Employee.findOneAndUpdate({ employeeId: data.employeeId }, data, { upsert: true });
        }
        res.send(`✅ นำเข้ารายชื่อพนักงาน ${factoryEmployees.length} คน เรียบร้อยแล้ว!`);
    } catch (err) {
        res.send('❌ เกิดข้อผิดพลาด: ' + err.message);
    }
});

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