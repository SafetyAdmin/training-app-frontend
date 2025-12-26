const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: '*', // อนุญาตให้ใครก็ได้เข้ามา... (แก้ปัญหา CORS 100%)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// --- 1. เชื่อมต่อ Database ---
const MONGO_URI = 'mongodb+srv://haekwang:Hae347795@cluster0.rk7rvot.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

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

const employeeSchema = new mongoose.Schema({
  employeeId: String,
  name: String
});
const Employee = mongoose.model('Employee', employeeSchema);

// --- 3. API ต่างๆ ---

// 3.1 บันทึกเวลาเรียน (แก้ให้ผ่านง่ายขึ้น)
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
      progress.employeeName = employeeName;
      progress.lastWatchedTime = currentTime;
    }

    // ✅ ปรับแก้: ถ้าดูเกิน 90% ให้ถือว่าผ่าน (เผื่อเน็ตกระตุกเวลาหาย)
    if (totalDuration > 0 && currentTime >= (totalDuration * 0.90)) {
       progress.isCompleted = true;
    }
    // ✅ เพิ่ม: ถ้าจบวิดีโอ (เวลาดู กับ เวลารวม ต่างกันไม่เกิน 5 วิ) ให้ผ่านเลย
    if (totalDuration > 0 && Math.abs(currentTime - totalDuration) < 5) {
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

// 3.2 ดึงเวลาเรียนเดิม
app.get('/api/get-progress', async (req, res) => {
    try {
        const { employeeId, courseId } = req.query;
        // ดึงอันที่อัปเดตล่าสุด
        const progress = await Progress.findOne({ employeeId, courseId }).sort({ lastUpdated: -1 });
        res.json({ currentTime: progress ? progress.lastWatchedTime : 0 });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ error: 'Error' }); 
    }
});

// 3.3 ล็อกอินพนักงาน
app.post('/api/login', async (req, res) => {
  const { employeeId } = req.body;
  try {
    const emp = await Employee.findOne({ employeeId });
    if (emp) res.json({ success: true, name: emp.name, employeeId: emp.employeeId });
    else res.json({ success: false, message: 'ไม่พบรหัสพนักงาน' });
  } catch (err) { 
    console.error(err);
    res.status(500).json({ success: false }); 
  }
});

