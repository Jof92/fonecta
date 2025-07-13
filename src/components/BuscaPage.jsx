import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { FaCopy } from 'react-icons/fa'
import './BuscaPage.css'
import EmptyState from './EmptyState'

export default function FornecedorListBusca() {
  const [busca, setBusca] = useState('')
  const [fornecedores, setFornecedores] = useState([])
  const [copiadoId, setCopiadoId] = useState(null)
  const [sugestoes, setSugestoes] = useState([])
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)
  const [marcados, setMarcados] = useState(new Set())

  useEffect(() => {
    buscarFornecedores()
  }, [busca])

  const buscarFornecedores = async () => {
    const { data, error } = await supabase.from('fornecedores').select('*')
    if (error) return console.error('Erro ao buscar fornecedores:', error)

    if (busca.trim() === '') {
      setFornecedores(data)
      return
    }

    const termo = busca.toLowerCase()
    const filtrados = data.filter(f =>
      (f.nome && f.nome.toLowerCase().includes(termo)) ||
      (f.empresa && f.empresa.toLowerCase().includes(termo)) ||
      (Array.isArray(f.tags) && f.tags.some(tag => tag.toLowerCase().includes(termo)))
    )
    setFornecedores(filtrados)
  }

  const buscarSugestoes = async (texto) => {
    if (texto.length < 4) return setMostrarSugestoes(false)

    const { data, error } = await supabase
      .from('fornecedores')
      .select('tags')
      .not('tags', 'is', null)
      .limit(50)

    if (error) return console.error('Erro ao buscar tags:', error)

    const tags = [...new Set(
      data.flatMap(f => (Array.isArray(f.tags) ? f.tags : []))
    )]

    const filtradas = tags.filter(tag =>
      tag.toLowerCase().includes(texto.toLowerCase())
    ).map(tag => tag.startsWith('#') ? tag : `#${tag}`)

    setSugestoes(filtradas)
    setMostrarSugestoes(true)
  }

  const copiarContato = (f) => {
    const texto = `Nome: ${f.nome}\nEmpresa: ${f.empresa}\nWhatsApp: ${f.whatsapp}`
    navigator.clipboard.writeText(texto).then(() => {
      setCopiadoId(f.id)
      setTimeout(() => setCopiadoId(null), 2000)
    })
  }

  const toggleMarcado = (id) => {
    const novo = new Set(marcados)
    if (novo.has(id)) novo.delete(id)
    else novo.add(id)
    setMarcados(novo)
  }

  return (
    <div className="fornecedor-wrapper">
      <h2>Buscar Fornecedores</h2>

      <div className="search-input-wrapper" style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Digite nome, empresa ou #tag"
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value)
            buscarSugestoes(e.target.value)
          }}
          className="search-input"
          onFocus={() => busca.length >= 4 && setMostrarSugestoes(true)}
          onBlur={() => setTimeout(() => setMostrarSugestoes(false), 150)}
        />
        {busca && (
          <button className="clear-button" onClick={() => setBusca('')} type="button">×</button>
        )}
        {mostrarSugestoes && sugestoes.length > 0 && (
          <ul className="tag-sugestoes">
            {sugestoes.map((tag, i) => (
              <li key={i} className="tag-sugestao" onMouseDown={() => setBusca(tag)}>
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="fornecedor-list-container">
        <ul className="fornecedor-list">
          {fornecedores
            .slice()
            .sort((a, b) => a.nome.localeCompare(b.nome))
            .map((f) => (
              <li
                key={f.id}
                className={`fornecedor-item ${marcados.has(f.id) ? 'marcado' : ''}`}
              >
                <div className="fornecedor-info" style={{ flex: 1 }}>
                  <strong>{f.nome}</strong> — {f.empresa} <br />
                  📱{' '}
                  <a
                    href={`https://wa.me/${f.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fornecedor-whatsapp-link"
                  >
                    {f.whatsapp}
                  </a>
                  <br />
                  🏷️{' '}
                  {f.tags?.map((tag) => (
                    <button
                      key={tag}
                      className="tag-button"
                      onClick={() => setBusca(tag)}
                      type="button"
                    >
                      {tag}
                    </button>
                  ))}
                  {marcados.has(f.id) && (
                    <div className="marcado-alerta">Contato com erro ou inexistente</div>
                  )}
                </div>
                <div className="fornecedor-actions">
                  <FaCopy
                    className={`action-icon ${copiadoId === f.id ? 'copied' : ''}`}
                    title="Copiar contato"
                    onClick={() => copiarContato(f)}
                  />
                  <span
                    className={`checkbox-problema ${marcados.has(f.id) ? 'checked' : ''}`}
                    onClick={() => toggleMarcado(f.id)}
                    title="Marcar contato com problema"
                  >
                    {marcados.has(f.id) ? '✔' : '☐'}
                  </span>
                </div>
              </li>
            ))}
          {fornecedores.length === 0 && <EmptyState mensagem="Não encontrei nada... que pena!" />}
        </ul>
      </div>

      <p className="fornecedor-quantidade">
        Total de fornecedores exibidos: {fornecedores.length}
      </p>
    </div>
  )
}
