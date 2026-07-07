import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

function Navbar() {
  // Get user state and logout function from global AuthContext
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()                // clears token from localStorage, sets user to null
    navigate('/login')      // redirect to login page
  }

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',  // logo left, links right
      alignItems: 'center',
      padding: '15px 30px',
      background: '#1a1a2e',            // dark blue background
      color: 'white',
      position: 'sticky',               // stays at top when scrolling
      top: 0,
      zIndex: 100                        // always on top of other elements
    }}>

      {/* Left side - App name, always visible */}
      <Link to="/" style={{
        color: 'white',
        textDecoration: 'none',
        fontSize: '20px',
        fontWeight: 'bold'
      }}>
        📄 Resume Analyzer
      </Link>

      {/* Right side - only show links if user is logged in */}
      {user && (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>

          {/* Dashboard link */}
          <Link to="/dashboard" style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '15px'
          }}>
            Dashboard
          </Link>

          {/* Upload link */}
          <Link to="/upload" style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '15px'
          }}>
            Upload Resume
          </Link>

          {/* User email display */}
          <span style={{
            color: '#aaa',
            fontSize: '14px'
          }}>
            {user.email}
          </span>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            style={{
              background: '#e74c3c',     // red button
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Logout
          </button>

        </div>
      )}
    </nav>
  )
}

export default Navbar