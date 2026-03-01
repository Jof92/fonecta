import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaSearch, FaBuilding, FaAddressBook, FaClipboardList } from 'react-icons/fa'
import './HomePage.css'

const cards = [
  {
    id: 'busca',
    icon: <FaSearch size={32} />,
    label: 'Buscar Fornecedores',
    descricao: 'Encontre fornecedores por nome, empresa ou #tag',
    rota: '/busca',
    cor: 'blue',
    destaque: true,
  },
  {
    id: 'cnpj',
    icon: <FaBuilding size={32} />,
    label: 'Consultar CNPJ',
    descricao: 'Verifique dados de empresas pelo CNPJ',
    rota: '/cnpj',
    cor: 'green',
  },
  {
    id: 'cadastro',
    icon: <FaAddressBook size={32} />,
    label: 'Cadastrar Fornecedor',
    descricao: 'Adicione novos fornecedores à base de dados',
    rota: '/admin',
    cor: 'orange',
  },
  {
    id: 'pedidos',
    icon: <FaClipboardList size={32} />,
    label: 'Pedidos',
    descricao: 'Gerencie e acompanhe seus pedidos de cotação',
    rota: '/pedidos',
    cor: 'purple',
  },
]

export default function HomePage({ nomeUsuario = 'Admin' }) {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="home-wrapper">

      <div className={`home-header ${visible ? 'home-header--visible' : ''}`}>
        <p className="home-saudacao">
          {saudacao}, <span className="home-nome">{nomeUsuario}</span> 👋
        </p>
        <p className="home-subtexto">O que você precisa hoje?</p>
      </div>

      <div className="home-grid">
        {cards.map((card, i) => (
          <button
            key={card.id}
            className={[
              'home-card',
              `home-card--${card.cor}`,
              visible ? 'home-card--visible' : '',
              card.destaque ? 'home-card--destaque' : '',
            ].join(' ')}
            style={{ transitionDelay: `${i * 80}ms` }}
            onClick={() => navigate(card.rota)}
          >
            {card.destaque && <span className="home-card__barra" />}

            <span className="home-card__icone">{card.icon}</span>
            <p className="home-card__label">{card.label}</p>
            <p className="home-card__desc">{card.descricao}</p>
          </button>
        ))}
      </div>

      <p className={`home-rodape ${visible ? 'home-rodape--visible' : ''}`}>
        Fonecta · Plataforma de Compradores e Fornecedores
      </p>
    </div>
  )
}