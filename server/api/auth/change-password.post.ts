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
    
    const { currentPassword, newPassword } = body
    
    // Validate current password
    const currentPasswordValidation = validateStringLength(currentPassword, 6, 100, 'رمز عبور فعلی')
    if (!currentPasswordValidation.isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'رمز عبور فعلی نامعتبر است',
        data: { message: currentPasswordValidation.errors.join(', ') }
      })
    }
    
    // Validate new password
    const newPasswordValidation = validateStringLength(newPassword, 6, 100, 'رمز عبور جدید')
    if (!newPasswordValidation.isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'رمز عبور جدید نامعتبر است',
        data: { message: newPasswordValidation.errors.join(', ') }
      })
    }
    
    // Check if new password is different from current
    if (currentPassword === newPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: 'رمز عبور جدید باید متفاوت باشد',
        data: { message: 'رمز عبور جدید نمی‌تواند مشابه رمز عبور فعلی باشد' }
      })
    }
    
    // Mock password verification and change - in production, verify current password and update in database
    if (currentPassword !== 'password123') {
      throw createError({
        statusCode: 401,
        statusMessage: 'رمز عبور فعلی اشتباه است',
        data: { message: 'رمز عبور فعلی که وارد کرده‌اید صحیح نیست' }
      })
    }
    
    return {
      success: true,
      message: 'رمز عبور با موفقیت تغییر یافت'
    }
    
  } catch (error: any) {
    console.error('Change password API Error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'خطا در تغییر رمز عبور',
      data: { message: 'متأسفانه مشکلی در تغییر رمز عبور پیش آمده است' }
    })
  }
})