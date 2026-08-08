import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { App } from './App'
import { HomePage } from './routes/home/HomePage'
import { CrsTool } from './routes/crs/CrsTool'
import { OinpTool } from './routes/oinp/OinpTool'
import { BcTool } from './routes/bc/BcTool'
import { SaskatchewanTool } from './routes/saskatchewan/SaskatchewanTool'
import { AlbertaTool } from './routes/alberta/AlbertaTool'
import { ManitobaTool } from './routes/manitoba/ManitobaTool'
import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'crs', element: <CrsTool /> },
      { path: 'oinp', element: <OinpTool /> },
      { path: 'bc', element: <BcTool /> },
      { path: 'saskatchewan', element: <SaskatchewanTool /> },
      { path: 'alberta', element: <AlbertaTool /> },
      { path: 'manitoba', element: <ManitobaTool /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
