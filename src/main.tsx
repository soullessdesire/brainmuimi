import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from "sonner"
import { HelmetProvider } from "react-helmet-async"
import App from './App.tsx'
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query"


const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster position='bottom-right' richColors closeButton/>
    </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
)
