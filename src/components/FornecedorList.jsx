import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { FaEdit, FaTrash, FaCopy } from 'react-icons/fa'
import './FornecedorList.css'
import EmptyState from './EmptyState'

export default function FornecedorList() {
  const [busca, setBusca] = useState('')
  const [fornecedores, setFornecedores] = useState([])
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({
    nome: '',
    empresa: '',
    whatsapp: '',
    tags: ''
  })

  const [modoSelecao, setModoSelecao] = useState(false)
  const [selecionados, setSelecionados] = useState(new Set())
  const [copiadoId, setCopiadoId] = useState(null)
  const [sugestoes, setSugestoes] = useState([])
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)

  useEffect(() => {
    buscarFornecedores()
  }, [busca])

  const buscarFornecedores = async () => {
    const { data, error } = await supabase.from('fornecedores').select('*')

    if (error) {
      console.error('Erro ao buscar fornecedores:', error)
      return
    }

    if (busca.trim() === '') {
      setFornecedores(data)
      setSelecionados(new Set())
      setModoSelecao(false)
      return
    }

    const termo = busca.toLowerCase()

    const filtrados = data.filter(f =>
      (f.nome && f.nome.toLowerCase().includes(termo)) ||
      (f.empresa && f.empresa.toLowerCase().includes(termo)) ||
      (Array.isArray(f.tags) && f.tags.some(tag => tag.toLowerCase().includes(termo)))
    )

    setFornecedores(filtrados)
    setSelecionados(new Set())
    setModoSelecao(false)
  }

  const buscarSugestoes = async (texto) => {
    if (texto.length < 4) {
      setSugestoes([])
      setMostrarSugestoes(false)
      return
    }

    const { data: tagsData, error: tagsError } = await supabase
      .from('fornecedores')
      .select('tags')
      .not('tags', 'is', null)
      .limit(50)

    if (tagsError) {
      console.error('Erro ao buscar tags:', tagsError)
      setSugestoes([])
      setMostrarSugestoes(false)
      return
    }

    let tags = []
    if (tagsData) {
      tagsData.forEach(f => {
        if (f.tags && Array.isArray(f.tags)) {
          tags.push(...f.tags)
        }
      })
    }
    const tagsFiltradas = [...new Set(tags)].filter(tag =>
      tag.toLowerCase().includes(texto.toLowerCase())
    )

    const tagsComHash = tagsFiltradas.map(t => (t.startsWith('#') ? t : `#${t}`))

    setSugestoes(tagsComHash)
    setMostrarSugestoes(true)
  }

  const toggleModoSelecao = () => {
    if (modoSelecao) {
      setSelecionados(new Set())
      setModoSelecao(false)
    } else {
      setModoSelecao(true)
    }
  }

  const toggleSelecionado = (id) => {
    const novosSelecionados = new Set(selecionados)
    if (novosSelecionados.has(id)) {
      novosSelecionados.delete(id)
    } else {
      novosSelecionados.add(id)
    }
    setSelecionados(novosSelecionados)
  }

  const copiarSelecionados = () => {
    if (selecionados.size === 0) return

    const contatosParaCopiar = fornecedores
      .filter(f => selecionados.has(f.id))
      .map(f => `Nome: ${f.nome}\nEmpresa: ${f.empresa}\nWhatsApp: ${f.whatsapp}`)
      .join('\n\n')

    navigator.clipboard.writeText(contatosParaCopiar).then(() => {
      setCopiadoId('multi')
      setTimeout(() => setCopiadoId(null), 2000)
    }).catch(() => {})
  }

  const deletarSelecionados = async () => {
    if (selecionados.size === 0) return
    if (!window.confirm(`Tem certeza que deseja excluir ${selecionados.size} fornecedor(es)?`)) return

    const idsArray = Array.from(selecionados)
    const { error } = await supabase.from('fornecedores').delete().in('id', idsArray)

    if (error) {
      alert('Erro ao excluir: ' + error.message)
    } else {
      setSelecionados(new Set())
      setModoSelecao(false)
      buscarFornecedores()
    }
  }

  const deletarFornecedor = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir?')) return
    const { error } = await supabase.from('fornecedores').delete().eq('id', id)
    if (error) {
      alert('Erro ao excluir: ' + error.message)
    } else {
      buscarFornecedores()
    }
  }

  const iniciarEdicao = (f) => {
    setEditando(f.id)
    setForm({
      nome: f.nome,
      empresa: f.empresa,
      whatsapp: f.whatsapp,
      tags: f.tags?.join(' ') || ''
    })
    setModoSelecao(false)
    setSelecionados(new Set())
  }

  const cancelarEdicao = () => {
    setEditando(null)
    setForm({ nome: '', empresa: '', whatsapp: '', tags: '' })
  }

  const salvarEdicao = async (id) => {
    const tagsArray = form.tags
      .split(/[\s,]+/)
      .filter(tag => tag.startsWith('#'))
      .map(tag => tag.toLowerCase())

    const { error } = await supabase
      .from('fornecedores')
      .update({
        nome: form.nome,
        empresa: form.empresa,
        whatsapp: form.whatsapp,
        tags: tagsArray
      })
      .eq('id', id)

    if (error) {
      alert('Erro ao editar: ' + error.message)
    } else {
      cancelarEdicao()
      buscarFornecedores()
    }
  }

  const copiarContato = (f) => {
    const texto = `Nome: ${f.nome}\nEmpresa: ${f.empresa}\nWhatsApp: ${f.whatsapp}`
    navigator.clipboard.writeText(texto).then(() => {
      setCopiadoId(f.id)
      setTimeout(() => setCopiadoId(null), 2000)
    }).catch(() => {})
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
          <button
            className="clear-button"
            onClick={() => setBusca('')}
            type="button"
            title="Limpar busca"
          >
            ×
          </button>
        )}

        {mostrarSugestoes && sugestoes.length > 0 && (
          <ul className="tag-sugestoes">
            {sugestoes.map((tag, i) => (
              <li
                key={i}
                className="tag-sugestao"
                onMouseDown={() => {
                  setBusca(tag)
                  setMostrarSugestoes(false)
                }}
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
        <button
          className="btn selecionar-btn"
          onClick={toggleModoSelecao}
          type="button"
          style={{ marginRight: '1rem' }}
        >
          {modoSelecao ? 'Cancelar' : 'Selecionar'}
        </button>

        {modoSelecao && (
          <>
            <FaCopy
              title="Copiar selecionados"
              onClick={copiarSelecionados}
              style={{ cursor: selecionados.size > 0 ? 'pointer' : 'not-allowed', marginRight: '1rem', color: selecionados.size > 0 ? '#007bff' : '#aaa' }}
              size={20}
            />
            <FaTrash
              title="Deletar selecionados"
              onClick={deletarSelecionados}
              style={{ cursor: selecionados.size > 0 ? 'pointer' : 'not-allowed', color: selecionados.size > 0 ? '#dc3545' : '#aaa' }}
              size={20}
            />
          </>
        )}
      </div>

      <div className="fornecedor-list-container">
        <ul className="fornecedor-list">
          {fornecedores
            .slice()
            .sort((a, b) => a.nome.localeCompare(b.nome))
            .map((f) =>
              editando === f.id ? (
                <li key={f.id} className="fornecedor-item editando">
                  <input
                    type="text"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    placeholder="Nome"
                  />
                  <input
                    type="text"
                    value={form.empresa}
                    onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                    placeholder="Empresa"
                  />
                  <input
                    type="text"
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    placeholder="WhatsApp"
                  />
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="#tags"
                  />
                  <br />
                  <div className="edit-buttons">
                    <button className="btn salvar" onClick={() => salvarEdicao(f.id)}>
                      Salvar
                    </button>
                    <button className="btn cancelar" onClick={cancelarEdicao}>
                      Cancelar
                    </button>
                  </div>
                </li>
              ) : (
                <li key={f.id} className="fornecedor-item">
                  {modoSelecao && (
                    <input
                      type="checkbox"
                      checked={selecionados.has(f.id)}
                      onChange={() => toggleSelecionado(f.id)}
                      style={{ marginRight: '10px' }}
                    />
                  )}
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
                    </a>{' '}
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
                  </div>
                  {!modoSelecao && (
                    <div className="fornecedor-actions">
                      <FaCopy
                        className={`action-icon ${copiadoId === f.id ? 'copied' : ''}`}
                        title="Copiar contato"
                        onClick={() => copiarContato(f)}
                      />
                      <FaEdit
                        onClick={() => iniciarEdicao(f)}
                        className="action-icon"
                        title="Editar"
                      />
                      <FaTrash
                        onClick={() => deletarFornecedor(f.id)}
                        className="action-icon"
                        title="Excluir"
                      />
                    </div>
                  )}
                </li>
              )
            )}
          {fornecedores.length === 0 && <EmptyState mensagem="Não encontrei nada... que pena!" />}
        </ul>
      </div>

      <p className="fornecedor-quantidade">
        Total de fornecedores exibidos: {fornecedores.length}
      </p>
    </div>
  )
}
