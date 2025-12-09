import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import CodeEditor from './CodeEditor'

const SessionPage = () => {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const wsRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [connectedUsers, setConnectedUsers] = useState(0)
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState('// Welcome to the coding interview!\n// Start coding here...\n')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  // Handle code changes from editor
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
          setCode(data.code || '')
          setLanguage(data.language || 'javascript')
          setConnectedUsers(data.connected_users || 0)
          break
        case 'update':
          setCode(data.code || '')
          setLanguage(data.language || 'javascript')
          break
        case 'user_count':
          setConnectedUsers(data.connected_users || 0)
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
        // Capture console.log output
        const logs = []
        const originalLog = console.log
        console.log = (...args) => {
          logs.push(args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' '))
        }

        // Execute JavaScript code
        const func = new Function(code)
        const result = func()

        // Restore console.log
        console.log = originalLog

        const output = logs.length > 0 ? logs.join('\n') :
                      result !== undefined ? String(result) :
                      'Code executed successfully (no output)'
        setOutput(output)
      } catch (error) {
        setOutput(`Error: ${error.message}`)
      }
    } else if (language === 'python') {
      // Load Pyodide and run Python code
      setOutput('Loading Python environment...')

      if (!window.pyodide) {
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js'
        script.onload = async () => {
          try {
            window.pyodide = await loadPyodide()
            runPythonCode(code)
          } catch (error) {
            setOutput(`Error loading Python: ${error.message}`)
          }
        }
        document.head.appendChild(script)
      } else {
        runPythonCode(code)
      }
    }
  }, [code, language])

  const runPythonCode = async (code) => {
    try {
      await window.pyodide.loadPackagesFromImports(code)
      const result = await window.pyodide.runPythonAsync(code)
      const output = result?.toString() || 'Code executed successfully (no output)'
      setOutput(output)
    } catch (error) {
      setOutput(`Error: ${error.message}`)
    }
  }

  // Copy session link
  const copySessionLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    })
  }

  return (
    <div className="session-page">
      <div className="session-header">
        <h1>Session: {sessionId}</h1>
        <div className="session-controls">
          <button onClick={copySessionLink} className="copy-btn">
            {copySuccess ? 'Copied!' : 'Copy Link'}
          </button>
          <span className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
            {connected ? '● Connected' : '● Disconnected'}
          </span>
          <span className="user-count">
            Users: {connectedUsers}
          </span>
        </div>
      </div>

      <div className="editor-container">
        <div className="editor-toolbar">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="language-selector"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>
          <button onClick={runCode} className="run-btn">
            Run Code
          </button>
        </div>

        <div className="editor-wrapper">
          <CodeEditor
            value={code}
            language={language}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              automaticLayout: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              tabSize: 2,
              wordWrap: 'on',
              lineNumbers: 'on',
              bracketPairColorization: { enabled: true },
              suggest: {
                showKeywords: true,
                showSnippets: true,
              },
            }}
          />
        </div>
      </div>

      <div className="output-container">
        <h3>Output</h3>
        <pre className="output">{output || 'Click "Run Code" to execute'}</pre>
      </div>
    </div>
  )
}

export default SessionPage