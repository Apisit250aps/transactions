# API Documentation - ระบบจัดการธุรกรรม

## ภาพรวมของระบบ

ระบบ API นี้เป็นระบบจัดการธุรกรรมทางการเงินที่ให้ผู้ใช้สามารถสร้างบัญชี เข้าสู่ระบบ และจัดการธุรกรรมทางการเงินได้ ระบบประกอบด้วย 3 ส่วนหลัก:
- **User Management**: จัดการผู้ใช้และการยืนยันตัวตน
- **Wallet Management**: จัดการกระเป๋าเงิน
- **Transaction Management**: จัดการธุรกรรมทางการเงิน

---

## Authentication

ระบบใช้ JWT Token สำหรับการยืนยันตัวตน โดยต้องส่ง Token ใน Header ของทุกคำขอที่ต้องการความปลอดภัย

```
Authorization: Bearer <your_jwt_token>
```

---

## ข้อมูลโครงสร้าง (Data Models)

### User
```typescript
{
  uuid: string,        // UUID ของผู้ใช้
  name: string,        // ชื่อผู้ใช้ (ไม่ซ้ำ)
  password: string,    // รหัสผ่าน (เข้ารหัสด้วย argon2)
  createdAt: Date,     // วันที่สร้าง
  updatedAt: Date      // วันที่อัปเดต
}
```

### Wallet
```typescript
{
  uuid: string,        // UUID ของกระเป๋าเงิน
  owner: string,       // UUID ของเจ้าของ
  name: string,        // ชื่อกระเป๋าเงิน
  desc?: string,       // คำอธิบาย (ไม่บังคับ)
  createdAt: Date,     // วันที่สร้าง
  updatedAt: Date      // วันที่อัปเดต
}
```

### Transaction
```typescript
{
  uuid: string,        // UUID ของธุรกรรม
  wallet: string,      // UUID ของกระเป๋าเงิน
  name: string,        // ชื่อธุรกรรม
  desc?: string,       // คำอธิบาย (ไม่บังคับ)
  amount: number,      // จำนวนเงิน (ไม่ติดลบ)
  type: -1 | 1,       // ประเภท: -1 = รายจ่าย, 1 = รายรับ
  date?: Date,         // วันที่ธุรกรรม (ไม่บังคับ)
  createdAt: Date,     // วันที่สร้าง
  updatedAt: Date      // วันที่อัปเดต
}
```

---

## API Endpoints

### 1. การจัดการผู้ใช้ (User Management)

#### 1.1 สร้างผู้ใช้ใหม่
**POST** `/api/auth/register`

สร้างผู้ใช้ใหม่และกระเป๋าเงินเริ่มต้น

**Request Body:**
```json
{
  "name": "username",
  "email":"test@mail.com",
  "password": "password123"
}
```

**Response:**
- **201 Created** - สร้างผู้ใช้สำเร็จ
```json
{
  "success": true,
  "message": "Create user successfully!"
}
```

