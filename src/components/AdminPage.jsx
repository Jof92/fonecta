import React from 'react';
import { useNavigate } from 'react-router-dom';
import FornecedorForm from './FornecedorForm';
import FornecedorList from './FornecedorList';

export default function AdminPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '0.5rem' }}>
      {/* Linha de botões */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '0.5rem',
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
        }}
      >
        <button
          onClick={() => navigate('/cadastro-externo')}
          style={buttonStyle}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#004a99')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0066cc')}
        >
          Cadastro
        </button>

        <button
          onClick={() => navigate('/busca')}
          style={buttonStyle}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#004a99')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0066cc')}
        >
          Busca
        </button>

        <button
          onClick={() => navigate('/cnpj')}
          style={buttonStyle}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#004a99')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0066cc')}
        >
          CNPJ
        </button>
      </div>

      {/* Linha com os blocos lado a lado */}
      <div
        style={{
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
      >
        <div className="app-form-container bloco-flutuante">
          <FornecedorForm />
        </div>

        <div className="app-list-container bloco-flutuante">
          <FornecedorList />
        </div>
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: '0.6rem 1.2rem',
  fontSize: '1rem',
  backgroundColor: '#0066cc',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
};
