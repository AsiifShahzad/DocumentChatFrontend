import { useState, useEffect } from 'react'

const HEALTH_CHECK_INTERVAL = 30000 // 30 seconds
const HEALTH_TIMEOUT = 10000 // 10 seconds per health check

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

        const response = await fetch(`${apiUrl}/api/health`, {
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

        const data = await response.json()

        // Validate health response structure
        if (!data || typeof data !== 'object') {
          if (isMounted) {
            setIsUnhealthy(true)
            setHealth(null)
          }
          return
        }

        // Check for required health fields
        if (!data.embedding_model || !data.pinecone || !data.reranker) {
          if (isMounted) {
            setIsUnhealthy(true)
            setHealth(null)
          }
          return
        }

        if (isMounted) {
          setHealth(data)
          // Consider unhealthy if any service is degraded or error
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

    // Check health immediately
    checkHealth()

    // Then check periodically
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

  return (
    <div className={`${
      isUnhealthy 
        ? 'bg-red-50 border-b border-red-200' 
        : 'bg-gray-50 border-b border-gray-200'
    } px-6 py-3 transition-colors`}>
      {isChecking && !health ? (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          Checking backend services...
        </div>
      ) : isUnhealthy ? (
        <p className="text-sm text-red-700 font-medium">
          ⚠️ Backend service unavailable - Some services are degraded or offline
        </p>
      ) : health ? (
        <div className="flex items-center gap-6 text-sm">
          <span className="font-medium text-gray-700">Services:</span>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(health.embedding_model)}`} title={getStatusLabel(health.embedding_model)}></div>
              <span className="text-gray-600">Embedding</span>
              <span className="text-xs text-gray-500">({getStatusLabel(health.embedding_model)})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(health.pinecone)}`} title={getStatusLabel(health.pinecone)}></div>
              <span className="text-gray-600">Pinecone</span>
              <span className="text-xs text-gray-500">({getStatusLabel(health.pinecone)})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(health.reranker)}`} title={getStatusLabel(health.reranker)}></div>
              <span className="text-gray-600">Reranker</span>
              <span className="text-xs text-gray-500">({getStatusLabel(health.reranker)})</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-600">Unable to reach backend services</p>
      )}
    </div>
  )
}

export default HealthBar
