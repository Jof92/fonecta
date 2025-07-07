import React from 'react'
import './EmptyState.css'

export default function EmptyState({ mensagem = 'Nada encontrado.' }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">:(</div>
      <p>{mensagem}</p>
    </div>
  )
}
