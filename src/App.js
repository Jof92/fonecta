// src/App.jsx
import React, { useState, useEffect, useRef } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom'

import Header from './components/Header'
import Footer from './components/Footer'
import LoginRegisterPanel from './components/LoginRegisterPanel'
import LoadingSpinner from './components/LoadingSpinner'
import BuscaPage from './components/BuscaPage'
import CadastroFornecedor from './components/CadastroExterno'
import AdminPage from './components/AdminPage'
import Cnpj from './components/Cnpj'

/*import secreImg from './assets/secre.png'*/
import caixaImg from './assets/caixa.png'
import maoImg from './assets/mao.png'
import empiImg from './assets/empi.png'
import onboxImg from './assets/onbox.png'


// Importa a engrenagem SVG como componente React
import { ReactComponent as GearIcon } from './assets/icon/gear.svg'

import './App.css'

function CadastroPage() {
  const imagens = [ maoImg, caixaImg, empiImg, onboxImg]
  const frases = [
    /*<span><strong>Aqui</strong> seus fornecedores se encontram</span>,*/
    <span>Seu <strong>Projeto</strong> começa com boas conexões</span>,
    <span><strong>Aqui</strong> todos os seus fornecedores estão reunidos</span>,
    <span>Mais <strong>Agilidade</strong> para encontrar quem resolve</span>,
    <span><strong>Vem</strong> ai!</span>,
  ]

  const [index, setIndex] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    let timeoutFadeOut
    let timeoutFadeIn

    function nextSlide() {
      timeoutFadeOut = setTimeout(() => {
        setFade(false)
        timeoutFadeIn = setTimeout(() => {
          setIndex((prev) => (prev + 1) % frases.length)
          setFade(true)
          nextSlide()
        }, 1000)
      }, 9000)
    }

    nextSlide()

    return () => {
      clearTimeout(timeoutFadeOut)
      clearTimeout(timeoutFadeIn)
    }
  }, [frases.length])

  return (
    <div
      className="page-container"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
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
          textAlign: 'center',
        }}
      >
        <img
          src={imagens[index]}
          alt="Imagem rotativa"
          style={{
            width: '100%',
            maxWidth: '500px',
            borderRadius: '12px',
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

function AppContent({ tema, setTema }) {
  const location = useLocation()

  // Forçar tema padrão na página inicial
  const temaAtual = location.pathname === '/' ? 'default' : tema

  const [mostrarLogin, setMostrarLogin] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [reports, setReports] = useState([]) // mensagens novas
  const [novosCadastros, setNovosCadastros] = useState([]) // cadastros externos

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

  function adicionarReport(report) {
    setReports((prev) => [...prev, report])
  }

  function adicionarNovoCadastro(cadastro) {
    setNovosCadastros((prev) => [...prev, cadastro])
  }

  return (
    <>
      {carregando && <LoadingSpinner />}

      <div className={`app-container tema-${temaAtual}`}>
        <Header
          mostrarLogin={mostrarLogin}
          setMostrarLogin={setMostrarLogin}
          reports={reports}
          novosCadastros={novosCadastros}
          tema={tema}
          setTema={setTema}
        />

        {!carregando && mostrarLogin && (
          <div
            className="login-dropdown"
            style={{
              position: 'absolute',
              top: '70px',
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
            <Route path="/" element={<CadastroPage />} />
            <Route
              path="/admin"
              element={
                <AdminPage
                  reports={reports}
                  setReports={setReports}
                  novosCadastros={novosCadastros}
                  setNovosCadastros={setNovosCadastros}
                />
              }
            />
            <Route path="/busca" element={<BuscaPage adicionarReport={adicionarReport} />} />
            <Route
              path="/cadastro-externo"
              element={<CadastroFornecedor adicionarNovoCadastro={adicionarNovoCadastro} />}
            />
            <Route path="/cnpj" element={<Cnpj />} />
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
      </div>
    </>
  )
}

export default function App() {
  const [tema, setTema] = useState('default')

  return (
    <Router>
      <AppContent tema={tema} setTema={setTema} />
    </Router>
  )
}
