import { useState, useEffect } from 'react'
import HealthBar from './components/HealthBar'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import { FiMenu, FiX } from 'react-icons/fi'

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
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

      const data = await response.json()
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
      <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="font-bold text-gray-900 text-lg">AskMyPDF</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        >
          {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay - visible only on sm and below */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30 top-[calc(3.5rem+2.75rem)]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar - visible on md and up */}
        <div className="hidden md:block">
          <Sidebar 
            document={document}
            onUploadSuccess={handleUploadSuccess}
            apiUrl={API_URL}
            onError={showToast}
          />
        </div>

        {/* Mobile Sidebar - in drawer on sm and below */}
        {sidebarOpen && (
          <div className="md:hidden fixed left-0 top-[calc(3.5rem+2.75rem)] bottom-0 z-40 bg-white border-r border-gray-200 w-80 overflow-y-auto">
            <Sidebar 
              document={document}
              onUploadSuccess={handleUploadSuccess}
              apiUrl={API_URL}
              onError={showToast}
            />
          </div>
        )}

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