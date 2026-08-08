import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { App } from './App'
import { CrsTool } from './routes/crs/CrsTool'
import { OinpTool } from './routes/oinp/OinpTool'
import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/crs" replace /> },
      { path: 'crs', element: <CrsTool /> },
      { path: 'oinp', element: <OinpTool /> },
      { path: '*', element: <Navigate to="/crs" replace /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
