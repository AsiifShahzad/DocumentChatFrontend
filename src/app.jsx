import { useState, useEffect } from 'react'
import HealthBar from './components/HealthBar'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'

const API_URL = import.meta.env.VITE_API_URL || 'https://rag-document-search-mmpi.onrender.com'
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

  useEffect(() => {
    let currentSessionId = localStorage.getItem('documentChatSessionId')
    console.log('[SESSION] Retrieved from localStorage:', currentSessionId)
    
    if (!currentSessionId) {
      try {
        const array = new Uint8Array(16)
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
          crypto.getRandomValues(array)
          currentSessionId = 'session_' + Date.now() + '_' + Array.from(array, x => x.toString(16).padStart(2, '0')).join('')
        } else {
          currentSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        }
        localStorage.setItem('documentChatSessionId', currentSessionId)
        console.log('[SESSION] Generated new session:', currentSessionId)
      } catch (e) {
        currentSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        console.log('[SESSION] localStorage unavailable, using session:', currentSessionId)
      }
    } else {
      console.log('[SESSION] Using existing session from localStorage:', currentSessionId)
    }
    setSessionId(currentSessionId)

    const handleBeforeUnload = () => {
      try {
        const sid = localStorage.getItem('documentChatSessionId')
        console.log('[CLEANUP] Before unload - cleaning session:', sid)
        if (sid) {
          const result = navigator.sendBeacon(
            `${API_URL}/cleanup-session`,
            new URLSearchParams({ session_id: sid })
          )
          console.log('[CLEANUP] sendBeacon result:', result)
          localStorage.removeItem('documentChatSessionId')
          console.log('[CLEANUP] Removed session from localStorage')
        }
      } catch (e) {
        console.error('[CLEANUP] Error during cleanup:', e)
      }
    }

    const handlePageHide = () => {
      console.log('[CLEANUP] Page hide event fired (mobile-friendly)')
      handleBeforeUnload()
    }

    const handleStorageChange = (e) => {
      if (e.key === 'documentChatSessionId') {
        console.log('[SESSION] Storage changed externally. New value:', e.newValue)
        if (e.newValue) {
          setSessionId(e.newValue)
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handlePageHide)
    window.addEventListener('storage', handleStorageChange)
    console.log('[SESSION] beforeunload, pagehide, and storage listeners attached')

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handlePageHide)
      window.removeEventListener('storage', handleStorageChange)
      console.log('[SESSION] cleanup listeners removed')
    }
  }, [])

  const showToast = (message, type = 'error', duration = 3000) => {
    setToast({ message, type })
    const timeoutId = setTimeout(() => setToast(null), duration)
    return () => clearTimeout(timeoutId)
  }

  const handleUploadSuccess = (doc) => {
    try {
      const validatedDoc = validateUploadResponse(doc)

      // Use the session_id the backend actually used — single source of truth
      const confirmedSessionId = doc.session_id || sessionId
      console.log('[APP] Confirmed session_id from backend:', confirmedSessionId)

      localStorage.setItem('documentChatSessionId', confirmedSessionId)
      setSessionId(confirmedSessionId)

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
    if (isLoading) {
      return
    }

    setMessages(prev => [...prev, { role: 'user', content: question }])
    setIsLoading(true)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

      const currentSessionId = localStorage.getItem('documentChatSessionId') || sessionId
      console.log('[QUESTION] State sessionId:', sessionId)
      console.log('[QUESTION] localStorage sessionId:', localStorage.getItem('documentChatSessionId'))
      console.log('[QUESTION] Using sessionId:', currentSessionId)

      if (sessionId !== currentSessionId) {
        console.warn('[QUESTION] ⚠️ SESSION MISMATCH! State and localStorage differ!')
      }

      const response = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question,
          session_id: currentSessionId 
        }),
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

      <div className="md:hidden flex items-center justify-center bg-white border-b border-gray-200 px-4 py-2">
        <h1 className="font-bold text-gray-900 text-lg">AskMyPDF</h1>
      </div>

      <div className="flex flex-1 overflow-hidden">
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
