// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';

// Check if the root element exists
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('❌ Root element not found!');

  // Create a fallback UI if root element is missing
  document.body.innerHTML = `
    <div style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="
        background: white;
        padding: 2.5rem;
        border-radius: 1rem;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        text-align: center;
        max-width: 500px;
        margin: 1rem;
      ">
        <div style="
          width: 80px;
          height: 80px;
          background: #fee2e2;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          font-size: 2.5rem;
        ">
          ⚠️
        </div>
        <h1 style="
          color: #dc2626;
          margin-bottom: 0.5rem;
          font-size: 1.875rem;
          font-weight: bold;
        ">
          Application Error
        </h1>
        <p style="
          color: #4b5563;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        ">
          The application cannot start because the root element (#root) was not found in the HTML.
        </p>
        <div style="
          background: #f3f4f6;
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
          text-align: left;
        ">
          <p style="
            color: #374151;
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
          ">
            <strong>Possible solutions:</strong>
          </p>
          <ul style="
            color: #6b7280;
            font-size: 0.875rem;
            margin: 0;
            padding-left: 1.25rem;
            line-height: 1.6;
          ">
            <li>Check if your HTML file contains: <code>&lt;div id="root"&gt;&lt;/div&gt;</code></li>
            <li>Make sure the script is loaded after the DOM is ready</li>
            <li>Clear your browser cache and try again</li>
          </ul>
        </div>
        <button 
          onclick="window.location.reload()" 
          style="
            background: #3b82f6;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            cursor: pointer;
            font-weight: 500;
            font-size: 1rem;
            transition: background 0.2s;
            margin-bottom: 0.5rem;
          "
          onmouseover="this.style.background='#2563eb'"
          onmouseout="this.style.background='#3b82f6'"
        >
          Reload Page
        </button>
        <p style="
          color: #9ca3af;
          font-size: 0.75rem;
          margin-top: 1rem;
        ">
          AI Resume Builder v1.0.0
        </p>
      </div>
    </div>
  `;

  throw new Error('Root element (#root) not found in the DOM');
}

// Simple error boundary for development
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error: error
    };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service here
    console.error('🔥 Error caught by boundary:', error);
    console.error('📋 Error info:', errorInfo);

    this.setState({
      errorInfo: errorInfo
    });

    // Optional: Send error to analytics service
    // if (window.analytics) {
    //   window.analytics.track('React Error', {
    //     error: error.toString(),
    //     componentStack: errorInfo.componentStack
    //   });
    // }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.reload();
  }

  handleReport = () => {
    // You can implement error reporting here
    const errorData = {
      error: this.state.error?.toString(),
      componentStack: this.state.errorInfo?.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    console.log('📤 Error report:', errorData);
    alert('Error reported to console. Thank you!');
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                background: '#fef3c7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d97706',
                fontSize: '1.5rem'
              }}>
                ⚠️
              </div>
              <div>
                <h1 style={{
                  margin: 0,
                  color: '#111827',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}>
                  Something went wrong
                </h1>
                <p style={{
                  margin: '0.25rem 0 0',
                  color: '#6b7280',
                  fontSize: '0.875rem'
                }}>
                  The application encountered an unexpected error
                </p>
              </div>
            </div>

            <div style={{
              background: '#f9fafb',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1.5rem',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: '#dc2626',
              maxHeight: '200px',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              <strong>Error:</strong> {this.state.error?.toString()}
              <br /><br />
              <strong>Component Stack:</strong>
              <br />
              {this.state.errorInfo?.componentStack}
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={this.handleReset}
                style={{
                  flex: 1,
                  minWidth: '120px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#2563eb'}
                onMouseOut={(e) => e.target.style.background = '#3b82f6'}
              >
                Reload Application
              </button>

              <button
                onClick={this.handleReport}
                style={{
                  flex: 1,
                  minWidth: '120px',
                  background: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#f9fafb';
                  e.target.style.borderColor = '#9ca3af';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.borderColor = '#d1d5db';
                }}
              >
                Report Error
              </button>

              <button
                onClick={() => window.history.back()}
                style={{
                  flex: 1,
                  minWidth: '120px',
                  background: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#f9fafb';
                  e.target.style.borderColor = '#9ca3af';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.borderColor = '#d1d5db';
                }}
              >
                Go Back
              </button>
            </div>

            <div style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid #e5e7eb',
              color: '#6b7280',
              fontSize: '0.75rem'
            }}>
              <p style={{ margin: '0.25rem 0' }}>
                <strong>Need help?</strong> Contact support at support@resumebuilder.com
              </p>
              <p style={{ margin: '0.25rem 0' }}>
                AI Resume Builder v1.0.0 • {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Render the app
try {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );

  // Log successful start
  console.log('🚀 AI Resume Builder started successfully');
  console.log('📱 Mode:', import.meta.env.MODE);
  console.log('🌐 Environment:', import.meta.env.DEV ? 'Development' : 'Production');

  // Performance monitoring
  if (import.meta.env.DEV) {
    console.log('⚡ Performance monitoring enabled in development');
  }

} catch (error) {
  console.error('❌ Failed to render React application:', error);

  // Show a basic error message
  rootElement.innerHTML = `
    <div style="
      padding: 2rem;
      text-align: center;
      background: #fee2e2;
      border-radius: 0.5rem;
      border: 1px solid #fca5a5;
      color: #dc2626;
    ">
      <h2 style="margin-top: 0;">Failed to start application</h2>
      <p>${error.message}</p>
      <button 
        onclick="window.location.reload()"
        style="
          background: #dc2626;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
          cursor: pointer;
          margin-top: 1rem;
        "
      >
        Try Again
      </button>
    </div>
  `;

  throw error;
}

// Global error handlers
window.addEventListener('error', (event) => {
  console.error('🌐 Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🔗 Unhandled promise rejection:', event.reason);
});

// Development only features
if (import.meta.env.DEV) {
  // Enable React DevTools
  console.log('🔧 React DevTools enabled in development');

  // Add a global refresh shortcut (Ctrl + R)
  window.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'r') {
      console.log('🔄 Manual refresh triggered');
    }
  });
}

// Optional: Add a loading indicator
const style = document.createElement('style');
style.textContent = `
  /* Loading animation */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  #root {
    animation: fadeIn 0.3s ease-in;
  }
  
  /* Better focus styles */
  :focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
    border-radius: 0.25rem;
  }
  
  /* Print styles */
  @media print {
    .no-print {
      display: none !important;
    }
  }
`;
document.head.appendChild(style);

// Export for testing purposes
export { ErrorBoundary };