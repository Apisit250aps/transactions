type ApiResponse<T = unknown> = {
  success: boolean
  message: string
  data?: T
  error?: unknown
}

type Token = {
  access: string
}
