import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import {
  FaPlus, FaTrash, FaSearch, FaTimes,
  FaArrowLeft, FaLink, FaCopy, FaCheck
} from 'react-icons/fa'
import './NovoPedidoForm.css'

const insumoVazio = () => ({ codigo: '', descricao: '', quantidade: '', unidade: '' })

export default function NovoPedidoForm() {
  const navigate = useNavigate()

  const [nomeEmpreendimento, setNomeEmpreendimento] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [dataPedido, setDataPedido] = useState('')
  const [dataLimite, setDataLimite] = useState('')
  const [insumos, setInsumos] = useState([insumoVazio()])
  const [fornecedoresSelecionados, setFornecedoresSelecionados] = useState([])

  const [buscaFornecedor, setBuscaFornecedor] = useState('')
  const [resultadosBusca, setResultadosBusca] = useState([])
  const [buscando, setBuscando] = useState(false)

  const [salvando, setSalvando] = useState(false)
  const [linksGerados, setLinksGerados] = useState([])
  const [copiado, setCopiado] = useState(null)
  const [etapa, setEtapa] = useState('form')

  function mascaraCnpj(v) {
    v = v.replace(/\D/g, '').slice(0, 14)
    if (v.length > 12) return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    if (v.length > 8)  return v.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4')
    if (v.length > 5)  return v.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3')
    if (v.length > 2)  return v.replace(/(\d{2})(\d+)/, '$1.$2')
    return v
  }

  function adicionarInsumo() {
    setInsumos(prev => [...prev, insumoVazio()])
  }

  function removerInsumo(i) {
    setInsumos(prev => prev.filter((_, idx) => idx !== i))
  }

  function atualizarInsumo(i, campo, valor) {
    setInsumos(prev => prev.map((ins, idx) => idx === i ? { ...ins, [campo]: valor } : ins))
  }

  useEffect(() => {
    if (buscaFornecedor.trim().length < 2) { setResultadosBusca([]); return }
    const timer = setTimeout(() => buscarFornecedores(), 300)
    return () => clearTimeout(timer)
  }, [buscaFornecedor])

  async function buscarFornecedores() {
    setBuscando(true)
    const { data } = await supabase.from('fornecedores').select('*')
    const termo = buscaFornecedor.toLowerCase()
    const idsJa = new Set(fornecedoresSelecionados.map(f => f.id))
    const filtrados = (data || [])
      .filter(f =>
        f.nome?.toLowerCase().includes(termo) ||
        f.empresa?.toLowerCase().includes(termo) ||
        f.tags?.some(t => t.toLowerCase().includes(termo))
      )
      .filter(f => !idsJa.has(f.id))
      .slice(0, 8)
    setResultadosBusca(filtrados)
    setBuscando(false)
  }

  function selecionarFornecedor(f) {
    setFornecedoresSelecionados(prev => [...prev, f])
    setBuscaFornecedor('')
    setResultadosBusca([])
  }

  function removerFornecedor(id) {
    setFornecedoresSelecionados(prev => prev.filter(f => f.id !== id))
  }

  async function handleGerar(e) {
    e.preventDefault()
    const insumosValidos = insumos.filter(i => i.descricao.trim())
    if (insumosValidos.length === 0) { alert('Adicione ao menos um insumo com descrição.'); return }
    if (fornecedoresSelecionados.length === 0) { alert('Selecione ao menos um fornecedor.'); return }

    setSalvando(true)

    const { data: pedido, error: errPedido } = await supabase
      .from('pedidos')
      .insert([{ nome_empreendimento: nomeEmpreendimento, cnpj, data_pedido: dataPedido, data_limite: dataLimite }])
      .select()
      .single()

    if (errPedido) { alert('Erro ao salvar pedido: ' + errPedido.message); setSalvando(false); return }

    const { error: errInsumos } = await supabase
      .from('pedido_insumos')
      .insert(insumosValidos.map(i => ({
        pedido_id: pedido.id,
        codigo: i.codigo,
        descricao: i.descricao,
        quantidade: Number(i.quantidade) || 0,
        unidade: i.unidade,
      })))

    if (errInsumos) { alert('Erro ao salvar insumos: ' + errInsumos.message); setSalvando(false); return }

    const { data: pfData, error: errPf } = await supabase
      .from('pedido_fornecedores')
      .insert(fornecedoresSelecionados.map(f => ({ pedido_id: pedido.id, fornecedor_id: f.id })))
      .select()

    if (errPf) { alert('Erro ao salvar fornecedores: ' + errPf.message); setSalvando(false); return }

    const base = window.location.origin
    const links = pfData.map((pf, i) => ({
      fornecedor: fornecedoresSelecionados[i],
      link: `${base}/cotacao/${pf.token}`,
      token: pf.token,
    }))

    setLinksGerados(links)
    setEtapa('links')
    setSalvando(false)
  }

  function copiarLink(token, link) {
    navigator.clipboard.writeText(link)
    setCopiado(token)
    setTimeout(() => setCopiado(null), 2000)
  }

  function copiarTodos() {
    const texto = linksGerados
      .map(l => `${l.fornecedor.nome} (${l.fornecedor.empresa}):\n${l.link}`)
      .join('\n\n')
    navigator.clipboard.writeText(texto)
    setCopiado('todos')
    setTimeout(() => setCopiado(null), 2000)
  }

  // ── Tela de links ────────────────────────────────────────
  if (etapa === 'links') {
    return (
      <div className="novo-pedido-page">
        <div className="np-links-header">
          <FaCheck className="np-links-check" />
          <h2>Pedido criado com sucesso!</h2>
          <p>Envie o link abaixo para cada fornecedor. Cada link é único e exclusivo.</p>
        </div>

        <div className="np-links-lista">
          {linksGerados.map(l => (
            <div key={l.token} className="np-link-item">
              <div className="np-link-info">
                <strong>{l.fornecedor.nome}</strong>
                <span>{l.fornecedor.empresa}</span>
              </div>
              <div className="np-link-url">{l.link}</div>
              <button
                className={`btn-copiar ${copiado === l.token ? 'copiado' : ''}`}
                onClick={() => copiarLink(l.token, l.link)}
              >
                {copiado === l.token ? <FaCheck /> : <FaCopy />}
                {copiado === l.token ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          ))}
        </div>

        <div className="np-links-acoes">
          <button className="btn-copiar-todos" onClick={copiarTodos}>
            {copiado === 'todos' ? <FaCheck /> : <FaCopy />}
            {copiado === 'todos' ? 'Copiado!' : 'Copiar todos os links'}
          </button>
          <button className="btn-voltar-lista" onClick={() => navigate('/pedidos')}>
            Ver todos os pedidos
          </button>
        </div>
      </div>
    )
  }

  // ── Formulário ───────────────────────────────────────────
  return (
    <div className="novo-pedido-page">
      <div className="np-topbar">
        <button className="np-btn-voltar" onClick={() => navigate('/pedidos')}>
          <FaArrowLeft /> Voltar
        </button>
        <h2>Novo Pedido de Cotação</h2>
      </div>

      <form className="np-form" onSubmit={handleGerar}>

        <section className="np-section">
          <h3 className="np-section-title">Dados do Empreendimento</h3>
          <div className="np-grid-2">
            <div className="np-field">
              <label>Nome do Empreendimento</label>
              <input type="text" value={nomeEmpreendimento} onChange={e => setNomeEmpreendimento(e.target.value)} placeholder="Ex.: Residencial Parque Verde" required />
            </div>
            <div className="np-field">
              <label>CNPJ</label>
              <input type="text" value={cnpj} onChange={e => setCnpj(mascaraCnpj(e.target.value))} placeholder="00.000.000/0000-00" required />
            </div>
            <div className="np-field">
              <label>Data do Pedido</label>
              <input type="date" value={dataPedido} onChange={e => setDataPedido(e.target.value)} required />
            </div>
            <div className="np-field">
              <label>Data Limite para Envio do Orçamento</label>
              <input type="date" value={dataLimite} onChange={e => setDataLimite(e.target.value)} required />
            </div>
          </div>
        </section>

        <section className="np-section">
          <div className="np-section-header">
            <h3 className="np-section-title">Lista de Insumos</h3>
            <button type="button" className="btn-add" onClick={adicionarInsumo}>
              <FaPlus /> Adicionar insumo
            </button>
          </div>

          <div className="np-insumos-tabela-wrapper">
            <table className="np-insumos-tabela">
              <thead>
                <tr>
                  <th style={{ width: '110px' }}>Código</th>
                  <th>Descrição</th>
                  <th style={{ width: '110px' }}>Quantidade</th>
                  <th style={{ width: '90px' }}>Unid.</th>
                  <th style={{ width: '44px' }}></th>
                </tr>
              </thead>
              <tbody>
                {insumos.map((ins, i) => (
                  <tr key={i}>
                    <td><input type="text" value={ins.codigo} onChange={e => atualizarInsumo(i, 'codigo', e.target.value)} placeholder="COD-001" className="np-input-tabela" /></td>
                    <td><input type="text" value={ins.descricao} onChange={e => atualizarInsumo(i, 'descricao', e.target.value)} placeholder="Descrição do insumo" className="np-input-tabela" /></td>
                    <td><input type="number" value={ins.quantidade} onChange={e => atualizarInsumo(i, 'quantidade', e.target.value)} placeholder="0" min="0" className="np-input-tabela" /></td>
                    <td><input type="text" value={ins.unidade} onChange={e => atualizarInsumo(i, 'unidade', e.target.value)} placeholder="un / m²" className="np-input-tabela" /></td>
                    <td>
                      {insumos.length > 1 && (
                        <button type="button" className="btn-remover-linha" onClick={() => removerInsumo(i)} title="Remover">
                          <FaTrash />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="np-section">
          <h3 className="np-section-title">Selecionar Fornecedores</h3>

          <div className="np-busca-wrapper">
            <div className="np-busca-input-wrapper">
              <FaSearch className="np-busca-icon" />
              <input
                type="text"
                value={buscaFornecedor}
                onChange={e => setBuscaFornecedor(e.target.value)}
                placeholder="Buscar por nome, empresa ou #tag..."
                className="np-busca-input"
              />
              {buscaFornecedor && (
                <button type="button" className="np-busca-clear" onClick={() => { setBuscaFornecedor(''); setResultadosBusca([]) }}>
                  <FaTimes />
                </button>
              )}
            </div>

            {resultadosBusca.length > 0 && (
              <ul className="np-busca-dropdown">
                {buscando && <li className="np-busca-loading">Buscando...</li>}
                {resultadosBusca.map(f => (
                  <li key={f.id} className="np-busca-item" onMouseDown={() => selecionarFornecedor(f)}>
                    <span className="np-busca-nome">{f.nome}</span>
                    <span className="np-busca-empresa">{f.empresa}</span>
                    <span className="np-busca-tags">{f.tags?.slice(0, 3).join(' ')}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {fornecedoresSelecionados.length > 0 && (
            <div className="np-fornecedores-chips">
              {fornecedoresSelecionados.map(f => (
                <div key={f.id} className="np-chip">
                  <div className="np-chip-info">
                    <strong>{f.nome}</strong>
                    <span>{f.empresa}</span>
                  </div>
                  <button type="button" className="np-chip-remove" onClick={() => removerFornecedor(f.id)}>
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="np-footer">
          <button type="submit" className="btn-gerar" disabled={salvando}>
            <FaLink />
            {salvando ? 'Gerando...' : 'Gerar Links de Cotação'}
          </button>
        </div>

      </form>
    </div>
  )
}