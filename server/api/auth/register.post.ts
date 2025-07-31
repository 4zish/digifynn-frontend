import { validateStringLength, validateEmail } from '../../../utils/validation'

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
    
    const { email, password, name } = body
    
    // Validate email
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ایمیل نامعتبر است',
        data: { message: emailValidation.errors.join(', ') }
      })
    }
    
    // Validate password
    const passwordValidation = validateStringLength(password, 6, 100, 'رمز عبور')
    if (!passwordValidation.isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'رمز عبور نامعتبر است',
        data: { message: passwordValidation.errors.join(', ') }
      })
    }
    
    // Validate name
    const nameValidation = validateStringLength(name, 2, 50, 'نام')
    if (!nameValidation.isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'نام نامعتبر است',
        data: { message: nameValidation.errors.join(', ') }
      })
    }
    
    // Mock registration - in production, check if user exists and save to database
    if (email === 'demo@example.com') {
      throw createError({
        statusCode: 409,
        statusMessage: 'کاربر با این ایمیل وجود دارد',
        data: { message: 'حساب کاربری با این ایمیل قبلاً ثبت شده است' }
      })
    }
    
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      avatar: '',
      roles: ['user'],
      permissions: ['read_posts', 'write_comments'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    }
    
    const token = generateJWT(user.id)
    
    return {
      success: true,
      user,
      token,
      message: 'ثبت‌نام موفقیت‌آمیز بود'
    }
    
  } catch (error: any) {
    console.error('Register API Error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'خطا در ثبت‌نام',
      data: { message: 'متأسفانه مشکلی در فرآیند ثبت‌نام پیش آمده است' }
    })
  }
})

// Mock JWT generation - in production, use proper JWT library
function generateJWT(userId: string): string {
  return `mock_jwt_token_for_user_${userId}_${Date.now()}`
}