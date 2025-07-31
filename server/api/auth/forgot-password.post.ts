import { validateEmail } from '../../../utils/validation'

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
    
    const { email } = body
    
    // Validate email
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ایمیل نامعتبر است',
        data: { message: emailValidation.errors.join(', ') }
      })
    }
    
    // Mock password reset request - in production, generate reset token and send email
    // Always return success for security (don't reveal if email exists)
    
    return {
      success: true,
      message: 'اگر ایمیل شما در سیستم موجود باشد، لینک بازنشانی رمز عبور ارسال خواهد شد'
    }
    
  } catch (error: any) {
    console.error('Forgot password API Error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'خطا در درخواست بازنشانی رمز عبور',
      data: { message: 'متأسفانه مشکلی در درخواست بازنشانی رمز عبور پیش آمده است' }
    })
  }
})