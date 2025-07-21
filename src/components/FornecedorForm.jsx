import React, { useState, useEffect } from 'react'
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

  const [mensagem, setMensagem] = useState(null)
  const [tipoMensagem, setTipoMensagem] = useState('sucesso')

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

  const handleSugestaoClick = (tagSelecionada) => {
    const partes = tags.trim().split(/\s+/)
    partes[partes.length - 1] = tagSelecionada
    setTags(partes.join(' ') + ' ')
    setSugestoes([])
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

      // ✅ Chama a função passada por prop ao finalizar cadastro
      if (onCadastroFinalizado) {
        setTimeout(() => {
          onCadastroFinalizado()
        }, 1500) // pequeno delay para o Toast aparecer antes de sumir
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
            className="form-input"
            type="text"
            value={tags}
            onChange={handleTagsChange}
            placeholder="Ex.: #cimento #areia"
          />
          {sugestoes.length > 0 && (
            <ul className="tag-sugestoes">
              {sugestoes.map((sug, idx) => (
                <li
                  key={idx}
                  className="tag-sugestao"
                  onClick={() => handleSugestaoClick(sug)}
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
