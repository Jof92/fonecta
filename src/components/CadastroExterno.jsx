import React, { useState } from 'react';
import FornecedorForm from './FornecedorForm';
import qrCode from '../assets/qrcode1.png';
import logoParceira from '../assets/parceira.png';
import './CadastroExterno.css';

export default function CadastroFornecedor() {
  const [cadastroFinalizado, setCadastroFinalizado] = useState(false);

  if (cadastroFinalizado) {
    return (
      <div className="cadastro-fornecedor-body">
        <div className="topo-container" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
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
      
      {/* Topo: Logo + Mensagem */}
      <div className="topo-container">
        <div className="logo-box">
          <img
            src={logoParceira}
            alt="Logo da Empresa"
            className="logo-empresa"
          />
        </div>
        <div className="mensagem-box">
          <p className="mensagem-cadastro">
            Quer fazer parte do nosso time de fornecedores?
            <br />
            <strong>Cadastre-se aqui.</strong>
          </p>
        </div>
      </div>

      {/* Meio: Formulário + QR Code */}
      <div className="form-qr-container">
        <div className="form-wrapper">
          <FornecedorForm mostrarTitulo={false} onCadastroFinalizado={() => setCadastroFinalizado(true)} />
        </div>
        <div className="qr-wrapper">
          <img
            src={qrCode}
            alt="QR Code para cadastro"
            className="qr-code-img"
          />
        </div>
      </div>
      
    </div>
  );
}
