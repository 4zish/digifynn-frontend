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
    
    const { content, postId, parentId } = body
    
    // Validate content
    const contentValidation = validateStringLength(content, 10, 2000, 'محتوای نظر')
    if (!contentValidation.isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'محتوای نظر نامعتبر است',
        data: { message: contentValidation.errors.join(', ') }
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
    
    // Validate parentId if provided
    if (parentId) {
      const parentIdValidation = validateStringLength(parentId, 1, 50, 'شناسه نظر والد')
      if (!parentIdValidation.isValid) {
        throw createError({
          statusCode: 400,
          statusMessage: 'شناسه نظر والد نامعتبر است',
          data: { message: parentIdValidation.errors.join(', ') }
        })
      }
    }
    
    // Mock comment creation - in production, save to database
    const newComment = {
      id: Math.random().toString(36).substr(2, 9),
      content,
      author: {
        id: '1',
        name: 'کاربر نمونه',
        email: 'demo@example.com',
        avatar: '',
        isActive: true
      },
      postId,
      parentId: parentId || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isApproved: true,
      likes: 0
    }
    
    return {
      success: true,
      comment: newComment,
      message: 'نظر با موفقیت ثبت شد'
    }
    
  } catch (error: any) {
    console.error('Comment creation API Error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'خطا در ثبت نظر',
      data: { message: 'متأسفانه مشکلی در ثبت نظر پیش آمده است' }
    })
  }
})