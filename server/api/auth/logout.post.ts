export default defineEventHandler(async () => {
  try {
    // In production, invalidate the JWT token or session
    // For now, just return success
    
    return {
      success: true,
      message: 'خروج موفقیت‌آمیز بود'
    }
    
  } catch (error: any) {
    console.error('Logout API Error:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'خطا در خروج',
      data: { message: 'متأسفانه مشکلی در فرآیند خروج پیش آمده است' }
    })
  }
})