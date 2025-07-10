import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import FornecedorForm from './components/FornecedorForm'
import FornecedorList from './components/FornecedorList'
import Footer from './components/Footer'
import logoParceira from './assets/parceira.png'
import logoFonecta from './assets/fonect.png'
import './App.css'

// Cabeçalho com logos ou botão de login
function Header() {
  const location = useLocation()
  const navigate = useNavigate()

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
            onClick={() => navigate('/admin')}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#0066ff',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Login
          </button>
        ) : (
          <img src={logoParceira} alt="Logo Parceira" className="logo-parceira" />
        )}
      </div>
    </header>
  )
}

// Página de cadastro público
function CadastroPage() {
  return (
    <div className="app-form-container bloco-flutuante">
      <FornecedorForm />
    </div>
  )
}

// Página completa (admin) com cadastro e lista
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

// App principal com rotas
function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/cadastro" element={<CadastroPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/" element={<Navigate to="/cadastro" replace />} />
            <Route
              path="*"
              element={<h2 style={{ color: 'white', textAlign: 'center' }}>Página não encontrada</h2>}
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
