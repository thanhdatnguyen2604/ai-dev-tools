import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import Editor from '@monaco-editor/react'

const SimpleSessionPage = () => {
  const { sessionId } = useParams()
  const wsRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [code, setCode] = useState('// Welcome to the coding interview!\n// Start coding here...\n')
  const [language, setLanguage] = useState('javascript')
  const [output, setOutput] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)

  // Initialize WebSocket connection
  useEffect(() => {
    const wsUrl = `ws://localhost:8989/ws/session/${sessionId}/`
    wsRef.current = new WebSocket(wsUrl)

    wsRef.current.onopen = () => {
      setConnected(true)
      console.log('Connected to session:', sessionId)
    }

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)

      switch (data.type) {
        case 'init':
          setCode(data.code || '// Welcome to the coding interview!')
          setLanguage(data.language || 'javascript')
          break
        case 'update':
          setCode(data.code || code)
          setLanguage(data.language || language)
          break
      }
    }

    wsRef.current.onclose = () => {
      setConnected(false)
      console.log('Disconnected from session')
    }

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error)
      setConnected(false)
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [sessionId])

  // Handle code change
  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode)
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'update',
        code: newCode,
        language: language
      }))
    }
  }, [language])

  // Handle language change
  const handleLanguageChange = useCallback((newLanguage) => {
    setLanguage(newLanguage)
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'update',
        code: code,
        language: newLanguage
      }))
    }
  }, [code])

  // Run code
  const runCode = useCallback(() => {
    if (!code) return

    setOutput('Running code...')

    if (language === 'javascript') {
      try {
        const logs = []
        const originalLog = console.log
        console.log = (...args) => {
          logs.push(args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' '))
        }

        const func = new Function(code)
        const result = func()

        console.log = originalLog

        const output = logs.length > 0 ? logs.join('\n') :
                      result !== undefined ? String(result) :
                      'Code executed successfully (no output)'
        setOutput(output)
      } catch (error) {
        setOutput(`Error: ${error.message}`)
      }
    } else if (language === 'python') {
      setOutput('Python execution would be loaded here...')
    }
  }, [code, language])

  // Copy session link
  const copySessionLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    })
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1e1e1e', color: '#d4d4d4', padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Session: {sessionId}</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={copySessionLink}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0e639c',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {copySuccess ? 'Copied!' : 'Copy Link'}
          </button>
          <span style={{ color: connected ? '#4CAF50' : '#f44336' }}>
            {connected ? '● Connected' : '● Disconnected'}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          style={{
            padding: '8px',
            backgroundColor: '#3c3c3c',
            color: '#d4d4d4',
            border: '1px solid #555',
            borderRadius: '3px'
          }}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
        <button
          onClick={runCode}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginLeft: 'auto'
          }}
        >
          Run Code
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <Editor
          height="500px"
          language={language === "python" ? "python" : "javascript"}
          value={code}
          onChange={(value) => handleCodeChange(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            tabSize: 2,
            wordWrap: 'on',
            automaticLayout: true,
          }}
        />
      </div>

      <div>
        <h3>Output:</h3>
        <pre style={{
          backgroundColor: '#252526',
          padding: '15px',
          borderRadius: '5px',
          minHeight: '100px',
          fontFamily: 'monospace',
          fontSize: '14px',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word'
        }}>
          {output || 'Click "Run Code" to execute'}
        </pre>
      </div>
    </div>
  )
}

export default SimpleSessionPage