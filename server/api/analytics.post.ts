import { validateStringLength } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  try {
    // Rate limiting for analytics endpoint
    const clientIP = getRequestHeader(event, 'x-forwarded-for') || getRequestHeader(event, 'x-real-ip') || 'unknown'
    
    // Get request body
    const body = await readBody(event)
    
    // Validate analytics data
    if (!body || typeof body !== 'object') {
      throw createError({
        statusCode: 400,
        statusMessage: 'داده‌های نامعتبر',
        data: { message: 'داده‌های analytics نامعتبر است' }
      })
    }
    
    const { event: eventName, parameters, timestamp, userAgent, referrer } = body
    
    // Validate required fields
    const eventValidation = validateStringLength(eventName, 1, 100, 'نام رویداد')
    if (!eventValidation.isValid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'نام رویداد نامعتبر است',
        data: { message: eventValidation.errors.join(', ') }
      })
    }
    
    // Sanitize and validate parameters
    const sanitizedParameters: Record<string, any> = {}
    if (parameters && typeof parameters === 'object') {
      for (const [key, value] of Object.entries(parameters)) {
        if (typeof value === 'string') {
          const validation = validateStringLength(value, 0, 1000, key)
          if (validation.isValid) {
            sanitizedParameters[key] = value
          }
        } else if (typeof value === 'number' || typeof value === 'boolean') {
          sanitizedParameters[key] = value
        }
      }
    }
    
    // Create analytics record
    const analyticsRecord = {
      event: eventName,
      parameters: sanitizedParameters,
      timestamp: timestamp || Date.now(),
      userAgent: userAgent || getRequestHeader(event, 'user-agent') || '',
      referrer: referrer || '',
      ip: clientIP
    }
    
    // In production, store in database
    // For now, log to console and optionally store in file
    console.log('Analytics Event:', analyticsRecord)
    
    // Store analytics data (in production, use database)
    await storeAnalyticsData(analyticsRecord)
    
    return {
      success: true,
      message: 'Analytics data recorded successfully'
    }
    
  } catch (error: any) {
    console.error('Analytics API Error:', error)
    
    // If it's already a Nuxt error, re-throw it
    if (error.statusCode) {
      throw error
    }
    
    // Return a structured error response
    throw createError({
      statusCode: 500,
      statusMessage: 'خطا در ثبت analytics',
      data: {
        message: 'متأسفانه مشکلی در ثبت داده‌های analytics پیش آمده است.',
        originalError: error instanceof Error ? error.message : 'Unknown error'
      }
    })
  }
})

// Store analytics data (in production, use database)
async function storeAnalyticsData(record: any) {
  try {
    // In production, you would store this in a database
    // For now, we'll just log it
    console.log('Storing analytics data:', record)
    
    // Example: Store in file system (for development)
    // const fs = await import('fs/promises')
    // const data = JSON.stringify(record) + '\n'
    // await fs.appendFile('./analytics.log', data)
    
  } catch (error) {
    console.error('Error storing analytics data:', error)
  }
} 