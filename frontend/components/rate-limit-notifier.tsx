'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface RateLimitError {
  id: number
  service: string
  model: string
  error_message: string
  reset_time: string | null
  retry_after_seconds: number | null
  occurred_at: string
}

/**
 * Rate Limit Notifier Component
 * Polls for rate limit errors and displays toast notifications
 */
export function RateLimitNotifier() {
  const [lastCheckedId, setLastCheckedId] = useState<number>(0)

  useEffect(() => {
    // Check for new rate limit errors every 30 seconds
    const checkForErrors = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1002'
        const response = await fetch(`${API_BASE_URL}/api/errors/rate-limits`)

        if (!response.ok) {
          return
        }

        const errors: RateLimitError[] = await response.json()

        // Find new errors (with ID > lastCheckedId)
        const newErrors = errors.filter((error) => error.id > lastCheckedId)

        // Display toast for each new error
        newErrors.forEach((error) => {
          const resetTime = error.reset_time
            ? new Date(error.reset_time).toLocaleTimeString()
            : 'Unknown'

          const retryIn = error.retry_after_seconds
            ? `${error.retry_after_seconds} seconds`
            : 'Unknown'

          toast.error(`Rate Limit Exceeded: ${error.service}`, {
            description: (
              <div className="space-y-1">
                <p className="font-medium">Model: {error.model}</p>
                <p className="text-sm">Reset Time: {resetTime}</p>
                <p className="text-sm">Retry After: {retryIn}</p>
                <p className="text-xs text-gray-500 mt-2">{error.error_message}</p>
              </div>
            ),
            duration: 10000, // Show for 10 seconds
          })
        })

        // Update last checked ID
        if (errors.length > 0) {
          const maxId = Math.max(...errors.map((e) => e.id))
          setLastCheckedId(maxId)
        }
      } catch (error) {
        // Silently fail - don't spam console
      }
    }

    // Check immediately on mount
    checkForErrors()

    // Then check every 30 seconds
    const interval = setInterval(checkForErrors, 30000)

    return () => clearInterval(interval)
  }, [lastCheckedId])

  // This component doesn't render anything visible
  return null
}
