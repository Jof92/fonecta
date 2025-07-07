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

  const [copiadoId, setCopiadoId] = useState(null)

  useEffect(() => {
    buscarFornecedores()
  }, [busca])

  const buscarFornecedores = async () => {
    let query = supabase.from('fornecedores').select('*')

    if (busca.trim() !== '') {
      const texto = busca.toLowerCase()
      query = query.or(
        `nome.ilike.%${texto}%,empresa.ilike.%${texto}%,tags.cs.{${texto}}`
      )
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar fornecedores:', error)
    } else {
      setFornecedores(data)
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
  }

  const cancelarEdicao = () => {
    setEditando(null)
    setForm({ nome: '', empresa: '', whatsapp: '', tags: '' })
  }

  const salvarEdicao = async (id) => {
    console.log('Salvando edição para fornecedor id:', id)
    
    // Garante que tags não sejam vazias antes de processar
    const tagsArray = form.tags
      .split(/[\s,]+/)
      .filter((tag) => tag.startsWith('#'))
      .map((tag) => tag.toLowerCase())

    console.log('Tags processadas:', tagsArray)

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
      console.error('Erro ao editar:', error)
    } else {
      console.log('Fornecedor atualizado com sucesso!')
      cancelarEdicao()
      buscarFornecedores()
    }
  }

  const copiarContato = (f) => {
    const texto = `Nome: ${f.nome}\nEmpresa: ${f.empresa}\nWhatsApp: ${f.whatsapp}`
    navigator.clipboard.writeText(texto).then(() => {
      setCopiadoId(f.id)
      setTimeout(() => setCopiadoId(null), 2000)
    }).catch(() => {
      // opcional: feedback de erro
    })
  }

  return (
    <div className="fornecedor-wrapper">
      <h2>Buscar Fornecedores</h2>

      <div className="search-input-wrapper">
        <input
          type="text"
          placeholder="Digite nome, empresa ou #tag"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="search-input"
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
                    <button className="btn salvar" onClick={() => salvarEdicao(f.id)}>Salvar</button>
                    <button className="btn cancelar" onClick={cancelarEdicao}>Cancelar</button>
                  </div>
                </li>
              ) : (
                <li key={f.id} className="fornecedor-item">
                  <div className="fornecedor-info">
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
                </li>
              )
            )}
          {fornecedores.length === 0 && (
            <EmptyState mensagem="Não encontrei nada... que pena!" />
          )}
        </ul>
      </div>
    </div>
  )
}
