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
    
    const { email, password } = body
    
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
    
    // Mock authentication - in production, verify against database
    if (email === 'demo@example.com' && password === 'password123') {
      const user = {
        id: '1',
        email: 'demo@example.com',
        name: 'کاربر نمونه',
        avatar: '',
        roles: ['user'],
        permissions: ['read_posts', 'write_comments'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        isActive: true
      }
      
      const token = generateJWT(user.id) // Mock JWT generation
      
      return {
        success: true,
        user,
        token,
        message: 'ورود موفقیت‌آمیز بود'
      }
    }
    
    throw createError({
      statusCode: 401,
      statusMessage: 'اطلاعات ورود نادرست است',
      data: { message: 'ایمیل یا رمز عبور اشتباه است' }
    })
    
  } catch (error: any) {
    console.error('Login API Error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'خطا در ورود',
      data: { message: 'متأسفانه مشکلی در فرآیند ورود پیش آمده است' }
    })
  }
})

// Mock JWT generation - in production, use proper JWT library
function generateJWT(userId: string): string {
  return `mock_jwt_token_for_user_${userId}_${Date.now()}`
}