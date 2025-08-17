import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import Toast from './Toast'
import './FornecedorForm.css'

export default function FornecedorForm({
  mostrarTitulo = true,
  onCadastroFinalizado,
  origem = 'admin' // 'externo' ou 'admin'
}) {
  const [nome, setNome] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [tipoFornecedor, setTipoFornecedor] = useState('servico')

  const [fornecedorCoopercon, setFornecedorCoopercon] = useState(false)
  const [associadoQualifios, setAssociadoQualifios] = useState(false)

  const [tags, setTags] = useState('')
  const [todasTags, setTodasTags] = useState([])
  const [sugestoes, setSugestoes] = useState([])
  const [sugestaoSelecionada, setSugestaoSelecionada] = useState(-1)

  const [mensagem, setMensagem] = useState(null)
  const [tipoMensagem, setTipoMensagem] = useState('sucesso')

  const inputTagsRef = useRef(null)

  // Carregar todas as tags existentes
  useEffect(() => {
    const carregarTags = async () => {
      const { data, error } = await supabase.from('fornecedores').select('tags')
      if (error) return console.error('Erro ao buscar tags:', error)

      const tagsUnicas = new Set()
      data.forEach(f => {
        f.tags?.forEach(tag => tagsUnicas.add(tag.toLowerCase()))
      })
      setTodasTags(Array.from(tagsUnicas))
    }

    carregarTags()
  }, [])

  // Gerenciamento de sugestões de tags
  const handleTagsChange = (e) => {
    const texto = e.target.value
    setTags(texto)
    setSugestaoSelecionada(-1)

    const partes = texto.split(/\s+/)
    const ultima = partes[partes.length - 1]

    if (ultima.length >= 4 && ultima.startsWith('#')) {
      const termo = ultima.toLowerCase()
      const filtradas = todasTags.filter(tag => tag.startsWith(termo) && tag !== termo)
      setSugestoes(filtradas.slice(0, 5))
    } else {
      setSugestoes([])
    }
  }

  const selecionarSugestao = (tagSelecionada) => {
    const partes = tags.trim().split(/\s+/)
    partes[partes.length - 1] = tagSelecionada
    setTags(partes.join(' ') + ' ')
    setSugestoes([])
    setSugestaoSelecionada(-1)
    inputTagsRef.current?.focus()
  }

  const handleKeyDownTags = (e) => {
    if (sugestoes.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSugestaoSelecionada(prev => (prev < sugestoes.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSugestaoSelecionada(prev => (prev > 0 ? prev - 1 : sugestoes.length - 1))
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (sugestaoSelecionada >= 0 && sugestaoSelecionada < sugestoes.length) {
        e.preventDefault()
        selecionarSugestao(sugestoes[sugestaoSelecionada])
      }
    }
  }

  // Exibir mensagens
  const exibirMensagem = (texto, tipo = 'sucesso') => {
    setMensagem(texto)
    setTipoMensagem(tipo)
    setTimeout(() => setMensagem(null), 3000)
  }

  // Submit do formulário
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validação WhatsApp
    const numeroLimpo = whatsapp.replace(/\D/g, '')
    if (!/^\d{10,11}$/.test(numeroLimpo)) {
      exibirMensagem('Número de WhatsApp inválido. Use o formato: xx xxxxx xxxx', 'erro')
      return
    }
    const ddd = numeroLimpo.slice(0, 2)
    const numero = numeroLimpo.slice(2)
    const whatsappFormatado = `(${ddd}) ${numero}`

    // Verifica duplicidade
    const { data: existentes, error: erroConsulta } = await supabase
      .from('fornecedores')
      .select('id')
      .eq('whatsapp', whatsappFormatado)

    if (erroConsulta) {
      exibirMensagem('Erro ao verificar duplicidade: ' + erroConsulta.message, 'erro')
      return
    }
    if (existentes.length > 0) {
      exibirMensagem('Este número de WhatsApp já está cadastrado.', 'erro')
      return
    }

    // Processa tags
    const tagsArray = tags
      .split(/[\s,]+/)
      .filter(tag => tag.startsWith('#'))
      .map(tag => tag.toLowerCase())

    // Insere fornecedor
    const { data: novoFornecedor, error } = await supabase
      .from('fornecedores')
      .insert([{
        nome,
        empresa,
        whatsapp: whatsappFormatado,
        tipo: tipoFornecedor,
        tags: tagsArray,
        coopercon: fornecedorCoopercon,
        qualifios: associadoQualifios
      }])
      .select()
      .single()

    if (error) {
      exibirMensagem('Erro ao cadastrar: ' + error.message, 'erro')
    } else {
      exibirMensagem('Fornecedor cadastrado com sucesso!')

      // Só criar notificação se for cadastro externo
      if (origem === 'externo') {
        const tagsMensagem = tagsArray.slice(0, 3).join(', ')
        const mensagemReport = `${nome} da empresa ${empresa} fez um novo cadastro com as tags (${tagsMensagem})`

        await supabase.from('reports').insert([{
          tipo: 'cadastro_externo',
          mensagem: mensagemReport
        }])
      }

      // Limpa formulário
      setNome('')
      setEmpresa('')
      setWhatsapp('')
      setTipoFornecedor('servico')
      setTags('')
      setSugestoes([])
      setSugestaoSelecionada(-1)
      setFornecedorCoopercon(false)
      setAssociadoQualifios(false)

      if (onCadastroFinalizado) {
        setTimeout(() => {
          onCadastroFinalizado(novoFornecedor)
        }, 1500)
      }
    }
  }

  return (
    <>
      {mensagem && (
        <Toast
          mensagem={mensagem}
          tipo={tipoMensagem}
          onClose={() => setMensagem(null)}
        />
      )}

      <form className="fornecedor-form" onSubmit={handleSubmit}>
        {mostrarTitulo && <h2 className="form-title">Cadastrar Fornecedor</h2>}

        <label className="form-label">Nome:</label>
        <input
          className="form-input"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <label className="form-label">Empresa:</label>
        <input
          className="form-input"
          type="text"
          value={empresa}
          onChange={(e) => setEmpresa(e.target.value)}
          required
        />

        <label className="form-label">WhatsApp:</label>
        <input
          className="form-input"
          type="text"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="DDD + Telefone"
          required
        />

        {/* Tipo de fornecedor */}
        <div className="selection-group" role="radiogroup" aria-label="Tipo de Fornecedor">
          <button
            type="button"
            className={`selection-button ${tipoFornecedor === 'servico' ? 'selected' : ''}`}
            onClick={() => setTipoFornecedor('servico')}
            aria-pressed={tipoFornecedor === 'servico'}
          >
            Serviço
          </button>
          <button
            type="button"
            className={`selection-button ${tipoFornecedor === 'material' ? 'selected' : ''}`}
            onClick={() => setTipoFornecedor('material')}
            aria-pressed={tipoFornecedor === 'material'}
          >
            Material
          </button>
          <button
            type="button"
            className={`selection-button ${tipoFornecedor === 'material_servico' ? 'selected' : ''}`}
            onClick={() => setTipoFornecedor('material_servico')}
            aria-pressed={tipoFornecedor === 'material_servico'}
          >
            Material e Serviço
          </button>
        </div>

        {/* Perguntas adicionais */}
        <label className="form-label" style={{ marginTop: '10px' }}>
          <input
            type="checkbox"
            checked={fornecedorCoopercon}
            onChange={(e) => setFornecedorCoopercon(e.target.checked)}
          />{' '}
          Fornecedor Coopercon?
        </label>

        <label className="form-label" style={{ marginTop: '5px' }}>
          <input
            type="checkbox"
            checked={associadoQualifios}
            onChange={(e) => setAssociadoQualifios(e.target.checked)}
          />{' '}
          Associado à Qualifios?
        </label>

        <label className="form-label">Hashtags:</label>
        <div style={{ position: 'relative' }}>
          <input
            ref={inputTagsRef}
            className="form-input"
            type="text"
            value={tags}
            onChange={handleTagsChange}
            onKeyDown={handleKeyDownTags}
            placeholder="Ex.: #cimento #areia"
            autoComplete="off"
          />
          {sugestoes.length > 0 && (
            <ul className="tag-sugestoes" role="listbox">
              {sugestoes.map((sug, idx) => (
                <li
                  key={idx}
                  className={`tag-sugestao ${idx === sugestaoSelecionada ? 'selecionada' : ''}`}
                  onClick={() => selecionarSugestao(sug)}
                  role="option"
                  aria-selected={idx === sugestaoSelecionada}
                >
                  {sug}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button className="form-button" type="submit">
          Cadastrar
        </button>
      </form>
    </>
  )
}
