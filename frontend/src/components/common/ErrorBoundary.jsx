import { Component } from 'react'
import { Alert, AlertTitle } from '@mui/material'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error) {
    console.error('ErrorBoundary caught an error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert severity="error">
          <AlertTitle>Something went wrong</AlertTitle>
          {this.state.error?.message}
        </Alert>
      )
    }

    return this.props.children
  }
}