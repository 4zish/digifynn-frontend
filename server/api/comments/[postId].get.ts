import { validateStringLength } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  try {
    const postId = getRouterParam(event, 'postId')
    const query = getQuery(event)
    
    if (!postId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'شناسه مقاله ضروری است',
        data: { message: 'شناسه مقاله باید مشخص شود' }
      })
    }
    
    // Validate postId
    const postIdValidation = validateStringLength(postId, 1, 50, 'شناسه مقاله')
    if (!postIdValidation.isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'شناسه مقاله نامعتبر است',
        data: { message: postIdValidation.errors.join(', ') }
      })
    }
    
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10
    
    // Validate pagination
    if (page < 1 || limit < 1 || limit > 50) {
      throw createError({
        statusCode: 400,
        statusMessage: 'پارامترهای صفحه‌بندی نامعتبر است',
        data: { message: 'شماره صفحه و تعداد نتایج باید عدد مثبت باشد' }
      })
    }
    
    // Mock comments data - in production, fetch from database
    const mockComments = [
      {
        id: '1',
        content: 'مقاله بسیار مفیدی بود. ممنون از اشتراک‌گذاری',
        author: {
          id: '1',
          name: 'کاربر یک',
          email: 'user1@example.com',
          avatar: '',
          isActive: true
        },
        postId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isApproved: true,
        likes: 5
      },
      {
        id: '2',
        content: 'آیا می‌توانید در مورد این موضوع بیشتر توضیح دهید؟',
        author: {
          id: '2',
          name: 'کاربر دو',
          email: 'user2@example.com',
          avatar: '',
          isActive: true
        },
        postId,
        parentId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isApproved: true,
        likes: 2
      }
    ]
    
    return {
      success: true,
      comments: mockComments,
      total: mockComments.length,
      page,
      limit
    }
    
  } catch (error: any) {
    console.error('Comments fetch API Error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'خطا در بارگذاری نظرات',
      data: { message: 'متأسفانه مشکلی در بارگذاری نظرات پیش آمده است' }
    })
  }
})