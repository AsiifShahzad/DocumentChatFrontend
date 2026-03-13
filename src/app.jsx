import { useState, useEffect } from 'react'
import HealthBar from './components/HealthBar'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'

const API_URL = import.meta.env.VITE_API_URL || 'https://asiifbaloch-documentchat.hf.space'
const REQUEST_TIMEOUT = 60000 

const validateUploadResponse = (data) => {
  if (!data || typeof data !== 'object') throw new Error('Invalid server response format')
  if (!data.filename || typeof data.filename !== 'string') throw new Error('Missing filename in response')
  if (data.chunks_processed === undefined) throw new Error('Missing chunks_processed in response')
  return data
}

const validateAnswerResponse = (data) => {
  if (!data || typeof data !== 'object') throw new Error('Invalid server response format')
  if (!data.answer || typeof data.answer !== 'string') throw new Error('Missing answer in response')
  if (!Array.isArray(data.sources)) throw new Error('Invalid sources format')
  return data
}

function App() {
  const [document, setDocument] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [sessionId, setSessionId] = useState(null)

  // Generate session ID on app load and setup cleanup
  useEffect(() => {
    // Generate session ID - only once per session
    let currentSessionId = sessionStorage.getItem('documentChatSessionId')
    if (!currentSessionId) {
      try {
        // Try to use crypto API if available (more secure)
        const array = new Uint8Array(16)
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
          crypto.getRandomValues(array)
          currentSessionId = 'session_' + Date.now() + '_' + Array.from(array, x => x.toString(16).padStart(2, '0')).join('')
        } else {
          // Fallback for older browsers
          currentSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        }
        sessionStorage.setItem('documentChatSessionId', currentSessionId)
        // Log for debugging
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          console.log('[App] Session ID created:', currentSessionId)
        }
      } catch (e) {
        // Handle private browsing mode where sessionStorage might be unavailable
        currentSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      }
    } else {
      // Log existing session ID
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('[App] Using existing session ID:', currentSessionId)
      }
    }
    setSessionId(currentSessionId)

    // Setup auto-cleanup on page unload
    const handleBeforeUnload = () => {
      try {
        const sid = sessionStorage.getItem('documentChatSessionId')
        if (sid) {
          // Use sendBeacon for reliable delivery even on page unload
          navigator.sendBeacon(`${API_URL}/cleanup-session/${sid}`)
        }
      } catch (e) {
        // Silently fail - cleanup is best-effort
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  const showToast = (message, type = 'error', duration = 3000) => {
    setToast({ message, type })
    const timeoutId = setTimeout(() => setToast(null), duration)
    // Return function to clear timeout if needed
    return () => clearTimeout(timeoutId)
  }

  const handleUploadSuccess = (doc) => {
    try {
      const validatedDoc = validateUploadResponse(doc)
      setDocument(validatedDoc)
      setMessages([])
      showToast(`"${validatedDoc.filename}" uploaded successfully! (${validatedDoc.chunks_processed} chunks)`, 'success')
    } catch (error) {
      showToast(`Upload validation failed: ${error.message}`)
    }
  }

  const handleSendMessage = async (question) => {
    if (!question.trim()) {
      showToast('Please enter a question')
      return
    }
    if (!document) {
      showToast('Please upload a document first')
      return
    }

    // Prevent duplicate messages during loading
    if (isLoading) {
      return
    }

    setMessages(prev => [...prev, { role: 'user', content: question }])
    setIsLoading(true)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

      const response = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
        signal: controller.signal,
        credentials: 'include',
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Server error (${response.status}): ${errorText || 'Failed to get answer'}`)
      }

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        throw new Error('Invalid response format from server')
      }

      const validatedData = validateAnswerResponse(data)

      setMessages(prev => [...prev, {
        role: 'ai',
        content: validatedData.answer,
        sources: validatedData.sources || [],
        confidence: typeof validatedData.confidence === 'number' ? validatedData.confidence : 0,
      }])
    } catch (error) {
      let userMessage = 'Failed to get answer'
      
      if (error.name === 'AbortError') {
        userMessage = 'Request timed out (60s). Please try again.'
      } else if (error instanceof TypeError) {
        userMessage = 'Network error. Check your connection and backend URL.'
      } else {
        userMessage = error.message || userMessage
      }

      showToast(userMessage)
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <HealthBar apiUrl={API_URL} />
      
      {toast && (
        <div className={`fixed top-16 right-4 px-4 py-3 rounded-lg text-white z-50 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Mobile Header - visible only on sm and below */}
      <div className="md:hidden flex items-center justify-center bg-white border-b border-gray-200 px-4 py-2">
        <h1 className="font-bold text-gray-900 text-lg">AskMyPDF</h1>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar - visible on md and up */}
        <div className="hidden md:block">
          <Sidebar 
            document={document}
            onUploadSuccess={handleUploadSuccess}
            apiUrl={API_URL}
            onError={showToast}
            sessionId={sessionId}
          />
        </div>

        <ChatArea 
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          hasDocument={!!document}
          onUploadClick={handleUploadSuccess}
          apiUrl={API_URL}
          onError={showToast}
          sessionId={sessionId}
        />
      </div>
    </div>
  )
}

export default App