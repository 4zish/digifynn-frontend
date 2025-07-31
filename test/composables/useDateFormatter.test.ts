import { describe, it, expect } from 'vitest'
import { useDateFormatter } from '~/composables/useDateFormatter'

describe('useDateFormatter', () => {
  const { formatDate, formatRelativeDate } = useDateFormatter()

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const result = formatDate('2024-01-15')
      expect(result).toBe('۱۵ ژانویه ۲۰۲۴')
    })

    it('should handle empty date string', () => {
      const result = formatDate('')
      expect(result).toBe('')
    })

    it('should handle null date string', () => {
      const result = formatDate(null as any)
      expect(result).toBe('')
    })

    it('should handle invalid date string', () => {
      const result = formatDate('invalid-date')
      expect(result).toBe('invalid-date')
    })

    it('should format date with custom locale', () => {
      const result = formatDate('2024-01-15', 'en-US')
      expect(result).toBe('January 15, 2024')
    })
  })

  describe('formatRelativeDate', () => {
    beforeEach(() => {
      // Mock current date to 2024-01-15
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-15'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return "امروز" for today', () => {
      const result = formatRelativeDate('2024-01-15')
      expect(result).toBe('امروز')
    })

    it('should return "دیروز" for yesterday', () => {
      const result = formatRelativeDate('2024-01-14')
      expect(result).toBe('دیروز')
    })

    it('should return days ago for recent dates', () => {
      const result = formatRelativeDate('2024-01-10')
      expect(result).toBe('۵ روز پیش')
    })

    it('should return weeks ago for dates within a month', () => {
      const result = formatRelativeDate('2024-01-01')
      expect(result).toBe('۲ هفته پیش')
    })

    it('should return months ago for dates within a year', () => {
      const result = formatRelativeDate('2023-12-01')
      expect(result).toBe('۱ ماه پیش')
    })

    it('should return formatted date for old dates', () => {
      const result = formatRelativeDate('2023-01-01')
      expect(result).toBe('۱ ژانویه ۲۰۲۳')
    })

    it('should handle invalid date string', () => {
      const result = formatRelativeDate('invalid-date')
      expect(result).toBe('invalid-date')
    })
  })
}) 