import React, { useState } from 'react';
import { 
  Users, 
  ShieldAlert, 
  Shield, 
  UserPlus, 
  Check, 
  Trash, 
  ToggleLeft, 
  ToggleRight, 
  Lock 
} from 'lucide-react';
import { UserProfile } from '../types';

interface UserRolesProps {
  users: UserProfile[];
  onSaveUsers: (newUsers: UserProfile[]) => void;
  onAddNotification: (title: string, msg: string, type: 'urgent' | 'lead' | 'info') => void;
}

export default function UserRoles({
  users,
  onSaveUsers,
  onAddNotification
}: UserRolesProps) {
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<'Admin' | 'Supervisor' | 'Agent'>('Agent');
  const [isAdding, setIsAdding] = useState(false);

  // Default permissions set by role
  const getPermissionsForRole = (role: 'Admin' | 'Supervisor' | 'Agent'): string[] => {
    switch (role) {
      case 'Admin':
        return ["CrearAgente", "VerMetricas", "ExportarLeads", "EditarRoles"];
      case 'Supervisor':
        return ["VerMetricas", "ExportarLeads"];
      case 'Agent':
        return ["VerMetricas"];
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) return;

    // Check if email already registered
    if (users.some(u => u.email.toLowerCase() === formEmail.toLowerCase())) {
      alert("El correo electrónico ya se encuentra registrado.");
      return;
    }

    const newUser: UserProfile = {
      uid: "user-" + Math.random().toString(36).substring(2, 9),
      name: formName,
      email: formEmail,
      role: formRole,
      permissions: getPermissionsForRole(formRole),
      createdAt: new Date().toISOString()
    };

    onSaveUsers([...users, newUser]);
    setIsAdding(false);
    setFormName('');
    setFormEmail('');
    onAddNotification(
      "Usuario Registrado", 
      `Se agregó a ${formName} con rol ${formRole} y permisos encriptados`, 
      "info"
    );
  };

  const handleDeleteUser = (uid: string, name: string) => {
    if (uid === "user-default") {
       alert("No puedes retirar el administrador raíz de la plataforma.");
       return;
    }
    if (confirm(`¿Estás seguro que deseas eliminar el usuario de ${name}?`)) {
      onSaveUsers(users.filter(u => u.uid !== uid));
      onAddNotification("Usuario Eliminado", `Se retiró el usuario ${name} del sistema`, "info");
    }
  };

  const handleChangeRole = (uid: string, newRole: 'Admin' | 'Supervisor' | 'Agent') => {
    const updated = users.map(u => {
      if (u.uid === uid) {
        return {
          ...u,
          role: newRole,
          permissions: getPermissionsForRole(newRole)
        };
      }
      return u;
    });
    onSaveUsers(updated);
    onAddNotification("Rol Modificado", `Se actualizaron los permisos de acceso del usuario`, "info");
  };

  const handleTogglePermission = (uid: string, perm: string) => {
    const updated = users.map(u => {
      if (u.uid === uid) {
        const has = u.permissions.includes(perm);
        const next = has 
          ? u.permissions.filter(p => p !== perm)
          : [...u.permissions, perm];
        return { ...u, permissions: next };
      }
      return u;
    });
    onSaveUsers(updated);
    onAddNotification("Permiso Personalizado", "La autorización específica fue alterada de forma segura", "info");
  };

  const allAvailablePermissions = ["CrearAgente", "VerMetricas", "ExportarLeads", "EditarRoles"];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Gestión de Usuarios y Roles de Acceso</h1>
          <p className="text-sm text-gray-500 mt-1">Declara roles personalizados (Admin, Supervisor, Agente) y ajusta los permisos a nivel granular de forma segura.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 mt-4 md:mt-0 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Registrar Colaborador
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreateUser} className="bg-white p-6 rounded-2xl border border-blue-100 shadow-xs space-y-4 max-w-2xl text-xs font-sans">
          <h3 className="text-sm font-bold text-gray-800">Registrar Nuevo Colaborador</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-gray-700">Nombre Completo</label>
              <input
                type="text"
                placeholder="Sofia Lorenzana"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                className="w-full text-xs border border-gray-200 outline-none p-3 rounded-xl bg-gray-50/50"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-gray-700">Correo Corporativo</label>
              <input
                type="email"
                placeholder="sofia@empresa.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                required
                className="w-full text-xs border border-gray-200 outline-none p-3 rounded-xl bg-gray-50/50"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-gray-700">Rol Inicial</label>
              <select
                value={formRole}
                onChange={(e: any) => setFormRole(e.target.value)}
                className="w-full text-xs border border-gray-200 outline-none p-3 rounded-xl bg-gray-50/50"
              >
                <option value="Admin">Admin (Control Total)</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Agent">Agent (Operador)</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2.5 pt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl cursor-pointer"
            >
              Registrar
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="border border-gray-200 text-gray-600 font-medium py-2 px-4 rounded-xl hover:bg-gray-50 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase font-bold tracking-wider">
                <th className="p-4 pl-6">Colaborador</th>
                <th className="p-4">Rol en Plataforma</th>
                <th className="p-4">Credenciales / Permisos Autorizados</th>
                <th className="p-4 pr-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-gray-50 text-gray-700 font-mono">
              {users.map((u) => {
                const isRoot = u.uid === "user-default";

                return (
                  <tr key={u.uid} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6 font-sans">
                      <p className="font-semibold text-gray-900">{u.name}</p>
                      <p className="text-[11px] text-gray-400">{u.email}</p>
                    </td>
                    <td className="p-4">
                      {isRoot ? (
                        <span className="bg-red-50 text-red-700 border border-red-100 rounded-full px-3 py-1 font-sans font-bold flex items-center gap-1.5 w-max">
                          <Lock className="w-3.5 h-3.5 text-red-500" />
                          {u.role} (Raíz)
                        </span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeRole(u.uid, e.target.value as any)}
                          className="font-sans border border-gray-150 rounded px-2.5 py-1 text-xs text-gray-700 bg-white"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Supervisor">Supervisor</option>
                          <option value="Agent">Agent</option>
                        </select>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {allAvailablePermissions.map(perm => {
                          const isAuthorized = u.permissions.includes(perm);
                          
                          return (
                            <button
                              key={perm}
                              onClick={() => !isRoot && handleTogglePermission(u.uid, perm)}
                              disabled={isRoot}
                              className={`px-2 py-0.5 rounded text-[10px] font-medium border flex items-center gap-1 cursor-pointer transition-colors ${
                                isAuthorized 
                                  ? 'bg-green-50 text-green-700 border-green-150 font-bold' 
                                  : 'bg-gray-50 text-gray-400 border-gray-200'
                              }`}
                            >
                              {isAuthorized && <Check className="w-3 h-3" />}
                              {perm}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {!isRoot ? (
                        <button
                          onClick={() => handleDeleteUser(u.uid, u.name)}
                          className="text-gray-400 hover:text-rose-600 hover:bg-rose-50 border border-gray-100 p-1.5 rounded-lg transition-colors cursor-pointer inline-flex"
                          title="Eliminar usuario"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-sans italic">Protegido</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
