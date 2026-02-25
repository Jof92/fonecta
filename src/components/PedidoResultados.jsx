import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { FaArrowLeft, FaTrophy, FaClock, FaSync } from 'react-icons/fa'
import './PedidoResultados.css'

export default function PedidoResultados() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [pedido, setPedido] = useState(null)
  const [insumos, setInsumos] = useState([])
  const [fornecedores, setFornecedores] = useState([])
  const [respostas, setRespostas] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (id) carregarResultados()
  }, [id])

  async function carregarResultados() {
    setCarregando(true)

    // 1. Pedido
    const { data: ped, error: errPed } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', id)
      .single()
    if (errPed) { console.error('pedido:', errPed); setCarregando(false); return }

    // 2. Insumos
    const { data: ins, error: errIns } = await supabase
      .from('pedido_insumos')
      .select('*')
      .eq('pedido_id', id)
    if (errIns) console.error('insumos:', errIns)

    // 3. pedido_fornecedores (sem join)
    const { data: pfs, error: errPfs } = await supabase
      .from('pedido_fornecedores')
      .select('*')
      .eq('pedido_id', id)
    if (errPfs) console.error('pedido_fornecedores:', errPfs)

    // 4. Buscar dados dos fornecedores separadamente
    const pfList = pfs || []
    const fornecedorIds = pfList.map(pf => pf.fornecedor_id).filter(Boolean)
    let fornecedoresData = []
    if (fornecedorIds.length > 0) {
      const { data: fData, error: errF } = await supabase
        .from('fornecedores')
        .select('*')
        .in('id', fornecedorIds)
      if (errF) console.error('fornecedores:', errF)
      fornecedoresData = fData || []
    }

    // Montar pedido_fornecedores com dados do fornecedor embutidos
    const pfComFornecedor = pfList.map(pf => ({
      ...pf,
      fornecedor: fornecedoresData.find(f => f.id === pf.fornecedor_id) || null,
    }))

    // 5. Respostas
    const pfIds = pfList.map(pf => pf.id)
    let respData = []
    if (pfIds.length > 0) {
      const { data: rData, error: errR } = await supabase
        .from('pedido_respostas')
        .select('*')
        .in('pedido_fornecedor_id', pfIds)
      if (errR) console.error('respostas:', errR)
      respData = rData || []
    }

    setPedido(ped)
    setInsumos(ins || [])
    setFornecedores(pfComFornecedor)
    setRespostas(respData)
    setCarregando(false)
  }

  // mapa[pedido_fornecedor_id][insumo_id] = { preco, observacao }
  function montarMapa() {
    const mapa = {}
    respostas.forEach(r => {
      if (!mapa[r.pedido_fornecedor_id]) mapa[r.pedido_fornecedor_id] = {}
      mapa[r.pedido_fornecedor_id][r.insumo_id] = {
        preco: r.preco,
        observacao: r.observacao,
      }
    })
    return mapa
  }

  function menorPrecoPorInsumo(insumoId, mapa) {
    const precos = fornecedores
      .filter(pf => pf.respondido)
      .map(pf => mapa[pf.id]?.[insumoId]?.preco)
      .filter(p => p != null && p > 0)
    if (precos.length === 0) return null
    return Math.min(...precos)
  }

  function totalFornecedor(pfId, mapa) {
    return insumos.reduce((acc, ins) => {
      const preco = mapa[pfId]?.[ins.id]?.preco
      const qtd = Number(ins.quantidade) || 1
      return acc + (preco != null ? preco * qtd : 0)
    }, 0)
  }

  function formatarMoeda(v) {
    if (v == null || v === 0) return '—'
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  function formatarData(d) {
    if (!d) return '—'
    return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
  }

  if (carregando) {
    return (
      <div className="pr-page">
        <div className="pr-loading">
          <div className="pr-spinner" />
          Carregando resultados...
        </div>
      </div>
    )
  }

  const mapa = montarMapa()
  const fornecedoresRespondidos = fornecedores.filter(pf => pf.respondido)
  const fornecedoresPendentes = fornecedores.filter(pf => !pf.respondido)

  let menorTotalPfId = null
  let menorTotal = Infinity
  fornecedoresRespondidos.forEach(pf => {
    const t = totalFornecedor(pf.id, mapa)
    if (t > 0 && t < menorTotal) { menorTotal = t; menorTotalPfId = pf.id }
  })

  return (
    <div className="pr-page">

      {/* Topbar */}
      <div className="pr-topbar">
        <button className="pr-btn-voltar" onClick={() => navigate('/pedidos')}>
          <FaArrowLeft /> Voltar
        </button>
        <div className="pr-topbar__info">
          <h2>{pedido?.nome_empreendimento}</h2>
          <span>CNPJ: {pedido?.cnpj} · Limite: {formatarData(pedido?.data_limite)}</span>
        </div>
        <button className="pr-btn-refresh" onClick={carregarResultados} title="Atualizar">
          <FaSync />
        </button>
      </div>

      {/* Status */}
      <div className="pr-status-row">
        <div className="pr-status-card pr-status-card--ok">
          <strong>{fornecedoresRespondidos.length}</strong>
          <span>responderam</span>
        </div>
        <div className="pr-status-card pr-status-card--pendente">
          <FaClock size={12} />
          <strong>{fornecedoresPendentes.length}</strong>
          <span>aguardando</span>
        </div>
        {fornecedoresPendentes.length > 0 && (
          <div className="pr-pendentes-lista">
            {fornecedoresPendentes.map(pf => (
              <span key={pf.id} className="pr-pendente-chip">
                {pf.fornecedor?.nome || 'Fornecedor'}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Sem respostas */}
      {fornecedoresRespondidos.length === 0 ? (
        <div className="pr-sem-respostas">
          <FaClock size={40} />
          <p>Nenhum fornecedor respondeu ainda.</p>
          <span>Aguarde as respostas ou atualize a página.</span>
        </div>
      ) : (
        <>
          <div className="pr-tabela-wrapper">
            <table className="pr-tabela">
              <thead>
                <tr>
                  <th className="pr-th-insumo">Insumo</th>
                  <th className="pr-th-qtd">Qtd.</th>
                  <th className="pr-th-qtd">Unid.</th>
                  {fornecedoresRespondidos.map(pf => (
                    <th
                      key={pf.id}
                      className={`pr-th-fornecedor ${pf.id === menorTotalPfId ? 'pr-th--melhor' : ''}`}
                    >
                      {pf.id === menorTotalPfId && <FaTrophy className="pr-trophy" />}
                      <div className="pr-th-nome">{pf.fornecedor?.nome || '—'}</div>
                      <div className="pr-th-empresa">{pf.fornecedor?.empresa || '—'}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {insumos.map(ins => {
                  const menor = menorPrecoPorInsumo(ins.id, mapa)
                  return (
                    <tr key={ins.id}>
                      <td className="pr-td-insumo">
                        {ins.codigo && <span className="pr-codigo">{ins.codigo}</span>}
                        {ins.descricao}
                      </td>
                      <td className="pr-td-num">{ins.quantidade}</td>
                      <td className="pr-td-num">{ins.unidade}</td>
                      {fornecedoresRespondidos.map(pf => {
                        const dado = mapa[pf.id]?.[ins.id]
                        const preco = dado?.preco
                        const isMenor = preco != null && preco > 0 && preco === menor
                        return (
                          <td
                            key={pf.id}
                            className={[
                              'pr-td-preco',
                              isMenor ? 'pr-td-preco--menor' : '',
                              preco == null ? 'pr-td-preco--vazio' : '',
                            ].join(' ')}
                          >
                            <div className="pr-preco-valor">
                              {preco != null
                                ? preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                : '—'}
                            </div>
                            {dado?.observacao && (
                              <div className="pr-obs" title={dado.observacao}>
                                {dado.observacao}
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}

                {/* Total */}
                <tr className="pr-tr-total">
                  <td colSpan={3} className="pr-td-total-label">Total estimado</td>
                  {fornecedoresRespondidos.map(pf => {
                    const total = totalFornecedor(pf.id, mapa)
                    const isMelhor = pf.id === menorTotalPfId
                    return (
                      <td key={pf.id} className={`pr-td-total ${isMelhor ? 'pr-td-total--melhor' : ''}`}>
                        {isMelhor && <FaTrophy className="pr-trophy-small" />}
                        {total > 0
                          ? total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                          : '—'}
                      </td>
                    )
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pr-legenda">
            <span className="pr-legenda-menor" />
            <span>Menor preço por item</span>
            <span className="pr-legenda-sep" />
            <FaTrophy style={{ color: '#f0b429' }} />
            <span>Melhor proposta geral</span>
          </div>
        </>
      )}
    </div>
  )
}