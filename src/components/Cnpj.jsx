import React, { useState } from 'react';
import { FaCopy } from 'react-icons/fa';
import './Cnpj.css';

export default function Cnpj() {
  const [cnpj, setCnpj] = useState('');
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiadoCampo, setCopiadoCampo] = useState(null);

  const limparCNPJ = (valor) => valor.replace(/\D/g, '');

  const formatarNome = (nome) => {
    if (!nome) return '.';
    const texto = nome.toLowerCase();
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  };

  const montarEndereco = (dados) => {
    if (!dados) return '.';

    const logradouro = dados.descricao_logradouro?.trim() || '';
    const numero = dados.numero?.trim() || '';
    const bairro = dados.bairro?.trim() || '';
    const municipio = dados.municipio?.trim() || '';
    const uf = dados.uf?.trim() || '';

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
    return ',';
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
      console.log('Dados completos da API:', json);
      setDados(json);
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
    if (!texto || texto === '—') return;
    navigator.clipboard.writeText(texto).then(() => {
      setCopiadoCampo(campo);
      setTimeout(() => setCopiadoCampo(null), 1500);
    });
  };

  const campos = [
    { label: 'CNPJ', valor: mostrarDado(dados?.cnpj) },
    { label: 'Razão Social', valor: mostrarDado(formatarNome(dados?.razao_social)) },
    { label: 'Endereço', valor: montarEndereco(dados) },
    { label: 'CEP', valor: mostrarDado(dados?.cep) },
    { label: 'Telefone', valor: mostrarDado(dados?.ddd_telefone_1) },
    {
      label: 'Inscrição Estadual/Municipal',
      valor: mostrarDado(dados?.inscricoes_estaduais?.[0]?.inscricao_estadual)
    },
    {
      label: 'CNAE',
      valor: `${mostrarDado(dados?.cnae_fiscal)} - ${mostrarDado(dados?.cnae_fiscal_descricao)}`
    }
  ];

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

      {loading && <p className="cnpj-loading">🔄 Buscando dados...</p>}
      {erro && <p className="cnpj-erro">⚠️ {erro}</p>}

      <div className="cnpj-result-container">
        <div className="cnpj-result-box">
          <h3>Informações do CNPJ</h3>
          {campos.map(({ label, valor }) => (
            <p key={label} className="cnpj-campo">
              <strong>{label}:</strong>{' '}
              <span className="cnpj-valor">{valor}</span>
              <FaCopy
                className={`btn-copiar ${copiadoCampo === label ? 'copied' : ''}`}
                title={`Copiar ${label}`}
                onClick={() => copiarTexto(valor, label)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    copiarTexto(valor, label);
                  }
                }}
              />
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
