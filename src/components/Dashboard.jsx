// src/components/Dashboard.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

export default function Dashboard({ usuario }) {
  const navigate = useNavigate()
  const [hoveredCard, setHoveredCard] = useState(null)

  const cards = [
    {
      id: 'orcamentos',
      titulo: 'Orçamentos',
      descricao: 'Gerencie suas cotações e comparativos de preços',
      icone: '📊',
      cor: '#667eea',
      rota: '/orcamentos'
    },
    {
      id: 'contatos',
      titulo: 'Contatos',
      descricao: 'Acesse sua lista de fornecedores e parceiros',
      icone: '👥',
      cor: '#27ae60',
      rota: '/contatos'
    },
    {
      id: 'projetos',
      titulo: 'Projetos',
      descricao: 'Acompanhe o andamento das suas obras e demandas',
      icone: '🏗️',
      cor: '#e67e22',
      rota: '/projetos'
    },
    {
      id: 'relatorios',
      titulo: 'Relatórios',
      descricao: 'Visualize dados e exporte informações',
      icone: '📈',
      cor: '#9b59b6',
      rota: '/relatorios'
    }
  ]

  const handleCardClick = (rota) => {
    // Animação sutil antes de navegar
    setHoveredCard(rota)
    setTimeout(() => {
      navigate(rota)
      setHoveredCard(null)
    }, 150)
  }

  return (
    <div className="dashboard-container">
      {/* Cabeçalho de Boas-vindas */}
      <div className="dashboard-header">
        <h1>
          Olá, <span className="user-name">{usuario?.nome || 'Usuário'}</span> 👋
        </h1>
        <p className="dashboard-subtitle">
          Selecione uma opção abaixo para começar
        </p>
      </div>

      {/* Grid de Cards Quadrados */}
      <div className="dashboard-grid">
        {cards.map((card) => (
          <button
            key={card.id}
            className={`dashboard-card ${hoveredCard === card.rota ? 'clicked' : ''}`}
            style={{
              '--card-color': card.cor,
              borderColor: hoveredCard === card.rota ? card.cor : 'transparent'
            }}
            onMouseEnter={() => setHoveredCard(card.rota)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardClick(card.rota)}
          >
            <div className="card-icon" style={{ backgroundColor: `${card.cor}20` }}>
              <span className="icon-emoji">{card.icone}</span>
            </div>
            <h3 className="card-title">{card.titulo}</h3>
            <p className="card-description">{card.descricao}</p>
            <div className="card-arrow">→</div>
          </button>
        ))}
      </div>

      {/* Stats Rápidos (Opcional) */}
      <div className="dashboard-stats">
        <div className="stat-item">
          <span className="stat-number">12</span>
          <span className="stat-label">Orçamentos ativos</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">48</span>
          <span className="stat-label">Fornecedores</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">3</span>
          <span className="stat-label">Pendências</span>
        </div>
      </div>
    </div>
  )
}