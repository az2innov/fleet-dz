import React, { Component, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dz-Fleet AI Erreur :', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0b0f19',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            marginBottom: '16px'
          }}>
            ⚠️
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
            Erreur d'exécution Dz-Fleet AI
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '480px', marginBottom: '20px', lineHeight: '1.6' }}>
            Un problème de cache ou de script est survenu dans votre session de navigation.
          </p>
          <div style={{
            backgroundColor: '#121929',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            maxWidth: '640px',
            width: '100%',
            textAlign: 'left',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#fca5a5',
            marginBottom: '24px',
            overflow: 'auto',
            maxHeight: '160px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>
              {this.state.error?.toString()}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'pre-wrap' }}>
              {this.state.errorInfo?.componentStack}
            </div>
          </div>
          <button
            onClick={this.handleReset}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              backgroundColor: '#059669',
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: '13px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)'
            }}
          >
            🔄 Vider le Cache & Relancer l'Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);
