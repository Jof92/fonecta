import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { FaCopy, FaTags, FaMobileAlt } from 'react-icons/fa';
import './BuscaPage.css';
import EmptyState from './EmptyState';

export default function FornecedorListBusca({ adicionarReport, nomeUsuarioLogado = 'Usuário' }) {
  const [busca, setBusca] = useState('');
  const [fornecedores, setFornecedores] = useState([]);
  const [copiadoId, setCopiadoId] = useState(null);
  const [sugestoes, setSugestoes] = useState([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [marcados, setMarcados] = useState(new Set());

  // Buscar fornecedores filtrando por busca
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

  // Buscar sugestões de tags a partir do texto digitado
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

  // Atualiza a lista de fornecedores sempre que o texto de busca mudar
  useEffect(() => {
    buscarFornecedores();
  }, [busca]);

  // Função para copiar dados do contato para a área de transferência
  const copiarContato = (f) => {
    const texto = `Nome: ${f.nome}\nEmpresa: ${f.empresa}\nWhatsApp: ${f.whatsapp}`;
    navigator.clipboard.writeText(texto).then(() => {
      setCopiadoId(f.id);
      setTimeout(() => setCopiadoId(null), 2000);
    });
  };

  // Marca ou desmarca contato e registra relatório se função passada por props existir
  const toggleMarcado = (f) => {
    const novo = new Set(marcados);
    if (novo.has(f.id)) {
      novo.delete(f.id);
      setMarcados(novo);
    } else {
      novo.add(f.id);
      setMarcados(novo);

      if (adicionarReport) {
        adicionarReport({
          id: `${f.id}-${Date.now()}`,
          nomePessoa: nomeUsuarioLogado,
          contatoMarcado: `${f.nome} (${f.whatsapp})`,
        });
      }
    }
  };

  // Manipula clique em sugestão para preencher o input e esconder sugestões
  const selecionarSugestao = (tag) => {
    setBusca(tag);
    setMostrarSugestoes(false);
  };

  return (
    <div className="pagina-busca">
      <h2>Buscar Fornecedores</h2>

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
          <ul
            id="tag-sugestoes-list"
            className="tag-sugestoes"
            role="listbox"
            aria-label="Sugestões de tags"
          >
            {sugestoes.map((tag, i) => (
              <li
                key={i}
                className="tag-sugestao"
                role="option"
                tabIndex={-1}
                onMouseDown={() => selecionarSugestao(tag)}
              >
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
                  <strong>{f.nome}</strong> — {f.empresa}
                  <br />
                  <FaMobileAlt style={{ color: '#B197FC', marginRight: 6 }} />
                  <a
                    href={`https://wa.me/${f.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fornecedor-whatsapp-link"
                    style={{ color: '#196F3D', fontWeight: 'bold' }}
                  >
                    {f.whatsapp}
                  </a>
                  <br />
                  <FaTags style={{ color: '#B197FC', marginRight: 6 }} />
                  {f.tags?.map((tag) => (
                    <button
                      key={tag}
                      className="tag-button"
                      onClick={() => setBusca(tag)}
                      type="button"
                    >
                      {tag}
                    </button>
                  ))}
                  {marcados.has(f.id) && (
                    <div className="marcado-alerta">Contato com erro ou inexistente</div>
                  )}
                </div>
                <div className="fornecedor-actions">
                  <FaCopy
                    className={`action-icon ${copiadoId === f.id ? 'copied' : ''}`}
                    title="Copiar contato"
                    onClick={() => copiarContato(f)}
                  />
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

      <p className="fornecedor-quantidade">
        Total de fornecedores exibidos: {fornecedores.length}
      </p>
    </div>
  );
}
