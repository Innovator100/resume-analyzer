import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Results() {
  const [result, setResult] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Get analysis result from localStorage (saved in Analyze.jsx)
    const stored = localStorage.getItem('analysis_result')
    if (!stored) {
      // If no result found, send back to upload
      navigate('/upload')
      return
    }
    setResult(JSON.parse(stored))
  }, [])

  if (!result) return <p>Loading...</p>


  // Parse all fields including new ones
  const missingSkills = JSON.parse(result.missing_skills)
  const matchedSkills = JSON.parse(result.matched_skills)
  const suggestions = JSON.parse(result.suggestions)
  const hiddenSkills = result.hidden_skills ? JSON.parse(result.hidden_skills) : []
  const inputQuality = result.input_quality ? JSON.parse(result.input_quality) : null

  // Color based on score
  const getScoreColor = (score) => {
    if (score >= 75) return 'green'
    if (score >= 50) return 'orange'
    return 'red'
  }

  return (
    <div style={{ maxWidth: '800px', margin: '60px auto', padding: '20px' }}>
      <h2>Analysis Results</h2>

      {/* Summary */}
      <div style={{
        background: '#f0f4ff',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '25px'
      }}>
        <h3>Summary</h3>
        <p>{result.summary}</p>
      </div>

      {/* Scores */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '25px'
      }}>
        {/* Match Score */}
        <div style={{
          flex: 1,
          textAlign: 'center',
          padding: '20px',
          border: '2px solid #ddd',
          borderRadius: '8px'
        }}>
          <h3>Match Score</h3>
          <p style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: getScoreColor(result.match_score),
            margin: 0
          }}>
            {result.match_score}%
          </p>
        </div>

        {/* ATS Score */}
        <div style={{
          flex: 1,
          textAlign: 'center',
          padding: '20px',
          border: '2px solid #ddd',
          borderRadius: '8px'
        }}>
          <h3>ATS Score</h3>
          <p style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: getScoreColor(result.ats_score),
            margin: 0
          }}>
            {result.ats_score}%
          </p>
        </div>
      </div>

      {/* Matched Skills */}
      <div style={{ marginBottom: '25px' }}>
        <h3>✅ Matched Skills</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {matchedSkills.map((skill, index) => (
            <span key={index} style={{
              background: '#d4edda',
              color: '#155724',
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '14px'
            }}>
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Missing Skills */}
      <div style={{ marginBottom: '25px' }}>
        <h3>❌ Missing Skills</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {missingSkills.map((skill, index) => (
            <span key={index} style={{
              background: '#f8d7da',
              color: '#721c24',
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '14px'
            }}>
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Hidden Skills - NEW */}
      {hiddenSkills.length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h3>🔍 Hidden Skills Detected</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>
            These skills are implied by your projects/experience but not explicitly stated.
            Consider adding them directly to your resume.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {hiddenSkills.map((skill, index) => (
              <span key={index} style={{
                background: '#fff3cd',
                color: '#856404',
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '14px'
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Input Quality Warning - NEW */}
      {inputQuality && inputQuality.notes && (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffc107',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '25px'
        }}>
          <h3>⚠️ Analysis Note</h3>
          <p><strong>Resume quality:</strong> {inputQuality.resume_quality}</p>
          <p><strong>Job description quality:</strong> {inputQuality.job_description_quality}</p>
          <p>{inputQuality.notes}</p>
        </div>
      )}

      {/* Suggestions */}
      <div style={{ marginBottom: '25px' }}>
        <h3>💡 Suggestions to Improve</h3>
        <ul style={{ paddingLeft: '20px' }}>
          {suggestions.map((suggestion, index) => (
            <li key={index} style={{
              marginBottom: '10px',
              lineHeight: '1.6'
            }}>
              {suggestion}
            </li>
          ))}
        </ul>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => navigate('/upload')}>
          Analyze Another Resume
        </button>
        <button onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}

export default Results