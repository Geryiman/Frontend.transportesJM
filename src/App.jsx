import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import HomePrivado from './pages/HomePrivado.jsx';
import Register from './pages/Register.jsx';
import LoginAdmin from './pages/admin/LoginAdmin.jsx';
import PanelConductor from './pages/admin/PanelConductor.jsx';
import PanelSecretario from './pages/admin/PanelSecretario.jsx';
import PanelGeneral from './pages/admin/PanelGeneral.jsx';
import Usuarios from './pages/admin/Usuarios.jsx';
import Notificaciones from './pages/admin/Notificaciones.jsx';
import CrearUsuario from './pages/admin/CrearUsuario.jsx';
import ProtectedAdminRoute from './components/ProtectedAdminRoute.jsx';
import AccesoDenegado from './pages/admin/AccesoDenegado.jsx';
import Perfil from './pages/Perfil.jsx';
import CrearPlantillaUnidad from './pages/admin/CrearPlantillaUnidad.jsx';
import ListarPlantillas from './pages/admin/ListarPlantillas.jsx';
import CrearViaje from './pages/admin/CrearViaje.jsx';
import ReservarViaje from './pages/ReservarViaje.jsx';
import ParadasExtras from './pages/admin/ParadasExtras.jsx';
import MisViajes from './pages/MisViajes.jsx';
import Contactanos from './pages/Contactanos.jsx';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/usuario/login" element={<Login />} />
        <Route path="/usuario/home" element={<HomePrivado />} />
        <Route path="/usuario/contacto" element={<Contactanos />} />
        <Route path="/contacto" element={<Contactanos />} />

        <Route path="/usuario/register" element={<Register />} />
        <Route path="/usuario/mis-viajes" element={<MisViajes />} />
        <Route path="/admin/login" element={<LoginAdmin />} />
        <Route path="/admin/panel-general" element={<PanelGeneral />} />
        <Route path="/admin/panel-conductor" element={<PanelConductor />} />
        <Route path="/admin/panel-secretario" element={<PanelSecretario />} />
        <Route path="/usuario/perfil" element={<Perfil />} />
        <Route path='/usuario/reservarviaje' element={<ReservarViaje />} />



        <Route
          path="/admin/CrearPlantillaUnidad"
          element={
            <ProtectedAdminRoute allowedRoles={['administrador_general']}>
              <CrearPlantillaUnidad />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/notificaciones"
          element={
            <ProtectedAdminRoute allowedRoles={['administrador_general']}>
              <Notificaciones />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/crear-usuario"
          element={
            <ProtectedAdminRoute allowedRoles={['administrador_general']}>
              <CrearUsuario />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/usuarios"
          element={
            <ProtectedAdminRoute allowedRoles={['administrador_general']}>
              <Usuarios />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/ListaPlantillas"
          element={
            <ProtectedAdminRoute allowedRoles={['administrador_general']}>
              <ListarPlantillas />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/ParadasExtras"
          element={
            <ProtectedAdminRoute allowedRoles={['administrador_general']}>
              <ParadasExtras />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/CrearViaje"
          element={
            <ProtectedAdminRoute allowedRoles={['administrador_general']}>
              <CrearViaje />
            </ProtectedAdminRoute>
          }
        />



        <Route path="/admin/acceso-denegado" element={<AccesoDenegado />} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
