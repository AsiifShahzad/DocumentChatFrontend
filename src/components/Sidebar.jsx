import { useRef, useState } from 'react'
import { FiUploadCloud, FiFile, FiFileText } from 'react-icons/fi'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const UPLOAD_TIMEOUT = 120000 // 2 minutes

function Sidebar({ document, onUploadSuccess, apiUrl, onError }) {
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

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

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT)

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        credentials: 'include',
      })

      clearTimeout(timeoutId)
      setUploadProgress(100)

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

      onUploadSuccess(data)
      setUploadProgress(0)
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
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <FiFile className="text-xl text-blue-500" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">AskMyPDF</h1>
            <p className="text-xs text-gray-600">Analyze & query your PDFs</p>
          </div>
        </div>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center justify-center gap-2">
            <FiUploadCloud className="text-lg text-blue-500" /> Upload Document
          </h3>
          <FiUploadCloud className="text-4xl text-blue-400 mb-3 mx-auto" />
          <p className="font-medium text-gray-900 text-sm">Click or drag PDF here</p>
          <p className="text-xs text-gray-500 mt-2">Maximum file size 50MB</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          style={{ display: 'none' }}
        />

        {isUploading && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600">Uploading...</span>
            </div>
            {uploadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-6 flex-1">
        <h2 className="text-sm font-semibold text-gray-900 mb-6">Current Document</h2>
        
        {document ? (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-300 animate-slide-in">
            <div className="flex items-start gap-3">
              <div className="text-3xl text-blue-500 animate-bounce-icon">
                <FiFileText />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-blue-900 truncate">{document.filename}</p>
                <p className="text-xs text-blue-700 mt-2 font-medium">
                  ✓ {document.chunks_processed} chunks processed
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border-2 border-dashed border-gray-300">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-5xl text-gray-300 mb-3">
                <FiFile />
              </div>
              <p className="text-sm font-medium text-gray-600">No document active</p>
              <p className="text-xs text-gray-500 mt-1">Upload a PDF to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar