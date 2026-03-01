import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { FaPlus, FaBuilding, FaFolderOpen, FaTrash, FaMapMarkerAlt } from 'react-icons/fa'
import './ProjetosPage.css'

export default function ProjetosPage() {
  const navigate = useNavigate()
  const [projetos, setProjetos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState({
    nome: '', razao_social: '', cnpj: '', endereco: '', cidade: '', estado: ''
  })
  const [salvando, setSalvando] = useState(false)

  useEffect(() => { buscarProjetos() }, [])

  async function buscarProjetos() {
    setCarregando(true)
    const { data, error } = await supabase
      .from('projetos')
      .select('*, pedidos(id)')
      .order('created_at', { ascending: false })
    if (!error) setProjetos(data || [])
    setCarregando(false)
  }

  async function salvarProjeto(e) {
    e.preventDefault()
    if (!form.nome.trim()) return
    setSalvando(true)
    const { error } = await supabase.from('projetos').insert([form])
    if (!error) {
      setModalAberto(false)
      setForm({ nome: '', razao_social: '', cnpj: '', endereco: '', cidade: '', estado: '' })
      buscarProjetos()
    }
    setSalvando(false)
  }

  async function deletarProjeto(e, id) {
    e.stopPropagation()
    if (!window.confirm('Excluir este projeto? Os pedidos vinculados perderão o vínculo.')) return
    await supabase.from('projetos').delete().eq('id', id)
    buscarProjetos()
  }

  return (
    <div className="projetos-page">
      <div className="projetos-header">
        <div className="projetos-header__left">
          <FaBuilding className="projetos-header__icon" />
          <div className="projetos-heade-text">
            <h1 className="projetos-header__title">Projetos</h1>
            <p className="projetos-header__sub">Selecione um projeto para ver seus pedidos de cotação</p>
          </div>
        </div>
        <button className="btn-novo-projeto" onClick={() => setModalAberto(true)}>
          <FaPlus />
        </button>
      </div>

      {carregando ? (
        <div className="projetos-loading">
          <div className="spinner" />
          <span>Carregando projetos...</span>
        </div>
      ) : projetos.length === 0 ? (
        <div className="projetos-empty">
          <FaBuilding size={56} />
          <h3>Nenhum projeto ainda</h3>
          <p>Crie seu primeiro projeto para organizar os pedidos de cotação.</p>
          <button className="btn-novo-projeto" onClick={() => setModalAberto(true)}>
            <FaPlus /> Criar primeiro projeto
          </button>
        </div>
      ) : (
        <div className="projetos-grid">
          {projetos.map(proj => (
            <div
              key={proj.id}
              className="projeto-card"
              onClick={() => navigate(`/projetos/${proj.id}/pedidos`)}
            >
              <div className="projeto-card__header">
                <div className="projeto-card__icon">
                  <FaBuilding />
                </div>
                <button
                  className="projeto-card__del"
                  title="Excluir projeto"
                  onClick={(e) => deletarProjeto(e, proj.id)}
                >
                  <FaTrash />
                </button>
              </div>

              <div className="projeto-card__body">
                <h3 className="projeto-card__nome">{proj.nome}</h3>
                {proj.razao_social && (
                  <p className="projeto-card__razao">{proj.razao_social}</p>
                )}
                {proj.cnpj && (
                  <p className="projeto-card__cnpj">CNPJ: {proj.cnpj}</p>
                )}
                {(proj.cidade || proj.estado) && (
                  <p className="projeto-card__local">
                    <FaMapMarkerAlt />
                    {[proj.cidade, proj.estado].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>

              <div className="projeto-card__footer">
                <span className="projeto-card__pedidos">
                  <FaFolderOpen />
                  {proj.pedidos?.length || 0} pedido{proj.pedidos?.length !== 1 ? 's' : ''}
                </span>
                <span className="projeto-card__ver">Ver pedidos →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL NOVO PROJETO */}
      {modalAberto && (
        <div className="modal-overlay" onClick={() => setModalAberto(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Novo Projeto</h3>
              <button className="modal-close" onClick={() => setModalAberto(false)}>✕</button>
            </div>
            <form onSubmit={salvarProjeto} className="modal-form">
              <div className="form-group">
                <label>Nome do Empreendimento *</label>
                <input
                  type="text"
                  placeholder="Ex: Residencial Vista Verde"
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Razão Social</label>
                <input
                  type="text"
                  placeholder="Ex: Construtora ABC Ltda"
                  value={form.razao_social}
                  onChange={e => setForm({ ...form, razao_social: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>CNPJ</label>
                <input
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={form.cnpj}
                  onChange={e => setForm({ ...form, cnpj: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Endereço</label>
                <input
                  type="text"
                  placeholder="Rua, número, bairro"
                  value={form.endereco}
                  onChange={e => setForm({ ...form, endereco: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Cidade</label>
                  <input
                    type="text"
                    placeholder="São Paulo"
                    value={form.cidade}
                    onChange={e => setForm({ ...form, cidade: e.target.value })}
                  />
                </div>
                <div className="form-group form-group--estado">
                  <label>Estado</label>
                  <input
                    type="text"
                    placeholder="SP"
                    maxLength={2}
                    value={form.estado}
                    onChange={e => setForm({ ...form, estado: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={() => setModalAberto(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-salvar" disabled={salvando}>
                  {salvando ? 'Salvando...' : 'Criar Projeto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}