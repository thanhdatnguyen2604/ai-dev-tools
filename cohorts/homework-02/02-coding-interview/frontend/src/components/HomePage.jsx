import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const HomePage = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const createNewSession = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8989/api/sessions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      })

      if (!response.ok) {
        throw new Error('Failed to create session')
      }

      const data = await response.json()
      navigate(`/session/${data.id}`)
    } catch (error) {
      console.error('Error creating session:', error)
      alert('Failed to create session. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home-page">
      <div className="home-content">
        <h1>Coding Interview Platform</h1>
        <p>Create a shared coding session for real-time collaborative interviews</p>
        <button
          className="create-session-btn"
          onClick={createNewSession}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create new interview session'}
        </button>
      </div>
    </div>
  )
}

export default HomePage