import { useState, useEffect } from 'react'
import HealthBar from './components/HealthBar'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'

const API_URL = 'https://asiifbaloch-documentchat.hf.space'
const REQUEST_TIMEOUT = 30000 // 30 seconds

// Validate API response structure
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

  const showToast = (message, type = 'error', duration = 3000) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), duration)
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

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: question }])
    setIsLoading(true)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

      const response = await fetch(`${API_URL}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Server error (${response.status}): ${errorText || 'Failed to get answer'}`)
      }

      const data = await response.json()
      const validatedData = validateAnswerResponse(data)

      setMessages(prev => [...prev, {
        role: 'ai',
        content: validatedData.answer,
        sources: validatedData.sources || [],
        confidence: typeof validatedData.confidence === 'number' ? validatedData.confidence : 0,
      }])
      showToast('Answer received!', 'success')
    } catch (error) {
      let userMessage = 'Failed to get answer'
      
      if (error.name === 'AbortError') {
        userMessage = 'Request timed out (30s). Please try again.'
      } else if (error instanceof TypeError) {
        userMessage = 'Network error. Check your connection and backend URL.'
      } else {
        userMessage = error.message || userMessage
      }

      showToast(userMessage)
      setMessages(prev => prev.slice(0, -1)) // Remove user message on error
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

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          document={document}
          onUploadSuccess={handleUploadSuccess}
          apiUrl={API_URL}
          onError={showToast}
        />
        <ChatArea 
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          hasDocument={!!document}
        />
      </div>
    </div>
  )
}

export default App
