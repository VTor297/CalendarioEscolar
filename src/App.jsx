import { useState } from 'react'
import './App.css'
import CoordenacaoApp from "./pages/Cordenacao"

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>

  <CoordenacaoApp />
      

    </div>
  )
}

export default App
