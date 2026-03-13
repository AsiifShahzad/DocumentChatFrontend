import { useState, useEffect } from 'react'
import { FiCheckCircle, FiAlertCircle, FiActivity } from 'react-icons/fi'

const HEALTH_CHECK_INTERVAL = 30000
const HEALTH_TIMEOUT = 60000 // increased to 60s for HF cold start

function HealthBar({ apiUrl }) {
  const [health, setHealth] = useState(null)
  const [isUnhealthy, setIsUnhealthy] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    let isMounted = true

    const checkHealth = async () => {
      try {
        setIsChecking(true)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), HEALTH_TIMEOUT)

        const response = await fetch(`${apiUrl}/health`, {
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          if (isMounted) {
            setIsUnhealthy(true)
            setHealth(null)
          }
          return
        }

        let data
        try {
          data = await response.json()
        } catch (jsonError) {
          if (isMounted) {
            setIsUnhealthy(true)
            setHealth(null)
          }
          return
        }

        if (!data || typeof data !== 'object') {
          if (isMounted) {
            setIsUnhealthy(true)
            setHealth(null)
          }
          return
        }

        if (!data.embedding_model || !data.pinecone || !data.reranker) {
          if (isMounted) {
            setIsUnhealthy(true)
            setHealth(null)
          }
          return
        }

        if (isMounted) {
          setHealth(data)
          const hasIssues = Object.values(data).some(v => v === 'degraded' || v === 'error')
          setIsUnhealthy(hasIssues)
        }
      } catch (error) {
        if (isMounted) {
          setIsUnhealthy(true)
          setHealth(null)
        }
      } finally {
        if (isMounted) {
          setIsChecking(false)
        }
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, HEALTH_CHECK_INTERVAL)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [apiUrl])

  const getStatusColor = (status) => {
    const colorMap = {
      ok: 'bg-green-500',
      healthy: 'bg-green-500',
      degraded: 'bg-yellow-500',
      error: 'bg-red-500',
    }
    return colorMap[status] || 'bg-gray-300'
  }

  const getStatusLabel = (status) => {
    const labelMap = {
      ok: 'OK',
      healthy: 'OK',
      degraded: 'Degraded',
      error: 'Error',
    }
    return labelMap[status] || 'Unknown'
  }

  if (isChecking && !health) {
    return (
      <div className="bg-gray-100 border-b border-gray-200 px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
          <span className="hidden sm:inline">Checking backend health...</span>
          <span className="sm:hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (isUnhealthy) {
    return (
      <div className="bg-red-50 border-b border-red-200 px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <FiAlertCircle className="text-red-600 flex-shrink-0" />
          <span className="text-red-800 font-medium hidden sm:inline">Backend service unavailable</span>
          <span className="text-red-800 font-medium sm:hidden">Connection issue</span>
        </div>
      </div>
    )
  }

  // Only show health bar if there's an issue - don't show when everything is fine
  return null
}

export default HealthBar