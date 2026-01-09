// --- server.js (ฉบับสมบูรณ์: Admin + Course Management) ---
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// 1. เชื่อมต่อ Database
// (ใช้ URI เดิมของคุณ)
const MONGO_URI = 'mongodb+srv://haekwang:Hae347795@cluster0.rk7rvot.mongodb.net/?appName=Cluster0';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// --- 2. สร้าง Models (Schema) ---

// Model 1: ประวัติการเรียน (Progress)
const progressSchema = new mongoose.Schema({
  employeeId: String,
  employeeName: String,
  courseId: String,
  lastWatchedTime: Number,
  isCompleted: Boolean,
  lastUpdated: { type: Date, default: Date.now }
});
const Progress = mongoose.model('Progress', progressSchema);

// Model 2: ข้อมูลพนักงาน (Employee)
const employeeSchema = new mongoose.Schema({
  employeeId: String,
  name: String
});
const Employee = mongoose.model('Employee', employeeSchema);

// Model 3: คอร์สเรียน (Course) - ใหม่!
const courseSchema = new mongoose.Schema({
  id: { type: String, unique: true }, // เช่น SF001
  title: String,    // ชื่อวิชา
  category: String, // หมวดหมู่
  icon: String,     // ไอคอน
  url: String,      // ลิงก์ YouTube
  duration: String  // ความยาว (Text)
});
const Course = mongoose.model('Course', courseSchema);

// --- 3. API ฝั่งนักเรียน (Student) ---

// Login
app.post('/api/login', async (req, res) => {
  const { employeeId } = req.body;
  try {
    const emp = await Employee.findOne({ employeeId });
    if (emp) res.json({ success: true, name: emp.name, employeeId: emp.employeeId });
    else res.json({ success: false, message: 'ไม่พบรหัสพนักงาน' });
  } catch (err) { res.status(500).json({ success: false }); }
});

// ดึงรายชื่อคอร์สทั้งหมด (ใหม่!)
app.get('/api/courses', async (req, res) => {
  try {
    // เรียงตามหมวดหมู่ก่อน แล้วค่อยเรียงตามรหัส
    const courses = await Course.find().sort({ category: 1, id: 1 });
    res.json({ success: true, data: courses });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// บันทึกเวลาเรียน
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
    
    // Logic ผ่านเกณฑ์ (ดูเกิน 90% หรือเหลือไม่ถึง 5 วิ)
    if (totalDuration > 0) {
        if (currentTime >= (totalDuration * 0.90) || Math.abs(currentTime - totalDuration) < 5) {
            progress.isCompleted = true;
        }
    }
    
    progress.lastUpdated = new Date();
    await progress.save();
    res.json({ success: true });
  } catch (error) { res.status(500).json({ success: false }); }
});

// ดึงเวลาเรียนเดิม (Resume)
app.get('/api/get-progress', async (req, res) => {
    try {
        const { employeeId, courseId } = req.query;
        const progress = await Progress.findOne({ employeeId, courseId }).sort({ lastUpdated: -1 });
        res.json({ currentTime: progress ? progress.lastWatchedTime : 0 });
    } catch (err) { res.status(500).json({ error: 'Error' }); }
});

