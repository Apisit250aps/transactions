import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { TokenPayload } from './jwt'

const JWT_SECRET = process.env.JWT_SECRET ?? ''
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set')
}

export type Auth = {
  id: string
  name: string
}

export async function getAuth(request: NextRequest): Promise<Auth | null> {
  const authHeader = request.headers.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.split(' ')[1]

  try {
    const auth = jwt.verify(token, JWT_SECRET) as TokenPayload
    return {
      id: auth.sub,
      name: auth.name,
    }
  } catch (error) {
    console.log(error)
    return null
  }
}
