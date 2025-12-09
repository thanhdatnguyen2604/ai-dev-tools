import { useRef, useEffect, useCallback } from 'react'
import * as monaco from 'monaco-editor'

const CodeEditor = ({
  value = '',
  language = 'javascript',
  onChange = null,
  theme = 'vs-dark',
  options = {}
}) => {
  const editorRef = useRef(null)
  const monacoRef = useRef(null)

  // Default editor options
  const defaultOptions = {
    selectOnLineNumbers: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    tabSize: 2,
    insertSpaces: true,
    wordWrap: 'on',
    automaticLayout: true,
    lineNumbers: 'on',
    roundedSelection: false,
    readOnly: false,
    cursorStyle: 'line',
    wordBasedSuggestions: true,
    bracketPairColorization: { enabled: true },
    suggest: {
      showKeywords: true,
      showSnippets: true,
    },
    ...options
  }

  // Initialize Monaco Editor
  useEffect(() => {
    if (editorRef.current && !monacoRef.current) {
      // Configure Python language support
      monaco.languages.register({ id: 'python' })

      // Set up Python syntax highlighting if not already available
      monaco.languages.setMonarchTokensProvider('python', {
        tokenizer: {
          root: [
            [/[a-zA-Z_]\w*/, {
              cases: {
                '@keywords': 'keyword',
                '@default': 'identifier'
              }
            }],
            [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
            [/0[xX][0-9a-fA-F]+/, 'number.hex'],
            [/\d+/, 'number'],
            [/".*?"/, 'string'],
            [/'.*?'/, 'string'],
            [/#.*$/, 'comment'],
            [/[{}()\[\]]/, '@brackets'],
            [/[<>](?!@symbols)/, '@brackets'],
            [/@symbols/, 'operator'],
            [/\s*\n/, null],
          ],
        },
        keywords: [
          'and', 'as', 'assert', 'break', 'class', 'continue', 'def',
          'del', 'elif', 'else', 'except', 'exec', 'finally', 'for',
          'from', 'global', 'if', 'import', 'in', 'is', 'lambda',
          'not', 'or', 'pass', 'print', 'raise', 'return', 'try',
          'while', 'with', 'yield', 'True', 'False', 'None', 'async',
          'await', 'nonlocal'
        ],
      })

      // Create the editor instance
      monacoRef.current = monaco.editor.create(editorRef.current, {
        value: value,
        language: language,
        theme: theme,
        options: defaultOptions,
      })

      // Store editor instance globally for external access
      window.editor = monacoRef.current

      // Add change listener if onChange prop is provided
      if (onChange) {
        const disposable = monacoRef.current.onDidChangeModelContent(() => {
          const newValue = monacoRef.current.getValue()
          onChange(newValue)
        })

        return () => {
          disposable.dispose()
        }
      }
    }

    return () => {
      if (monacoRef.current) {
        monacoRef.current.dispose()
        monacoRef.current = null
      }
    }
  }, [])

  // Update editor value when value prop changes
  useEffect(() => {
    if (monacoRef.current && value !== monacoRef.current.getValue()) {
      monacoRef.current.setValue(value)
    }
  }, [value])

  // Update language when language prop changes
  useEffect(() => {
    if (monacoRef.current) {
      const model = monacoRef.current.getModel()
      if (model) {
        monaco.editor.setModelLanguage(model, language)
      }
    }
  }, [language])

  // Update theme when theme prop changes
  useEffect(() => {
    if (monacoRef.current) {
      monaco.editor.setTheme(theme)
    }
  }, [theme])

  // Update options when options prop changes
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.updateOptions(defaultOptions)
    }
  }, [options])

  return (
    <div
      ref={editorRef}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  )
}

export default CodeEditor