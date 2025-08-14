import { getAuth } from '@/libs/auth'
import {
  TransactionSchema,
  wallets,
  transactions,
  Transaction,
  UpdateTransactionSchema,
} from '@/models'
import { NextRequest, NextResponse } from 'next/server'

// CREATE - สร้าง transaction ใหม่
export async function CreateTransaction(
  req: NextRequest
): Promise<NextResponse<ApiResponse<Transaction>>> {
  try {
    const auth = await getAuth(req)

    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const wallet = await wallets.findOne({ owner: auth.id })

    if (!wallet) {
      return NextResponse.json(
        {
          success: false,
          message: 'Wallet not found',
        },
        { status: 404 }
      )
    }

    const body = await req.json()

    const transactionParsed = await TransactionSchema.safeParseAsync({
      wallet: wallet.uuid,
      ...body,
    })

    if (!transactionParsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid transaction data',
          error: transactionParsed.error.issues,
        },
        { status: 400 }
      )
    }

    await transactions.insertOne({
      ...transactionParsed.data,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Transaction created successfully',
        data: transactionParsed.data,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating transaction:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}

// READ - อ่าน transaction ทั้งหมดของ user
export async function GetTransactions(
  req: NextRequest
): Promise<NextResponse<ApiResponse<Transaction[]>>> {
  try {
    const auth = await getAuth(req)

    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const wallet = await wallets.findOne({ owner: auth.id })

    if (!wallet) {
      return NextResponse.json(
        {
          success: false,
          message: 'Wallet not found',
        },
        { status: 404 }
      )
    }

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const userTransactions = await transactions
      .find({ wallet: wallet.uuid })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const totalTransactions = await transactions.countDocuments({
      wallet: wallet.uuid,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Transactions retrieved successfully',
        data: userTransactions,
        meta: {
          page,
          limit,
          total: totalTransactions,
          totalPages: Math.ceil(totalTransactions / limit),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching transactions:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}

// READ - อ่าน transaction เดียวโดย ID
export async function GetTransactionById(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Transaction>>> {
  try {
    const auth = await getAuth(req)

    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const wallet = await wallets.findOne({ owner: auth.id })

    if (!wallet) {
      return NextResponse.json(
        {
          success: false,
          message: 'Wallet not found',
        },
        { status: 404 }
      )
    }
    const id = (await params).id
    const transaction = await transactions.findOne({
      uuid: id,
      wallet: wallet.uuid,
    })

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          message: 'Transaction not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Transaction retrieved successfully',
        data: transaction,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching transaction:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}

// UPDATE - อัปเดต transaction
export async function UpdateTransaction(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Transaction>>> {
  try {
    const auth = await getAuth(req)

    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      )
    }
    const id = (await params).id
    const existingTransaction = await transactions.findOne({
      uuid: id,
    })

    if (!existingTransaction) {
      return NextResponse.json(
        {
          success: false,
          message: 'Transaction not found',
        },
        { status: 404 }
      )
    }

    const body = await req.json()

    const transactionParsed = await UpdateTransactionSchema.safeParseAsync({
      ...body,
    })

    if (!transactionParsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid transaction data',
          error: transactionParsed.error.issues,
        },
        { status: 400 }
      )
    }

    await transactions.updateOne(
      { uuid: id },
      {
        $set: {
          ...transactionParsed.data,
          updatedAt: new Date(),
        },
      }
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Transaction updated successfully',
        data: transactionParsed.data as Transaction,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating transaction:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}

// DELETE - ลบ transaction
export async function DeleteTransaction(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const auth = await getAuth(req)

    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const wallet = await wallets.findOne({ owner: auth.id })

    if (!wallet) {
      return NextResponse.json(
        {
          success: false,
          message: 'Wallet not found',
        },
        { status: 404 }
      )
    }
    const id = (await params).id
    const existingTransaction = await transactions.findOne({
      uuid: id,
      wallet: wallet.uuid,
    })

    if (!existingTransaction) {
      return NextResponse.json(
        {
          success: false,
          message: 'Transaction not found',
        },
        { status: 404 }
      )
    }

    await transactions.deleteOne({
      uuid: id,
      wallet: wallet.uuid,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Transaction deleted successfully',
        data: null,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting transaction:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}
