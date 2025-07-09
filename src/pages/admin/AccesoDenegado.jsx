import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AccesoDenegado() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-red-50 text-center">
      <h1 className="text-4xl font-bold text-red-700 mb-4">Acceso Denegado</h1>
      <p className="text-gray-700 mb-6">No tienes permisos para acceder a esta página.</p>
      <button
        onClick={() => navigate('/admin/login')}
        className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
      >
        Ir al Login
      </button>
    </div>
  );
}
