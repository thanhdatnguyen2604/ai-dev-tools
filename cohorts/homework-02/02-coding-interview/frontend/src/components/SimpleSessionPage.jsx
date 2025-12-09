import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { runPython, isPyodideLoaded } from '../utils/pyodideLoader'

const SimpleSessionPage = () => {
  const { sessionId } = useParams()
  const wsRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState(() =>
    language === 'python'
      ? '# Welcome to the coding interview!\n# Start coding here...\nprint("Hello from Python!")'
      : '// Welcome to the coding interview!\n// Start coding here...\n'
  )
  const [output, setOutput] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [lastError, setLastError] = useState(null)

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
          const initLang = data.language || 'javascript'
          setLanguage(initLang)
          if (data.code) {
            setCode(data.code)
          } else {
            // Set default code based on language
            setCode(initLang === 'python'
              ? '# Welcome to the coding interview!\n# Start coding here...\nprint("Hello from Python!")'
              : '// Welcome to the coding interview!\n// Start coding here...\n')
          }
          break
        case 'update':
          const updateLang = data.language || language
          setLanguage(updateLang)
          if (data.code) {
            setCode(data.code)
          }
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

  // Effect to update code when language changes (only for welcome message)
  useEffect(() => {
    if (code.includes('Welcome to the coding interview!')) {
      const newCode = language === 'python'
        ? '# Welcome to the coding interview!\n# Start coding here...\nprint("Hello from Python!")'
        : '// Welcome to the coding interview!\n// Start coding here...\n'
      setCode(newCode)
    }
  }, [language])

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

    // Change to appropriate default code if it's the welcome message
    if (code.includes('Welcome to the coding interview!')) {
      const newCode = newLanguage === 'python'
        ? '# Welcome to the coding interview!\n# Start coding here...\nprint("Hello from Python!")'
        : '// Welcome to the coding interview!\n// Start coding here...\n'
      setCode(newCode)

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'update',
          code: newCode,
          language: newLanguage
        }))
      }
    } else {
      // Keep the existing code but send the language update
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'update',
          code: code,
          language: newLanguage
        }))
      }
    }
  }, [code])

  // Run code
  const runCode = useCallback(async () => {
    if (!code) return

    setIsRunning(true)
    setOutput('Running code...')

    if (language === 'javascript') {
      try {
        // Create a safe execution context
        const logs = []
        const originalLog = console.log
        const originalError = console.error
        const originalWarn = console.warn

        // Capture console outputs
        console.log = (...args) => {
          logs.push(`[log] ${args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ')}`)
        }

        console.error = (...args) => {
          logs.push(`[error] ${args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ')}`)
        }

        console.warn = (...args) => {
          logs.push(`[warn] ${args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ')}`)
        }

        // Execute the code in a try-catch block
        let result
        try {
          // Use async function evaluation for better error handling
          const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor
          const func = new AsyncFunction(`
            return (async () => {
              ${code}
            })()
          `)
          result = await func()
        } catch (syncError) {
          // Fallback to sync evaluation if async fails
          const func = new Function(code)
          result = func()
        }

        // Restore original console methods
        console.log = originalLog
        console.error = originalError
        console.warn = originalWarn

        // Prepare output
        const consoleOutput = logs.join('\n')

        if (consoleOutput) {
          setOutput(consoleOutput)
        } else if (result !== undefined && result !== null) {
          // Handle different result types
          if (typeof result === 'object') {
            setOutput(JSON.stringify(result, null, 2))
          } else {
            setOutput(String(result))
          }
        } else {
          setOutput('Code executed successfully (no output)')
        }
      } catch (error) {
        // Provide detailed error information
        const errorInfo = {
          name: error.name,
          message: error.message,
          stack: error.stack
        }

        // Try to extract the most relevant error line
        const stackLines = error.stack ? error.stack.split('\n') : []
        const relevantLine = stackLines.find(line =>
          line.includes(':') && !line.includes('at Function') && !line.includes('at AsyncFunction')
        )

        setOutput(`Error: ${error.message}${relevantLine ? `\n${relevantLine.trim()}` : ''}`)
      }
    } else if (language === 'python') {
      try {
        if (!isPyodideLoaded()) {
          setOutput('Loading Python environment (first time only)...')
        }

        const result = await runPython(code)

        if (result.success) {
          setOutput(result.output)
          setLastError(null)
        } else {
          setOutput(result.error)
          setLastError(result.suggestion)
        }
      } catch (error) {
        setOutput(`Failed to execute Python code: ${error.message}`)
      }
    }

    setIsRunning(false)
  }, [code, language])

  // Convert JavaScript comments to Python comments
  const convertCommentsToPython = () => {
    // Convert // comments to # comments
    const pythonCode = code
      // Replace // comments with # comments, but be careful with URLs
      .replace(/(https?:\/\/[^\s]+)|(\/\/.*)/g, (match, url, comment) => {
        if (url) return url; // Keep URLs as is
        if (comment) return comment.replace('//', '#'); // Convert comment
        return match;
      });

    setCode(pythonCode);
    setLastError(null);
    setOutput('Comments converted! Click "Run Code" to execute.');

    // Send update via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'update',
        code: pythonCode,
        language: language
      }));
    }
  };

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
          disabled={isRunning}
          style={{
            padding: '8px 16px',
            backgroundColor: isRunning ? '#666' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            marginLeft: 'auto',
            opacity: isRunning ? 0.7 : 1
          }}
        >
          {isRunning ? 'Running...' : 'Run Code'}
        </button>
        {lastError && lastError.includes('Convert JS Comments') && (
          <button
            onClick={convertCommentsToPython}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginLeft: '10px'
            }}
          >
            Convert JS Comments
          </button>
        )}
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