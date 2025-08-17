import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft, FaTrash } from 'react-icons/fa';
import { BsPerson } from 'react-icons/bs';
import { FaGear } from 'react-icons/fa6';
import { supabase } from '../supabaseClient';
import logoFonecta from '../assets/fonect.png';
import logoParceiraDefault from '../assets/parceira.png';
import './Header.css';

export default function Header({ mostrarLogin, setMostrarLogin, user, setUser, tema, setTema }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const estaNaBusca = pathname.startsWith('/busca');
  const estaNaHome = pathname === '/';
  const estaNoCadastroExterno = pathname === '/cadastro-externo';
  const estaNaAdmin = pathname === '/admin';

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loginAtivo, setLoginAtivo] = useState(false);
  const [menuAbertoTema, setMenuAbertoTema] = useState(false);

  const [mostrarBoxReports, setMostrarBoxReports] = useState(false);
  const [reportSelecionado, setReportSelecionado] = useState(null);
  const [idsLidos, setIdsLidos] = useState(new Set());
  const [mostrarMenuLogo, setMostrarMenuLogo] = useState(false);
  const [reports, setReports] = useState([]);

  const menuRef = useRef(null);
  const reportsRef = useRef(null);
  const gearRef = useRef(null);
  const inputFileRef = useRef(null);

  const [logoParceira, setLogoParceira] = useState(user?.logo_parceira_url || logoParceiraDefault);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (user?.logo_parceira_url) {
      setLogoParceira(user.logo_parceira_url + `?t=${new Date().getTime()}`);
    } else {
      setLogoParceira(logoParceiraDefault);
    }
  }, [user?.logo_parceira_url]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMostrarMenuLogo(false);
      if (gearRef.current && !gearRef.current.contains(event.target)) setMenuAbertoTema(false);
    }
    if (mostrarMenuLogo || menuAbertoTema) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mostrarMenuLogo, menuAbertoTema]);

  useEffect(() => {
    function handleClickOutsideReport(event) {
      if (reportsRef.current && !reportsRef.current.contains(event.target)) setMostrarBoxReports(false);
    }
    if (mostrarBoxReports) document.addEventListener('mousedown', handleClickOutsideReport);
    return () => document.removeEventListener('mousedown', handleClickOutsideReport);
  }, [mostrarBoxReports]);

  useEffect(() => {
    async function buscarReports() {
      const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
      if (error) console.error('Erro ao buscar reports:', error);
      else setReports(data);
    }
    if (estaNaAdmin) {
      buscarReports();
      const interval = setInterval(buscarReports, 10000);
      return () => clearInterval(interval);
    }
  }, [estaNaAdmin]);

  const mensagensNaoLidas = reports.filter(r => !idsLidos.has(r.id));
  const corIcone = mensagensNaoLidas.length > 0 ? '#004a99' : '#4a90e2';

  function toggleBoxReports() {
    setMostrarBoxReports(prev => {
      const novoEstado = !prev;
      if (novoEstado) setReportSelecionado(null);
      return novoEstado;
    });
  }

  function abrirDetalhe(report) {
    setReportSelecionado(report);
    setIdsLidos(prev => new Set(prev).add(report.id));
  }

  function fecharDetalhe() {
    setReportSelecionado(null);
  }

  function toggleMenuLogo() {
    setMostrarMenuLogo(prev => !prev);
  }

  function sair() {
    setMostrarMenuLogo(false);
    navigate('/');
  }

  async function handleFileChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id || 'admin'}-logoParceira.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('logos-parceiros')
      .upload(filePath, file, { upsert: true });
    if (uploadError) return alert('Erro no upload: ' + uploadError.message);

    const { publicURL, error: urlError } = supabase.storage.from('logos-parceiros').getPublicUrl(filePath);
    if (urlError) return alert('Erro ao obter URL pública: ' + urlError.message);

    const { error: updateError } = await supabase.from('users').update({ logo_parceira_url: publicURL }).eq('id', user.id);
    if (updateError) return alert('Erro ao atualizar banco: ' + updateError.message);

    if (setUser) setUser(prev => ({ ...prev, logo_parceira_url: publicURL }));
    else setLogoParceira(publicURL + `?t=${new Date().getTime()}`);
    setMostrarMenuLogo(false);
  }

  function abrirSeletorArquivos() {
    if (inputFileRef.current) inputFileRef.current.click();
  }

  function toggleLogin() {
    setLoginAtivo(prev => !prev);
    setMostrarLogin(prev => !prev);
  }

  return (
    <header className="app-header">
      <div className="header-left">
        <img src={logoFonecta} alt="Logo Fonecta" className="logo-fonecta" />
        <h1 className="fonecta-title">FONECTA</h1>
      </div>

      {!estaNoCadastroExterno && (
        <div className="header-right">
          {(estaNaAdmin || estaNaBusca) && (
            <div ref={gearRef} className="gear-container">
              <button
                onClick={() => setMenuAbertoTema(prev => !prev)}
                className="gear-button"
                aria-label="Abrir menu de temas"
                title="Alterar tema de fundo"
                type="button"
              >
                <FaGear style={{ width: '24px', height: '24px', color: corIcone, transition: 'color 0.3s' }} />
              </button>

              {menuAbertoTema && (
                <div className="menu-tema">
                  {['default', 'black', 'purple', 'darkblue'].map(id => (
                    <div
                      key={id}
                      onClick={() => { setTema(id); setMenuAbertoTema(false); }}
                      className={`menu-item ${tema === id ? 'ativo' : ''}`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { setTema(id); setMenuAbertoTema(false); } }}
                    >
                      {id.charAt(0).toUpperCase() + id.slice(1)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {estaNaAdmin && (
            <div className="admin-icons">
              <button onClick={toggleBoxReports} className="btn-envelope" aria-label="Mensagens de Reporte">
                <FaEnvelope color={corIcone} size={24} />
                {mensagensNaoLidas.length > 0 && <span className="badge-reports">{mensagensNaoLidas.length}</span>}
              </button>

              <img src={logoParceira} alt="Logo Parceira" className="logo-parceira clickable" onClick={toggleMenuLogo} />

              {mostrarMenuLogo && (
                <div ref={menuRef} className="menu-logo">
                  <button onClick={abrirSeletorArquivos} className="menu-logo-item">Adicionar imagem</button>
                  <button onClick={sair} className="menu-logo-item sair">Sair</button>
                  <input type="file" accept="image/*" style={{ display: 'none' }} ref={inputFileRef} onChange={handleFileChange} />
                </div>
              )}
            </div>
          )}

          {estaNaBusca && (
            <div className="busca-logo">
              <img src={logoParceira} alt="Logo Parceira" className="logo-parceira clickable" onClick={toggleMenuLogo} />
              {mostrarMenuLogo && (
                <div ref={menuRef} className="menu-logo-busca">
                  <button onClick={sair} className="menu-logo-item sair">Sair</button>
                </div>
              )}
            </div>
          )}

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
            <img src={logoParceiraDefault} alt="Logo Parceira" className="logo-parceira" />
          )}
        </div>
      )}

      {mostrarBoxReports && estaNaAdmin && (
        <div ref={reportsRef} className="box-reports">
          {!reportSelecionado ? (
            <>
              <h4 className="titulo-reports">Mensagens</h4>
              {reports.map(r => (
                <div key={r.id} className={`report-item ${idsLidos.has(r.id) ? 'lido' : ''}`}>
                  <span onClick={() => abrirDetalhe(r)} style={{ cursor: 'pointer', flex: 1 }}>
                    {r.mensagem}
                  </span>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      const { error } = await supabase.from('reports').delete().eq('id', r.id);
                      if (error) alert('Erro ao deletar mensagem: ' + error.message);
                      else {
                        setReports(prev => prev.filter(item => item.id !== r.id));
                        setIdsLidos(prev => {
                          const novoSet = new Set(prev);
                          novoSet.delete(r.id);
                          return novoSet;
                        });
                      }
                    }}
                    className="btn-delete-report"
                    title="Apagar mensagem"
                    aria-label="Apagar mensagem"
                  >
                    <FaTrash color="#c00" />
                  </button>
                </div>
              ))}
            </>
          ) : (
            <div>
              <button onClick={fecharDetalhe} className="btn-voltar" aria-label="Voltar" title="Voltar">
                <FaArrowLeft />
              </button>
              <p><strong>{reportSelecionado.mensagem}</strong></p>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
