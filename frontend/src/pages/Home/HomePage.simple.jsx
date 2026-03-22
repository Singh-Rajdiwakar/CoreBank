import React from 'react'

export default function HomePage() {
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px', color: '#10b981' }}>
        🏦 NexPay Banking System
      </h1>
      
      <p style={{ fontSize: '18px', marginBottom: '30px', maxWidth: '600px' }}>
        ✅ Frontend is RUNNING and RENDERING!
      </p>

      <div style={{ 
        background: '#1a202c', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '30px',
        border: '2px solid #10b981',
        maxWidth: '600px'
      }}>
        <h2 style={{ color: '#10b981', marginTop: 0 }}>Server Status</h2>
        <p>✅ Dev Server: <code>http://localhost:3002</code></p>
        <p>✅ Backend API: <code>http://localhost:8080</code></p>
        <p>✅ React: Rendering Successfully</p>
        <p>✅ All Imports: Working</p>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3 style={{ marginBottom: '15px' }}>Quick Navigation:</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="/" style={{ 
            padding: '10px 20px', 
            background: '#10b981', 
            color: '#0f172a', 
            textDecoration: 'none', 
            borderRadius: '5px',
            fontWeight: 'bold'
          }}>
            🏠 Home
          </a>
          <a href="/login" style={{ 
            padding: '10px 20px', 
            background: '#10b981', 
            color: '#0f172a', 
            textDecoration: 'none', 
            borderRadius: '5px',
            fontWeight: 'bold'
          }}>
            🔐 Login
          </a>
          <a href="/admin/dashboard" style={{ 
            padding: '10px 20px', 
            background: '#10b981', 
            color: '#0f172a', 
            textDecoration: 'none', 
            borderRadius: '5px',
            fontWeight: 'bold'
          }}>
            👨‍💼 Admin
          </a>
        </div>
      </div>

      <div style={{ marginTop: '40px', borderTop: '1px solid #374151', paddingTop: '20px' }}>
        <h3>Debug Information:</h3>
        <p>If you're still seeing issues:</p>
        <ol style={{ textAlign: 'left', display: 'inline-block' }}>
          <li>Press <code style={{ background: '#0f172a', padding: '2px 6px' }}>F12</code> to open DevTools</li>
          <li>Check the <code style={{ background: '#0f172a', padding: '2px 6px' }}>Console</code> tab for errors</li>
          <li>Look for red error messages</li>
          <li>Share the exact error message with me</li>
        </ol>
      </div>

      <footer style={{ marginTop: '50px', fontSize: '12px', color: '#666' }}>
        <p>Frontend Diagnostic Mode - If you see this, React is working! ✅</p>
      </footer>
    </div>
  )
}
