import './styles/globals.css';
import '@interchain-ui/react/styles';
import { ThemeProvider, Toaster } from '@interchain-ui/react';

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'


const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
      <Toaster position={'top-right'} closeButton={true} />
    </ThemeProvider>
  </StrictMode>,
)