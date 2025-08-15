import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { FaCopy, FaTags, FaPhoneAlt, FaWhatsapp } from 'react-icons/fa';
import { MdManageAccounts, MdOutlineHandyman } from 'react-icons/md';
import { VscVerified } from 'react-icons/vsc'; // Coopercon
import WorkerIcon from '../assets/icon/worker.svg'; // Material + Serviço
import QualifiosLogo from '../assets/icon/logo-qualifio-bkp.png'; // Qualifios
import './BuscaPage.css';
import EmptyState from './EmptyState';
import LegendaIcones from './legendaIcones';

export default function FornecedorListBusca({ adicionarReport, nomeUsuarioLogado = 'Usuário' }) {
  const [busca, setBusca] = useState('');
  const [fornecedores, setFornecedores] = useState([]);
  const [copiadoId, setCopiadoId] = useState(null);
  const [sugestoes, setSugestoes] = useState([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [marcados, setMarcados] = useState(new Set());
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Atualiza isMobile ao redimensionar
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const buscarFornecedores = async () => {
    const { data, error } = await supabase.from('fornecedores').select('*');
    if (error) return console.error('Erro ao buscar fornecedores:', error);

    if (busca.trim() === '') {
      setFornecedores(data);
      return;
    }

    const termo = busca.toLowerCase();
    const filtrados = data.filter(f =>
      (f.nome && f.nome.toLowerCase().includes(termo)) ||
      (f.empresa && f.empresa.toLowerCase().includes(termo)) ||
      (Array.isArray(f.tags) && f.tags.some(tag => tag.toLowerCase().includes(termo)))
    );
    setFornecedores(filtrados);
  };

  const buscarSugestoes = async (texto) => {
    if (texto.length < 2) {
      setMostrarSugestoes(false);
      setSugestoes([]);
      return;
    }

    const { data, error } = await supabase
      .from('fornecedores')
      .select('tags')
      .not('tags', 'is', null)
      .limit(50);

    if (error) {
      console.error('Erro ao buscar tags:', error);
      setMostrarSugestoes(false);
      return;
    }

    const tags = [...new Set(data.flatMap(f => (Array.isArray(f.tags) ? f.tags : [])))];
    const filtradas = tags
      .filter(tag => tag.toLowerCase().includes(texto.toLowerCase()))
      .map(tag => (tag.startsWith('#') ? tag : `#${tag}`));

    setSugestoes(filtradas);
    setMostrarSugestoes(true);
  };

  useEffect(() => {
    buscarFornecedores();
  }, [busca]);

  const copiarContato = (f) => {
    const texto = `Nome: ${f.nome}\nEmpresa: ${f.empresa}\nWhatsApp: ${f.whatsapp}`;
    navigator.clipboard.writeText(texto).then(() => {
      setCopiadoId(f.id);
      setTimeout(() => setCopiadoId(null), 2000);
    });
  };

  const toggleMarcado = (f) => {
    const novo = new Set(marcados);
    if (novo.has(f.id)) {
      novo.delete(f.id);
    } else {
      novo.add(f.id);
      if (adicionarReport) {
        adicionarReport({
          id: `${f.id}-${Date.now()}`,
          nomePessoa: nomeUsuarioLogado,
          contatoMarcado: `${f.nome} (${f.whatsapp})`,
        });
      }
    }
    setMarcados(novo);
  };

  const selecionarSugestao = (tag) => {
    setBusca(tag);
    setMostrarSugestoes(false);
  };

  const escolherIconePorTipo = (f) => {
    switch(f.tipo?.toLowerCase()) {
      case 'serviço':
      case 'servico':
        return <MdManageAccounts style={{ width: 20, height: 20, color: '#B197FC', marginRight: 4 }} title="Serviço" />;
      case 'material':
        return <MdOutlineHandyman style={{ width: 20, height: 20, color: '#B197FC', marginRight: 4 }} title="Material" />;
      case 'material e servico':
      case 'material+servico':
        return (
          <img 
            src={WorkerIcon} 
            alt="Material e Serviço" 
            style={{ 
              width: 20, 
              height: 20, 
              marginRight: 4, 
              filter: 'invert(49%) sepia(32%) saturate(2661%) hue-rotate(196deg) brightness(93%) contrast(91%)' 
            }} 
          />
        );
      default:
        return <FaTags style={{ color: '#B197FC', marginRight: 4 }} />;
    }
  };

  return (
    <div className="pagina-busca">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent:'space-between' }}>
        <h2>Buscar Fornecedores</h2>
        <LegendaIcones />
      </div>

      <div className="search-input-wrapper" style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Digite nome, empresa ou #tag"
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            buscarSugestoes(e.target.value);
          }}
          className="search-input"
          onFocus={() => busca.length >= 2 && setMostrarSugestoes(true)}
          onBlur={() => setTimeout(() => setMostrarSugestoes(false), 150)}
          aria-autocomplete="list"
          aria-expanded={mostrarSugestoes}
          aria-haspopup="listbox"
          aria-controls="tag-sugestoes-list"
          role="combobox"
        />
        {busca && (
          <button className="clear-button" onClick={() => setBusca('')} type="button" aria-label="Limpar busca">
            ×
          </button>
        )}
        {mostrarSugestoes && sugestoes.length > 0 && (
          <ul id="tag-sugestoes-list" className="tag-sugestoes" role="listbox" aria-label="Sugestões de tags">
            {sugestoes.map((tag, i) => (
              <li key={i} className="tag-sugestao" role="option" tabIndex={-1} onMouseDown={() => selecionarSugestao(tag)}>
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="fornecedor-list-container">
        <ul className="fornecedor-list">
          {fornecedores
            .slice()
            .sort((a, b) => a.nome.localeCompare(b.nome))
            .map((f) => (
              <li key={f.id} className={`fornecedor-item ${marcados.has(f.id) ? 'marcado' : ''}`}>
                <div className="fornecedor-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <strong>{f.nome}</strong>
                    {f.coopercon && <VscVerified style={{ color: 'rgb(40, 167, 69)', width: 20, height: 20 }} title="Coopercon" />}
                    {f.qualifios && <img src={QualifiosLogo} alt="Qualifios" style={{ width: 20, height: 20 }} title="Qualifios" />}
                  </div>
                  <div>{f.empresa}</div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    {isMobile && (
                      <a href={`tel:${f.whatsapp.replace(/\D/g, '')}`} title="Ligar" style={{ color: '#00C48C' }}>
                        <FaPhoneAlt />
                      </a>
                    )}
                    <a href={`https://wa.me/${f.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" style={{ color: '#00C48C' }}>
                      <FaWhatsapp />
                    </a>
                    <span style={{ fontWeight: 'bold', color: '#333' }}>{f.whatsapp}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                    {escolherIconePorTipo(f)}
                    {f.tags?.map((tag) => (
                      <button key={tag} className="tag-button" onClick={() => setBusca(tag)} type="button">{tag}</button>
                    ))}
                  </div>

                  {marcados.has(f.id) && <div className="marcado-alerta">Contato com erro ou inexistente</div>}
                </div>

                <div className="fornecedor-actions">
                  <FaCopy className={`action-icon ${copiadoId === f.id ? 'copied' : ''}`} title="Copiar contato" onClick={() => copiarContato(f)} />
                  <span
                    className={`checkbox-problema ${marcados.has(f.id) ? 'checked' : ''}`}
                    onClick={() => toggleMarcado(f)}
                    title="Marcar contato com problema"
                    role="checkbox"
                    aria-checked={marcados.has(f.id)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        toggleMarcado(f);
                      }
                    }}
                  >
                    {marcados.has(f.id) ? '✔' : '☐'}
                  </span>
                </div>
              </li>
            ))}
          {fornecedores.length === 0 && <EmptyState mensagem="Não encontrei nada... que pena!" />}
        </ul>
      </div>

      <p className="fornecedor-quantidade">Total de fornecedores exibidos: {fornecedores.length}</p>
    </div>
  );
}
