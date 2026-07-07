import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../services/api'

function Analyze() {
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const extractedText = localStorage.getItem('extracted_text')
  const resumeId = localStorage.getItem('resume_id')

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste a job description')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await API.post('/analyze', {
        resume_id: resumeId,
        job_description: jobDescription,
        extracted_text: extractedText
      })

      localStorage.setItem('analysis_result', JSON.stringify(res.data))
      navigate('/results')
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '700px', margin: '60px auto', padding: '20px' }}>
      <h2>Analyze Your Resume</h2>

      {/* Show extracted resume text */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Extracted Resume Text</h3>
        <div style={{
          background: '#f5f5f5',
          padding: '15px',
          borderRadius: '8px',
          whiteSpace: 'pre-wrap',
          fontSize: '14px',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {extractedText || 'No resume text found. Please upload your resume first.'}
        </div>
      </div>

      {/* Job description input */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Paste Job Description</h3>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here..."
          rows={10}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '14px',
            resize: 'vertical'
          }}
        />
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button
        onClick={handleAnalyze}
        disabled={loading || !jobDescription.trim()}
        style={{
          padding: '10px 30px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        {loading ? 'Analyzing...' : 'Analyze Match'}
      </button>
    </div>
  )
}

export default Analyze