import { useRoutes } from 'react-router'
import { routes } from '@/routes'
import { AppRootRoutes } from './routes/AppRootRoutes'

function App() {
  return useRoutes([...routes, ...AppRootRoutes])
}

export default App