// 3.4 ลงทะเบียนรายชื่อพนักงาน (Setup) - รายชื่อครบทุกคน
app.get('/api/setup-employees', async (req, res) => {
    const employees = [
        { "employeeId": "AM0511001", "name": "นางสาวพวงเพชร  พยนต์" },
        { "employeeId": "AM0908001", "name": "นางประกอบ  ลีพิลา" },
        { "employeeId": "AM1005001", "name": "นายสมพร  แสนขุนทด" },
        { "employeeId": "AM1211001", "name": "นางสาวอุไลพร  บุญยิ่ง" },
        { "employeeId": "AM1407002", "name": "นางสุพัตร  แซ่ใจ" },
        { "employeeId": "AM1409001", "name": "นายวินิทร  พูนหลำ" },
        { "employeeId": "AM1504001", "name": "นางสาวสิทธิพร  หมวดคงทอง" },
        { "employeeId": "AM1505002", "name": "นายธานินทร์  มณาศักดิ์" },
        { "employeeId": "AM1506001", "name": "นางสาววรรณา  ทาคำห่อ" },
        { "employeeId": "AM1507001", "name": "นายประสงค์  สิงห์ลอ" },
        { "employeeId": "AM1906001", "name": "นางสาวพัชราภรณ์  ภาชนะพูล" },
        { "employeeId": "AM2503001", "name": "นายวิทยา  สุทธิรักษ์" },
        { "employeeId": "AM2503002", "name": "นายสุรเชษฐ์  เสือหลง" },
        { "employeeId": "AM2503003", "name": "นางสาวมุกดา  พงษาดำ" },
        { "employeeId": "AS0902001", "name": "นางสาวขวัญพนม  พรมสิทธิ์" },
        { "employeeId": "AS1001001", "name": "นายอธิราช  จงประจันต์" },
        { "employeeId": "AS1004002", "name": "นางถวิน  บุราณสาร" },
        { "employeeId": "AS1101003", "name": "นางสาวสำเนียง  อ่อนน้อม" },
        { "employeeId": "AS1201006", "name": "นายสงกราณ  สีสอน" },
        { "employeeId": "AS1204005", "name": "นางสาวไสว  เชื้อสอน" },
        { "employeeId": "AS1304002", "name": "นายลูกหว้า  จันนาค" },
        { "employeeId": "AS1304005", "name": "นางสาววนิดา  ชัยวงษา" },
        { "employeeId": "AS1306005", "name": "นายนาวิน  อ่อนสุระทุม" },
        { "employeeId": "AS1403006", "name": "นายบรรหาญ  พรมมาลย์" },
        { "employeeId": "AS1404007", "name": "นางสาวพรวิภา  ทาอุสาห์" },
        { "employeeId": "AS1407003", "name": "นางสาวติ๋ว  ขาวสั้น" },
        { "employeeId": "AS1409006", "name": "นางสาววิพาพร  โคตรชมภู" },
        { "employeeId": "AS1502001", "name": "นายธวัชชัย  เลิศนา" },
        { "employeeId": "AS1502002", "name": "นางสาวนันทิชา  พิมทราย" },
        { "employeeId": "AS1506004", "name": "นางสาวทัศนีย์  พระสว่าง" },
        { "employeeId": "AS1507001", "name": "นายสมชาย  ชูชาติ" },
        { "employeeId": "AS1601004", "name": "นางสาวสุรัตน์  อินกอง" },
        { "employeeId": "AS1602007", "name": "นายวิชาติ  เวียงเงิน" },
        { "employeeId": "AS1603004", "name": "นางสาวสุมิตรา  แก้วม่วง" },
        { "employeeId": "AS1605005", "name": "นางสาวศิราภรณ์  นามรักษ์" },
        { "employeeId": "AS1607005", "name": "นางสาวสุวรรณ  โรคกระโทก" },
        { "employeeId": "AS1608011", "name": "นางสาวลำไพ  ตาทิพย์" },
        { "employeeId": "AS1608019", "name": "นายสง่า  แคนคันรัมย์" },
        { "employeeId": "AS1610002", "name": "นางสาวสุพรรณี  หลงสีดา" },
        { "employeeId": "AS1703003", "name": "นายบุรินทร์  หินนอก" },
        { "employeeId": "AS1703007", "name": "นางสาวจินตนา  ไยรีอ่าง" },
        { "employeeId": "AS1705008", "name": "นางสาวพัชรินทร์  สุขต้น" },
        { "employeeId": "AS1706001", "name": "นางกชกร  คำภีระ" },
        { "employeeId": "AS1708007", "name": "นายบรรจง  สัญญสิทธิ์" },
        { "employeeId": "AS1801008", "name": "นางสาวกาญจนา  ภาคพรม" },
        { "employeeId": "AS1802004", "name": "นางนันท์นภัส  สีดอกบวบ" },
        { "employeeId": "AS1808005", "name": "นายแสนพล  แจ่มโนนคูณ" },
        { "employeeId": "AS1810001", "name": "นางสาวสุนิสา  จะหา" },
        { "employeeId": "AS1810008", "name": "นายรุ่งโรจน์  เหล่าบัวบาน" },
        { "employeeId": "AS1905007", "name": "นายปรีชา  แก้วปิก" },
        { "employeeId": "AS2001001", "name": "นายชัยศิริ  เสริมศรี" },
        { "employeeId": "AS2001011", "name": "นายชานน  จะหา" },
        { "employeeId": "AS2001013", "name": "นางสาวมุตา  แสนเสนา" },
        { "employeeId": "AS2001016", "name": "นางสาวสร้อยสุดา  ทิรอดรัมย์" },
        { "employeeId": "AS2002001", "name": "นายชานนท์  เครือวัลย์" },
        { "employeeId": "AS2010002", "name": "นางสาวสุพพัตรา  ประทีป" },
        { "employeeId": "AS2010003", "name": "นางสาวผกาวรรณ  สีทอง" },
        { "employeeId": "AS2010004", "name": "นางสาวศศิธร  ธูปหล้า" },
        { "employeeId": "AS2011004", "name": "นายวิทูร  ทองกุล" },
        { "employeeId": "AS2011009", "name": "นางสาวรดาวรรณ  พรมศรีจันทร์" },
        { "employeeId": "AS2101004", "name": "นางสาวศรีสุดา  จะหา" },
        { "employeeId": "AS2101008", "name": "นางสาวลำไย  แก้วแสง" },
        { "employeeId": "AS2101032", "name": "นายสมควร  พิลาวงค์" },
        { "employeeId": "AS2101037", "name": "นางสาวไพรลิน  แสนสีแก้ว" },
        { "employeeId": "AS2101046", "name": "นางสาวอรสา  กุลาศรี" },
        { "employeeId": "AS2102005", "name": "นางสาวภิญญดา  ทุดบุญ" },
        { "employeeId": "AS2102013", "name": "นางสาวสุมิตรา  วรรณประเสริฐ" },
        { "employeeId": "AS2102015", "name": "นางสาวฐิติกานต์  แรมสุข" },
        { "employeeId": "AS2102037", "name": "นางสาวสายนภา  มาน้ำเที่ยง" },
        { "employeeId": "AS2102038", "name": "นายธราพงษ์  ผิวเหลือง" },
        { "employeeId": "AS2103013", "name": "นางสาวนิภาพร  สีภักดี" },
        { "employeeId": "AS2103014", "name": "นางสาวกนกกร  จันทรหนองหว้า" },
        { "employeeId": "AS2103022", "name": "นางสาวสมัย  อินตะพันธ์" },
        { "employeeId": "AS2103028", "name": "นางเอื้อมพร  กลิ่นสระน้อย" },
        { "employeeId": "AS2103031", "name": "นายอภิสิทธิ์  ราชสม" },
        { "employeeId": "AS2104002", "name": "นางนภาพร  ไชยคีนี" },
        { "employeeId": "AS2104003", "name": "นางสาวพเยาว์  ต๊ะประจำ" },
        { "employeeId": "AS2107001", "name": "นางสมจิต  หมอนทอง" },
        { "employeeId": "AS2107005", "name": "นางสาวเกสรา  การะเกษ" },
        { "employeeId": "AS2107014", "name": "นายจักรกฤษณ์  หมู่อำพันธ์" },
        { "employeeId": "AS2204002", "name": "นายนครินทร์  ศิริสานต์" },
        { "employeeId": "AS2204003", "name": "นายเกียรติศักดิ์  วัฒนา" },
        { "employeeId": "AS2204004", "name": "นายอำนาจ  องค์รัมย์" },
        { "employeeId": "AS2205001", "name": "นายองอาจ  พลดงนอก" },
        { "employeeId": "AS2205007", "name": "นางสาววิไลวรรณ  มีทอง" },
        { "employeeId": "AS2205008", "name": "นางพิศนภา  ยิ่งกำแหง" },
        { "employeeId": "AS2205009", "name": "นางสาวสุนิศา  สอนตะคุ" },
        { "employeeId": "AS2205010", "name": "นางสาวสายรุ้ง  จันทะกูล" },
        { "employeeId": "AS2205014", "name": "นางสาวพรพรรณ  ใจยงค์" },
        { "employeeId": "AS2205015", "name": "นางสาวสายชล  อภิรักษ์" },
        { "employeeId": "AS2205017", "name": "นางทองเพชร  สวรรค์พรม" },
        { "employeeId": "AS2205018", "name": "นางสาวบุษราภรณ์  บัวระวงค์" },
        { "employeeId": "AS2205021", "name": "นางสาวนันทิชา  แต้มทอง" },
        { "employeeId": "AS2205022", "name": "นางสาวนิตยา  พิมทราย" },
        { "employeeId": "AS2205023", "name": "นางสาววิไลวรรณ  วรรณทวี" },
        { "employeeId": "AS2205027", "name": "นางบังอร  ก้อนบัว" },
        { "employeeId": "AS2206004", "name": "นางสาวพรสุดา  แก้วเคน" },
        { "employeeId": "AS2206008", "name": "นางสาวกรรณิกา  ไชยบอน" },
        { "employeeId": "AS2206009", "name": "นางสาวซูบัยดะห์  ซาแล" },
        { "employeeId": "AS2206011", "name": "นางสาวอังคณา  บุญพรหม" },
        { "employeeId": "AS2208001", "name": "นายวีระพงษ์  พงษ์สวัสดิ์" },
        { "employeeId": "AS2303001", "name": "นางสาวยุภา   กะภูพันธ์" },
        { "employeeId": "AS2303002", "name": "นางสาววิรญา   สาลี" },
        { "employeeId": "AS2303004", "name": "นางสาววิไล   นารี" },
        { "employeeId": "AS2303006", "name": "นางสาวชรินรัตน์   คำเขียว" },
        { "employeeId": "AS2303008", "name": "นางสาวศิริพร   แออู" },
        { "employeeId": "AS2309001", "name": "นายทองปาน  สุมรัมย์" },
        { "employeeId": "AS2309003", "name": "นางสาวบังอร  สุดศรี" },
        { "employeeId": "AS2309004", "name": "นางสาววิจิตรา  ครุฑคีรี" },
        { "employeeId": "AS2309006", "name": "นางดวงตา  นามกันยา" },
        { "employeeId": "AS2309007", "name": "นายนิคม  ครองบุ่งคล้า" },
        { "employeeId": "AS2309008", "name": "นายอนันต์  บุญภิรมย์" },
        { "employeeId": "AS2402002", "name": "นายศรายุทธ  ขิงเขียว" },
        { "employeeId": "AS2402004", "name": "นายเกรียงไกร  ถนอมสงัด" },
        { "employeeId": "AS2404001", "name": "นายคมสันต์  เดชพร" },
        { "employeeId": "AS2404002", "name": "นายศรนรินทร์  หงษ์อุดร" },
        { "employeeId": "AS2405001", "name": "นางสาวสุภัสสร  ศรีสวัสดิ์" },
        { "employeeId": "AS2405002", "name": "นางสาววิชุดา  สิมมาคำ" },
        { "employeeId": "AS2407003", "name": "นางสาวน้ำทิพย์  สุขเลิศสิน" },
        { "employeeId": "AS2407004", "name": "นางสาวแพรวพราว  ยมมะนา" },
        { "employeeId": "AS2407005", "name": "นางสาวศรีทุม  ลือเมือง" },
        { "employeeId": "AS2407006", "name": "นายกฤษณะ  พีระ" },
        { "employeeId": "AS2501001", "name": "นายวราวุฒิ  สุวรรณสนธิ์" },
        { "employeeId": "AS2502001", "name": "นายชนิสร  โสภาจันทร์" },
        { "employeeId": "AS2502002", "name": "นายจิรายุทธ  โภคานันท์" },
        { "employeeId": "AS2502003", "name": "นายทนงศักดิ์  พรหมรักษา" },
        { "employeeId": "AS2502004", "name": "นายธนกฤต  ระแหง" },
        { "employeeId": "AS2502006", "name": "นายณัฐติพงศ์  เสย์" },
        { "employeeId": "AS2506001", "name": "นางสาวนัดฐนิชา  สืบประดิษฐ" },
        { "employeeId": "AS2506003", "name": "นางสาวอรุณี  กะการดี" },
        { "employeeId": "AS2506004", "name": "นายพัชร  ทองใบ" },
        { "employeeId": "AS2506005", "name": "นายชัยวัฒน์  แก้วยงกฎ" },
        { "employeeId": "AS2506006", "name": "นายธนานันท์  บุญเลิศ" },
        { "employeeId": "AS2506007", "name": "นายสุทธิวุฒิ  อุดร" },
        { "employeeId": "AS2506008", "name": "นายสุพัฒน์  อาจหาญ" },
        { "employeeId": "AS2506009", "name": "นายอังคฤทธิ์  ลอยสงวน" },
        { "employeeId": "AS2506010", "name": "นายจุลพันธ์  สืบประดิษฐ์" },
        { "employeeId": "AS2506012", "name": "นายพลเฉลิม  แปงบุญเรือง" },
        { "employeeId": "AS2506013", "name": "นายกิติศักดิ์  ขัดศิริ" },
        { "employeeId": "AS2508001", "name": "นางสาวจรรยพร  สายสุนีย์" },
        { "employeeId": "AS2508002", "name": "นางสาวจันทนา  ไขประภาย" },
        { "employeeId": "AS2508003", "name": "นางสาวจารุวรรณ์  ขาวสวรรณ์" },
        { "employeeId": "AS2508004", "name": "นางสาวชฎาพร  งามหนองอ้อ" },
        { "employeeId": "AS2508005", "name": "นางสาวธนภรณ์  แก้วอาษา" },
        { "employeeId": "AS2508008", "name": "นางสาวนาถยา  โยตะนันท์" },
        { "employeeId": "AS2508009", "name": "นางสาวนิภารักษ์  วงษ์ประจักษ์" },
        { "employeeId": "AS2508010", "name": "นางสาวพัชรภรณ์  ศรีมา" },
        { "employeeId": "AS2508011", "name": "นางสาวไพบูลย์  ทิมาชัย" },
        { "employeeId": "AS2508012", "name": "นางสาวรัตนาภรณ์  มีอุสา" },
        { "employeeId": "AS2508013", "name": "นางสาวลักษณา  เนียมเมืองปัก" },
        { "employeeId": "AS2508015", "name": "นางสาวศศิภา  ดอกปีบ" },
        { "employeeId": "AS2508016", "name": "นางสาวศิริรัตน์  เงางาม" },
        { "employeeId": "AS2508017", "name": "นางสาวสุกัญญา  บึงลอย" },
        { "employeeId": "AS2508019", "name": "นางสาวอักษร  ศรีเมืองปุ่น" },
        { "employeeId": "AS2508020", "name": "นายฉัตรชัย  สิงห์ลอ" },
        { "employeeId": "AS2508021", "name": "นายชัยยงค์  บัวสอน" },
        { "employeeId": "AS2508022", "name": "นายต้น  จู่มา" },
        { "employeeId": "AS2508023", "name": "นายนวมินทร์  อรรคพงษ์" },
        { "employeeId": "AS2508024", "name": "นายวัศพล  สีรับสี" },
        { "employeeId": "AS2508025", "name": "นายวิทธวัช  ขำขุนทด" },
        { "employeeId": "AS2508026", "name": "นายวิศวะ  ถนอมสงัด" },
        { "employeeId": "AS2508027", "name": "นายศรัณย์  เลิศนา" },
        { "employeeId": "AS2508028", "name": "นายศักดิ์กรินทร์  การะเกษ" },
        { "employeeId": "AS2509001", "name": "นางจุฑาลักษณ์  วงค์ละคร" },
        { "employeeId": "AS2509002", "name": "นางสาวปนัดดา  ยารัมย์" },
        { "employeeId": "AS2509003", "name": "นางสาวดวงฤดี  นิ่มประโคน" },
        { "employeeId": "AS2509004", "name": "นายไกรสร  สุขี" },
        { "employeeId": "AS2509005", "name": "นายณัฐพงศ์  เจริญดี" },
        { "employeeId": "AS2509006", "name": "นายอนพัชร  เลขนอก" },
        { "employeeId": "CO0702004", "name": "นายสิงห์คาร  กื้ดหมื่น" },
        { "employeeId": "CO0706001", "name": "นายทรงวุฒิ  กล่างเงิน" },
        { "employeeId": "CO0710006", "name": "นายไพวัลย์  พระศรี" },
        { "employeeId": "CO0710017", "name": "นางสาวยุภาพร  แก้ววังสัน" },
        { "employeeId": "CO0808010", "name": "นางสาวปราณี  ใจหมั่น" },
        { "employeeId": "CO0904012", "name": "นายเอกรินทร์  เอี่ยมพรม" },
        { "employeeId": "CO1003006", "name": "นางบัวริม  มีพันธ์" },
        { "employeeId": "CO1005004", "name": "นายวิไล  สุขสนิท" },
        { "employeeId": "CO1104002", "name": "นางสาวกฤษณา  อนุศรี" },
        { "employeeId": "CO1201001", "name": "นายสมเกียรติ  โทมี" },
        { "employeeId": "CO1201002", "name": "นางเมตตา  โทมี" },
        { "employeeId": "CO1209004", "name": "นางมาลิสา  ขอยวนกลาง" },
        { "employeeId": "CO1308005", "name": "นายศุภเสริฐ  ภักดิ์ใจ" },
        { "employeeId": "CO1408003", "name": "นางสมัย  พลศรี" },
        { "employeeId": "CO1501001", "name": "นายนรินทร์   มาสิน" },
        { "employeeId": "CO1501003", "name": "นายสมคิต  เกษแก้วเกี้ยง" },
        { "employeeId": "CO1502033", "name": "นางสาววราภรณ์  ตองอบ" },
        { "employeeId": "CO1509001", "name": "นายวันชัย  เถรหมื่นไว" },
        { "employeeId": "CO1603005", "name": "นายกฤษฏา  ศักดาวงษ์" },
        { "employeeId": "CO1603016", "name": "นายมนัส  สระกุนดิน" },
        { "employeeId": "CO1604003", "name": "นายศักดิ์สิทธิ์  สาริพันธ์" },
        { "employeeId": "CO1604005", "name": "นางฐานิต  ตุ้มเต็มรัมย์" },
        { "employeeId": "CO1604012", "name": "นางสาวสุทธินันท์  ดวงนิล" },
        { "employeeId": "CO1604032", "name": "นางสาวธัญพร  กื๊ดหมื่น" },
        { "employeeId": "CO1604034", "name": "นางสาววิไลวรรณ  ถิ่นสำอาง" },
        { "employeeId": "CO1605007", "name": "นายสมหมาย  เมืองทอง" },
        { "employeeId": "CO1605030", "name": "นางสาวอาภาพร  ผุยพรม" },
        { "employeeId": "CO1606006", "name": "นายประทีป  พันธ์เขียว" },
        { "employeeId": "CO1607008", "name": "นางสาวภัทร  ปวงสุข" },
        { "employeeId": "CO1607011", "name": "นายนันทวัท  บัวละคร" },
        { "employeeId": "CO1607016", "name": "นางสาวพรรณิกา  ไพเขียว" },
        { "employeeId": "CO1609014", "name": "นางสาวชรัญญา  จิตสมนึก" },
        { "employeeId": "CO1701001", "name": "นางสาวบุญล้อม  แสงเขตร" },
        { "employeeId": "CO1703006", "name": "นายสุพุธ  กระแสโสม" },
        { "employeeId": "CO1706014", "name": "นายทินกร  ลอยประโคน" },
        { "employeeId": "CO1706019", "name": "นางสาวชลดา  หอมดวง" },
        { "employeeId": "CO1707010", "name": "นายอภิวัฒน์  ท้าวพรม" },
        { "employeeId": "CO1801001", "name": "นายศักดิ์สิทธิ์  ฤทธิ์มหา" },
        { "employeeId": "CO1801007", "name": "นายสราวุฒิ  พันไผ่" },
        { "employeeId": "CO1801011", "name": "นายศรัญญู  แก้วบุญเรือง" },
        { "employeeId": "CO1801015", "name": "นางสาวสินจัย  แสงเขตร" },
        { "employeeId": "CO1801016", "name": "นางสาวพิมพ์ใจ  วงค์ปัญญานุรักษ์" },
        { "employeeId": "CO1801025", "name": "นางสาวศิริกันยา  กันณะโสภา" },
        { "employeeId": "CO1801028", "name": "นายจักกฤต  แพทย์นาดี" },
        { "employeeId": "CO1802005", "name": "นายกฤษณะ  ศรีเกียรติ" },
        { "employeeId": "CO1802007", "name": "นางสาวพรทิพย์  คำบุตร" },
        { "employeeId": "CO1803004", "name": "นายสุพิศ  ดาวสิงห์" },
        { "employeeId": "CO1808006", "name": "นายอั้นชรี  โสภณ" },
        { "employeeId": "CO1808008", "name": "นางสาวพลอยมณี  สุ่มมาตย์" },
        { "employeeId": "CO1809012", "name": "นายสมาน  ชูศรีทอง" },
        { "employeeId": "CO1901001", "name": "นางสาวโยธกา  พรวิจิตร" },
        { "employeeId": "CO1901006", "name": "นายจันทรวงศ์  จันทร์จริง" },
        { "employeeId": "CO1904011", "name": "นางสาวศุภรัตน์  แก้วนารี" },
        { "employeeId": "CO1904013", "name": "นายธีระวุฒิ  ชาจุหลัน" },
        { "employeeId": "CO1904014", "name": "นายอนุชา  อิสสระ" },
        { "employeeId": "CO1904016", "name": "นายมงคล  บุญเอก" },
        { "employeeId": "CO1907001", "name": "นางสาวกัลยรัตน์  โทมี" },
        { "employeeId": "CO1911003", "name": "นายประสิทธิ์  วิโรพรม" },
        { "employeeId": "CO2001005", "name": "นางสาวสไมพร  ปักนอก" },
        { "employeeId": "CO2007005", "name": "นายสัญญา  พวงศรี" },
        { "employeeId": "CO2008001", "name": "นายศศิธร  สีดาทอง" },
        { "employeeId": "CO2104001", "name": "นางสาวดาวเรือง  ชิณวงษ์" },
        { "employeeId": "CO2104002", "name": "นางสาววิภา  วิวาสุขุ" },
        { "employeeId": "CO2104004", "name": "นางสาววิมล  สมประสงค์" },
        { "employeeId": "CO2205001", "name": "นางสาวสุชาดา  จำปี" },
        { "employeeId": "CO2205005", "name": "นางสาวขวัญสุดา  การัมย์" },
        { "employeeId": "CO2309002", "name": "นางสาวนันทิยา  จับปิดครบุรี" },
        { "employeeId": "CO2309003", "name": "นางสาวสุนิตา  กวนทอง" },
        { "employeeId": "CO2309004", "name": "นางสาวธนพร  กวนทอง" },
        { "employeeId": "CO2309006", "name": "นายจักรินทร์  รัตนสีหา" },
        { "employeeId": "CO2309007", "name": "นายสมศักดิ์  แสบงบาน" },
        { "employeeId": "CO2407001", "name": "นายพีรชาติ  กันหาป้อง" },
        { "employeeId": "CO2506001", "name": "นายณัฐวุฒิ  อยู่ดี" },
        { "employeeId": "DL1210001", "name": "นายไสว  วังหอม" },
        { "employeeId": "DL2404001", "name": "นายจีรายุทธ  หล้าโคตร" },
        { "employeeId": "DL2404002", "name": "นายประนอม  โคตจังหรีด" },
        { "employeeId": "MA0702002", "name": "นางสาววันเพ็ญ  ฉิมสุข" },
        { "employeeId": "MA1307001", "name": "นางสาวเบญจมาศ  ดานขุนทด" },
        { "employeeId": "MA1504005", "name": "นายประสาน  หนองเส" },
        { "employeeId": "MA1703006", "name": "นายสมานมิตร  อ่อนสิงห์" },
        { "employeeId": "MA1904007", "name": "นายสาธิตย์  อุดมกิจ" },
        { "employeeId": "MA2012001", "name": "นายปิยะวัฒน์  ธิวะโต" },
        { "employeeId": "MA2105003", "name": "นางสาวบุษรา  ปลื้มจิตร" },
        { "employeeId": "MA2204001", "name": "นางสาวธัญญารัตน์  ถนอมกุลบุตร" },
        { "employeeId": "MA2305002", "name": "นางสาวนันทิกา  ภามาเนตร" },
        { "employeeId": "MA2306003", "name": "นายวันเฉลิม  ลายสนธิ์" },
        { "employeeId": "MA2306004", "name": "นายอดิศักดิ์  ลอยประโคน" },
        { "employeeId": "MA2306006", "name": "นางสาวสุมิตตรา  การิโส" },
        { "employeeId": "MA2409001", "name": "นายภาคภูมิ  อ้นชาลี" },
        { "employeeId": "MA2502002", "name": "นางสาวจันทรัศม์  สุทธิโรจน์" },
        { "employeeId": "MA2506001", "name": "นางสาวกานต์นภัส  ยอดเกลี้ยง" },
        { "employeeId": "MT0806003", "name": "นายสุทัศน์  คำหว่าง" },
        { "employeeId": "MT0907001", "name": "นายวิเชียร  แสนจันศรี" },
        { "employeeId": "MT1005001", "name": "นายนิรุต  มูลตรี" },
        { "employeeId": "MT1211001", "name": "นายบุญช่วย  คงประสิทธิ์" },
        { "employeeId": "MT1301001", "name": "นายวิชัย  เป่งหนองแซง" },
        { "employeeId": "MT1306001", "name": "นายเดชณรงค์  ทาแกง" },
        { "employeeId": "MT1407001", "name": "นายสมชาย  กันเกิด" },
        { "employeeId": "MT1706002", "name": "นายจำลอง  โลราช" },
        { "employeeId": "MT2011011", "name": "นายนฤเบศร์   ศรีสมบูรณ์" },
        { "employeeId": "MT2201002", "name": "นายศิวกร  วรรัตน์" },
        { "employeeId": "MT2202001", "name": "นายธนวัฒน์  ดอนหลาบคำ" },
        { "employeeId": "MT2307001", "name": "นายธันวา  เหลือผล" },
        { "employeeId": "MT2308001", "name": "นายพันธิตร  แสงจันทร์" },
        { "employeeId": "MT2504001", "name": "นายนัฐมนต์  กันทะหล้า" },
        { "employeeId": "MT2506001", "name": "นายสิทธิกร  พรหมสิทธิ์" },
        { "employeeId": "MT2509001", "name": "นายภูวเดช  คงสุจริต" },
        { "employeeId": "PE1307004", "name": "นายศุภกร  ตุ้มเต็มรัมย์" },
        { "employeeId": "PE1608003", "name": "นางสาวนิตยา  มูลน้อย" },
        { "employeeId": "PE1708001", "name": "นายวีระ  ศรีน้อย" },
        { "employeeId": "PE1802027", "name": "นางสาวกนกวรรณ  คะหาญ" },
        { "employeeId": "PE2205001", "name": "นายกฤษชาติ  แลนเชย" },
        { "employeeId": "PE2301001", "name": "นายพงษ์ฐรินฐ์  มีพันธ์" },
        { "employeeId": "PE2302002", "name": "นายธนสิทธิ์  บุญหาญ" },
        { "employeeId": "PE2504001", "name": "นายปฏิภาณ  ชามนตรี" },
        { "employeeId": "PR0703001", "name": "นางสาววรรัตน์  แก่นเจริญ" },
        { "employeeId": "PR0711001", "name": "นางพิสมัย  วงค์ละคร" },
        { "employeeId": "PR1009006", "name": "นายคำฉันท์  ทีดินดำ" },
        { "employeeId": "PR1201003", "name": "นางสาวสายพิน  โคตรสมบัติ" },
        { "employeeId": "PR1201008", "name": "นางสาวบุษกร  ถาวร" },
        { "employeeId": "PR1211001", "name": "นายปรีชา  หวันเสนา" },
        { "employeeId": "PR1304002", "name": "นางสาวหนึ่งฤทัย  ปรางสี" },
        { "employeeId": "PR1307001", "name": "นางศรีนวล  ใจสว่าง" },
        { "employeeId": "PR1308006", "name": "นายประวิทย์  ระยับศรี" },
        { "employeeId": "PR1401002", "name": "นางสาวปนิดา  นิรภูมิ" },
        { "employeeId": "PR1403004", "name": "นางสาวศรัณย์รัตน์  แสงเพ็ญ" },
        { "employeeId": "PR1408001", "name": "นายสุรพงษ์  โคระชาติ" },
        { "employeeId": "PR1409003", "name": "นางสาววนิดา  กุลาศรี" },
        { "employeeId": "PR1501004", "name": "นายนพรัตน์   จิตสมนึก" },
        { "employeeId": "PR1502006", "name": "นายบูรพา  โสภา" },
        { "employeeId": "PR1503025", "name": "นายสุรชัย  ดวงรัศมี" },
        { "employeeId": "PR1604007", "name": "นายสันติ  ภูมิฐาน" },
        { "employeeId": "PR1605007", "name": "นายพรชัย  แดนดงเมือง" },
        { "employeeId": "PR1607007", "name": "นางสาววรรณิภา  ภารสว่าง" },
        { "employeeId": "PR1607020", "name": "นางสาวสุกันยา  ดอกพิกุล" },
        { "employeeId": "PR1609005", "name": "นายชาตรี  ศรีชุมพร" },
        { "employeeId": "PR1703010", "name": "นายสุริยา  ดอกไม้งาม" },
        { "employeeId": "PR1704008", "name": "นางสาววาริณี  สอนใจ" },
        { "employeeId": "PR1705015", "name": "นายประสาร  ชาลี" },
        { "employeeId": "PR1707010", "name": "นางสาวเจนจิรา  ศรีจันทร์" },
        { "employeeId": "PR1707016", "name": "นายพิทักษ์  คงศรี" },
        { "employeeId": "PR1707017", "name": "นางสาวศิริลักษณ์  จันดากุล" },
        { "employeeId": "PR1708007", "name": "นายจตุพล  นิกร" },
        { "employeeId": "PR1709016", "name": "นายธีรพงศ์  วงศ์กาฬสินธุ์" },
        { "employeeId": "PR1801013", "name": "นางสาวจิราพัชร  แดงวิบูรณ์" },
        { "employeeId": "PR1801027", "name": "นางสาวจีระพา  ประภาษี" },
        { "employeeId": "PR1802007", "name": "นางสาวกันติกา  แต้มทอง" },
        { "employeeId": "PR1802021", "name": "นายพิทักษ์  โฮมชัย" },
        { "employeeId": "PR1805012", "name": "นายสมยศ  มัธยมนันท์" },
        { "employeeId": "PR1805013", "name": "นายศิลา  นีระวงศ์" },
        { "employeeId": "PR1805015", "name": "นางสาววรรณพร  พลทิพย์" },
        { "employeeId": "PR1808009", "name": "นางสาววราภรณ์  กองสุข" },
        { "employeeId": "PR1808018", "name": "นางสาวศิลาพร  วงค์ปัญญานุรักษ์" },
        { "employeeId": "PR1809014", "name": "นางสาวสุพัตรา  โคคะมาย" },
        { "employeeId": "PR1902002", "name": "นายหาญณรงค์  ไขประภาย" },
        { "employeeId": "PR1903004", "name": "นางสาวพัชรินทร์  ตุ่ยไธสง" },
        { "employeeId": "PR1904016", "name": "นางสาวลักษณา  วงค์สุข" },
        { "employeeId": "PR1904026", "name": "นายฐาปกร  น้อยโลมา" },
        { "employeeId": "PR1905002", "name": "นางสาวกนกภรณ์  โกมลวานิช" },
        { "employeeId": "PR1911004", "name": "นายอนุชิต  สระแก้ว" },
        { "employeeId": "PR1911005", "name": "นายศักดิ์สิทธิ์  วรรณะ" },
        { "employeeId": "PR2001002", "name": "นายประวิทย์  ปัดชา" },
        { "employeeId": "PR2001007", "name": "นายศราวุฒิ  เหลื่อมล้ำ" },
        { "employeeId": "PR2001008", "name": "นางสาวออน  สุขหอม" },
        { "employeeId": "PR2001010", "name": "นายแดนไทย  วงษาคำ" },
        { "employeeId": "PR2001011", "name": "นางสาวปราญชลี  วงษา" },
        { "employeeId": "PR2001012", "name": "นางสาวภัทราภา  สอนถา" },
        { "employeeId": "PR2001013", "name": "นางสาวพัชรินทร์  เทียงเป" },
        { "employeeId": "PR2001014", "name": "นายจิรศักดิ์  โสภา" },
        { "employeeId": "PR2001015", "name": "นายธุววิช  ภูมิฐาน" },
        { "employeeId": "PR2001022", "name": "นายอัศนัย  ทองใบบน" },
        { "employeeId": "PR2002002", "name": "นายเจษฎา  ปะตังกาโต" },
        { "employeeId": "PR2006007", "name": "นายมานพ  แก้วนุช" },
        { "employeeId": "PR2006008", "name": "นายจิรศักดิ์  จรัญรักษ์" },
        { "employeeId": "PR2006009", "name": "นายธณาชัย  อุดมศักดิ์ศิริ" },
        { "employeeId": "PR2007002", "name": "นายสุรจิต  สิทโคต" },
        { "employeeId": "PR2007006", "name": "นางสาวสายธาร  เนียมมณี" },
        { "employeeId": "PR2011008", "name": "นางสาวสุภาวดี   ปัญนิกา" },
        { "employeeId": "PR2102001", "name": "นายวีรกิต  ศิริมงคล" },
        { "employeeId": "PR2102021", "name": "นายยุทธกานต์  ตรีโอษฐ" },
        { "employeeId": "PR2103006", "name": "นางสาวสมหมาย  ไพรเดือน" },
        { "employeeId": "PR2103007", "name": "นางสาวสุพรรษา  ลาภขุนทด" },
        { "employeeId": "PR2103008", "name": "นางสาวบุสดี  พรมมา" },
        { "employeeId": "PR2103010", "name": "นางสาวมณีรัตน์  สุขกิจ" },
        { "employeeId": "PR2103012", "name": "นางสาวชมภู  กันจิตร" },
        { "employeeId": "PR2103013", "name": "นางสาวอรอนงค์  การะเกศ" },
        { "employeeId": "PR2103032", "name": "นางสาวสุภาวรรณ    ซุยทอง" },
        { "employeeId": "PR2107001", "name": "นายณัฐพล  เพชรมาก" },
        { "employeeId": "PR2201012", "name": "นายอำพร  ปั้นตาดี" },
        { "employeeId": "PR2201013", "name": "นายอานนท์  ศรีสวัสดิ์" },
        { "employeeId": "PR2201015", "name": "นางสาวธิราวัลย์  วรขันธ์" },
        { "employeeId": "PR2201016", "name": "นางสาวสุภาวดี   อินธิพันธ์" },
        { "employeeId": "PR2204001", "name": "นายกมลพร  นพรัตน์" },
        { "employeeId": "PR2204003", "name": "นางสาวกาญจนาพร  สระทองรอด" },
        { "employeeId": "PR2204005", "name": "นางสาวณิชนันทน์  ใจแก้ว" },
        { "employeeId": "PR2204006", "name": "นางสาวนลินี  สายสมร" },
        { "employeeId": "PR2204007", "name": "นางสาวพัฒน์ชญา  สุพรรณ" },
        { "employeeId": "PR2204011", "name": "นางสุวรรณี  ก๊กรัมย์" },
        { "employeeId": "PR2204013", "name": "นางสาวอรวรรณ  เชื้อหอม" },
        { "employeeId": "PR2204015", "name": "นางสาวสมใจ  ศรีวิลัย" },
        { "employeeId": "PR2204016", "name": "นางสาวอรุณรัตน์  ละพล" },
        { "employeeId": "PR2204017", "name": "นางสาวอุไรรัตน์  วงษ์ภักดี" },
        { "employeeId": "PR2204023", "name": "นางสาวสุรีวัลย์  ศรีศรี" },
        { "employeeId": "PR2205008", "name": "นายสมศักดิ์  แสงเขตร" },
        { "employeeId": "PR2302001", "name": "นายนพพร  อ่อนตา" },
        { "employeeId": "PR2303002", "name": "นายทวัตย์  รัตนสุวรรณ์" },
        { "employeeId": "PR2304003", "name": "นายวรวุฒิ  โพธิชัยศรี" },
        { "employeeId": "PR2304007", "name": "นายนครินทร์  หอมดวง" },
        { "employeeId": "PR2309001", "name": "นางสาวพัชรา  เหลื่อมล้ำ" },
        { "employeeId": "PR2309002", "name": "นางสาวอมรา  ศรีบุดดา" },
        { "employeeId": "PR2309003", "name": "นางสาวรัศมีวรรณ  เพ็ชรสุวรรณ" },
        { "employeeId": "PR2309004", "name": "นายอาทร  งามนัก" },
        { "employeeId": "PR2309005", "name": "นายสมบัติ  เพ็ชรสุวรรณ" },
        { "employeeId": "PR2309006", "name": "นายสายธาร  ทองอินทร์" },
        { "employeeId": "PR2402002", "name": "นายภูริภัทร  ถิตย์รัศมี" },
        { "employeeId": "PR2403001", "name": "นางสาวชลธิชา  ว่องไว" },
        { "employeeId": "PR2404001", "name": "นายประสิทธิ์  โสภา" },
        { "employeeId": "PR2406002", "name": "นายวีรยุทธ  พรมมี" },
        { "employeeId": "PR2407001", "name": "นายเอกภพ  เชื้อตาหมื่น" },
        { "employeeId": "PR2407002", "name": "นายรัชชานนท์  เจือจันทร์" },
        { "employeeId": "PR2407003", "name": "นายพยัคฆ์  พิมพ์รักษา" },
        { "employeeId": "PR2407006", "name": "นางสาวสโรชา  ประเสริฐศรี" },
        { "employeeId": "PR2407007", "name": "นางสาวมาริสา  พรมโสภา" },
        { "employeeId": "PR2501001", "name": "นายรณกร  น้อยโลมา" },
        { "employeeId": "PR2507001", "name": "นายสิทธิชัย  ไทยสำราญ" },
        { "employeeId": "PR2508001", "name": "นายจิรวัฒน์  ขุนหอม" },
        { "employeeId": "PR2508002", "name": "นายวรากร  ฝังนิล" },
        { "employeeId": "PR2508003", "name": "นายวสันต์  ฤาชา" },
        { "employeeId": "PR2508004", "name": "นายศรชัย  สุดเนตร" },
        { "employeeId": "PR2508005", "name": "นางสาวนรินทร์  ไวตะโคตร" },
        { "employeeId": "PR2508006", "name": "นางสาวประภาพร  ยืนยาว" },
        { "employeeId": "PR2508007", "name": "นางรุจิรา  วิเศษเนตร" },
        { "employeeId": "PR2508008", "name": "นางสาวสาวิตรี  สุดเนตร" },
        { "employeeId": "PR2508009", "name": "นางสาวอรธิดา  แย้มกลาง" },
        { "employeeId": "PR2508010", "name": "นางสาวธิดา  ชารีแสน" },
        { "employeeId": "PR2508014", "name": "นางสาววรัญญา  ชายอินทร์" },
        { "employeeId": "PR2509001", "name": "นางสาวกิติรัตน์  ไตรพิมพ์" },
        { "employeeId": "PR2509002", "name": "นางสาวปริศนา  ทองบุญมา" },
        { "employeeId": "PR2509003", "name": "นางสาวภาระวี  ภูธร" },
        { "employeeId": "PR2509004", "name": "นางสาวสิริลักษณ์  เนียมจันทร์" },
        { "employeeId": "PR2509005", "name": "นายชัยวัฒน์  แก้วสุวรรณ์" },
        { "employeeId": "PR2509007", "name": "นายพิทักษ์  สังชาตรี" },
        { "employeeId": "PR2509008", "name": "นายสุทิศ  สงค์การณ์" },
        { "employeeId": "QC0807001", "name": "นางสาวมลิวัลย์  ศรีเมือง" },
        { "employeeId": "QC1309001", "name": "นางสาวนุชจรี  น้อยสิม" },
        { "employeeId": "QC1506009", "name": "นางสาวพิมพ์ลพัส  สาริพันธ์" },
        { "employeeId": "QC2103001", "name": "นายศิริวุฒิ  ยิ่งสุข" },
        { "employeeId": "QC2108001", "name": "นายชัยวัช  ชัยแสนท้าว" },
        { "employeeId": "QC2109001", "name": "นางสาวพิชยา  เชื้อหงษ์" },
        { "employeeId": "QC2303001", "name": "นายคิริเมขล์  ใจมนต์" },
        { "employeeId": "QC2303003", "name": "นางสาวณัฐวิภา  คุณทา" },
        { "employeeId": "QC2401001", "name": "นายสุนัย  วันทา" },
        { "employeeId": "QC2404001", "name": "นางสาวกิตติยา  ชะนาเทศน์" },
        { "employeeId": "QC2412001", "name": "นายธนพนธ์    ระพันธ์" },
        { "employeeId": "QC2501001", "name": "นายณรงค์ฤทธิ์  คล้ายบรรดิษฐ์" },
        { "employeeId": "QC2508001", "name": "นายธวัฒชัย  เบื้อจันทึก" },
        { "employeeId": "IN1609010", "name": "นายกฤติญาณัท  แตงเพ็ชร" },
        { "employeeId": "IN1802002", "name": "นางสาวสุพัตรา  แก้วจันลา" },
        { "employeeId": "IN1803006", "name": "นางสาวกนกทิพย์  จุ่นมีวงศ์" },
        { "employeeId": "IN1904003", "name": "นางสาวอมรประภา  คุณศรีเมฆ" },
        { "employeeId": "IN2007001", "name": "นายวิเชษฐ  จูงมะเริง" },
        { "employeeId": "IN2008001", "name": "นายศิริชัย  ไชยแสง" },
        { "employeeId": "IN2106003", "name": "นางสาววิทิตา  หาไชย" },
        { "employeeId": "IN2107002", "name": "นางสาวรัชนีกรณ์  คงอิ่ม" },
        { "employeeId": "IN2110004", "name": "นางสาวสุนันทา  เชิดชู" },
        { "employeeId": "IN2110006", "name": "นางสาวประวีนา  ไชยทอง" },
        { "employeeId": "IN2201001", "name": "นายกันตพัฒน์  วงศ์ใหญ่" },
        { "employeeId": "IN2205001", "name": "นางสาววริยา  ปดไธสงค์" },
        { "employeeId": "IN2302001", "name": "นางสาวสาลินี  ศิริธร" },
        { "employeeId": "IN2405001", "name": "นายจักรภพ  ศรีพล" },
        { "employeeId": "IN2406006", "name": "นางสาวหัทยา  ชาติจันทึก" },
        { "employeeId": "IN2406007", "name": "นางสาวศิริรัตน์  ผิวดำ" },
        { "employeeId": "IN2501002", "name": "นางสาวณัฐชยา  ผ่องอิ่ม" },
        { "employeeId": "IN2501005", "name": "นางสาวอภิตา  ครองชื่น" },
        { "employeeId": "IN2501006", "name": "นางสาวพัชรี  บุตรนิน" },
        { "employeeId": "IN2501008", "name": "นายประสิทธิ์  ชัยสอน" },
        { "employeeId": "IN2501009", "name": "นางสาวมลธิดา  ทองเกลี้ยง" },
        { "employeeId": "IN2501012", "name": "นายอนุชา  ถินยศ" },
        { "employeeId": "IN2501013", "name": "นางสาวอุมาพร  คล้ายรุ่งเรือง" },
        { "employeeId": "IN2502006", "name": "นายนันทกร  บุญลาภ" },
        { "employeeId": "IN2504005", "name": "นายพีรพัฒน์  เสียวสุข" },
        { "employeeId": "IN2504007", "name": "นางสาวกาญจนธัช  รักคำ" },
        { "employeeId": "IN2505001", "name": "นางสาวพิตาภรณ์  นิลสนธิ" },
        { "employeeId": "IN2505003", "name": "นางสาวฑิฆัมพร  ไยรีอ่าง" },
        { "employeeId": "IN2505005", "name": "นายจักรกฤษณ์  ฉลอมพงษ์" },
        { "employeeId": "IN2506002", "name": "นางสาวกิจวาสนา  สีใจ" },
        { "employeeId": "IN2506003", "name": "นายรัฐพล  บุญเสด" },
        { "employeeId": "IN2506006", "name": "นายเรวัฒน์  นาคดี" },
        { "employeeId": "IN2506008", "name": "นางสาวนิโลบล  นวนอ่อน" },
        { "employeeId": "IN2507002", "name": "นางสาวอภิญญา  คำก้อน" },
        { "employeeId": "IN2507004", "name": "นางสาววรัญญา  นามวงค์" },
        { "employeeId": "IN2508001", "name": "นายธีรภัทร  พากเพียร" },
        { "employeeId": "IN2508003", "name": "นางสาวศศิธร  กรองบุญมา" },
        { "employeeId": "IN2509001", "name": "นายศุภชัย  คงดี" },
        { "employeeId": "IN2509002", "name": "นางสาวสุกัญญา  คำเรือง" },
        { "employeeId": "IN2509003", "name": "นางสาววรัญญา  แสนบุญ" },
        { "employeeId": "ST0606001", "name": "นางสุจิตรา  ประสารกก" },
        { "employeeId": "ST1506011", "name": "นายเฉลิมชัย  หมู่วรรณ" },
        { "employeeId": "ST1605008", "name": "นายอนุชา  นินชา" },
        { "employeeId": "ST1607002", "name": "นายธีระพงษ์  ฤทธิยูง" },
        { "employeeId": "ST1803005", "name": "นายสุรวุธ  ทุมที" },
        { "employeeId": "ST1804002", "name": "นางสาวสุกัญญา  กุลาศรี" },
        { "employeeId": "ST1904005", "name": "นายพงษ์ศักดิ์  บ่อแก้ว" },
        { "employeeId": "ST2006001", "name": "นายทวีศักดิ์  อินหอม" },
        { "employeeId": "ST2007002", "name": "นายศุภกิจ  ไชยคำมูล" },
        { "employeeId": "ST2105001", "name": "นายยิ่งพันธุ์  จันผ่อง" },
        { "employeeId": "ST2105004", "name": "นายอัดชา  ปูนาสี" },
        { "employeeId": "ST2405001", "name": "นายสมพงษ์  ริมงาม" },
        { "employeeId": "ST2501001", "name": "นายดนุสรณ์  นิลศิลา" },
        { "employeeId": "ST2501004", "name": "นายสิทธิพงษ์  พันเดช" },
        { "employeeId": "ST2501005", "name": "นายมานะ  สวัสดิ์ทอง" },
        { "employeeId": "ST2503001", "name": "นายกิติกร  หมู่มงคล" },
        { "employeeId": "ST2504001", "name": "นายธนิก  แสนขุนทด" },
        { "employeeId": "ST2504002", "name": "นายธนัช  แสนขุนทด" },
        { "employeeId": "ST2506001", "name": "นางสาวนภาพร  จันทาศรี" },
        { "employeeId": "ST2506002", "name": "นายชโนทัย  สินจันทร์" },
        { "employeeId": "ST2507001", "name": "นายประยูร  แก้วมาลา" }
    ];

    try {
        for (const data of employees) {
            // Upsert: อัปเดตถ้ามี สร้างใหม่ถ้าไม่มี
            await Employee.findOneAndUpdate({ employeeId: data.employeeId }, data, { upsert: true });
        }
        res.send(`✅ อัปเดตรายชื่อพนักงานจำนวน ${employees.length} คน เรียบร้อยแล้ว!`);
    } catch (err) { 
        res.send('❌ Error: ' + err.message); 
    }
});

