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
        console.log('[HealthBar] Checking health at:', `${apiUrl}/health`)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), HEALTH_TIMEOUT)

        const response = await fetch(`${apiUrl}/health`, { // fixed: removed /api
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          console.error('[HealthBar] Health check failed with status:', response.status)
          if (isMounted) {
            setIsUnhealthy(true)
            setHealth(null)
          }
          return
        }

        const data = await response.json()

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
        console.error('[HealthBar] Health check error:', error.message)
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

  // Only show health bar when checking or when there's an issue
  if (!isChecking && !isUnhealthy && health) {
    return null
  }

  return (
    <div className={`${
      isUnhealthy 
        ? 'bg-red-50 border-b border-red-200' 
        : 'bg-blue-50 border-b border-blue-200'
    } px-6 py-3 transition-colors`}>
      {isChecking && !health ? (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <FiActivity className="w-4 h-4 animate-spin" />
          Checking backend services...
        </div>
      ) : isUnhealthy ? (
        <p className="text-sm text-red-700 font-medium flex items-center gap-2">
          <FiAlertCircle className="w-4 h-4" /> Backend service unavailable - Some services are degraded or offline
        </p>
      ) : (
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <FiAlertCircle className="w-4 h-4" /> Unable to reach backend services
        </p>
      )}
    </div>
  )
}

export default HealthBar