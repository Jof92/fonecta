import React from 'react'
import FornecedorForm from './FornecedorForm'
import qrCode from '../assets/qrcode.png'
import logoParceira from '../assets/parceira.png'
import './CadastroExterno.css'

export default function CadastroFornecedor() {
  return (
    <div className="cadastro-fornecedor-body">

      {/* Linha 1: Logo + Frase */}
      <div className="topo-container">
        <div className="logo-box">
          <img src={logoParceira} alt="Logo da Empresa" className="logo-empresa" />
        </div>

        <div className="mensagem-box">
          <p className="mensagem-cadastro">
            Quer fazer parte do nosso time de fornecedores?<br />
            <strong>Cadastre-se aqui.</strong>
          </p>
        </div>
      </div>

      {/* Linha 2: Formulário + QR Code */}
      <div className="form-qr-container">
        <div className="form-wrapper">
          <FornecedorForm mostrarTitulo={false} />
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
  )
}
