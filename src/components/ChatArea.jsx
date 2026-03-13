import { useRef, useEffect, useState } from 'react'
import { FiSend, FiBriefcase, FiPaperclip } from 'react-icons/fi'

function ChatArea({ messages, isLoading, onSendMessage, hasDocument, onUploadClick, apiUrl, onError, sessionId }) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)

  const MAX_FILE_SIZE = 50 * 1024 * 1024
  const UPLOAD_TIMEOUT = 120000

  const validateFile = (file) => {
    if (!file) { onError('No file selected'); return false }
    if (!file.name.endsWith('.pdf')) { onError('Invalid file type. Only PDF files are supported.'); return false }
    if (file.size > MAX_FILE_SIZE) {
      onError(`File too large. Max 50MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`)
      return false
    }
    if (file.size === 0) { onError('File is empty'); return false }
    return true
  }

  const handleFileSelect = async (file) => {
    if (!validateFile(file)) return
    if (!sessionId) { onError('Session not initialized. Please refresh.'); return }

    setIsUploading(true)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('session_id', sessionId)
      console.log('[UPLOAD-CHATAREA] Uploading with session_id:', sessionId, 'file:', file.name)

      const response = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        credentials: 'include',
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        let errorDetail = ''
        try {
          const errorJson = await response.json()
          errorDetail = errorJson.detail || errorJson.error || JSON.stringify(errorJson)
        } catch (e) {
          try { errorDetail = await response.text() } catch (e2) { errorDetail = response.statusText }
        }
        throw new Error(`Upload failed (${response.status}): ${errorDetail || 'Unknown error'}`)
      }

      let data
      try { data = await response.json() }
      catch (jsonError) { throw new Error('Server returned invalid response format') }

      console.log('[UPLOAD-CHATAREA] Response received:', JSON.stringify(data))

      if (!data || typeof data !== 'object') throw new Error('Invalid server response format')
      if (!data.filename || typeof data.filename !== 'string') throw new Error('Server returned invalid filename')
      if (data.chunks_processed === undefined) throw new Error('Server returned invalid chunk data')

      console.log('[UPLOAD-CHATAREA] Upload successful:', data.filename, 'chunks:', data.chunks_processed)
      onUploadClick(data)
    } catch (error) {
      let userMessage = 'Upload failed'
      if (error.name === 'AbortError') userMessage = `Upload timed out after ${UPLOAD_TIMEOUT / 1000}s.`
      else if (error instanceof TypeError) userMessage = 'Network error. Check your connection.'
      else if (error.message.includes('Failed to fetch')) userMessage = 'Cannot reach backend server.'
      else userMessage = error.message || userMessage
      onError(userMessage)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = () => {
    if (!input.trim() || isLoading || !hasDocument) return
    const sanitizedInput = input.trim()
    if (sanitizedInput.length > 5000) { onError('Question too long (max 5000 characters)'); return }
    onSendMessage(sanitizedInput)
    setInput('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <main className="flex-1 flex flex-col bg-white w-full overflow-hidden">

      {/* Messages area — pb-24 on mobile so content never hides behind fixed input bar */}
      <div className="flex-1 overflow-y-auto p-3 pb-24 space-y-3 md:p-6 md:pb-6 md:space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 min-h-[65vh] md:min-h-0">
            <div className="mb-4 sm:mb-6 relative">
              <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-pulse-ring"></div>
              <div className="relative text-5xl sm:text-6xl md:text-7xl text-blue-500 animate-bounce-icon">
                <FiBriefcase />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-blue-600 mb-2 sm:mb-4">AskMyPDF</h2>
            <p className="text-sm text-gray-600 max-w-xs sm:max-w-md leading-relaxed">
              Start by uploading a PDF using the
              <span className="inline-flex items-center mx-1 text-blue-500 font-medium">
                <FiPaperclip className="mx-0.5" />
              </span>
              icon inside the input bar below.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] sm:max-w-md md:max-w-2xl rounded-lg px-3 py-2 sm:px-4 sm:py-3 ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none border border-gray-200'
                }`}>
                  <p className="text-sm leading-relaxed break-words">{msg.content || 'No response'}</p>

                  {msg.role === 'ai' && msg.sources && Array.isArray(msg.sources) && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-300 border-opacity-40">
                      <p className="text-xs font-bold text-gray-700 mb-1.5">Sources</p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((source, i) => {
                          if (!source || typeof source !== 'object') return null
                          const sourceName = source.source || source.name || `Source ${i + 1}`
                          const page = source.page !== undefined ? source.page : '?'
                          return (
                            <span
                              key={i}
                              className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200"
                              title={`${sourceName} - Page ${page}`}
                            >
                              {sourceName} (p{page})
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {msg.role === 'ai' && msg.confidence !== undefined && typeof msg.confidence === 'number' && (
                    <div className="mt-2 text-xs sm:text-sm">
                      <p className="font-bold text-gray-700">
                        Confidence: <span className="text-blue-600">
                          {Math.round(Math.min(100, Math.max(0, msg.confidence * 100)))}%
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg rounded-bl-none border border-gray-200 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* 
        INPUT BAR
        - Mobile: fixed to bottom of screen, always visible, no scroll needed
        - Desktop: normal flow at bottom, same as before
      */}
      <div className="
        fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-3 py-3
        md:relative md:bottom-auto md:left-auto md:right-auto md:z-auto md:p-4
      ">
        <div className="w-full max-w-2xl mx-auto">

          {/* Full-width input with icons inside */}
          <div className="relative flex items-center">

            {/* Upload icon — left side inside input */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="
                absolute left-3 z-10
                text-gray-400 hover:text-blue-500
                transition disabled:opacity-40 disabled:cursor-not-allowed
                flex items-center justify-center
              "
              title="Upload PDF"
              aria-label="Upload PDF"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FiPaperclip className="text-lg" />
              )}
            </button>

            {/* Text input */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!hasDocument || isLoading}
              placeholder={hasDocument ? 'Ask your question...' : 'Upload PDF first...'}
              maxLength={5000}
              className="
                w-full
                pl-10 pr-11 py-3
                text-sm
                border border-gray-300 rounded-full
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:bg-gray-50 disabled:text-gray-400
                transition
              "
            />

            {/* Send button — right side inside input */}
            <button
              onClick={handleSend}
              disabled={!hasDocument || !input.trim() || isLoading}
              className="
                absolute right-1.5
                w-8 h-8 rounded-full
                bg-blue-500 hover:bg-blue-600
                disabled:bg-gray-300 disabled:cursor-not-allowed
                text-white
                flex items-center justify-center
                transition
              "
            >
              {isLoading ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FiSend className="text-xs ml-0.5" />
              )}
            </button>
          </div>

          {/* Desktop keyboard hint */}
          <div className="hidden md:flex justify-center mt-2 text-xs text-gray-500 gap-1 items-center">
            <span>Press</span>
            <kbd className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-300 text-gray-700 font-mono text-xs">Enter</kbd>
            <span>to send</span>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        style={{ display: 'none' }}
      />
    </main>
  )
}

export default ChatArea