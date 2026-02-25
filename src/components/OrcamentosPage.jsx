// src/components/OrcamentosPage.jsx
import React, { useState, useEffect } from 'react'
import './OrcamentosPage.css'

// Estrutura baseada na sua planilha Excel
const estruturaInsumo = {
  codigo: '',
  especificacao: '',
  unidade: '',
  quantidade: 0,
  prUnitInicial: 0,
  percentualDesc: 0,
  prUnitInsumo: 0,
  percentualIPI: 0,
  prUnitComIPI: 0,
  difICMS: 0,
  prUnitFrete: 0,
  prUnitFinal: 0,
  precoTotal: 0,
  marca: '',
  observacao: ''
}

export default function OrcamentosPage({ usuario }) {
  const [insumos, setInsumos] = useState([])
  const [filtro, setFiltro] = useState('')
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState('')
  const [editandoId, setEditandoId] = useState(null)

  // Dados de exemplo baseados na sua planilha
  const dadosExemplo = [
    {
      id: 1,
      codigo: '003435-000',
      especificacao: 'Café da manhã',
      unidade: 'un',
      quantidade: 2400,
      prUnitInicial: 4.10,
      percentualDesc: 0,
      prUnitInsumo: 4.10,
      percentualIPI: 0,
      prUnitComIPI: 4.10,
      difICMS: 0,
      prUnitFrete: 0,
      prUnitFinal: 4.10,
      precoTotal: 9840.00,
      marca: '',
      observacao: ''
    },
    {
      id: 2,
      codigo: '003432-000',
      especificacao: 'Refeição',
      unidade: 'un',
      quantidade: 2400,
      prUnitInicial: 11.40,
      percentualDesc: 0,
      prUnitInsumo: 11.40,
      percentualIPI: 0,
      prUnitComIPI: 11.40,
      difICMS: 0,
      prUnitFrete: 0,
      prUnitFinal: 11.40,
      precoTotal: 27360.00,
      marca: '',
      observacao: ''
    }
  ]

  useEffect(() => {
    // Carrega do localStorage ou usa dados de exemplo
    const salvos = localStorage.getItem('fonecta_orcamentos')
    if (salvos) {
      setInsumos(JSON.parse(salvos))
    } else {
      setInsumos(dadosExemplo)
      localStorage.setItem('fonecta_orcamentos', JSON.stringify(dadosExemplo))
    }
  }, [])

  // Calcula preço final: (Inicial * (1 - Desc/100)) * (1 + IPI/100) + Frete
  const calcularPrecoFinal = (item) => {
    let preco = item.prUnitInicial
    preco = preco * (1 - item.percentualDesc / 100)
    preco = preco * (1 + item.percentualIPI / 100)
    preco = preco + item.prUnitFrete
    return parseFloat(preco.toFixed(4))
  }

  // Calcula total: Preço Final * Quantidade
  const calcularTotal = (item) => {
    const unitFinal = calcularPrecoFinal(item)
    return parseFloat((unitFinal * item.quantidade).toFixed(2))
  }

  // Atualiza um campo do insumo
  const handleInputChange = (id, campo, valor) => {
    setInsumos(prev => prev.map(item => {
      if (item.id === id) {
        const atualizado = { ...item, [campo]: valor }
        // Recalcula campos dependentes
        if (['prUnitInicial', 'percentualDesc', 'percentualIPI', 'prUnitFrete'].includes(campo)) {
          atualizado.prUnitInsumo = atualizado.prUnitInicial * (1 - atualizado.percentualDesc / 100)
          atualizado.prUnitComIPI = atualizado.prUnitInsumo * (1 + atualizado.percentualIPI / 100)
          atualizado.prUnitFinal = calcularPrecoFinal(atualizado)
          atualizado.precoTotal = calcularTotal(atualizado)
        }
        return atualizado
      }
      return item
    }))
  }

  // Salva no localStorage
  useEffect(() => {
    if (insumos.length > 0) {
      localStorage.setItem('fonecta_orcamentos', JSON.stringify(insumos))
    }
  }, [insumos])

  // Filtra por busca
  const insumosFiltrados = insumos.filter(item =>
    item.codigo.toLowerCase().includes(filtro.toLowerCase()) ||
    item.especificacao.toLowerCase().includes(filtro.toLowerCase()) ||
    item.marca.toLowerCase().includes(filtro.toLowerCase())
  )

  // Totais gerais
  const totalGeral = insumosFiltrados.reduce((acc, item) => acc + item.precoTotal, 0)

  return (
    <div className="orcamentos-page">
      <div className="page-header">
        <h1>📊 Orçamentos</h1>
        <p className="page-subtitle">Gerencie cotações e comparativos de preços</p>
      </div>

      {/* Filtros */}
      <div className="filters-bar">
        <input
          type="text"
          placeholder="🔍 Buscar por código, descrição ou marca..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="search-input"
        />
        <select
          value={fornecedorSelecionado}
          onChange={(e) => setFornecedorSelecionado(e.target.value)}
          className="filter-select"
        >
          <option value="">Todos os fornecedores</option>
          <option value="forn1">Fornecedor 1</option>
          <option value="forn2">Fornecedor 2</option>
          <option value="forn3">Fornecedor 3</option>
        </select>
        <button className="btn-primary" onClick={() => adicionarNovoInsumo()}>
          + Novo Insumo
        </button>
      </div>

      {/* Tabela */}
      <div className="table-container">
        <table className="orcamentos-table">
          <thead>
            <tr>
              <th>Código</th>
              <th className="col-desc">Especificação</th>
              <th>Unid</th>
              <th>Quantidade</th>
              <th>Pr. Unit. Inicial</th>
              <th>% Desc</th>
              <th>Pr. Unit. Insumo</th>
              <th>% IPI</th>
              <th>Pr. Unit. Com IPI</th>
              <th>Dif. ICMS</th>
              <th>Pr. Unit. Frete</th>
              <th className="col-destaque">Pr. Unit. Final</th>
              <th className="col-destaque">Preço Total</th>
              <th>Marca</th>
              <th>Obs</th>
              <th className="col-actions">Ações</th>
            </tr>
          </thead>
          <tbody>
            {insumosFiltrados.map((item) => (
              <tr key={item.id} className={editandoId === item.id ? 'editing' : ''}>
                <td>{item.codigo}</td>
                <td className="col-desc">{item.especificacao}</td>
                <td>{item.unidade}</td>
                <td>{item.quantidade.toLocaleString('pt-BR')}</td>
                
                <td>
                  <input
                    type="number"
                    step="0.0001"
                    value={item.prUnitInicial}
                    onChange={(e) => handleInputChange(item.id, 'prUnitInicial', parseFloat(e.target.value) || 0)}
                    className="table-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    value={item.percentualDesc}
                    onChange={(e) => handleInputChange(item.id, 'percentualDesc', parseFloat(e.target.value) || 0)}
                    className="table-input"
                  />
                </td>
                <td className="calculated">{item.prUnitInsumo.toFixed(4)}</td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    value={item.percentualIPI}
                    onChange={(e) => handleInputChange(item.id, 'percentualIPI', parseFloat(e.target.value) || 0)}
                    className="table-input"
                  />
                </td>
                <td className="calculated">{item.prUnitComIPI.toFixed(4)}</td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    value={item.difICMS}
                    onChange={(e) => handleInputChange(item.id, 'difICMS', parseFloat(e.target.value) || 0)}
                    className="table-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.0001"
                    value={item.prUnitFrete}
                    onChange={(e) => handleInputChange(item.id, 'prUnitFrete', parseFloat(e.target.value) || 0)}
                    className="table-input"
                  />
                </td>
                <td className="col-destaque calculated">{calcularPrecoFinal(item).toFixed(4)}</td>
                <td className="col-destaque calculated total">{calcularTotal(item).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td>
                  <input
                    type="text"
                    value={item.marca}
                    onChange={(e) => handleInputChange(item.id, 'marca', e.target.value)}
                    className="table-input"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={item.observacao}
                    onChange={(e) => handleInputChange(item.id, 'observacao', e.target.value)}
                    className="table-input"
                  />
                </td>
                <td className="col-actions">
                  <button className="btn-icon btn-save" title="Salvar" onClick={() => setEditandoId(null)}>💾</button>
                  <button className="btn-icon btn-delete" title="Excluir" onClick={() => removerInsumo(item.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="total-row">
              <td colSpan="12" style={{ textAlign: 'right', fontWeight: 'bold' }}>TOTAL GERAL:</td>
              <td className="col-destaque total" style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                {totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </td>
              <td colSpan="3"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Botões de Ação */}
      <div className="actions-bar">
        <button className="btn-secondary" onClick={() => exportarParaExcel()}>📥 Exportar Excel</button>
        <button className="btn-primary" onClick={() => window.print()}>🖨️ Imprimir</button>
        <button className="btn-success" onClick={() => salvarOrcamento()}>✅ Salvar Orçamento</button>
      </div>
    </div>
  )

  // Funções auxiliares
  function adicionarNovoInsumo() {
    const novo = { ...estruturaInsumo, id: Date.now(), quantidade: 1 }
    setInsumos(prev => [...prev, novo])
    setEditandoId(novo.id)
  }

  function removerInsumo(id) {
    if (window.confirm('Tem certeza que deseja excluir este insumo?')) {
      setInsumos(prev => prev.filter(item => item.id !== id))
    }
  }

  function exportarParaExcel() {
    alert('📥 Função de exportação para Excel será implementada com a biblioteca xlsx')
  }

  function salvarOrcamento() {
    localStorage.setItem('fonecta_orcamentos', JSON.stringify(insumos))
    alert('✅ Orçamento salvo com sucesso!')
  }
}