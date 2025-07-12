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

  const handleLogin = async (e) => {
    e.preventDefault()
    setMensagem(null)

    const { error, data } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.senha,
    })

    if (error) {
      setMensagem('Erro no login: ' + error.message)
    } else {
      setMensagem('Login bem-sucedido!')
      onLoginSuccess?.(data.user) // Fecha painel
      navigate('/admin') // Redireciona
    }
  }

  const handleCadastro = async (e) => {
    e.preventDefault()
    setMensagem(null)

    const perfil =
      form.codigo === 'admin123' ? 'admin' :
      form.codigo === 'buscador123' ? 'buscador' :
      null

    if (!perfil) {
      setMensagem('Código inválido! Use admin123 ou buscador123.')
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.senha,
    })

    if (error) {
      setMensagem('Erro no cadastro: ' + error.message)
      return
    }

    const { error: errorProfile } = await supabase.from('profiles').insert([
      {
        id: data.user.id,
        nome: form.nome,
        empresa: form.empresa,
        setor: form.setor,
        perfil,
      },
    ])

    if (errorProfile) {
      setMensagem('Erro ao salvar perfil: ' + errorProfile.message)
      return
    }

    setMensagem(`Usuário ${perfil} cadastrado com sucesso! Verifique seu email.`)

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
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label>Senha:</label>
        <input
          type="password"
          name="senha"
          value={form.senha}
          onChange={handleChange}
          required
        />

        {modo === 'cadastro' && (
          <>
            <label>Nome:</label>
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              required
            />

            <label>Empresa:</label>
            <input
              type="text"
              name="empresa"
              value={form.empresa}
              onChange={handleChange}
              required
            />

            <label>Setor:</label>
            <input
              type="text"
              name="setor"
              value={form.setor}
              onChange={handleChange}
              required
            />

            <label>Código de acesso:</label>
            <input
              type="text"
              name="codigo"
              value={form.codigo}
              onChange={handleChange}
              required
            />
          </>
        )}

        <button type="submit">
          {modo === 'login' ? 'Entrar' : 'Cadastrar'}
        </button>
      </form>

      <button
        className="toggle-mode"
        onClick={() => setModo(modo === 'login' ? 'cadastro' : 'login')}
      >
        {modo === 'login' ? 'Criar uma conta' : 'Voltar para login'}
      </button>

      {mensagem && <p className="login-msg">{mensagem}</p>}
    </div>
  )
}
