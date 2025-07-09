import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function ProtectedAdminRoute({ allowedRoles = [], children }) {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetch(`${API_URL}/admin/validate-token`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (allowedRoles.includes(data.rol)) {
          setIsAuthorized(true);
        } else {
          navigate('/admin/acceso-denegado'); // nueva redirección
        }
      })
      .catch(() => {
        navigate('/admin/login');
      });
  }, [navigate, allowedRoles]);

  if (isAuthorized === null) return <p className="text-center mt-10">Verificando acceso...</p>;

  return <>{children}</>;
}
