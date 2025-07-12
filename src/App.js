import React, { useState, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import FornecedorForm from './components/FornecedorForm'
import FornecedorList from './components/FornecedorList'
import LoginRegisterPanel from './components/LoginRegisterPanel'
import Footer from './components/Footer'
import LoadingSpinner from './components/LoadingSpinner'
import logoParceira from './assets/parceira.png'
import logoFonecta from './assets/fonect.png'
import qrCode from './assets/qrcode.png'
import './App.css'

function Header({ mostrarLogin, setMostrarLogin }) {
  const location = useLocation()
  const estaNaPaginaDeCadastro = location.pathname === '/cadastro'

  return (
    <header className="app-header">
      <div className="header-left">
        <img src={logoFonecta} alt="Logo Fonecta" className="logo-fonecta" />
        <h1 className="fonecta-title">FONECTA</h1>
      </div>

      <div className="header-right">
        {estaNaPaginaDeCadastro ? (
          <button
            onClick={() => setMostrarLogin(prev => !prev)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#0066ff',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            {mostrarLogin ? 'Fechar Login' : 'Login'}
          </button>
        ) : (
          <img src={logoParceira} alt="Logo Parceira" className="logo-parceira" />
        )}
      </div>
    </header>
  )
}

function CadastroPage({ mostrarLogin, setMostrarLogin }) {
  return (
    <div className="page-container">
      <div className="app-form-container bloco-flutuante">
        <FornecedorForm />
      </div>

      <div className="login-container bloco-flutuante">
        {mostrarLogin ? (
          <LoginRegisterPanel
            onLoginSuccess={() => {
              setMostrarLogin(false)
            }}
          />
        ) : (
          <div style={{ textAlign: 'center' }}>
            <img
              src={qrCode}
              alt="QR Code para cadastro"
              style={{
                width: '300px',
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              }}
            />
            <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
              Aponte a câmera para se cadastrar
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function AdminPage() {
  return (
    <>
      <div className="app-form-container bloco-flutuante">
        <FornecedorForm />
      </div>
      <div className="app-list-container bloco-flutuante">
        <FornecedorList />
      </div>
    </>
  )
}

function AppContent() {
  const [mostrarLogin, setMostrarLogin] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setCarregando(true)
    const timer = setTimeout(() => setCarregando(false), 500)
    return () => clearTimeout(timer)
  }, [location])

  return (
    <>
      {carregando && <LoadingSpinner />}

      <Header mostrarLogin={mostrarLogin} setMostrarLogin={setMostrarLogin} />

      <main className="app-main">
        <Routes>
          <Route
            path="/cadastro"
            element={
              <CadastroPage
                mostrarLogin={mostrarLogin}
                setMostrarLogin={setMostrarLogin}
              />
            }
          />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/" element={<Navigate to="/cadastro" replace />} />
          <Route
            path="*"
            element={
              <h2 style={{ color: 'white', textAlign: 'center' }}>
                Página não encontrada
              </h2>
            }
          />
        </Routes>
      </main>

      <Footer />
    </>
  )
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <AppContent />
      </div>
    </Router>
  )
}

export default App
