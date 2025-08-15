import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa'
import { BsPerson } from 'react-icons/bs'
import { supabase } from '../supabaseClient'
import logoFonecta from '../assets/fonect.png'
import logoParceiraDefault from '../assets/parceira.png'
import { ReactComponent as GearIcon } from '../assets/icon/gear.svg'

export default function Header({
  mostrarLogin,
  setMostrarLogin,
  reports = [],
  user,
  setUser,
  tema,
  setTema
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname

  const estaNaBusca = pathname.startsWith('/busca')
  const estaNaHome = pathname === '/'
  const estaNoCadastroExterno = pathname === '/cadastro-externo'
  const estaNaAdmin = pathname === '/admin'

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [loginAtivo, setLoginAtivo] = useState(false)
  const [menuAbertoTema, setMenuAbertoTema] = useState(false)

  const [mostrarBoxReports, setMostrarBoxReports] = useState(false)
  const [reportSelecionado, setReportSelecionado] = useState(null)
  const [idsLidos, setIdsLidos] = useState(new Set())
  const [mostrarMenuLogo, setMostrarMenuLogo] = useState(false)

  const menuRef = useRef(null)
  const reportsRef = useRef(null)
  const gearRef = useRef(null)
  const inputFileRef = useRef(null)

  const [logoParceira, setLogoParceira] = useState(user?.logo_parceira_url || logoParceiraDefault)

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (user?.logo_parceira_url) {
      setLogoParceira(user.logo_parceira_url + `?t=${new Date().getTime()}`)
    } else {
      setLogoParceira(logoParceiraDefault)
    }
  }, [user?.logo_parceira_url])

  // Fecha menus ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMostrarMenuLogo(false)
      }
      if (gearRef.current && !gearRef.current.contains(event.target)) {
        setMenuAbertoTema(false)
      }
    }
    if (mostrarMenuLogo || menuAbertoTema) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mostrarMenuLogo, menuAbertoTema])

  useEffect(() => {
    function handleClickOutsideReport(event) {
      if (reportsRef.current && !reportsRef.current.contains(event.target)) {
        setMostrarBoxReports(false)
      }
    }
    if (mostrarBoxReports) {
      document.addEventListener('mousedown', handleClickOutsideReport)
    }
    return () => document.removeEventListener('mousedown', handleClickOutsideReport)
  }, [mostrarBoxReports])

  const mensagensNaoLidas = reports.filter(r => !idsLidos.has(r.id))

  function toggleBoxReports() {
    setMostrarBoxReports(prev => {
      const novoEstado = !prev
      if (novoEstado) setReportSelecionado(null)
      return novoEstado
    })
  }

  function abrirDetalhe(report) {
    setReportSelecionado(report)
    setIdsLidos(prev => new Set(prev).add(report.id))
  }

  function fecharDetalhe() {
    setReportSelecionado(null)
  }

  function toggleMenuLogo() {
    setMostrarMenuLogo(prev => !prev)
  }

  function sair() {
    setMostrarMenuLogo(false)
    navigate('/')
  }

  async function handleFileChange(event) {
    const file = event.target.files[0]
    if (!file) return

    const fileExt = file.name.split('.').pop()
    const fileName = `${user?.id || 'admin'}-logoParceira.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('logos-parceiros')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      alert('Erro no upload: ' + uploadError.message)
      return
    }

    const { publicURL, error: urlError } = supabase.storage
      .from('logos-parceiros')
      .getPublicUrl(filePath)

    if (urlError) {
      alert('Erro ao obter URL pública: ' + urlError.message)
      return
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ logo_parceira_url: publicURL })
      .eq('id', user.id)

    if (updateError) {
      alert('Erro ao atualizar banco: ' + updateError.message)
      return
    }

    if (setUser) {
      setUser(prev => ({
        ...prev,
        logo_parceira_url: publicURL
      }))
    } else {
      setLogoParceira(publicURL + `?t=${new Date().getTime()}`)
    }

    setMostrarMenuLogo(false)
  }

  function abrirSeletorArquivos() {
    if (inputFileRef.current) inputFileRef.current.click()
  }

  function toggleLogin() {
    setLoginAtivo(prev => !prev)
    setMostrarLogin(prev => !prev)
  }

  const corIcone = mensagensNaoLidas.length > 0 ? '#004a99' : '#4a90e2'

  return (
    <header className="app-header" style={{ position: 'relative', zIndex: 10 }}>
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <img src={logoFonecta} alt="Logo Fonecta" className="logo-fonecta" />
        <h1 className="fonecta-title">FONECTA</h1>
      </div>

      {!estaNoCadastroExterno && (
        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {(estaNaAdmin || estaNaBusca) && (
            <div
              ref={gearRef}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
            >
              <button
                onClick={() => setMenuAbertoTema(prev => !prev)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'filter 0.3s',
                  filter: menuAbertoTema ? 'drop-shadow(0 0 8px #00C48C)' : 'none'
                }}
                aria-label="Abrir menu de temas"
                title="Alterar tema de fundo"
                type="button"
              >
                <GearIcon style={{ width: '24px', height: '24px', stroke: corIcone, transition: 'fill 0.3s' }} />
              </button>

              {menuAbertoTema && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    backgroundColor: '#5e2e8c',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                    padding: '0.5rem 0',
                    minWidth: '140px',
                    color: 'white',
                    fontSize: '0.9rem',
                    zIndex: 1100
                  }}
                >
                  {['default', 'black', 'purple', 'darkblue'].map((id) => (
                    <div
                      key={id}
                      onClick={() => {
                        setTema(id)
                        setMenuAbertoTema(false)
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        backgroundColor: tema === id ? '#452075' : 'transparent',
                        color: 'white',
                        fontWeight: tema === id ? '700' : 'normal',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#7c3aed'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = tema === id ? '#452075' : 'transparent'}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setTema(id)
                          setMenuAbertoTema(false)
                        }
                      }}
                    >
                      {id.charAt(0).toUpperCase() + id.slice(1)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mensagens e logo parceira */}
          {estaNaAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
              <button
                onClick={toggleBoxReports}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="Mensagens de Reporte"
              >
                <FaEnvelope color={corIcone} size={24} />
                {mensagensNaoLidas.length > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      background: 'red',
                      borderRadius: '50%',
                      color: 'white',
                      padding: '2px 6px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      lineHeight: '1'
                    }}
                  >
                    {mensagensNaoLidas.length}
                  </span>
                )}
              </button>

              <img
                src={logoParceira}
                alt="Logo Parceira"
                className="logo-parceira"
                style={{ cursor: 'pointer' }}
                onClick={toggleMenuLogo}
              />

              {mostrarMenuLogo && (
                <div
                  ref={menuRef}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    width: '180px',
                    zIndex: 1001
                  }}
                >
                  <button
                    onClick={abrirSeletorArquivos}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    Adicionar imagem
                  </button>
                  <hr style={{ margin: 0 }} />
                  <button
                    onClick={sair}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: 'red',
                      fontWeight: 'bold'
                    }}
                  >
                    Sair
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={inputFileRef}
                    onChange={handleFileChange}
                  />
                </div>
              )}
            </div>
          )}

          {/* Página Busca */}
          {estaNaBusca && (
            <div style={{ position: 'relative' }}>
              <img
                src={logoParceira}
                alt="Logo Parceira"
                className="logo-parceira"
                style={{ cursor: 'pointer' }}
                onClick={toggleMenuLogo}
              />

              {mostrarMenuLogo && (
                <div
                  ref={menuRef}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    width: '140px',
                    zIndex: 1001
                  }}
                >
                  <button
                    onClick={sair}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: 'red',
                      fontWeight: 'bold'
                    }}
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Página Home */}
          {estaNaHome && (
            <button
              onClick={toggleLogin}
              className={`login-button ${loginAtivo ? 'active' : ''}`}
              aria-pressed={loginAtivo}
              aria-label={loginAtivo ? 'Fechar login' : 'Abrir login'}
              title={loginAtivo ? 'Fechar login' : 'Abrir login'}
              type="button"
            >
              <BsPerson />
            </button>
          )}

          {!estaNaHome && !estaNaAdmin && !estaNaBusca && (
            <img
              src={logoParceiraDefault}
              alt="Logo Parceira"
              className="logo-parceira"
            />
          )}
        </div>
      )}

      {/* Box Reports */}
      {mostrarBoxReports && estaNaAdmin && (
        <div
          ref={reportsRef}
          style={{
            position: 'absolute',
            top: '3.5rem',
            right: '1rem',
            width: '280px',
            maxHeight: '300px',
            overflowY: 'auto',
            background: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            borderRadius: '8px',
            padding: '0.5rem',
            zIndex: 1000
          }}
        >
          {!reportSelecionado ? (
            <>
              <h4 style={{ margin: '0.5rem', textAlign: 'center' }}>Mensagens</h4>
              {reports.map(r => (
                <div
                  key={r.id}
                  style={{
                    padding: '0.4rem 0.5rem',
                    borderBottom: '1px solid #ddd',
                    cursor: 'pointer',
                    backgroundColor: idsLidos.has(r.id) ? '#f0f0f0' : 'white'
                  }}
                  onClick={() => abrirDetalhe(r)}
                >
                  {r.nomePessoa}
                </div>
              ))}
            </>
          ) : (
            <div>
              <button
                onClick={fecharDetalhe}
                style={{
                  marginBottom: '0.5rem',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  color: '#0066ff'
                }}
                aria-label="Voltar"
                title="Voltar"
              >
                <FaArrowLeft />
              </button>
              <p>
                <strong>{reportSelecionado.nomePessoa}</strong> reportou que o contato{' '}
                <strong>{reportSelecionado.contatoMarcado}</strong> está errado.
              </p>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
