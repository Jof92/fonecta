import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { FaSignInAlt, FaEnvelope } from 'react-icons/fa'

import logoFonecta from '../assets/fonect.png'
import logoParceira from '../assets/parceira.png'

export default function Header({ mostrarLogin, setMostrarLogin, reports = [] }) {
  const location = useLocation()
  const pathname = location.pathname

  const estaNaHome = pathname === '/'
  const estaNoCadastroExterno = pathname === '/cadastro-externo'
  const estaNaAdmin = pathname === '/admin'

  const [mostrarBoxReports, setMostrarBoxReports] = useState(false)
  const [reportSelecionado, setReportSelecionado] = useState(null)

  // Guarda os IDs das mensagens já lidas
  const [idsLidos, setIdsLidos] = useState(new Set())

  // Calcula as mensagens não lidas (que ainda não estão no Set idsLidos)
  const mensagensNaoLidas = reports.filter(r => !idsLidos.has(r.id))

  // Quando abrir o painel de mensagens, fecha o detalhe e mantém o contador
  function toggleBoxReports() {
    setMostrarBoxReports((prev) => {
      const novoEstado = !prev
      if (novoEstado) setReportSelecionado(null)
      return novoEstado
    })
  }

  // Quando abrir o detalhe de uma mensagem, marca ela como lida (adiciona ao Set)
  function abrirDetalhe(report) {
    setReportSelecionado(report)
    setIdsLidos((prev) => new Set(prev).add(report.id))
  }

  function fecharDetalhe() {
    setReportSelecionado(null)
  }

  // Cor do ícone: azul escuro se houver mensagens não lidas, azul claro se não
  const corIcone = mensagensNaoLidas.length > 0 ? '#004a99' : '#4a90e2'

  return (
    <header className="app-header" style={{ position: 'relative', zIndex: 10 }}>
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <img src={logoFonecta} alt="Logo Fonecta" className="logo-fonecta" />
        <h1 className="fonecta-title">FONECTA</h1>
      </div>

      {!estaNoCadastroExterno && (
        <div
          className="header-right"
          style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
        >
          {estaNaAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* Ícone de mensagens */}
              <button
                onClick={toggleBoxReports}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Mensagens de Reporte"
              >
                <FaEnvelope
                  color={corIcone}
                  size={24}
                />
                {mensagensNaoLidas.length > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      background: 'red',
                      borderRadius: '50%',
                      color: 'white',
                      padding: '2px 6px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      lineHeight: '1',
                    }}
                  >
                    {mensagensNaoLidas.length}
                  </span>
                )}
              </button>

              {/* Logo parceira à direita do ícone */}
              <img
                src={logoParceira}
                alt="Logo Parceira"
                className="logo-parceira"
              />
            </div>
          )}

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
            !estaNaAdmin && <img src={logoParceira} alt="Logo Parceira" className="logo-parceira" />
          )}
        </div>
      )}

      {/* Painel de mensagens */}
      {mostrarBoxReports && estaNaAdmin && (
        <div
          style={{
            position: 'absolute',
            top: '3.5rem',
            right: '1rem',
            width: '280px',
            maxHeight: '300px',
            overflowY: 'auto',
            background: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            borderRadius: '8px',
            padding: '0.5rem',
            zIndex: 1000,
          }}
        >
          {!reportSelecionado ? (
            <>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Mensagens</h4>
              {reports.map((r) => (
                <div
                  key={r.id}
                  style={{
                    padding: '0.4rem 0.5rem',
                    borderBottom: '1px solid #ddd',
                    cursor: 'pointer',
                    backgroundColor: idsLidos.has(r.id) ? '#f0f0f0' : 'white',
                  }}
                  onClick={() => abrirDetalhe(r)}
                >
                  <strong>{r.nomePessoa}</strong>
                </div>
              ))}
            </>
          ) : (
            <div>
              <button
                onClick={fecharDetalhe}
                style={{ marginBottom: '0.5rem', cursor: 'pointer' }}
              >
                ← Voltar
              </button>
              <p>
                <strong>Nome:</strong> {reportSelecionado.nomePessoa}
              </p>
              <p>
                <strong>Contato marcado como erro:</strong> {reportSelecionado.contatoMarcado}
              </p>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
