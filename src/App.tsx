import { useRoutes } from 'react-router'
import { AppRootRoutes } from './routes/AppRootRoutes'

function App() {
  return useRoutes([...AppRootRoutes])
}

export default App
