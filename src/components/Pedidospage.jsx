import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { FaPlus, FaEye, FaTrash, FaClipboardList } from 'react-icons/fa'
import './Pedidospage.css'

export default function PedidosPage() {
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    buscarPedidos()
  }, [])

  async function buscarPedidos() {
    setCarregando(true)
    const { data, error } = await supabase
      .from('pedidos')
      .select('*, pedido_fornecedores(id, respondido)')
      .order('created_at', { ascending: false })

    if (!error) setPedidos(data || [])
    setCarregando(false)
  }

  async function deletarPedido(id) {
    if (!window.confirm('Excluir este pedido? Todos os dados serão perdidos.')) return
    await supabase.from('pedidos').delete().eq('id', id)
    buscarPedidos()
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
      <div className="pedidos-topbar">
        <div className="pedidos-topbar__titulo">
          <FaClipboardList />
          <h2>Pedidos de Cotação</h2>
        </div>
        <button className="btn-novo-pedido" onClick={() => navigate('/pedidos/novo')}>
          <FaPlus /> Novo Pedido
        </button>
      </div>

      {carregando ? (
        <div className="pedidos-loading">Carregando...</div>
      ) : pedidos.length === 0 ? (
        <div className="pedidos-empty">
          <FaClipboardList size={48} />
          <p>Nenhum pedido criado ainda.</p>
          <button className="btn-novo-pedido" onClick={() => navigate('/pedidos/novo')}>
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
                const statusClass = respondidos === total && total > 0
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
                        <button
                          className="btn-acao btn-acao--ver"
                          title="Ver resultados"
                          onClick={() => navigate(`/pedidos/${p.id}/resultados`)}
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