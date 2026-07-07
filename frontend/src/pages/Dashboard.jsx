import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import API from '../services/api'

function Dashboard() {
  // Get logged in user info and logout function from AuthContext
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Three states for handling history data
  const [history, setHistory] = useState([])        // stores past analyses
  const [loading, setLoading] = useState(true)      // are we fetching?
  const [error, setError] = useState('')            // did something go wrong?

  // Runs once when dashboard loads - fetches analysis history
  useEffect(() => {
    API.get('/history')
      .then(res => {
        setHistory(res.data)       // save data to state
        setLoading(false)          // done loading
      })
      .catch(err => {
        setError('Failed to load history')
        setLoading(false)
      })
  }, [])  // empty [] means run only once on page load

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Helper: format date nicely
  // "2026-07-03T11:08:24" → "July 3, 2026"
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Helper: score color (green/orange/red)
  const getScoreColor = (score) => {
    if (score >= 75) return 'green'
    if (score >= 50) return 'orange'
    return 'red'
  }

  return (
    <div style={{ maxWidth: '800px', margin: '60px auto', padding: '20px' }}>

      {/* Header section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div>
          <h2>Dashboard</h2>
          <p style={{ color: '#666' }}>Welcome back, <strong>{user?.email}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/upload')}>
            Upload Resume
          </button>
          <button onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Analysis History section */}
      <h3>Your Analysis History</h3>

      {/* Loading state */}
      {loading && <p>Loading your history...</p>}

      {/* Error state */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Empty state - no analyses yet */}
      {!loading && history.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          border: '2px dashed #ddd',
          borderRadius: '8px',
          color: '#666'
        }}>
          <p>No analyses yet.</p>
          <p>Upload your resume to get started!</p>
          <button onClick={() => navigate('/upload')}>
            Upload Resume
          </button>
        </div>
      )}

      {/* History cards - one card per analysis */}
      {!loading && history.map((item) => (
        <div key={item.id} style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '15px',
          background: '#fafafa'
        }}>
          {/* Card header: filename + date */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '10px'
          }}>
            <strong>{item.filename}</strong>
            <span style={{ color: '#666', fontSize: '14px' }}>
              {formatDate(item.created_at)}
            </span>
          </div>

          {/* Scores */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
            <span>
              Match Score: <strong style={{ color: getScoreColor(item.match_score) }}>
                {item.match_score}%
              </strong>
            </span>
            <span>
              ATS Score: <strong style={{ color: getScoreColor(item.ats_score) }}>
                {item.ats_score}%
              </strong>
            </span>
          </div>

          {/* Summary - truncated to 150 characters */}
          <p style={{
            color: '#555',
            fontSize: '14px',
            margin: '0'
          }}>
            {item.summary.length > 150
              ? item.summary.substring(0, 150) + '...'
              : item.summary
            }
          </p>
        </div>
      ))}

    </div>
  )
}

export default Dashboard