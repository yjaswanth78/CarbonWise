import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App Component', () => {
  it('renders the login screen initially', () => {
    render(<App />)
    
    // The login screen should display the app title
    const heading = screen.getByText(/CarbonWise/i)
    expect(heading).toBeDefined()

    // Should have a button for sign in
    const signInButton = screen.getByRole('button', { name: /Sign In \/ Join/i })
    expect(signInButton).toBeDefined()
  })
})
