import React, { useEffect, useState } from 'react'

const TestComponent = () => {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    setMessage('React is working!')
  }, [])

  return (
    <div style={{ padding: '20px', backgroundColor: '#1e1e1e', color: '#fff', minHeight: '100vh' }}>
      <h1>Coding Interview Platform</h1>
      <p>{message}</p>
      <button
        onClick={() => alert('Button clicked!')}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test Button
      </button>
    </div>
  )
}

export default TestComponent