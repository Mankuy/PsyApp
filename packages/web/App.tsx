import { useEffect } from 'react'

function App() {
  useEffect(() => {
    console.log('mounted')
  }, [])
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  )
}
export default App
