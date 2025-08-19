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
  first_name: string
  last_name: string
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
  "first_name":"John",
  "last_name":"Doe",
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
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "auth": { ...user }
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


# การจัดการ JWT Token ใน Flutter แอปพลิเคชัน

## ภาพรวม

เอกสารนี้อธิบายการใช้งานระบบจัดการ JWT (JSON Web Token) ใน Flutter แอปพลิเคชันที่ประกอบด้วย 2 ส่วนหลัก:
1. **JwtStorage** - คลาสสำหรับจัดเก็บ Token อย่างปลอดภัย
2. **ApiService** - คลาสสำหรับจัดการการเรียก API พร้อม Authentication

## การติดตั้ง Dependencies

เพิ่ม packages ต่อไปนี้ใน `pubspec.yaml`:

```yaml
dependencies:
  flutter_secure_storage: ^9.0.0
  get: ^4.6.6
  http: ^1.1.0
```

จากนั้นรันคำสั่ง:
```bash
flutter pub get
```

## JwtStorage Class - การจัดเก็บ Token อย่างปลอดภัย

### ความปลอดภัยของ Flutter Secure Storage

`flutter_secure_storage` เป็นแพ็กเกจที่ให้ความปลอดภัยสูงในการเก็บข้อมูลสำคัญ:

- **Android**: ใช้ Android Keystore เก็บข้อมูลแบบเข้ารหัส
- **iOS**: ใช้ iOS Keychain ที่มีระบบรักษาความปลอดภัยในระดับระบบปฏิบัติการ
- **ข้อมูลจะไม่หายไปแม้แอปถูกปิด** และปลอดภัยกว่าการใช้ SharedPreferences

### วิธีการใช้งาน JwtStorage

#### 1. บันทึก Token
```dart
// บันทึก JWT Token หลังจาก Login สำเร็จ
await JwtStorage.saveToken('your_jwt_token_here');
```

#### 2. ดึง Token มาใช้งาน
```dart
// ดึง Token เพื่อใช้ในการเรียก API
String? token = await JwtStorage.getToken();
if (token != null) {
  // มี Token สามารถใช้งานได้
  print('Token: $token');
} else {
  // ไม่มี Token หรือเกิดข้อผิดพลาด
  print('No token available');
}
```

#### 3. ลบ Token (Logout)
```dart
// ลบ Token เมื่อผู้ใช้ Logout
await JwtStorage.deleteToken();
```

### การจัดการข้อผิดพลาด

คลาส JwtStorage มีการจัดการข้อผิดพลาดแบบ Try-Catch:

- **saveToken()**: หากบันทึกไม่ได้จะพิมพ์ Error และสามารถเพิ่มการจัดการทางเลือกได้
- **getToken()**: หากอ่านไม่ได้จะส่งคืน `null`
- **deleteToken()**: หากลบไม่ได้จะพิมพ์ Error แต่ไม่หยุดการทำงาน

## ApiService Class - การจัดการ API Calls

### คุณสมบัติหลัก

1. **Auto Token Management**: ดึง Token จาก JwtStorage โดยอัตโนมัติ
2. **Token Expiration Handling**: ตรวจสอบ Status Code 403 และทำ Logout อัตโนมัติ
3. **Version Control**: ส่ง App Version ใน Header ทุกครั้ง
4. **GetX Integration**: ใช้ GetX สำหรับ Navigation และ State Management

### HTTP Methods ที่รองรับ

#### 1. GET Request
```dart
ApiService apiService = Get.find<ApiService>();

try {
  final response = await apiService.get('https://api.example.com/users');
  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    // ประมวลผลข้อมูล
  }
} catch (e) {
  print('Error: $e');
}
```

#### 2. POST Request
```dart
final userData = {
  'name': 'John Doe',
  'email': 'john@example.com'
};

try {
  final response = await apiService.post(
    'https://api.example.com/users',
    userData
  );
  if (response.statusCode == 201) {
    print('User created successfully');
  }
} catch (e) {
  print('Error: $e');
}
```

#### 3. PUT Request
```dart
final updateData = {
  'name': 'John Smith',
  'email': 'johnsmith@example.com'
};

try {
  final response = await apiService.put(
    'https://api.example.com/users/123',
    updateData
  );
  if (response.statusCode == 200) {
    print('User updated successfully');
  }
} catch (e) {
  print('Error: $e');
}
```

#### 4. DELETE Request
```dart
try {
  final response = await apiService.delete('https://api.example.com/users/123');
  if (response.statusCode == 200) {
    print('User deleted successfully');
  }
} catch (e) {
  print('Error: $e');
}
```

### การจัดการ Token หมดอายุ

เมื่อ Server ส่ง Status Code 403 (Forbidden):

1. ระบบจะเรียก `logout()` อัตโนมัติ
2. ลบ Token ออกจาก Secure Storage
3. นำผู้ใช้กลับไปหน้า Login (`/login`)
4. โยน Exception พร้อมข้อความ "Token expired. User logged out."

### Headers ที่ส่งไปทุก Request