// 3.5 API ดึงรายงานสำหรับ Admin (แก้ Logic ให้ดึงข้อมูลล่าสุด)
app.get('/api/admin/report', async (req, res) => {
  try {
    const employees = await Employee.find();
    
    // เรียงจากล่าสุดไปหาเก่า เพื่อให้ .find() เจออันล่าสุดเสมอ
    const progressList = await Progress.find().sort({ lastUpdated: -1 });

    const report = employees.map(emp => {
      const empProgress = progressList.find(p => p.employeeId === emp.employeeId);
      
      return {
        id: emp.employeeId,
        name: emp.name,
        course: empProgress ? empProgress.courseId : '-',
        status: empProgress ? (empProgress.isCompleted ? '✅ ผ่านแล้ว' : '🟡 กำลังเรียน') : '🔴 ยังไม่เรียน',
        lastSeen: empProgress ? new Date(empProgress.lastUpdated).toLocaleString('th-TH') : '-'
      };
    });

    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3.6 API รีเซ็ตการเรียน (สำหรับ Admin กดรีเซ็ตให้พนักงาน)
app.post('/api/admin/reset-progress', async (req, res) => {
  const { employeeId } = req.body;
  try {
    // ลบข้อมูล Progress ของพนักงานคนนั้นทิ้งทั้งหมด
    await Progress.deleteMany({ employeeId });
    console.log(`🗑️ Reset progress for: ${employeeId}`);
    res.json({ success: true, message: 'รีเซ็ตข้อมูลเรียบร้อย' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 4. Start Server ---
const PORT = process.env.PORT || 3001; 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});