import { createRoot } from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import App from './App.tsx'
import '@mantine/core/styles.css'

createRoot(document.getElementById('root')!).render(
  <MantineProvider>
    <App />
  </MantineProvider>
)