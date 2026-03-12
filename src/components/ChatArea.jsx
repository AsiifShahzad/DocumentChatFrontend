import { useRef, useEffect, useState } from 'react'

function ChatArea({ messages, isLoading, onSendMessage, hasDocument }) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

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
    <main className="flex-1 flex flex-col bg-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to AskMyDoc</h2>
            <p className="text-gray-600 max-w-md">
              {hasDocument
                ? 'Your document is ready. Ask questions about it below.'
                : 'Upload a PDF document in the sidebar to get started.'}
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
                  className={`max-w-2xl rounded-lg px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-900 rounded-bl-none border border-gray-200'
                  }`}
                >
                  <p className="text-sm leading-relaxed break-words">{msg.content || 'No response'}</p>

                  {msg.role === 'ai' && msg.sources && Array.isArray(msg.sources) && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-300 border-opacity-30">
                      <p className="text-xs font-medium mb-2 opacity-75">📚 Sources:</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((source, i) => {
                          // Validate source structure
                          if (!source || typeof source !== 'object') return null
                          const sourceName = source.source || source.name || `Source ${i + 1}`
                          const page = source.page !== undefined ? source.page : '?'
                          return (
                            <span
                              key={i}
                              className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded truncate"
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
                    <div className="mt-2 text-xs opacity-75">
                      <p>🎯 Confidence: {Math.round(Math.min(100, Math.max(0, msg.confidence * 100)))}%</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg rounded-bl-none border border-gray-200 px-4 py-3">
                  <div className="flex gap-2">
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

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-2">
          {!hasDocument && (
            <p className="text-xs text-orange-600 px-2">📤 Upload a PDF in the sidebar to start chatting</p>
          )}
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!hasDocument || isLoading}
              placeholder={
                hasDocument
                  ? 'Ask a question about your document... (Shift+Enter for new line)'
                  : 'Upload a PDF to start asking questions'
              }
              maxLength={5000}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!hasDocument || !input.trim() || isLoading}
              title={
                !hasDocument
                  ? 'Upload a PDF first'
                  : !input.trim()
                  ? 'Type a question'
                  : isLoading
                  ? 'Waiting for response...'
                  : 'Send message'
              }
              className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 min-w-14"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Send</span>
              )}
            </button>
          </div>
          {input.length > 4500 && (
            <p className="text-xs text-orange-600 px-2">{input.length}/5000 characters</p>
          )}
        </div>
      </div>
    </main>
  )
}

export default ChatArea