```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json",
  "app_version": "1.2.0"
}
```

## การตั้งค่าเริ่มต้น

### 1. เพิ่ม ApiService ใน GetX Bindings

```dart
class InitialBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<ApiService>(ApiService());
  }
}
```

### 2. กำหนด Route สำหรับ Login

ใน `main.dart`:

```dart
GetMaterialApp(
  initialBinding: InitialBinding(),
  getPages: [
    GetPage(name: '/login', page: () => LoginPage()),
    GetPage(name: '/home', page: () => HomePage()),
    // Routes อื่นๆ
  ],
  initialRoute: '/login',
)
```

## ตัวอย่างการใช้งานจริง

### Login Flow

```dart
class LoginController extends GetxController {
  final ApiService _apiService = Get.find<ApiService>();

  Future<void> login(String email, String password) async {
    try {
      // เรียก Login API (ไม่ต้องใช้ Token)
      final response = await http.post(
        Uri.parse('https://api.example.com/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final token = data['token'];
        
        // บันทึก Token
        await JwtStorage.saveToken(token);
        
        // นำไปหน้าหลัก
        Get.offAllNamed('/home');
      }
    } catch (e) {
      print('Login error: $e');
    }
  }
}
```

### ตรวจสอบ Authentication Status

```dart
class AuthMiddleware extends GetMiddleware {
  @override
  RouteSettings? redirect(String? route) async {
    final token = await JwtStorage.getToken();
    if (token == null) {
      return const RouteSettings(name: '/login');
    }
    return null;
  }
}
```

## ข้อควรระวัง

1. **ความปลอดภัย**: JWT Token เก็บข้อมูลสำคัญ ใช้ Secure Storage เท่านั้น
2. **Token Expiration**: ตั้งเวลาหมดอายุที่เหมาะสม (แนะนำ 1-24 ชั่วโมง)
3. **Error Handling**: จัดการข้อผิดพลาดทุกระดับเพื่อประสบการณ์ผู้ใช้ที่ดี
4. **Network Security**: ใช้ HTTPS เสมอในการส่ง Token
5. **Logout**: ให้ผู้ใช้สามารถ Logout ได้ทุกเวลา

## การปรับแต่งเพิ่มเติม

### เพิ่ม Refresh Token

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class JwtStorage {
  static const _storage = FlutterSecureStorage();
  static const String _tokenKey = 'jwt_token';

  static Future<void> saveToken(String token) async {
    try {
      await _storage.write(key: _tokenKey, value: token);
    } catch (e) {
      print('Error saving token: $e');
      // Handle error (e.g., use alternative storage method)
    }
  }

  static Future<String?> getToken() async {
    try {
      return await _storage.read(key: _tokenKey);
    } catch (e) {
      print('Error reading token: $e');
      return null;
    }
  }

  static Future<void> deleteToken() async {
    try {
      await _storage.delete(key: _tokenKey);
    } catch (e) {
      print('Error deleting token: $e');
    }
  }
}
```

### เพิ่ม Loading State

```dart
class ApiService extends GetxController {
  String get version => "1.2.0";

  Future<http.Response> _handleResponse(
      Future<http.Response> Function() apiCall) async {
    try {
      final response = await apiCall();
      if (response.statusCode == 403) {
        await logout();
        throw Exception('Token expired. User logged out.');
      }
      return response;
    } catch (e) {
      rethrow;
    }
  }

  Future<http.Response> get(String endpoint) async {
    return _handleResponse(() async {
      final token = await JwtStorage.getToken();
      return await http.get(
        Uri.parse(endpoint),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
          'app_version': version,
        },
      );
    });
  }

  Future<http.Response> post(String endpoint, dynamic data) async {
    return _handleResponse(() async {
      final token = await JwtStorage.getToken();
      return await http.post(
        Uri.parse(endpoint),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
          'app_version': version,
        },
        body: json.encode(data),
      );
    });
  }

  Future<http.Response> delete(String endpoint) async {
    return _handleResponse(() async {
      final token = await JwtStorage.getToken();
      return await http.delete(
        Uri.parse(endpoint),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
          'app_version': version,
        },
      );
    });
  }

  Future<http.Response> put(String endpoint, dynamic data) async {
    return _handleResponse(() async {
      final token = await JwtStorage.getToken();
      return await http.put(
        Uri.parse(endpoint),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
          'app_version': version,
        },
        body: json.encode(data),
      );
    });
  }

  Future<bool> logout() async {
    try {
      await JwtStorage.deleteToken();
      Get.offAllNamed('/login');
      return true;
    } catch (e) {
      print('Error during logout: $e');
      return false;
    }
  }
}
```

## สรุป

ระบบ JWT Token Management นี้ให้ความปลอดภัยและความสะดวกในการจัดการ Authentication ใน Flutter แอป ด้วยการใช้ Secure Storage สำหรับเก็บ Token และการจัดการ API calls ที่มีการตรวจสอบ Token หมดอายุอัตโนมัติ ทำให้นักพัฒนาสามารถมั่นใจได้ในความปลอดภัยของข้อมูลผู้ใช้


