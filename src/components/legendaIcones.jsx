import React, { useState, useRef, useEffect } from 'react';
import { IoMdInformationCircleOutline } from "react-icons/io";
import { FaPhoneAlt, FaWhatsapp, FaTags } from 'react-icons/fa';
import { VscVerified } from 'react-icons/vsc';
import { MdManageAccounts, MdOutlineHandyman } from 'react-icons/md';
import { ReactComponent as IconWorker } from '../assets/icon/worker.svg';
import LogoQualifios from '../assets/icon/logo-qualifio-bkp.png';

export default function LegendaIcones() {
  const [mostrar, setMostrar] = useState(false);
  const tooltipRef = useRef(null);

  // Fecha o tooltip ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setMostrar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setMostrar(!mostrar)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#007bff',
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center'
        }}
        title="Mostrar legenda"
      >
        <IoMdInformationCircleOutline />
      </button>

      {mostrar && (
        <div
          ref={tooltipRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: '140px',
            fontSize: '14px'
          }}
        >
          <h4 style={{ marginTop: 0 }}>Legenda de Ícones</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FaPhoneAlt color="#00C48C" /> Telefone
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FaWhatsapp color="#00C48C" /> WhatsApp
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <VscVerified color="#28a745" /> Coopercon
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <img src={LogoQualifios} alt="Qualifios" style={{ width: 16, height: 16 }} /> Qualifios
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MdManageAccounts color="#B197FC" /> Serviço
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MdOutlineHandyman color="#B197FC" /> Material
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconWorker style={{ width: 16, height: 16 }} /> Material e Serviço
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FaTags color="#B197FC" /> Tags
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
