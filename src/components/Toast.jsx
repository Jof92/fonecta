import React from 'react'
import './Toast.css'

export default function Toast({ tipo, mensagem, onClose }) {
  return (
    <div className={`toast ${tipo}`}>
      <span>{mensagem}</span>
      <button onClick={onClose} className="toast-close">×</button>
    </div>
  )
}
