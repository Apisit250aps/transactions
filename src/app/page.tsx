'use client'
import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

// Single-file React page for the provided API docs (Thai).
// Tailwind CSS recommended. Drop into a Next.js/Vite React app and render.
// Features: sticky ToC, copy buttons for code, section anchors, light/dark support.

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null)
  async function copy(text: string, key?: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key ?? 'ok')
      setTimeout(() => setCopied(null), 1500)
    } catch {}
  }
  return { copied, copy }
}

function CodeBlock({
  code,
  lang,
  fileName,
}: {
  code: string
  lang?: string
  fileName?: string
}) {
  const { copied, copy } = useCopy()
  const key = fileName ?? code.slice(0, 20)
  return (
    <div className="relative group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-3 py-2 text-xs border-b border-zinc-200 dark:border-zinc-800">
        <span className="opacity-70 font-mono">
          {fileName ?? (lang ? `${lang}` : 'code')}
        </span>
        <button
          onClick={() => copy(code, key)}
          className="px-2 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        >
          {copied === key ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className={`p-4 overflow-auto text-sm leading-6`}>
        <code className={`language-${lang ?? ''}`}>{code}</code>
      </pre>
    </div>
  )
}

const sections = [
  { id: 'overview', title: 'ภาพรวมของระบบ' },
  { id: 'auth', title: 'Authentication' },
  { id: 'models', title: 'ข้อมูลโครงสร้าง (Data Models)' },
  { id: 'endpoints-user', title: 'API – การจัดการผู้ใช้' },
  { id: 'endpoints-transaction', title: 'API – การจัดการธุรกรรม' },
  { id: 'status-codes', title: 'HTTP Status Codes' },
  { id: 'errors', title: 'ข้อผิดพลาดทั่วไป' },
  { id: 'examples', title: 'ตัวอย่างการใช้งาน' },
  { id: 'notes', title: 'หมายเหตุ' },
]

export default function ApiDocsPage() {
  const header = useMemo(
    () => (
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold">
          API Documentation – ระบบจัดการธุรกรรม
        </h1>
        <div className="flex items-center gap-2">
          <a
            href="#"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-3 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-sm"
          >
            ไปบนสุด
          </a>
          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-sm"
          >
            พิมพ์/บันทึก PDF
          </button>
        </div>
      </div>
    ),
    []
  )

  const authHeader = 'Authorization: Bearer <your_jwt_token>'

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 text-zinc-900 dark:text-zinc-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          {header}
          <p className="mt-2 opacity-70">
            เอกสาร API สำหรับระบบผู้ใช้ กระเป๋าเงิน และธุรกรรมทางการเงิน (TH).
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
          {/* Sidebar */}
          <aside className=" h-max">
            <nav className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur p-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide opacity-60 px-2">
                สารบัญ
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="block px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Content */}
          <main className="space-y-10">
            {/* Overview */}
            <section id="overview" className="scroll-mt-24">
              <h2 className="text-xl font-semibold mb-2">ภาพรวมของระบบ</h2>
              <p className="opacity-90">
                ระบบ API
                นี้เป็นระบบจัดการธุรกรรมทางการเงินที่ให้ผู้ใช้สามารถสร้างบัญชี
                เข้าสู่ระบบ และจัดการธุรกรรมได้ ครอบคลุม 3 ส่วนหลัก:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>
                  <b>User Management</b>: จัดการผู้ใช้และการยืนยันตัวตน
                </li>
                <li>
                  <b>Wallet Management</b>: จัดการกระเป๋าเงิน
                </li>
                <li>
                  <b>Transaction Management</b>: จัดการธุรกรรมทางการเงิน
                </li>
              </ul>
            </section>

            {/* Auth */}
            <section id="auth" className="scroll-mt-24">
              <h2 className="text-xl font-semibold mb-2">Authentication</h2>
              <p className="opacity-90">
                ระบบใช้ JWT Token สำหรับการยืนยันตัวตน โดยต้องส่ง Token ใน
                Header ของทุกคำขอที่ต้องการความปลอดภัย
              </p>
              <CodeBlock lang="text" code={authHeader} />
            </section>

            {/* Models */}
            <section id="models" className="scroll-mt-24">
              <h2 className="text-xl font-semibold mb-2">
                ข้อมูลโครงสร้าง (Data Models)
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">User</h3>
                  <CodeBlock
                    lang="ts"
                    code={`{
  uuid: string,        // UUID ของผู้ใช้
  name: string,        // ชื่อผู้ใช้ (ไม่ซ้ำ)
  password: string,    // รหัสผ่าน (เข้ารหัสด้วย argon2)
  createdAt: Date,     // วันที่สร้าง
  updatedAt: Date      // วันที่อัปเดต
}`}
                  />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Wallet</h3>
                  <CodeBlock
                    lang="ts"
                    code={`{
  uuid: string,        // UUID ของกระเป๋าเงิน
  owner: string,       // UUID ของเจ้าของ
  name: string,        // ชื่อกระเป๋าเงิน
  desc?: string,       // คำอธิบาย (ไม่บังคับ)
  createdAt: Date,     // วันที่สร้าง
  updatedAt: Date      // วันที่อัปเดต
}`}
                  />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Transaction</h3>
                  <CodeBlock
                    lang="ts"
                    code={`{
  uuid: string,        // UUID ของธุรกรรม
  wallet: string,      // UUID ของกระเป๋าเงิน
  name: string,        // ชื่อธุรกรรม
  desc?: string,       // คำอธิบาย (ไม่บังคับ)
  amount: number,      // จำนวนเงิน (ไม่ติดลบ)
  type: -1 | 1,        // ประเภท: -1 = รายจ่าย, 1 = รายรับ
  date?: Date,         // วันที่ธุรกรรม (ไม่บังคับ)
  createdAt: Date,     // วันที่สร้าง
  updatedAt: Date      // วันที่อัปเดต
}`}
                  />
                </div>
              </div>
            </section>

            {/* Endpoints: User */}
            <section id="endpoints-user" className="scroll-mt-24">
              <h2 className="text-xl font-semibold mb-2">
                API – การจัดการผู้ใช้ (User Management)
              </h2>
              <div className="space-y-6">
                {/* Register */}
                <article>
                  <h3 className="font-medium">
                    1.1 สร้างผู้ใช้ใหม่ –{' '}
                    <span className="font-mono">POST /api/auth/register</span>
                  </h3>
                  <p className="opacity-90">
                    สร้างผู้ใช้ใหม่และกระเป๋าเงินเริ่มต้น
                  </p>
                  <h4 className="mt-2 text-sm font-semibold opacity-70">
                    Request Body
                  </h4>
                  <CodeBlock
                    lang="json"
                    code={`{
  "name": "username",
  "first_name":"John",
  "last_name":"Doe",
  "password": "password123"
}`}
                  />
                  <h4 className="mt-2 text-sm font-semibold opacity-70">
                    Response – 201 Created
                  </h4>
                  <CodeBlock
                    lang="json"
                    code={`{
  "success": true,
  "message": "Create user successfully!"
}`}
                  />
                  <details className="mt-2">
                    <summary className="cursor-pointer opacity-90">
                      ข้อผิดพลาดที่เป็นไปได้
                    </summary>
                    <div className="mt-2 space-y-2">
                      <CodeBlock
                        lang="json"
                        fileName="400 Bad Request"
                        code={`{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": ["Name is required"],
    "password": ["Password must be at least 6 characters"]
  }
}`}
                      />
                      <CodeBlock
                        lang="json"
                        fileName="409 Conflict"
                        code={`{
  "success": false,
  "message": "Name already exists"
}`}
                      />
                    </div>
                  </details>
                </article>

                {/* Login */}
                <article>
                  <h3 className="font-medium">
                    1.2 เข้าสู่ระบบ –{' '}
                    <span className="font-mono">POST /api/auth/login</span>
                  </h3>
                  <p className="opacity-90">เข้าสู่ระบบและรับ JWT Token</p>
                  <h4 className="mt-2 text-sm font-semibold opacity-70">
                    Request Body
                  </h4>
                  <CodeBlock
                    lang="json"
                    code={`{
  "name": "username",
  "password": "password123"
}`}
                  />
                  <h4 className="mt-2 text-sm font-semibold opacity-70">
                    Response – 200 OK
                  </h4>
                  <CodeBlock
                    lang="json"
                    code={`{
  "success": true,
  "message": "login successfully!",
  "data": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "auth": { ...user }
  }
}`}
                  />
                  <details className="mt-2">
                    <summary className="cursor-pointer opacity-90">
                      ข้อผิดพลาดที่เป็นไปได้
                    </summary>
                    <div className="mt-2 space-y-2">
                      <CodeBlock
                        lang="json"
                        fileName="400 Bad Request"
                        code={`{
  "success": false,
  "message": "Missing credentials"
}`}
                      />
                      <CodeBlock
                        lang="json"
                        fileName="404 Not Found"
                        code={`{
  "success": false,
  "message": "user not found"
}`}
                      />
                      <CodeBlock
                        lang="json"
                        fileName="401 Unauthorized"
                        code={`{
  "success": false,
  "message": "Invalid credentials"
}`}
                      />
                    </div>
                  </details>
                </article>
              </div>
            </section>

            {/* Endpoints: Transaction */}
            <section id="endpoints-transaction" className="scroll-mt-24">
              <h2 className="text-xl font-semibold mb-2">
                API – การจัดการธุรกรรม (Transaction Management)
              </h2>
              <div className="space-y-8">
                {/* Create */}
                <article>
                  <h3 className="font-medium">
                    2.1 สร้างธุรกรรมใหม่ –{' '}
                    <span className="font-mono">POST /api/transaction</span>
                  </h3>
                  <p className="opacity-90">สร้างธุรกรรมใหม่ (ต้องล็อกอิน)</p>
                  <CodeBlock
                    lang="text"
                    fileName="Headers"
                    code={'Authorization: Bearer <jwt_token>'}
                  />
                  <h4 className="mt-2 text-sm font-semibold opacity-70">
                    Request Body
                  </h4>
                  <CodeBlock
                    lang="json"
                    code={`{
  "name": "ซื้อของ",
  "desc": "ซื้อของใช้ในบ้าน",
  "amount": 500,
  "type": -1,
  "date": "2024-01-15"
}`}
                  />
                  <h4 className="mt-2 text-sm font-semibold opacity-70">
                    Response – 201 Created
                  </h4>
                  <CodeBlock
                    lang="json"
                    code={`{
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
}`}
                  />
                  <details className="mt-2">
                    <summary className="cursor-pointer opacity-90">
                      ข้อผิดพลาดที่เป็นไปได้
                    </summary>
                    <div className="mt-2 space-y-2">
                      <CodeBlock
                        lang="json"
                        fileName="401 Unauthorized"
                        code={`{
  "success": false,
  "message": "Unauthorized"
}`}
                      />
                      <CodeBlock
                        lang="json"
                        fileName="404 Not Found"
                        code={`{
  "success": false,
  "message": "Wallet not found"
}`}
                      />
                      <CodeBlock
                        lang="json"
                        fileName="400 Bad Request"
                        code={`{
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
}`}
                      />
                    </div>
                  </details>
                </article>

                {/* List */}
                <article>
                  <h3 className="font-medium">
                    2.2 ดูธุรกรรมทั้งหมด –{' '}
                    <span className="font-mono">GET /api/transaction</span>
                  </h3>
                  <CodeBlock
                    lang="text"
                    fileName="Headers"
                    code={'Authorization: Bearer <jwt_token>'}
                  />
                  <div className="mt-2 text-sm">
                    <p className="opacity-90">
                      <b>Query Parameters</b>
                    </p>
                    <ul className="list-disc ml-6 mt-1">
                      <li>
                        <code>page</code> (optional): หมายเลขหน้า (ค่าเริ่มต้น:
                        1)
                      </li>
                      <li>
                        <code>limit</code> (optional): จำนวนต่อหน้า
                        (ค่าเริ่มต้น: 10)
                      </li>
                    </ul>
                  </div>
                  <CodeBlock
                    lang="text"
                    fileName="ตัวอย่าง URL"
                    code={`GET /api/transaction?page=1&limit=5`}
                  />
                  <h4 className="mt-2 text-sm font-semibold opacity-70">
                    Response – 200 OK
                  </h4>
                  <CodeBlock
                    lang="json"
                    code={`{
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
}`}
                  />
                </article>

                {/* Get by ID */}
                <article>
                  <h3 className="font-medium">
                    2.3 ดูธุรกรรมแบบระบุ ID –{' '}
                    <span className="font-mono">GET /api/transaction/[id]</span>
                  </h3>
                  <CodeBlock
                    lang="text"
                    fileName="Headers"
                    code={'Authorization: Bearer <jwt_token>'}
                  />
                  <CodeBlock
                    lang="text"
                    fileName="ตัวอย่าง"
                    code={`GET /api/transaction/550e8400-e29b-41d4-a716-446655440000`}
                  />
                  <h4 className="mt-2 text-sm font-semibold opacity-70">
                    Response – 200 OK
                  </h4>
                  <CodeBlock
                    lang="json"
                    code={`{
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
}`}
                  />
                  <CodeBlock
                    lang="json"
                    fileName="404 Not Found"
                    code={`{
  "success": false,
  "message": "Transaction not found"
}`}
                  />
                </article>

                {/* Update */}
                <article>
                  <h3 className="font-medium">
                    2.4 แก้ไขธุรกรรม –{' '}
                    <span className="font-mono">PUT /api/transaction/[id]</span>
                  </h3>
                  <CodeBlock
                    lang="text"
                    fileName="Headers"
                    code={'Authorization: Bearer <jwt_token>'}
                  />
                  <h4 className="mt-2 text-sm font-semibold opacity-70">
                    Request Body
                  </h4>
                  <CodeBlock
                    lang="json"
                    code={`{
  "name": "ค่าอาหารเที่ยง",
  "desc": "ข้าวกล่องที่ออฟฟิศ",
  "amount": 80,
  "type": -1
}`}
                  />
                  <h4 className="mt-2 text-sm font-semibold opacity-70">
                    Response – 200 OK
                  </h4>
                  <CodeBlock
                    lang="json"
                    code={`{
  "success": true,
  "message": "Transaction updated successfully",
  "data": {
    "name": "ค่าอาหารเที่ยง",
    "desc": "ข้าวกล่องที่ออฟฟิศ",
    "amount": 80,
    "type": -1,
    "updatedAt": "2024-01-16T14:30:00.000Z"
  }
}`}
                  />
                  <details className="mt-2">
                    <summary className="cursor-pointer opacity-90">
                      ข้อผิดพลาดที่เป็นไปได้
                    </summary>
                    <div className="mt-2 space-y-2">
                      <CodeBlock
                        lang="json"
                        fileName="404 Not Found"
                        code={`{
  "success": false,
  "message": "Transaction not found"
}`}
                      />
                      <CodeBlock
                        lang="json"
                        fileName="400 Bad Request"
                        code={`{
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
}`}
                      />
                    </div>
                  </details>
                </article>

                {/* Delete */}
                <article>
                  <h3 className="font-medium">
                    2.5 ลบธุรกรรม –{' '}
                    <span className="font-mono">
                      DELETE /api/transaction/[id]
                    </span>
                  </h3>
                  <CodeBlock
                    lang="text"
                    fileName="Headers"
                    code={'Authorization: Bearer <jwt_token>'}
                  />
                  <CodeBlock
                    lang="text"
                    fileName="ตัวอย่าง"
                    code={`DELETE /api/transaction/550e8400-e29b-41d4-a716-446655440000`}
                  />
                  <h4 className="mt-2 text-sm font-semibold opacity-70">
                    Response – 200 OK
                  </h4>
                  <CodeBlock
                    lang="json"
                    code={`{
  "success": true,
  "message": "Transaction deleted successfully",
  "data": null
}`}
                  />
                  <CodeBlock
                    lang="json"
                    fileName="404 Not Found"
                    code={`{
  "success": false,
  "message": "Transaction not found"
}`}
                  />
                </article>
              </div>
            </section>

            {/* HTTP Status Codes */}
            <section id="status-codes" className="scroll-mt-24">
              <h2 className="text-xl font-semibold mb-2">HTTP Status Codes</h2>
              <div className="overflow-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <table className="w-full text-sm">
                  <thead className="text-left border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-3 py-2">Code</th>
                      <th className="px-3 py-2">ความหมาย</th>
                      <th className="px-3 py-2">การใช้งาน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      [200, 'OK', 'คำขอสำเร็จ'],
                      [201, 'Created', 'สร้างข้อมูลสำเร็จ'],
                      [400, 'Bad Request', 'ข้อมูลไม่ถูกต้องหรือไม่ครบ'],
                      [
                        401,
                        'Unauthorized',
                        'ไม่ได้ยืนยันตัวตนหรือ Token หมดอายุ',
                      ],
                      [404, 'Not Found', 'ไม่พบข้อมูลที่ต้องการ'],
                      [409, 'Conflict', 'ข้อมูลซ้ำ (เช่น ชื่อผู้ใช้ซ้ำ)'],
                      [
                        500,
                        'Internal Server Error',
                        'ข้อผิดพลาดของเซิร์ฟเวอร์',
                      ],
                    ].map(([code, name, use]) => (
                      <tr
                        key={code}
                        className="border-t border-zinc-200 dark:border-zinc-800"
                      >
                        <td className="px-3 py-2 font-mono">
                          {code as number}
                        </td>
                        <td className="px-3 py-2">{name as string}</td>
                        <td className="px-3 py-2 opacity-90">
                          {use as string}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Common Errors */}
            <section id="errors" className="scroll-mt-24">
              <h2 className="text-xl font-semibold mb-2">
                ข้อผิดพลาดทั่วไป (Common Errors)
              </h2>
              <div className="space-y-4">
                <article>
                  <h3 className="font-medium">
                    1) Token หมดอายุหรือไม่ถูกต้อง
                  </h3>
                  <CodeBlock
                    lang="json"
                    code={`{
  "success": false,
  "message": "Unauthorized"
}`}
                  />
                  <p className="text-sm opacity-90">
                    แก้ไข: ทำการล็อกอินใหม่เพื่อรับ Token ใหม่
                  </p>
                </article>
                <article>
                  <h3 className="font-medium">2) ข้อมูลไม่ถูกต้อง</h3>
                  <CodeBlock
                    lang="json"
                    code={`{
  "success": false,
  "message": "Invalid transaction data",
  "error": [...]
}`}
                  />
                  <p className="text-sm opacity-90">
                    แก้ไข: ตรวจสอบข้อมูลที่ส่งให้ตรงกับรูปแบบที่กำหนด
                  </p>
                </article>
                <article>
                  <h3 className="font-medium">3) ไม่พบกระเป๋าเงิน</h3>
                  <CodeBlock
                    lang="json"
                    code={`{
  "success": false,
  "message": "Wallet not found"
}`}
                  />
                  <p className="text-sm opacity-90">
                    แก้ไข: ตรวจสอบว่าผู้ใช้มีกระเป๋าเงิน
                    (สร้างอัตโนมัติเมื่อสมัครสมาชิก)
                  </p>
                </article>
              </div>
            </section>

            {/* Examples */}
            <section id="examples" className="scroll-mt-24">
              <h2 className="text-xl font-semibold mb-2">ตัวอย่างการใช้งาน</h2>
              <div className="space-y-6">
                <article>
                  <h3 className="font-medium">JavaScript/TypeScript</h3>
                  <CodeBlock
                    lang="js"
                    code={`// ล็อกอิน
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'testuser', password: 'password123' })
});

const loginData = await loginResponse.json();
const token = loginData.data.access;

// สร้างธุรกรรม
const transactionResponse = await fetch('/api/transaction', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \$\{token\}\`
  },
  body: JSON.stringify({ name: 'ค่าอาหาร', desc: 'อาหารเที่ยง', amount: 120, type: -1 })
});

const transactionData = await transactionResponse.json();`}
                  />
                </article>
                <article>
                  <h3 className="font-medium">cURL</h3>
                  <CodeBlock
                    lang="bash"
                    code={`# ล็อกอิน
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"testuser","password":"password123"}'

# สร้างธุรกรรม
curl -X POST http://localhost:3000/api/transaction \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name":"ค่าอาหาร","amount":120,"type":-1}'`}
                  />
                </article>
              </div>
            </section>

            {/* Notes */}
            <section id="notes" className="scroll-mt-24">
              <h2 className="text-xl font-semibold mb-2">หมายเหตุ</h2>
              <ul className="list-disc ml-6 space-y-1">
                <li>
                  <b>ความปลอดภัย</b>: รหัสผ่านถูกเข้ารหัสด้วย{' '}
                  <code>argon2</code> ก่อนบันทึก
                </li>
                <li>
                  <b>UUID</b>: ใช้สำหรับทุก Entity
                  เพื่อความปลอดภัยและคาดเดาไม่ได้
                </li>
                <li>
                  <b>การแบ่งหน้า</b>: รองรับการดึงรายการธุรกรรมแบบแบ่งหน้า
                </li>
                <li>
                  <b>วันที่</b>: เรียงธุรกรรมตามเวลาสร้างล่าสุดก่อน
                </li>
                <li>
                  <b>ประเภทธุรกรรม</b>: <code>-1</code> รายจ่าย, <code>1</code>{' '}
                  รายรับ
                </li>
                <li>
                  <b>Environment</b>: โหมด development แสดงรายละเอียด error
                  เพิ่มเติม
                </li>
              </ul>
            </section>

            <footer className="pt-8 text-xs opacity-60">
              © {new Date().getFullYear()}{' '}
              <a
                href="https://github.com/Apisit250aps/transactions.git"
                target="_blank"
                rel="noopener noreferrer"
              >
                Transactions API Docs • 
              </a>
              <a href="https://github.com/Apisit250aps" target="_blank" rel="noopener noreferrer"> Apisit Saithong</a>
              <a href="https://github.com/Apisit250aps/SavingQuests.git" target="_blank" rel="noopener noreferrer"> • Saving Quest</a>
            </footer>
          </main>
        </div>
      </div>
    </div>
  )
}
