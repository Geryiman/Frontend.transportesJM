import React from 'react';

export default function PanelSecretario() {
  const admin = JSON.parse(localStorage.getItem('adminData'));

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-purple-700 mb-4">Panel del Secretario</h1>
      <p>Bienvenido, {admin?.nombre} ({admin?.username})</p>
    </div>
  );
}