// My Learning (ประวัติรายบุคคล)
app.get('/api/my-learning/:employeeId', async (req, res) => {
    try {
        const { employeeId } = req.params;
        const history = await Progress.find({ employeeId });
        res.json({ success: true, data: history });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// --- 4. API ฝั่งผู้ดูแลระบบ (Admin) ---

// Report รวม
app.get('/api/admin/report', async (req, res) => {
  try {
    const employees = await Employee.find();
    const progressList = await Progress.find();
    
    const report = employees.map(emp => {
      const myProgress = progressList.filter(p => p.employeeId === emp.employeeId);
      const progressMap = {};
      
      myProgress.forEach(p => {
        // 🔥 แก้ตรงนี้: เพิ่ม lastUpdated ส่งไปด้วย
        progressMap[p.courseId] = { 
            isCompleted: p.isCompleted, 
            lastWatched: p.lastWatchedTime,
            lastUpdated: p.lastUpdated // ✅ เพิ่มบรรทัดนี้
        };
      });
      
      let lastSeen = '-';
      if (myProgress.length > 0) {
        const maxDate = new Date(Math.max(...myProgress.map(p => new Date(p.lastUpdated))));
        lastSeen = maxDate.toLocaleString('th-TH');
      }
      
      return { id: emp.employeeId, name: emp.name, progress: progressMap, lastSeen: lastSeen };
    });
    
    res.json({ success: true, data: report });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// Reset รายบุคคล
app.post('/api/admin/reset-progress', async (req, res) => {
  const { employeeId } = req.body;
  try {
    await Progress.deleteMany({ employeeId });
    res.json({ success: true, message: 'รีเซ็ตข้อมูลเรียบร้อย' });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// Reset ทั้งหมด (ล้างบาง)
app.delete('/api/reset-all-progress', async (req, res) => {
    try {
        await Progress.deleteMany({}); 
        res.json({ success: true, message: "Reset all progress successful" });
    } catch (error) { res.status(500).json({ success: false, error: "Failed to reset progress" }); }
});

// --- 5. API จัดการพนักงาน (Admin Manage Employees) ---

// เพิ่มพนักงานใหม่
app.post('/api/admin/add-employee', async (req, res) => {
  const { employeeId, name } = req.body;
  try {
    const existing = await Employee.findOne({ employeeId });
    if (existing) return res.status(400).json({ success: false, message: 'รหัสพนักงานนี้มีอยู่แล้ว' });

    const newEmp = new Employee({ employeeId, name });
    await newEmp.save();
    res.json({ success: true, message: 'เพิ่มพนักงานเรียบร้อย' });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ลบพนักงาน (รับ ID ผ่าน URL)
app.delete('/api/admin/delete-employee/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const result = await Employee.deleteOne({ employeeId });
    await Progress.deleteMany({ employeeId }); // ลบประวัติด้วย
    
    if (result.deletedCount === 0) return res.status(404).json({ success: false, message: "ไม่พบรหัสพนักงาน" });
    
    res.json({ success: true, message: 'ลบข้อมูลเรียบร้อย' });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// --- 6. API จัดการคอร์สเรียน (Admin Manage Courses) ---

// เพิ่มคอร์ส
app.post('/api/admin/add-course', async (req, res) => {
  try {
    const { id, title, category, icon, url, duration } = req.body;
    const existing = await Course.findOne({ id });
    if (existing) return res.status(400).json({ success: false, message: 'รหัสวิชาซ้ำ' });

    await new Course({ id, title, category, icon, url, duration }).save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ลบคอร์ส
app.delete('/api/admin/delete-course/:id', async (req, res) => {
  try {
    await Course.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// --- 7. Setup & Utilities ---

// Setup คอร์สเริ่มต้น (รันครั้งแรกเพื่อย้ายข้อมูลลง DB)
app.get('/api/setup-courses', async (req, res) => {
    const initialCourses = [
        { id: "SF001", category: "🔥 หมวดความปลอดภัย (Safety)", icon: "🔥", title: "หัวข้อวิชาที่ 1 ความรู้เกี่ยวกับความปลอดภัยในการทำงาน", url: "https://youtu.be/jH4ZRU7Q4VA", duration: "1 ชม. 25 น." },
        { id: "SF002", category: "🔥 หมวดความปลอดภัย (Safety)", icon: "🔥", title: "หัวข้อวิชาที่ 2 กฎหมายความปลอดภัย อาชีวอนามัย", url: "https://youtu.be/czC6QY27rto", duration: "1 ชม. 43 น." },
        { id: "SF003", category: "🔥 หมวดความปลอดภัย (Safety)", icon: "🔥", title: "หัวข้อวิชาที่ 3 ข้อบังคับว่าด้วยความปลอดภัย", url: "https://youtu.be/YF9Bef5Oq0Q", duration: "2 ชม. 34 น." },
        { id: "S501", category: "🗑️ 5ส เพื่อเพิ่มผลผลิต", icon: "🧹", title: "5ส เพื่อเพิ่มผลผลิต สำหรับอุตสาหกรรม ตอนที่ 1", url: "https://www.youtube.com/watch?v=6lAoHEIRXLg", duration: "1 ชม. 48 น." }
    ];
    try {
        // ลงเฉพาะอันที่ยังไม่มี
        for (const c of initialCourses) {
            const exist = await Course.findOne({ id: c.id });
            if (!exist) await new Course(c).save();
        }
        res.send('Setup Courses Completed');
    } catch (e) { res.status(500).send(e.message); }
});

// Setup รายชื่อพนักงาน (ถ้าต้องการเพิ่มทีละเยอะๆ)
app.get('/api/setup-employees', async (req, res) => {
    // ใส่ Array รายชื่อพนักงานยาวๆ ของคุณที่นี่ถ้าต้องการ Reset ใหม่
    // แต่แนะนำให้ใช้หน้า Admin เพิ่มเอาจะดีกว่าครับ
    res.send('Employee Setup Endpoint (Inactive)');
});

// Start Server
const PORT = process.env.PORT || 3001; 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});