- **400 Bad Request** - ข้อมูลไม่ถูกต้อง
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": ["Name is required"],
    "password": ["Password must be at least 6 characters"]
  }
}
```

- **409 Conflict** - ชื่อผู้ใช้ซ้ำ
```json
{
  "success": false,
  "message": "Name already exists"
}
```

#### 1.2 เข้าสู่ระบบ
**POST** `/api/auth/login`

เข้าสู่ระบบและรับ JWT Token

**Request Body:**
```json
{
  "name": "username",
  "password": "password123"
}
```

**Response:**
- **200 OK** - เข้าสู่ระบบสำเร็จ
```json
{
  "success": true,
  "message": "login successfully!",
  "data": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

- **400 Bad Request** - ข้อมูลไม่ครบ
```json
{
  "success": false,
  "message": "Missing credentials"
}
```

- **404 Not Found** - ไม่พบผู้ใช้
```json
{
  "success": false,
  "message": "user not found"
}
```

- **401 Unauthorized** - รหัสผ่านผิด
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### 2. การจัดการธุรกรรม (Transaction Management)

#### 2.1 สร้างธุรกรรมใหม่
**POST** `/api/transaction`

สร้างธุรกรรมใหม่ (ต้องล็อกอิน)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "ซื้อของ",
  "desc": "ซื้อของใช้ในบ้าน",
  "amount": 500,
  "type": -1,
  "date": "2024-01-15"
}
```

**Response:**
- **201 Created** - สร้างธุรกรรมสำเร็จ
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "wallet": "550e8400-e29b-41d4-a716-446655440001",
    "name": "ซื้อของ",
    "desc": "ซื้อของใช้ในบ้าน",
    "amount": 500,
    "type": -1,
    "date": "2024-01-15T00:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

- **401 Unauthorized** - ไม่ได้ล็อกอิน
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

- **404 Not Found** - ไม่พบกระเป๋าเงิน
```json
{
  "success": false,
  "message": "Wallet not found"
}
```

- **400 Bad Request** - ข้อมูลไม่ถูกต้อง
```json
{
  "success": false,
  "message": "Invalid transaction data",
  "error": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "string",
      "inclusive": true,
      "message": "Name is required",
      "path": ["name"]
    }
  ]
}
```

#### 2.2 ดูธุรกรรมทั้งหมด
**GET** `/api/transaction`

ดูธุรกรรมทั้งหมดของผู้ใช้ พร้อมการแบ่งหน้า (ต้องล็อกอิน)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (optional): หมายเลขหน้า (ค่าเริ่มต้น: 1)
- `limit` (optional): จำนวนรายการต่อหน้า (ค่าเริ่มต้น: 10)

**URL ตัวอย่าง:**
```
GET /api/transaction?page=1&limit=5
```

**Response:**
- **200 OK** - ดึงข้อมูลสำเร็จ
```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": [
    {
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "wallet": "550e8400-e29b-41d4-a716-446655440001",
      "name": "เงินเดือน",
      "desc": "เงินเดือนประจำเดือน",
      "amount": 30000,
      "type": 1,
      "date": "2024-01-15T00:00:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "uuid": "550e8400-e29b-41d4-a716-446655440002",
      "wallet": "550e8400-e29b-41d4-a716-446655440001",
      "name": "ค่าอาหาร",
      "desc": "ค่าอาหารกลางวัน",
      "amount": 150,
      "type": -1,
      "date": "2024-01-14T00:00:00.000Z",
      "createdAt": "2024-01-14T12:00:00.000Z",
      "updatedAt": "2024-01-14T12:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### 2.3 ดูธุรกรรมแบบระบุ ID
**GET** `/api/transaction/[id]`

ดูรายละเอียดของธุรกรรมเฉพาะ (ต้องล็อกอิน)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**URL ตัวอย่าง:**
```
GET /api/transaction/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
- **200 OK** - ดึงข้อมูลสำเร็จ
```json
{
  "success": true,
  "message": "Transaction retrieved successfully",
  "data": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "wallet": "550e8400-e29b-41d4-a716-446655440001",
    "name": "เงินเดือน",
    "desc": "เงินเดือนประจำเดือน",
    "amount": 30000,
    "type": 1,
    "date": "2024-01-15T00:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

- **404 Not Found** - ไม่พบธุรกรรม
```json
{
  "success": false,
  "message": "Transaction not found"
}
```

#### 2.4 แก้ไขธุรกรรม
**PUT** `/api/transaction/[id]`

แก้ไขข้อมูลธุรกรรม (ต้องล็อกอิน)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "ค่าอาหารเที่ยง",
  "desc": "ข้าวกล่องที่ออฟฟิศ",
  "amount": 80,
  "type": -1
}
```

**Response:**
- **200 OK** - แก้ไขสำเร็จ
```json
{
  "success": true,
  "message": "Transaction updated successfully",
  "data": {
    "name": "ค่าอาหารเที่ยง",
    "desc": "ข้าวกล่องที่ออฟฟิศ",
    "amount": 80,
    "type": -1,
    "updatedAt": "2024-01-16T14:30:00.000Z"
  }
}
```

- **404 Not Found** - ไม่พบธุรกรรม
```json
{
  "success": false,
  "message": "Transaction not found"
}
```

- **400 Bad Request** - ข้อมูลไม่ถูกต้อง
```json
{
  "success": false,
  "message": "Invalid transaction data",
  "error": [
    {
      "code": "too_small",
      "minimum": 0,
      "type": "number",
      "inclusive": true,
      "message": "Amount must be non-negative",
      "path": ["amount"]
    }
  ]
}
```

#### 2.5 ลบธุรกรรม
**DELETE** `/api/transaction/[id]`

ลบธุรกรรม (ต้องล็อกอิน)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**URL ตัวอย่าง:**
```
DELETE /api/transaction/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
- **200 OK** - ลบสำเร็จ
```json
{
  "success": true,
  "message": "Transaction deleted successfully",
  "data": null
}
```

- **404 Not Found** - ไม่พบธุรกรรม
```json
{
  "success": false,
  "message": "Transaction not found"
}
```

---

## HTTP Status Codes

| Code | ความหมาย | การใช้งาน |
|------|----------|-----------|
| 200 | OK | คำขอสำเร็จ |
| 201 | Created | สร้างข้อมูลสำเร็จ |
| 400 | Bad Request | ข้อมูลไม่ถูกต้องหรือไม่ครบ |
| 401 | Unauthorized | ไม่ได้ยืนยันตัวตนหรือ Token หมดอายุ |
| 404 | Not Found | ไม่พบข้อมูลที่ต้องการ |
| 409 | Conflict | ข้อมูลซ้ำ (เช่น ชื่อผู้ใช้ซ้ำ) |
| 500 | Internal Server Error | ข้อผิดพลาดของเซิร์ฟเวอร์ |

---

## ข้อผิดพลาดทั่วไป (Common Errors)

### 1. Token หมดอายุหรือไม่ถูกต้อง
```json
{
  "success": false,
  "message": "Unauthorized"
}
```
**แก้ไข:** ทำการล็อกอินใหม่เพื่อรับ Token ใหม่

### 2. ข้อมูลไม่ถูกต้อง
```json
{
  "success": false,
  "message": "Invalid transaction data",
  "error": [...]
}
```
**แก้ไข:** ตรวจสอบข้อมูลที่ส่งให้ตรงกับรูปแบบที่กำหนด

### 3. ไม่พบกระเป๋าเงิน
```json
{
  "success": false,
  "message": "Wallet not found"
}
```
**แก้ไข:** ตรวจสอบว่าผู้ใช้มีกระเป๋าเงิน (ควรสร้างอัตโนมัติเมื่อสมัครสมาชิก)

---

## ตัวอย่างการใช้งาน

### JavaScript/TypeScript
```javascript
// ล็อกอิน
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'testuser',
    password: 'password123'
  })
});

const loginData = await loginResponse.json();
const token = loginData.data.access;

// สร้างธุรกรรม
const transactionResponse = await fetch('/api/transaction', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'ค่าอาหาร',
    desc: 'อาหารเที่ยง',
    amount: 120,
    type: -1
  })
});

const transactionData = await transactionResponse.json();
```

### cURL
```bash
# ล็อกอิน
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"testuser","password":"password123"}'

# สร้างธุรกรรม
curl -X POST http://localhost:3000/api/transaction \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name":"ค่าอาหาร","amount":120,"type":-1}'
```

---

## หมายเหตุ

1. **ความปลอดภัย**: รหัสผ่านจะถูกเข้ารหัสด้วย argon2 ก่อนบันทึกลงฐานข้อมูล
2. **UUID**: ระบบใช้ UUID สำหรับ ID ของทุก Entity เพื่อความปลอดภัยและไม่ให้เดาได้
3. **การแบ่งหน้า**: API รองรับการแบ่งหน้าสำหรับการดูธุรกรรมทั้งหมด
4. **วันที่**: ระบบจะเรียงธุรกรรมตามวันที่สร้างใหม่สุดขึ้นก่อน
5. **ประเภทธุรกรรม**: ใช้ -1 สำหรับรายจ่าย และ 1 สำหรับรายรับ
6. **Environment**: ในโหมด development จะแสดงรายละเอียด error เพิ่มเติม