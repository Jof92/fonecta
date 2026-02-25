import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { FaPlus, FaEye, FaTrash, FaClipboardList, FaArrowLeft, FaBuilding } from 'react-icons/fa'
import './Pedidospage.css'

export default function ProjetoPedidosPage() {
  const navigate = useNavigate()
  const { projetoId } = useParams()

  const [projeto, setProjeto] = useState(null)
  const [pedidos, setPedidos] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    buscarDados()
  }, [projetoId])

  async function buscarDados() {
    setCarregando(true)
    const [{ data: proj }, { data: peds, error }] = await Promise.all([
      supabase.from('projetos').select('*').eq('id', projetoId).single(),
      supabase
        .from('pedidos')
        .select('*, pedido_fornecedores(id, respondido)')
        .eq('projeto_id', projetoId)
        .order('created_at', { ascending: false }),
    ])
    if (proj) setProjeto(proj)
    if (!error) setPedidos(peds || [])
    setCarregando(false)
  }

  async function deletarPedido(id) {
    if (!window.confirm('Excluir este pedido? Todos os dados serão perdidos.')) return
    await supabase.from('pedidos').delete().eq('id', id)
    buscarDados()
  }

  function formatarData(data) {
    if (!data) return '—'
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')
  }

  function contarRespostas(fornecedores) {
    if (!fornecedores) return { respondidos: 0, total: 0 }
    return {
      respondidos: fornecedores.filter(f => f.respondido).length,
      total: fornecedores.length,
    }
  }

  return (
    <div className="pedidos-page">
      {/* BREADCRUMB */}
      <div className="pedidos-breadcrumb">
        <button className="btn-back" onClick={() => navigate('/projetos')}>
          <FaArrowLeft /> Projetos
        </button>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-atual">
          <FaBuilding /> {projeto?.nome || '...'}
        </span>
      </div>

      <div className="pedidos-topbar">
        <div className="pedidos-topbar__titulo">
          <FaClipboardList />
          <div>
            <h2>Pedidos de Cotação</h2>
            {projeto?.razao_social && (
              <p className="pedidos-topbar__sub">{projeto.razao_social}</p>
            )}
          </div>
        </div>
        <button
          className="btn-novo-pedido"
          onClick={() => navigate(`/projetos/${projetoId}/pedidos/novo`)}
        >
          <FaPlus /> Novo Pedido
        </button>
      </div>

      {carregando ? (
        <div className="pedidos-loading">Carregando...</div>
      ) : pedidos.length === 0 ? (
        <div className="pedidos-empty">
          <FaClipboardList size={48} />
          <p>Nenhum pedido neste projeto.</p>
          <button
            className="btn-novo-pedido"
            onClick={() => navigate(`/projetos/${projetoId}/pedidos/novo`)}
          >
            <FaPlus /> Criar primeiro pedido
          </button>
        </div>
      ) : (
        <div className="pedidos-tabela-wrapper">
          <table className="pedidos-tabela">
            <thead>
              <tr>
                <th>Empreendimento</th>
                <th>CNPJ</th>
                <th>Data do Pedido</th>
                <th>Data Limite</th>
                <th>Respostas</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map(p => {
                const { respondidos, total } = contarRespostas(p.pedido_fornecedores)
                const statusClass =
                  respondidos === total && total > 0
                    ? 'status--completo'
                    : respondidos > 0
                    ? 'status--parcial'
                    : 'status--aguardando'

                return (
                  <tr key={p.id}>
                    <td className="td-empreendimento">{p.nome_empreendimento}</td>
                    <td className="td-mono">{p.cnpj}</td>
                    <td>{formatarData(p.data_pedido)}</td>
                    <td>{formatarData(p.data_limite)}</td>
                    <td>
                      <span className={`status-badge ${statusClass}`}>
                        {respondidos}/{total} respondidos
                      </span>
                    </td>
                    <td>
                      <div className="td-acoes">
                        {/* VER DETALHES DO PEDIDO */}
                        <button
                          className="btn-acao btn-acao--ver"
                          title="Ver pedido"
                          onClick={() => navigate(`/pedidos/${p.id}`)}
                        >
                          <FaEye />
                        </button>
                        <button
                          className="btn-acao btn-acao--del"
                          title="Excluir"
                          onClick={() => deletarPedido(p.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}