import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { db } from './libs/client'
import argon2 from 'argon2'

// users model 
export const UserSchema = z.object({
  uuid: z.uuid().default(uuidv4),
  name: z.string().min(1, 'Name is required'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .transform(async (plain) => {
      return await argon2.hash(plain, { type: argon2.argon2id })
    }),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
})
// wallets model
export const WalletSchema = z.object({
  uuid: z.uuid().default(uuidv4),
  owner: z.uuid(),
  name: z.string().min(1, 'Name is required'),
  desc: z.string().optional(),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
})
// transactions model
export const TransactionSchema = z.object({
  uuid: z.string().uuid().default(uuidv4),
  wallet: z.uuid(),
  name: z.string().min(1, 'Name is required'),
  desc: z.string().optional(),
  amount: z.number().min(0, 'Amount must be non-negative'),
  type: z.union([z.literal(-1), z.literal(1)]),
  date: z.coerce.date().optional(),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
})


export const UpdateTransactionSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  desc: z.string().optional(),
  amount: z.number().min(0, 'Amount must be non-negative').optional(),
  type: z.union([z.literal(-1), z.literal(1)]).optional(),
  date: z.coerce.date().optional(),
  updatedAt: z.coerce.date().default(() => new Date()),
})

// model types
export type User = z.infer<typeof UserSchema>
export type Wallet = z.infer<typeof WalletSchema>
export type Transaction = z.infer<typeof TransactionSchema>
// model collections
export const users = db.collection<User>('users')
export const wallets = db.collection<Wallet>('wallets')
export const transactions = db.collection<Transaction>('transactions')
