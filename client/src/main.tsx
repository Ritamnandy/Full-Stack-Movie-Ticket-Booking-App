import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/react'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if ( !publishableKey ) {
    throw new Error( 'Missing VITE_CLERK_PUBLISHABLE_KEY' )
}

createRoot( document.getElementById( 'root' )! ).render(
    <ClerkProvider publishableKey={ publishableKey }>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </ClerkProvider>
)
