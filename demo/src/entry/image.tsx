import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import ImagePage from '../page/ImagePage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ImagePage />
  </StrictMode>,
)
