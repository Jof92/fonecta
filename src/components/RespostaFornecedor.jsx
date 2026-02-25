import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { FaCheck, FaExclamationTriangle } from 'react-icons/fa'
import './RespostaFornecedor.css'

export default function RespostaFornecedor() {
  const { token } = useParams()

  const [estado, setEstado] = useState('carregando')
  const [pedidoFornecedor, setPedidoFornecedor] = useState(null)
  const [pedido, setPedido] = useState(null)
  const [fornecedor, setFornecedor] = useState(null)
  const [insumos, setInsumos] = useState([])
  const [precos, setPrecos] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (token) carregarDados()
  }, [token])

  async function carregarDados() {
    setEstado('carregando')

    // 1. Buscar pedido_fornecedor pelo token
    const { data: pf, error: errPf } = await supabase
      .from('pedido_fornecedores')
      .select('*')
      .eq('token', token)
      .single()

    if (errPf || !pf) {
      console.error('Erro ao buscar token:', errPf)
      setEstado('erro')
      return
    }

    // Verificar se já respondido antes de carregar o resto
    if (pf.respondido) {
      setEstado('jaRespondido')
      return
    }

    // 2. Buscar pedido
    const { data: pedidoData, error: errPedido } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', pf.pedido_id)
      .single()

    if (errPedido || !pedidoData) {
      console.error('Erro ao buscar pedido:', errPedido)
      setEstado('erro')
      return
    }

    // Verificar prazo
    const hoje = new Date()
    const limite = new Date(pedidoData.data_limite + 'T23:59:59')
    if (hoje > limite) {
      setEstado('expirado')
      return
    }

    // 3. Buscar fornecedor
    const { data: fornecedorData, error: errForn } = await supabase
      .from('fornecedores')
      .select('*')
      .eq('id', pf.fornecedor_id)
      .single()

    if (errForn || !fornecedorData) {
      console.error('Erro ao buscar fornecedor:', errForn)
      setEstado('erro')
      return
    }

    // 4. Buscar insumos
    const { data: insumosData, error: errIns } = await supabase
      .from('pedido_insumos')
      .select('*')
      .eq('pedido_id', pf.pedido_id)

    if (errIns) {
      console.error('Erro ao buscar insumos:', errIns)
      setEstado('erro')
      return
    }

    // Montar estado inicial de preços
    const init = {}
    ;(insumosData || []).forEach(i => {
      init[i.id] = { preco: '', observacao: '' }
    })

    setPedidoFornecedor(pf)
    setPedido(pedidoData)
    setFornecedor(fornecedorData)
    setInsumos(insumosData || [])
    setPrecos(init)
    setEstado('formulario')
  }

  function atualizarPreco(insumoId, campo, valor) {
    setPrecos(prev => ({
      ...prev,
      [insumoId]: { ...prev[insumoId], [campo]: valor },
    }))
  }

  async function handleEnviar(e) {
    e.preventDefault()
    setEnviando(true)
    setErro('')

    const respostas = insumos.map(i => ({
      pedido_fornecedor_id: pedidoFornecedor.id,
      insumo_id: i.id,
      preco: precos[i.id]?.preco !== '' ? Number(precos[i.id]?.preco) : null,
      observacao: precos[i.id]?.observacao || null,
    }))

    const { error: errResp } = await supabase
      .from('pedido_respostas')
      .insert(respostas)

    if (errResp) {
      setErro('Erro ao enviar: ' + errResp.message)
      setEnviando(false)
      return
    }

    await supabase
      .from('pedido_fornecedores')
      .update({ respondido: true })
      .eq('id', pedidoFornecedor.id)

    setEstado('enviado')
    setEnviando(false)
  }

  function formatarData(d) {
    if (!d) return '—'
    return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
  }

  // ── Estados de tela ──────────────────────────────────────

  if (estado === 'carregando') {
    return (
      <div className="rf-wrapper">
        <div className="rf-estado">
          <div className="rf-spinner" />
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  if (estado === 'erro') {
    return (
      <div className="rf-wrapper">
        <div className="rf-estado rf-estado--erro">
          <FaExclamationTriangle size={40} />
          <h2>Link inválido</h2>
          <p>Este link não existe ou foi removido. Entre em contato com o solicitante.</p>
        </div>
      </div>
    )
  }

  if (estado === 'expirado') {
    return (
      <div className="rf-wrapper">
        <div className="rf-estado rf-estado--erro">
          <FaExclamationTriangle size={40} />
          <h2>Prazo encerrado</h2>
          <p>O prazo para envio deste orçamento já foi encerrado.</p>
        </div>
      </div>
    )
  }

  if (estado === 'jaRespondido') {
    return (
      <div className="rf-wrapper">
        <div className="rf-estado rf-estado--ok">
          <FaCheck size={40} />
          <h2>Orçamento já enviado</h2>
          <p>Você já respondeu este pedido de cotação. Obrigado!</p>
        </div>
      </div>
    )
  }

  if (estado === 'enviado') {
    return (
      <div className="rf-wrapper">
        <div className="rf-estado rf-estado--ok">
          <FaCheck size={48} className="rf-check-anim" />
          <h2>Orçamento enviado com sucesso!</h2>
          <p>Sua cotação foi registrada. Obrigado, <strong>{fornecedor?.nome}</strong>!</p>
        </div>
      </div>
    )
  }

  // ── Formulário ───────────────────────────────────────────

  return (
    <div className="rf-wrapper">
      <div className="rf-card">

        <div className="rf-header">
          <div className="rf-header__badge">Pedido de Cotação</div>
          <h1 className="rf-header__titulo">{pedido?.nome_empreendimento}</h1>
          <div className="rf-header__meta">
            <span>CNPJ: {pedido?.cnpj}</span>
            <span>·</span>
            <span>Data do pedido: {formatarData(pedido?.data_pedido)}</span>
            <span>·</span>
            <span className="rf-limite">Prazo: {formatarData(pedido?.data_limite)}</span>
          </div>
          <div className="rf-header__fornecedor">
            Cotação para: <strong>{fornecedor?.nome}</strong> — {fornecedor?.empresa}
          </div>
        </div>

        <p className="rf-instrucao">
          Preencha abaixo os preços unitários de cada insumo. Campos sem preço serão considerados não disponíveis.
        </p>

        <form onSubmit={handleEnviar}>
          <div className="rf-tabela-wrapper">
            {insumos.length === 0 ? (
              <p className="rf-sem-insumos">Nenhum insumo cadastrado neste pedido.</p>
            ) : (
              <table className="rf-tabela">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Descrição</th>
                    <th>Qtd.</th>
                    <th>Unid.</th>
                    <th>Preço Unit. (R$)</th>
                    <th>Observação</th>
                  </tr>
                </thead>
                <tbody>
                  {insumos.map(ins => (
                    <tr key={ins.id}>
                      <td className="rf-td-mono">{ins.codigo || '—'}</td>
                      <td className="rf-td-desc">{ins.descricao}</td>
                      <td className="rf-td-num">{ins.quantidade}</td>
                      <td className="rf-td-num">{ins.unidade}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0,00"
                          value={precos[ins.id]?.preco || ''}
                          onChange={e => atualizarPreco(ins.id, 'preco', e.target.value)}
                          className="rf-input rf-input--preco"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="Opcional"
                          value={precos[ins.id]?.observacao || ''}
                          onChange={e => atualizarPreco(ins.id, 'observacao', e.target.value)}
                          className="rf-input rf-input--obs"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {erro && <p className="rf-erro">{erro}</p>}

          <div className="rf-footer">
            <button
              type="submit"
              className="btn-enviar"
              disabled={enviando || insumos.length === 0}
            >
              {enviando ? 'Enviando...' : 'Enviar Orçamento'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}