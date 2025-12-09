import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage'
import SimpleSessionPage from './components/SimpleSessionPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/session/:sessionId" element={<SimpleSessionPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
