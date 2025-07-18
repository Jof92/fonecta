import React, { useState, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { FaSignInAlt } from 'react-icons/fa'

import FornecedorForm from './components/FornecedorForm'
import FornecedorList from './components/FornecedorList'
import LoginRegisterPanel from './components/LoginRegisterPanel'
import Footer from './components/Footer'
import LoadingSpinner from './components/LoadingSpinner'
import BuscaPage from './components/BuscaPage'
import CadastroFornecedor from './components/CadastroExterno'

import logoParceira from './assets/parceira.png'
import logoFonecta from './assets/fonect.png'
import secreImg from './assets/secre.png'
import caixaImg from './assets/caixa.png'

import './App.css'

function CadastroPage() {
  const imagens = [secreImg, caixaImg]
  const frases = [
    <span><strong>Aqui</strong> seus fornecedores se encontram</span>,
    <span><strong>Aqui</strong> todos os seus fornecedores estão reunidos</span>,
  ]

  const [index, setIndex] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % frases.length)
        setFade(true)
      }, 1000)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        className="carousel-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          marginTop: '3rem',
          opacity: fade ? 1 : 0,
          transition: 'opacity 1s ease-in-out',
          flexWrap: 'wrap',
          padding: '0 1rem',
          textAlign: 'center'
        }}
      >
        <img
          src={imagens[index]}
          alt="Imagem rotativa"
          style={{
            width: '100%',
            maxWidth: '500px',
            borderRadius: '12px'
          }}
        />
        <p
          style={{
            fontSize: '1.8rem',
            fontWeight: '400',
            color: '#ffffff',
            maxWidth: '400px',
            lineHeight: '1.5',
          }}
        >
          {frases[index]}
        </p>
      </div>
    </div>
  )
}

function AdminPage() {
  const navigate = useNavigate()

  return (
    <>
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => navigate('/cadastro-externo')}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Abrir Cadastro Externo
        </button>
      </div>

      <div className="app-form-container bloco-flutuante">
        <FornecedorForm />
      </div>

      <div className="app-list-container bloco-flutuante">
        <FornecedorList />
      </div>
    </>
  )
}

function Header({ mostrarLogin, setMostrarLogin }) {
  const location = useLocation()
  const pathname = location.pathname

  const estaNaHome = pathname === '/'
  const estaNoCadastroExterno = pathname === '/cadastro-externo'

  return (
    <header className="app-header" style={{ position: 'relative', zIndex: 10 }}>
      <div className="header-left">
        <img src={logoFonecta} alt="Logo Fonecta" className="logo-fonecta" />
        <h1 className="fonecta-title">FONECTA</h1>
      </div>

      {!estaNoCadastroExterno && (
        <div className="header-right">
          {estaNaHome ? (
            <button
              onClick={() => setMostrarLogin((prev) => !prev)}
              className="login-button"
            >
              <span className="login-text">
                {mostrarLogin ? 'Fechar Login' : 'Login'}
              </span>
              <FaSignInAlt className="login-icon" />
            </button>
          ) : (
            <img src={logoParceira} alt="Logo Parceira" className="logo-parceira" />
          )}
        </div>
      )}
    </header>
  )
}

function AppContent() {
  const [mostrarLogin, setMostrarLogin] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const location = useLocation()

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setCarregando(true)
    const timer = setTimeout(() => setCarregando(false), 400)
    return () => clearTimeout(timer)
  }, [location])

  function fecharLogin() {
    setMostrarLogin(false)
  }

  return (
    <>
      {carregando && <LoadingSpinner />}

      <Header mostrarLogin={mostrarLogin} setMostrarLogin={setMostrarLogin} />

      {/* Caixa suspensa logo abaixo do header */}
      {!carregando && mostrarLogin && (
        <div
          className="login-dropdown"
          style={{
            position: 'absolute',
            top: '70px', // ajuste conforme a altura do header
            right: '2rem',
            zIndex: 1000,
            borderRadius: '8px',
            padding: '1rem',
          
          }}
        >
          <LoginRegisterPanel onLoginSuccess={() => setMostrarLogin(false)} />
        </div>
      )}

      {mostrarLogin && isMobile && (
        <div className="login-overlay" onClick={fecharLogin}></div>
      )}

      <main className="app-main">
        <Routes>
          <Route path="/" element={
            <CadastroPage />
          } />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/cadastro-externo" element={<CadastroFornecedor />} />
          <Route path="/busca" element={<BuscaPage />} />
          <Route path="*" element={
            <h2 style={{ color: 'white', textAlign: 'center' }}>
              Página não encontrada
            </h2>
          } />
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
