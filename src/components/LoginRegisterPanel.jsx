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

    setMensagem('Login bem-sucedido!')
    onLoginSuccess?.(data.user)

    if (perfilData.perfil === 'admin') {
      navigate('/admin')
    } else if (perfilData.perfil === 'buscador') {
      navigate('/busca')
    } else if (perfilData.perfil === 'pendente') {
      setMensagem('Cadastro pendente: aguarde aprovação ou insira o código correto.')
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

    // Cadastro sem esperar confirmação de email
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.senha,
      options: { emailRedirectTo: window.location.origin } // evita problemas com redirecionamento
    })

    if (error) {
      setMensagem('Erro no cadastro: ' + error.message)
      return
    }

    const userId = data.user?.id
    if (!userId) {
      setMensagem('Erro: usuário não retornado no cadastro.')
      return
    }

    // Atualiza o perfil pendente criado pelo trigger
    const { error: errorProfile } = await supabase
      .from('profiles')
      .update({
        nome: form.nome,
        empresa: form.empresa,
        setor: form.setor,
        perfil, // 'admin' ou 'buscador'
      })
      .eq('id', userId)

    if (errorProfile) {
      setMensagem('Erro ao salvar perfil: ' + errorProfile.message)
      return
    }

    setMensagem(`Usuário ${perfil} cadastrado com sucesso!Vá até o email cadastrado e confirme.`)

    setForm({
      email: '',
      senha: '',
      nome: '',
      empresa: '',
      setor: '',
      codigo: '',
    })

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
