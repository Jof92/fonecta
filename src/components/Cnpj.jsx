import React, { useState } from 'react';
import { FaCopy } from 'react-icons/fa';
import lupaImg from '../assets/lupa.png'; // ajuste o caminho conforme seu projeto
import './Cnpj.css';

export default function Cnpj() {
  const [cnpj, setCnpj] = useState('');
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiadoCampo, setCopiadoCampo] = useState(null);

  const limparCNPJ = (valor) => valor.replace(/\D/g, '');

  const formatarCNPJ = (valor) => {
    const c = limparCNPJ(valor);
    if (c.length !== 14) return valor;
    return c.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const formatarCEP = (cep) => {
    if (!cep) return '.';
    const c = cep.replace(/\D/g, '');
    if (c.length !== 8) return cep;
    return c.replace(/^(\d{2})(\d{3})(\d{3})$/, '$1.$2-$3');
  };

  const formatarTelefone = (telefone) => {
    if (!telefone) return '.';
    const t = telefone.replace(/\D/g, '');
    if (t.length === 10) {
      return t.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    } else if (t.length === 11) {
      return t.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else {
      return telefone;
    }
  };

  const capitalizarTitulo = (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(' ');
  };

  const montarEndereco = async (dadosOriginais) => {
    if (!dadosOriginais) return '.';

    let logradouro = dadosOriginais.descricao_logradouro?.trim() || '';
    let numero = dadosOriginais.numero?.trim() || '';
    let bairro = dadosOriginais.bairro?.trim() || '';
    let municipio = dadosOriginais.municipio?.trim() || '';
    let uf = dadosOriginais.uf?.trim() || '';
    let cep = dadosOriginais.cep?.replace(/\D/g, '') || '';

    if (!logradouro && cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        if (res.ok) {
          const jsonCEP = await res.json();
          if (!jsonCEP.erro) {
            logradouro = jsonCEP.logradouro || '';
            bairro = bairro || jsonCEP.bairro || '';
            municipio = municipio || jsonCEP.localidade || '';
            uf = uf || jsonCEP.uf || '';
          }
        }
      } catch {
        // falha na busca, mantém valores atuais
      }
    }

    const enderecoPartes = [];
    if (logradouro) enderecoPartes.push(logradouro);
    if (numero) enderecoPartes.push(numero);

    const localPartes = [];
    if (bairro) localPartes.push(bairro);
    if (municipio) localPartes.push(municipio);
    if (uf) localPartes.push(uf);

    const endereco = enderecoPartes.join(', ');
    const local = localPartes.join(' . ');

    if (endereco && local) return `${endereco} - ${local}`;
    if (endereco) return endereco;
    if (local) return local;
    return '.';
  };

  const buscarCNPJ = async () => {
    const cnpjLimpo = limparCNPJ(cnpj);

    if (cnpjLimpo.length !== 14) {
      setErro('CNPJ inválido.');
      setDados(null);
      return;
    }

    setLoading(true);
    setErro('');
    setDados(null);

    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
      if (!response.ok) throw new Error('CNPJ não encontrado.');

      const json = await response.json();

      const enderecoCompleto = await montarEndereco(json);

      setDados({
        ...json,
        enderecoCompleto,
      });
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  const mostrarDado = (valor, placeholder = '.') => {
    if (valor === null || valor === undefined || valor === '') return placeholder;
    if (Array.isArray(valor) && valor.length === 0) return placeholder;
    return valor;
  };

  const copiarTexto = (texto, campo) => {
    if (!texto || texto === '.' || texto === '—') return;
    navigator.clipboard.writeText(texto).then(() => {
      setCopiadoCampo(campo);
      setTimeout(() => setCopiadoCampo(null), 1500);
    });
  };

  return (
    <div className="cnpj-page">
      <div className="cnpj-form-topo">
        <input
          type="text"
          placeholder="Digite o CNPJ"
          value={cnpj}
          onChange={(e) => setCnpj(e.target.value)}
          className="cnpj-input"
        />
        <button onClick={buscarCNPJ} className="cnpj-button">
          Buscar
        </button>
      </div>

      <div className="cnpj-result-container">
        {!loading && !erro && !dados && (
          <div className="cnpj-imagem-inicial">
            <img src={lupaImg} alt="Buscar CNPJ" />
          </div>
        )}

        {loading && <p className="cnpj-loading">🔄 Buscando dados...</p>}

        {erro && <p className="cnpj-erro">⚠️ {erro}</p>}

        {dados && (
          <div className="cnpj-result-box">
            <h3>Informações do CNPJ</h3>

            <p className="cnpj-campo">
              <strong>CNPJ (limpo):</strong>{' '}
              <span className="cnpj-valor">{dados.cnpj}</span>
              <FaCopy
                className={`btn-copiar ${copiadoCampo === 'CNPJ limpo' ? 'copied' : ''}`}
                title="Copiar CNPJ limpo"
                onClick={() => copiarTexto(dados.cnpj, 'CNPJ limpo')}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    copiarTexto(dados.cnpj, 'CNPJ limpo');
                  }
                }}
              />
            </p>

            <p className="cnpj-campo">
              <strong>CNPJ (formatado):</strong>{' '}
              <span className="cnpj-valor">{formatarCNPJ(dados.cnpj)}</span>
              <FaCopy
                className={`btn-copiar ${copiadoCampo === 'CNPJ formatado' ? 'copied' : ''}`}
                title="Copiar CNPJ formatado"
                onClick={() => copiarTexto(formatarCNPJ(dados.cnpj), 'CNPJ formatado')}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    copiarTexto(formatarCNPJ(dados.cnpj), 'CNPJ formatado');
                  }
                }}
              />
            </p>

            <p className="cnpj-campo">
              <strong>Razão Social:</strong>{' '}
              <span className="cnpj-valor">{mostrarDado(capitalizarTitulo(dados.razao_social))}</span>
              <FaCopy
                className={`btn-copiar ${copiadoCampo === 'Razão Social' ? 'copied' : ''}`}
                title="Copiar Razão Social"
                onClick={() => copiarTexto(capitalizarTitulo(dados.razao_social), 'Razão Social')}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    copiarTexto(capitalizarTitulo(dados.razao_social), 'Razão Social');
                  }
                }}
              />
            </p>

            <p className="cnpj-campo">
              <strong>Endereço:</strong>{' '}
              <span className="cnpj-valor">{dados.enderecoCompleto || '.'}</span>
              <FaCopy
                className={`btn-copiar ${copiadoCampo === 'Endereço' ? 'copied' : ''}`}
                title="Copiar Endereço"
                onClick={() => copiarTexto(dados.enderecoCompleto, 'Endereço')}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    copiarTexto(dados.enderecoCompleto, 'Endereço');
                  }
                }}
              />
            </p>

            <p className="cnpj-campo">
              <strong>CEP:</strong>{' '}
              <span className="cnpj-valor">{formatarCEP(dados.cep)}</span>
              <FaCopy
                className={`btn-copiar ${copiadoCampo === 'CEP' ? 'copied' : ''}`}
                title="Copiar CEP"
                onClick={() => copiarTexto(formatarCEP(dados.cep), 'CEP')}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    copiarTexto(formatarCEP(dados.cep), 'CEP');
                  }
                }}
              />
            </p>

            <p className="cnpj-campo">
              <strong>Telefone:</strong>{' '}
              <span className="cnpj-valor">{formatarTelefone(dados.ddd_telefone_1)}</span>
              <FaCopy
                className={`btn-copiar ${copiadoCampo === 'Telefone' ? 'copied' : ''}`}
                title="Copiar Telefone"
                onClick={() => copiarTexto(formatarTelefone(dados.ddd_telefone_1), 'Telefone')}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    copiarTexto(formatarTelefone(dados.ddd_telefone_1), 'Telefone');
                  }
                }}
              />
            </p>

            <p className="cnpj-campo">
              <strong>Inscrição Estadual/Municipal:</strong>{' '}
              <span className="cnpj-valor">
                {mostrarDado(dados.inscricoes_estaduais?.[0]?.inscricao_estadual)}
              </span>
              <FaCopy
                className={`btn-copiar ${
                  copiadoCampo === 'Inscrição Estadual/Municipal' ? 'copied' : ''
                }`}
                title="Copiar Inscrição Estadual/Municipal"
                onClick={() =>
                  copiarTexto(
                    dados.inscricoes_estaduais?.[0]?.inscricao_estadual,
                    'Inscrição Estadual/Municipal'
                  )
                }
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    copiarTexto(
                      dados.inscricoes_estaduais?.[0]?.inscricao_estadual,
                      'Inscrição Estadual/Municipal'
                    );
                  }
                }}
              />
            </p>

            <p className="cnpj-campo">
              <strong>CNAE:</strong>{' '}
              <span className="cnpj-valor">
                {mostrarDado(dados.cnae_fiscal)} - {mostrarDado(dados.cnae_fiscal_descricao)}
              </span>
              <FaCopy
                className={`btn-copiar ${copiadoCampo === 'CNAE' ? 'copied' : ''}`}
                title="Copiar CNAE"
                onClick={() =>
                  copiarTexto(
                    `${dados.cnae_fiscal} - ${dados.cnae_fiscal_descricao}`,
                    'CNAE'
                  )
                }
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    copiarTexto(
                      `${dados.cnae_fiscal} - ${dados.cnae_fiscal_descricao}`,
                      'CNAE'
                    );
                  }
                }}
              />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
