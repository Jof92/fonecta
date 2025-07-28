import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import Toast from './Toast'
import './FornecedorForm.css'

export default function FornecedorForm({ mostrarTitulo = true, onCadastroFinalizado }) {
  const [nome, setNome] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [tags, setTags] = useState('')
  const [todasTags, setTodasTags] = useState([])
  const [sugestoes, setSugestoes] = useState([])
  const [sugestaoSelecionada, setSugestaoSelecionada] = useState(-1)

  const [mensagem, setMensagem] = useState(null)
  const [tipoMensagem, setTipoMensagem] = useState('sucesso')

  const inputTagsRef = useRef(null)

  useEffect(() => {
    const carregarTags = async () => {
      const { data, error } = await supabase.from('fornecedores').select('tags')
      if (error) {
        console.error('Erro ao buscar tags:', error)
        return
      }

      const tagsUnicas = new Set()
      data.forEach(f => {
        f.tags?.forEach(tag => tagsUnicas.add(tag.toLowerCase()))
      })
      setTodasTags(Array.from(tagsUnicas))
    }

    carregarTags()
  }, [])

  const handleTagsChange = (e) => {
    const texto = e.target.value
    setTags(texto)
    setSugestaoSelecionada(-1) // resetar seleção ao digitar

    const partes = texto.split(/\s+/)
    const ultima = partes[partes.length - 1]

    if (ultima.length >= 4 && ultima.startsWith('#')) {
      const termo = ultima.toLowerCase()
      const filtradas = todasTags.filter(
        tag => tag.startsWith(termo) && tag !== termo
      )
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
      setSugestaoSelecionada(prev =>
        prev < sugestoes.length - 1 ? prev + 1 : 0
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSugestaoSelecionada(prev =>
        prev > 0 ? prev - 1 : sugestoes.length - 1
      )
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (sugestaoSelecionada >= 0 && sugestaoSelecionada < sugestoes.length) {
        e.preventDefault()
        selecionarSugestao(sugestoes[sugestaoSelecionada])
      }
    }
  }

  const exibirMensagem = (texto, tipo = 'sucesso') => {
    setMensagem(texto)
    setTipoMensagem(tipo)
    setTimeout(() => setMensagem(null), 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const numeroLimpo = whatsapp.replace(/\D/g, '')
    if (!/^\d{10,11}$/.test(numeroLimpo)) {
      exibirMensagem('Número de WhatsApp inválido. Use o formato: xx xxxxx xxxx', 'erro')
      return
    }

    const ddd = numeroLimpo.slice(0, 2)
    const numero = numeroLimpo.slice(2)
    const whatsappFormatado = `(${ddd}) ${numero}`

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

    const tagsArray = tags
      .split(/[\s,]+/)
      .filter(tag => tag.startsWith('#'))
      .map(tag => tag.toLowerCase())

    const { error } = await supabase.from('fornecedores').insert([{
      nome,
      empresa,
      whatsapp: whatsappFormatado,
      tags: tagsArray,
    }])

    if (error) {
      exibirMensagem('Erro ao cadastrar: ' + error.message, 'erro')
    } else {
      exibirMensagem('Fornecedor cadastrado com sucesso!')
      setNome('')
      setEmpresa('')
      setWhatsapp('')
      setTags('')
      setSugestoes([])
      setSugestaoSelecionada(-1)

      if (onCadastroFinalizado) {
        setTimeout(() => {
          onCadastroFinalizado()
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
