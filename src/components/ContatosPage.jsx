// src/components/ContatosPage.jsx
import React from 'react'
import './ContatosPage.css'

export default function ContatosPage({ usuario }) {
  return (
    <div className="contatos-page">
      <div className="page-header">
        <h1>👥 Contatos</h1>
        <p className="page-subtitle">Gerencie seus fornecedores e parceiros</p>
      </div>

      <div className="contatos-placeholder">
        <p>🚧 Página de contatos em desenvolvimento</p>
        <p style={{ color: '#7f8c8d', marginTop: '1rem' }}>
          Em breve você poderá:<br/>
          • Cadastrar novos fornecedores<br/>
          • Filtrar por categoria/região<br/>
          • Enviar cotações em massa<br/>
          • Ver histórico de negociações
        </p>
        <button 
          className="btn-primary" 
          onClick={() => window.location.href = '/cadastro-externo'}
          style={{ marginTop: '1.5rem' }}
        >
          + Cadastrar Fornecedor Agora
        </button>
      </div>
    </div>
  )
}