import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import {
  FaArrowLeft, FaClipboardList, FaBuilding, FaCalendar,
  FaBoxes, FaTruck, FaCheckCircle, FaHourglassHalf,
  FaTrophy, FaClock, FaSync
} from 'react-icons/fa'
import './PedidoDetalhesPage.css'

export default function PedidoDetalhesPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [pedido, setPedido] = useState(null)
  const [insumos, setInsumos] = useState([])
  const [fornecedores, setFornecedores] = useState([])
  const [respostas, setRespostas] = useState([])
  const [carregando, setCarregando] = useState(true)

  const carregarDados = useCallback(async () => {
    setCarregando(true)

    const { data: ped, error: errPed } = await supabase
      .from('pedidos').select('*').eq('id', id).single()
    if (errPed || !ped) { setCarregando(false); return }

    const { data: ins } = await supabase
      .from('pedido_insumos').select('*').eq('pedido_id', id)

    const { data: pfs } = await supabase
      .from('pedido_fornecedores').select('*').eq('pedido_id', id)

    const pfList = pfs || []
    const fornecedorIds = pfList.map(pf => pf.fornecedor_id).filter(Boolean)
    let fornecedoresData = []
    if (fornecedorIds.length > 0) {
      const { data: fData } = await supabase
        .from('fornecedores')
        .select('id, nome, empresa, whatsapp')
        .in('id', fornecedorIds)
      fornecedoresData = fData || []
    }

    const pfComFornecedor = pfList.map(pf => ({
      ...pf,
      fornecedor: fornecedoresData.find(f => f.id === pf.fornecedor_id) || null,
    }))

    const pfIds = pfList.map(pf => pf.id)
    let respData = []
    if (pfIds.length > 0) {
      const { data: rData } = await supabase
        .from('pedido_respostas').select('*').in('pedido_fornecedor_id', pfIds)
      respData = rData || []
    }

    setPedido(ped)
    setInsumos(ins || [])
    setFornecedores(pfComFornecedor)
    setRespostas(respData)
    setCarregando(false)
  }, [id])

  useEffect(() => { if (id) carregarDados() }, [id, carregarDados])

  function formatarData(d) {
    if (!d) return '—'
    return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
  }

  function voltar() {
    if (pedido?.projeto_id) navigate(`/projetos/${pedido.projeto_id}/pedidos`)
    else navigate(-1)
  }

  function montarMapa() {
    const mapa = {}
    respostas.forEach(r => {
      if (!mapa[r.pedido_fornecedor_id]) mapa[r.pedido_fornecedor_id] = {}
      mapa[r.pedido_fornecedor_id][r.insumo_id] = { preco: r.preco, observacao: r.observacao }
    })
    return mapa
  }

  function menorPreco(insumoId, mapa, respondidos) {
    const precos = respondidos
      .map(pf => mapa[pf.id]?.[insumoId]?.preco)
      .filter(p => p != null && p > 0)
    return precos.length === 0 ? null : Math.min(...precos)
  }

  function totalFornecedor(pfId, mapa) {
    return insumos.reduce((acc, ins) => {
      const preco = mapa[pfId]?.[ins.id]?.preco
      const qtd = Number(ins.quantidade) || 1
      return acc + (preco != null ? preco * qtd : 0)
    }, 0)
  }

  if (carregando) {
    return (
      <div className="detalhes-loading">
        <div className="spinner" />
        <span>Carregando pedido...</span>
      </div>
    )
  }

  if (!pedido) {
    return (
      <div className="detalhes-loading">
        <p>Pedido não encontrado.</p>
        <button onClick={() => navigate(-1)}>Voltar</button>
      </div>
    )
  }

  const mapa = montarMapa()
  const respondidos = fornecedores.filter(pf => pf.respondido)
  const pendentes = fornecedores.filter(pf => !pf.respondido)

  let melhorPfId = null
  let melhorTotal = Infinity
  respondidos.forEach(pf => {
    const t = totalFornecedor(pf.id, mapa)
    if (t > 0 && t < melhorTotal) { melhorTotal = t; melhorPfId = pf.id }
  })

  return (
    <div className="detalhes-page">

      {/* TOPBAR */}
      <div className="detalhes-topbar">
        <button className="btn-back" onClick={voltar}>
          <FaArrowLeft /> Voltar
        </button>
        <button className="btn-refresh" onClick={carregarDados} title="Atualizar">
          <FaSync />
        </button>
      </div>

      {/* HERO */}
      <div className="detalhes-hero">
        <div className="detalhes-hero__icon"><FaClipboardList /></div>
        <div className="detalhes-hero__info">
          <h1>{pedido.nome_empreendimento}</h1>
          {pedido.razao_social && <p className="detalhes-razao">{pedido.razao_social}</p>}
          {pedido.cnpj && <p className="detalhes-cnpj">CNPJ: {pedido.cnpj}</p>}
        </div>
      </div>

      {/* RESUMO */}
      <div className="detalhes-resumo">
        <div className="resumo-card">
          <FaCalendar className="resumo-card__icon resumo-card__icon--blue" />
          <div>
            <span className="resumo-card__label">Data do Pedido</span>
            <span className="resumo-card__value">{formatarData(pedido.data_pedido)}</span>
          </div>
        </div>
        <div className="resumo-card">
          <FaCalendar className="resumo-card__icon resumo-card__icon--orange" />
          <div>
            <span className="resumo-card__label">Data Limite</span>
            <span className="resumo-card__value">{formatarData(pedido.data_limite)}</span>
          </div>
        </div>
        <div className="resumo-card">
          <FaBoxes className="resumo-card__icon resumo-card__icon--purple" />
          <div>
            <span className="resumo-card__label">Insumos</span>
            <span className="resumo-card__value">{insumos.length} item{insumos.length !== 1 ? 'ns' : ''}</span>
          </div>
        </div>
        <div className="resumo-card">
          <FaTruck className="resumo-card__icon resumo-card__icon--green" />
          <div>
            <span className="resumo-card__label">Fornecedores</span>
            <span className="resumo-card__value">{respondidos.length}/{fornecedores.length} responderam</span>
          </div>
        </div>
      </div>

      <div className="detalhes-body">

        {/* ── TABELA UNIFICADA ── */}
        <section className="detalhes-section">
          <div className="section-header">
            <FaBoxes />
            <h2>Insumos & Cotações</h2>
            <button className="btn-refresh-inline" onClick={carregarDados} title="Atualizar">
              <FaSync />
            </button>
          </div>

          {pendentes.length > 0 && (
            <div className="aguardando-row">
              <FaClock />
              <span>Aguardando:</span>
              {pendentes.map(pf => (
                <span key={pf.id} className="aguardando-chip">
                  {pf.fornecedor?.nome || 'Fornecedor'}
                </span>
              ))}
            </div>
          )}

          <div className="tabela-wrapper">
            <table className="tabela">
              <thead>
                <tr>
                  <th className="th-num">#</th>
                  <th className="th-cod">Código</th>
                  <th className="th-desc">Descrição</th>
                  <th className="th-qtd">Qtd.</th>
                  <th className="th-uni">Unid.</th>
                  {respondidos.map(pf => (
                    <th key={pf.id} className={`th-forn ${pf.id === melhorPfId ? 'th-forn--melhor' : ''}`}>
                      {pf.id === melhorPfId && <FaTrophy className="trophy-icon" />}
                      <span className="th-forn-nome">{pf.fornecedor?.nome || '—'}</span>
                      {pf.fornecedor?.empresa && (
                        <span className="th-forn-empresa">{pf.fornecedor.empresa}</span>
                      )}
                    </th>
                  ))}
                  {respondidos.length === 0 && (
                    <th className="th-forn th-forn--vazio">
                      <FaClock style={{ marginBottom: 2 }} />
                      <span className="th-forn-nome">Sem respostas</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {insumos.length === 0 ? (
                  <tr>
                    <td colSpan={5 + Math.max(respondidos.length, 1)} className="td-empty">
                      Nenhum insumo cadastrado.
                    </td>
                  </tr>
                ) : (
                  insumos.map((ins, idx) => {
                    const menor = menorPreco(ins.id, mapa, respondidos)
                    return (
                      <tr key={ins.id}>
                        <td className="td-num">{idx + 1}</td>
                        <td className="td-mono">{ins.codigo || '—'}</td>
                        <td className="td-desc">{ins.descricao || '—'}</td>
                        <td className="td-center">{ins.quantidade ?? '—'}</td>
                        <td className="td-center">{ins.unidade || '—'}</td>
                        {respondidos.map(pf => {
                          const dado = mapa[pf.id]?.[ins.id]
                          const preco = dado?.preco
                          const isMenor = preco != null && preco > 0 && preco === menor
                          return (
                            <td key={pf.id} className={`td-preco ${isMenor ? 'td-preco--menor' : ''}`}>
                              <span className="preco-valor">
                                {preco != null
                                  ? preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                  : '—'}
                              </span>
                              {dado?.observacao && (
                                <span className="preco-obs" title={dado.observacao}>{dado.observacao}</span>
                              )}
                            </td>
                          )
                        })}
                        {respondidos.length === 0 && <td className="td-preco td-preco--vazio">—</td>}
                      </tr>
                    )
                  })
                )}

                {/* Linha total */}
                {respondidos.length > 0 && (
                  <tr className="tr-total">
                    <td colSpan={5} className="td-total-label">Total estimado</td>
                    {respondidos.map(pf => {
                      const total = totalFornecedor(pf.id, mapa)
                      const isMelhor = pf.id === melhorPfId
                      return (
                        <td key={pf.id} className={`td-total ${isMelhor ? 'td-total--melhor' : ''}`}>
                          {isMelhor && <FaTrophy className="trophy-small" />}
                          {total > 0
                            ? total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                            : '—'}
                        </td>
                      )
                    })}
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {respondidos.length > 0 && (
            <div className="tabela-legenda">
              <span className="legenda-verde" /> Menor preço por item
              <span className="legenda-sep" />
              <FaTrophy style={{ color: '#f59e0b', fontSize: '0.75rem' }} /> Melhor proposta geral
            </div>
          )}
        </section>

        {/* ── FORNECEDORES ── */}
        <section className="detalhes-section">
          <div className="section-header">
            <FaTruck />
            <h2>Fornecedores</h2>
          </div>
          {fornecedores.length === 0 ? (
            <p className="section-empty">Nenhum fornecedor vinculado.</p>
          ) : (
            <div className="forns-lista">
              {fornecedores.map(pf => (
                <div key={pf.id} className={`forn-card ${pf.respondido ? 'forn-card--ok' : ''}`}>
                  <div className="forn-card__left">
                    <div className="forn-card__avatar"><FaBuilding /></div>
                    <div>
                      <p className="forn-card__nome">{pf.fornecedor?.nome || 'Fornecedor'}</p>
                      {pf.fornecedor?.empresa && <p className="forn-card__sub">{pf.fornecedor.empresa}</p>}
                      {pf.fornecedor?.whatsapp && <p className="forn-card__sub">📱 {pf.fornecedor.whatsapp}</p>}
                    </div>
                  </div>
                  <div className="forn-card__status">
                    {pf.respondido
                      ? <span className="badge badge--ok"><FaCheckCircle /> Respondido</span>
                      : <span className="badge badge--aguardando"><FaHourglassHalf /> Aguardando</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}