import { users, UserSchema, wallets, WalletSchema } from '@/models'
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
