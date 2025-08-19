import { signToken } from '@/libs/jwt'
import { omit } from '@/libs/utils'
import { users, UserSchema, wallets, WalletSchema } from '@/models'
import argon2 from 'argon2'
import { NextRequest, NextResponse } from 'next/server'

export async function CreateUser(
  req: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await req.json()

    const userParsed = await UserSchema.safeParseAsync(body)
    if (!userParsed.success) {
      const { fieldErrors } = userParsed.error.flatten()
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: fieldErrors },
        { status: 400 }
      )
    }

    const walletParsed = await WalletSchema.safeParseAsync({
      owner: userParsed.data.uuid,
      name: 'default',
    })
    if (!walletParsed.success) {
      const { fieldErrors } = walletParsed.error.flatten()
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: fieldErrors },
        { status: 400 }
      )
    }

    const unique = await users.findOne({ name: userParsed.data.name })
    if (unique) {
      return NextResponse.json(
        {
          success: false,
          message: 'Name already exists',
        },
        { status: 409 }
      )
    }

    await Promise.all([
      users.insertOne(userParsed.data),
      wallets.insertOne(walletParsed.data),
    ])

    return NextResponse.json(
      { success: true, message: 'Create user successfully!' },
      {
        status: 201,
      }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Server error!',
        error: error,
      },
      {
        status: 500,
      }
    )
  }
}

export async function UserLogin(
  req: NextRequest
): Promise<NextResponse<ApiResponse<Token>>> {
  try {
    const { name, password } = await req.json()
    if (!name || !password) {
      return NextResponse.json(
        { success: false, message: 'Missing credentials' },
        { status: 400 }
      )
    }
    const user = await users.findOne({ name })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'user not found',
        },
        { status: 404 }
      )
    }

    const isValid = await argon2.verify(user.password, password)
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = signToken({ sub: user.uuid, name: user.name })
    const auth = omit(user, ['password', '_id'])

    return NextResponse.json({
      success: true,
      message: 'login successfully!',
      data: {
        access: token,
        auth,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Server error!',
        error: error,
      },
      {
        status: 500,
      }
    )
  }
}
