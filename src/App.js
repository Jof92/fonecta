import React from 'react'
import './App.css'
import FornecedorForm from './components/FornecedorForm'
import FornecedorList from './components/FornecedorList'
import Footer from './components/Footer'

function App() {
  return (
    <div className="app-container">
      {/* Cabeçalho */}
      <header className="app-header">
        <h1>FONECTA</h1>
      </header>

      {/* Conteúdo principal */}
      <main className="app-main">
        <div className="app-form-container">
          <FornecedorForm />
        </div>

        <div className="app-list-container">
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
