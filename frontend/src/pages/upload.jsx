import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../services/api'

function Upload() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await API.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      // Save extracted text to localStorage temporarily
      localStorage.setItem('extracted_text', res.data.extracted_text)
      localStorage.setItem('resume_id', res.data.id)

      navigate('/analyze')
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '100px auto', padding: '20px' }}>
      <h2>Upload Your Resume</h2>
      <p>Supported formats: PDF, DOCX</p>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginBottom: '20px' }}>
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
        />
      </div>

      {file && (
        <p>Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)</p>
      )}

      <button
        onClick={handleUpload}
        disabled={loading || !file}
      >
        {loading ? 'Uploading...' : 'Upload Resume'}
      </button>
    </div>
  )
}

export default Upload