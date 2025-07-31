import { validateStringLength } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    if (!body) {
      throw createError({
        statusCode: 400,
        statusMessage: 'درخواست نامعتبر است',
        data: { message: 'بدنه درخواست خالی است' }
      })
    }
    
    const { token, newPassword } = body
    
    // Validate token
    const tokenValidation = validateStringLength(token, 10, 200, 'توکن بازنشانی')
    if (!tokenValidation.isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'توکن بازنشانی نامعتبر است',
        data: { message: tokenValidation.errors.join(', ') }
      })
    }
    
    // Validate new password
    const passwordValidation = validateStringLength(newPassword, 6, 100, 'رمز عبور جدید')
    if (!passwordValidation.isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'رمز عبور جدید نامعتبر است',
        data: { message: passwordValidation.errors.join(', ') }
      })
    }
    
    // Mock token verification and password reset - in production, verify token and update password
    if (!token.startsWith('reset_token_')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'توکن بازنشانی نامعتبر یا منقضی شده است',
        data: { message: 'لینک بازنشانی رمز عبور نامعتبر یا منقضی شده است' }
      })
    }
    
    return {
      success: true,
      message: 'رمز عبور با موفقیت بازنشانی شد'
    }
    
  } catch (error: any) {
    console.error('Reset password API Error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'خطا در بازنشانی رمز عبور',
      data: { message: 'متأسفانه مشکلی در بازنشانی رمز عبور پیش آمده است' }
    })
  }
})