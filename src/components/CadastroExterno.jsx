import React, { useState } from 'react';
import FornecedorForm from './FornecedorForm';
import qrCode from '../assets/qrcode1.png';
import logoParceira from '../assets/parceira.png';
import { supabase } from '../supabaseClient';
import './CadastroExterno.css';

export default function CadastroFornecedor() {
  const [cadastroFinalizado, setCadastroFinalizado] = useState(false);

  // Função chamada quando cadastro for finalizado
  const handleCadastroFinalizado = async (dadosFornecedor) => {
    setCadastroFinalizado(true);

    const nome = dadosFornecedor?.nome || 'Fornecedor sem nome';
    const empresa = dadosFornecedor?.empresa || 'Empresa não informada';
    const tags = dadosFornecedor?.tags?.slice(0, 3).join(', ') || 'Sem tags';

    const mensagem = `${nome} da empresa ${empresa} fez um novo cadastro com as tags: ${tags}`;

    try {
      const { error } = await supabase.from('reports').insert([
        {
          tipo: 'cadastro_externo',
          mensagem,
        },
      ]);

      if (error) console.error('Erro ao salvar notificação:', error.message);
    } catch (err) {
      console.error('Erro inesperado ao salvar notificação:', err);
    }
  };

  if (cadastroFinalizado) {
    return (
      <div className="cadastro-fornecedor-body">
        <div
          className="topo-container"
          style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
        >
          <div className="logo-box">
            <img
              src={logoParceira}
              alt="Logo da Empresa"
              className="logo-empresa"
              style={{ maxWidth: '250px' }}
            />
          </div>
          <div className="mensagem-box" style={{ marginTop: '2rem', fontSize: '1.2rem' }}>
            <p className="mensagem-cadastro">
              Agradecemos o seu interesse em ser nosso fornecedor.
              <br />
              Assim que houver demanda entraremos em contato.
              <br />
              <strong>Obrigado!</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cadastro-fornecedor-body">
      <div className="topo-container">
        <div className="logo-box">
          <img src={logoParceira} alt="Logo da Empresa" className="logo-empresa" />
        </div>
        <div className="mensagem-box">
          <p className="mensagem-cadastro">
            Quer fazer parte do nosso time de fornecedores?
            <br />
            <strong>Cadastre-se aqui.</strong>
          </p>
        </div>
      </div>

      <div className="form-qr-container">
        <div className="form-wrapper">
          <FornecedorForm
            mostrarTitulo={false}
            onCadastroFinalizado={handleCadastroFinalizado}
          />
        </div>
        <div className="qr-wrapper">
          <img src={qrCode} alt="QR Code para cadastro" className="qr-code-img" />
        </div>
      </div>
    </div>
  );
}
