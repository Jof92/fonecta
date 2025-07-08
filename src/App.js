import React from 'react'
import './App.css'
import FornecedorForm from './components/FornecedorForm'
import FornecedorList from './components/FornecedorList'
import Footer from './components/Footer'
import logoParceira from './assets/parceira.png' // logo parceira
import logoFonecta from './assets/fonect.png' // seu logo Fonecta

function App() {
  return (
    <div className="app-container">
      {/* Cabeçalho */}
      <header className="app-header">
        <div className="header-left">
          <img src={logoFonecta} alt="Logo Fonecta" className="logo-fonecta" />
          <h1 className="fonecta-title">FONECTA</h1>
        </div>
        <div className="header-right">
          <img src={logoParceira} alt="Logo Parceira" className="logo-parceira" />
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="app-main">
        <div className="app-form-container bloco-flutuante">
          <FornecedorForm />
        </div>

        <div className="app-list-container bloco-flutuante">
          <FornecedorList />
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        © 2025 FONECTA. Todos os direitos reservados.
      </footer>
    </div>
  )
}

export default App
