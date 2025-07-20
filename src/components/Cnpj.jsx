import React, { useState } from 'react';
import './Cnpj.css';

export default function Cnpj() {
  const [cnpj, setCnpj] = useState('');
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const limparCNPJ = (valor) => valor.replace(/\D/g, '');

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
      setDados(json);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cnpj-container bloco-flutuante">
      <h3>Consultar CNPJ</h3>
      <div className="cnpj-form">
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

      {loading && <p>🔄 Buscando dados...</p>}
      {erro && <p className="cnpj-erro">⚠️ {erro}</p>}

      {dados && (
        <div className="cnpj-result">
          <p><strong>CNPJ:</strong> {dados.cnpj}</p>
          <p><strong>Razão Social:</strong> {dados.razao_social}</p>
          <p><strong>Endereço:</strong> {dados.descricao_logradouro}, {dados.numero} - {dados.bairro}, {dados.municipio} - {dados.uf}</p>
          <p><strong>CEP:</strong> {dados.cep}</p>
          <p><strong>Telefone:</strong> {dados.ddd_telefone_1 || 'Não informado'}</p>
          <p><strong>Inscrição Estadual/Municipal:</strong> {dados.inscricoes_estaduais?.[0]?.inscricao_estadual || 'Não informado'}</p>
          <p><strong>CNAE:</strong> {dados.cnae_fiscal} - {dados.cnae_fiscal_descricao}</p>
        </div>
      )}
    </div>
  );
}
