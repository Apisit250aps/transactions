import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken'

/** ตั้งใน .env: JWT_SECRET=super-secret */
const JWT_SECRET = process.env.JWT_SECRET ?? ''
if (!JWT_SECRET) {
  // ช่วยจับพลาดตั้งแต่ตอนเริ่มโปรเซส
  throw new Error('JWT_SECRET is not set')
}

/** โครง payload พื้นฐานที่เรา “ลงชื่อ” เข้าไปใน token */
export type TokenPayload = {
  /** subject: ใส่ user id หรืออะไรก็ได้ที่ระบุตัวตน */
  sub: string
  name: string
  // เพิ่ม field อื่นๆ ได้ตามต้องการ
} & Record<string, unknown>

/** สร้าง (sign) JWT แบบ synchronous – ง่ายและเร็ว */
export function signToken(
  payload: TokenPayload,
  options: SignOptions = { expiresIn: '1d' } // ค่าเริ่มต้นอายุ 1 วัน
): string {
  // ป้องกัน error: "Expected payload to be a plain object"
  if (
    payload == null ||
    typeof payload !== 'object' ||
    Array.isArray(payload)
  ) {
    throw new TypeError('payload must be a plain object')
  }
  return jwt.sign(payload, JWT_SECRET, { ...options })
}

/** ตรวจสอบ (verify) JWT; หากไม่ผ่านจะคืน null แทนการ throw */
export function verifyToken<T extends JwtPayload = JwtPayload>(
  token: string
): (T & TokenPayload) | null {
  try {
    // jwt.verify คืนค่าเป็น string | JwtPayload; เรา cast ให้เป็นประเภทที่ต้องการ
    return jwt.verify(token, JWT_SECRET) as T & TokenPayload
  } catch {
    return null
  }
}

/** ดึง token จาก Authorization header: "Bearer <token>" */
