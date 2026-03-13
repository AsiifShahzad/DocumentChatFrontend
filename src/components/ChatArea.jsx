import { useRef, useEffect, useState } from 'react'
import { FiSend, FiUploadCloud, FiBriefcase, FiPlus } from 'react-icons/fi'

function ChatArea({ messages, isLoading, onSendMessage, hasDocument, onUploadClick, apiUrl, onError, sessionId }) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)

  const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
  const UPLOAD_TIMEOUT = 120000 // 2 minutes

  const validateFile = (file) => {
    if (!file) {
      onError('No file selected')
      return false
    }
    if (!file.name.endsWith('.pdf')) {
      onError('Invalid file type. Only PDF files are supported.')
      return false
    }
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)
      onError(`File is too large. Maximum size is ${sizeMB}MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`)
      return false
    }
    if (file.size === 0) {
      onError('File is empty')
      return false
    }
    return true
  }

  const handleFileSelect = async (file) => {
    if (!validateFile(file)) return
    if (!sessionId) {
      onError('Session not initialized. Please refresh the page.')
      return
    }

    setIsUploading(true)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('session_id', sessionId)

      const response = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        credentials: 'include',
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        let errorMessage = 'Upload failed'
        try {
          const errorData = await response.text()
          errorMessage = errorData || `Server error (${response.status})`
        } catch (e) {
          errorMessage = `Server error (${response.status}): ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()

      if (!data || typeof data !== 'object') throw new Error('Invalid server response format')
      if (!data.filename || typeof data.filename !== 'string') throw new Error('Server returned invalid filename')
      if (data.chunks_processed === undefined) throw new Error('Server returned invalid chunk data')

      onUploadClick(data)
    } catch (error) {
      let userMessage = 'Upload failed'

      if (error.name === 'AbortError') {
        userMessage = `Upload timed out after ${UPLOAD_TIMEOUT / 1000}s. File may be too large.`
      } else if (error instanceof TypeError) {
        userMessage = 'Network error. Check your connection and backend URL.'
      } else if (error.message.includes('Failed to fetch')) {
        userMessage = 'Cannot reach backend server. Check if it\'s running.'
      } else {
        userMessage = error.message || userMessage
      }

      onError(userMessage)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click()
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = () => {
    if (!input.trim()) {
      return
    }
    if (isLoading) {
      return
    }
    if (!hasDocument) {
      return
    }

    // Sanitize input - basic XSS prevention
    const sanitizedInput = input.trim()
    if (sanitizedInput.length > 5000) {
      alert('Question is too long (max 5000 characters)')
      return
    }

    onSendMessage(sanitizedInput)
    setInput('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <main className="flex-1 flex flex-col bg-white w-full overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 space-y-2 sm:space-y-4 md:space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-2 sm:px-4">
            <div className="mb-2 sm:mb-6 relative">
              <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-pulse-ring"></div>
              <div className="relative text-3xl sm:text-6xl md:text-7xl text-blue-500 animate-bounce-icon">
                <FiBriefcase />
              </div>
            </div>
            <h2 className="text-xl sm:text-4xl md:text-5xl font-extrabold text-blue-600 mb-1 sm:mb-4">AskMyPDF</h2>
            <p className="text-xs text-gray-600 max-w-md leading-relaxed">
              Start by uploading a PDF document.
              <br className="hidden sm:block" />
              Once processed, our AI will help you extract insights and answer questions.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs sm:max-w-md md:max-w-2xl rounded-lg px-2.5 py-1.5 sm:px-4 sm:py-3 ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-900 rounded-bl-none border border-gray-200'
                  }`}
                >
                  <p className="text-xs sm:text-sm leading-relaxed break-words">{msg.content || 'No response'}</p>

                  {msg.role === 'ai' && msg.sources && Array.isArray(msg.sources) && msg.sources.length > 0 && (
                    <div className="mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-300 border-opacity-40">
                      <p className="text-xs sm:text-sm font-bold text-gray-700 mb-1 sm:mb-2">Sources</p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {msg.sources.map((source, i) => {
                          // Validate source structure
                          if (!source || typeof source !== 'object') return null
                          const sourceName = source.source || source.name || `Source ${i + 1}`
                          const page = source.page !== undefined ? source.page : '?'
                          return (
                            <span
                              key={i}
                              className="text-xs sm:text-sm font-semibold bg-blue-50 text-blue-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded border border-blue-200 truncate"
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
                    <div className="mt-2 sm:mt-3 text-xs sm:text-sm">
                      <p className="font-bold text-gray-700">Confidence: <span className="text-blue-600">{Math.round(Math.min(100, Math.max(0, msg.confidence * 100)))}%</span></p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg rounded-bl-none border border-gray-200 px-3 py-2 sm:px-4 sm:py-3">
                  <div className="flex gap-1.5 sm:gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-2 sm:p-4">
        <div className="flex flex-col gap-1 items-center justify-center">
          <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl relative flex items-center gap-1.5 sm:gap-2">
            {/* Upload button - visible on mobile */}
            <button
              onClick={handleUploadButtonClick}
              disabled={isUploading}
              className="md:hidden bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center h-9 w-9 flex-shrink-0"
              title="Upload PDF"
              aria-label="Upload PDF"
            >
              {isUploading ? (
                <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FiPlus className="text-base" />
              )}
            </button>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!hasDocument || isLoading}
              placeholder={
                hasDocument
                  ? 'Ask your question...'
                  : 'Upload PDF first...'
              }
              maxLength={5000}
              className="flex-1 px-2.5 sm:px-4 py-1.5 sm:py-3 pr-9 sm:pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 text-xs sm:text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!hasDocument || !input.trim() || isLoading}
              className="absolute right-1 sm:right-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center h-6 w-6 sm:h-8 sm:w-8"
            >
              {isLoading ? (
                <div className="w-2 h-2 sm:w-3 sm:h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FiSend className="text-xs sm:text-sm" />
              )}
            </button>
          </div>
          <div className="text-xs text-gray-500 flex gap-0.5 items-center justify-center hidden md:flex">
            <span>Press</span>
            <kbd className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-300 text-gray-700 font-mono text-xs">
              Enter
            </kbd>
            <span>to send</span>
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
      </div>
    </main>
  )
}

export default ChatArea
