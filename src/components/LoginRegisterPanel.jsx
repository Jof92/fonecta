import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import './LoginRegisterPanel.css'

export default function LoginRegisterPanel({ onLoginSuccess }) {
  const navigate = useNavigate()

  const [modo, setModo] = useState('login')
  const [form, setForm] = useState({
    email: '',
    senha: '',
    nome: '',
    empresa: '',
    setor: '',
    codigo: '',
  })
  const [mensagem, setMensagem] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // ---------------- LOGIN ----------------
  const handleLogin = async (e) => {
    e.preventDefault()
    setMensagem(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.senha,
    })

    if (error) {
      setMensagem('Erro no login: ' + error.message)
      return
    }

    const userId = data.user?.id
    if (!userId) {
      setMensagem('Erro: usuário não encontrado.')
      return
    }

    const { data: perfilData, error: perfilError } = await supabase
      .from('profiles')
      .select('perfil')
      .eq('id', userId)
      .single()

    if (perfilError) {
      setMensagem('Erro ao buscar perfil: ' + perfilError.message)
      return
    }

    onLoginSuccess?.(data.user)

    if (perfilData.perfil === 'pendente') {
      setMensagem('Cadastro pendente: aguarde aprovação ou insira o código correto.')
      return
    }

    if (perfilData.perfil === 'admin' || perfilData.perfil === 'buscador') {
      navigate('/home')
    } else {
      setMensagem('Perfil inválido no cadastro.')
    }
  }

  // ---------------- CADASTRO ----------------
  const handleCadastro = async (e) => {
    e.preventDefault()
    setMensagem(null)

    const perfil =
      form.codigo === 'admin123' ? 'admin' :
      form.codigo === 'buscador123' ? 'buscador' :
      null

    if (!perfil) {
      setMensagem('Código inválido! Busque seu código com o administrador.')
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.senha,
      options: { emailRedirectTo: window.location.origin }
    })

    if (error) {
      setMensagem('Erro no cadastro: ' + error.message)
      return
    }

    const userId = data.user?.id
    if (!userId) {
      setMensagem('Verifique seu email e confirme o cadastro antes de fazer login.')
      setModo('login')
      return
    }

    const { error: errorProfile } = await supabase
      .from('profiles')
      .update({
        nome: form.nome,
        empresa: form.empresa,
        setor: form.setor,
        perfil,
      })
      .eq('id', userId)

    if (errorProfile) {
      setMensagem('Erro ao salvar perfil: ' + errorProfile.message)
      return
    }

    setMensagem(`Usuário ${perfil} cadastrado com sucesso! Confirme seu email e faça login.`)
    setForm({ email: '', senha: '', nome: '', empresa: '', setor: '', codigo: '' })
    setModo('login')
  }

  return (
    <div className="login-panel">
      <h3>{modo === 'login' ? 'Login' : 'Cadastro'}</h3>

      <form onSubmit={modo === 'login' ? handleLogin : handleCadastro}>
        <label>Email:</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />
        <label>Senha:</label>
        <input type="password" name="senha" value={form.senha} onChange={handleChange} required />

        {modo === 'cadastro' && (
          <>
            <label>Nome:</label>
            <input type="text" name="nome" value={form.nome} onChange={handleChange} required />
            <label>Empresa:</label>
            <input type="text" name="empresa" value={form.empresa} onChange={handleChange} required />
            <label>Setor:</label>
            <input type="text" name="setor" value={form.setor} onChange={handleChange} required />
            <label>Código de acesso:</label>
            <input type="text" name="codigo" value={form.codigo} onChange={handleChange} required />
          </>
        )}

        <button type="submit">{modo === 'login' ? 'Entrar' : 'Cadastrar'}</button>
      </form>

      <button className="toggle-mode" onClick={() => setModo(modo === 'login' ? 'cadastro' : 'login')}>
        {modo === 'login' ? 'Criar uma conta' : 'Voltar para login'}
      </button>

      {mensagem && <p className="login-msg">{mensagem}</p>}
    </div>
  )
}