import React, { useState, useRef, useEffect } from 'react';
import UserAvatar from './UserAvatar';

const SAMPLE_USERS = [
  { id: 1, name: 'Camila D.', email: 'camila@empresa.com', avatar_color: '#4ade80' },
  { id: 2, name: 'Iván W.', email: 'ivan@empresa.com', avatar_color: '#3b82f6' },
  { id: 3, name: 'Emilio García', email: 'emilio@empresa.com', avatar_color: '#8b5cf6' },
  { id: 4, name: 'Juan Pérez', email: 'juan@empresa.com', avatar_color: '#f59e0b' },
  { id: 5, name: 'Ana Martínez', email: 'ana@empresa.com', avatar_color: '#ef4444' },
  { id: 6, name: 'Carlos López', email: 'carlos@empresa.com', avatar_color: '#06b6d4' },
];

function UserDropdown({ value, onChange, placeholder = "Seleccionar usuario" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const filteredUsers = SAMPLE_USERS.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedUser = SAMPLE_USERS.find(user => user.name === value);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserSelect = (user) => {
    onChange(user.name);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
      >
        <div className="flex items-center justify-between">
          {selectedUser ? (
            <div className="flex items-center space-x-2">
              <UserAvatar name={selectedUser.name} size="sm" />
              <span className="text-gray-900">{selectedUser.name}</span>
            </div>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Buscar usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="w-full px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-50 border-b"
              >
                Sin asignar
              </button>
            )}
            {filteredUsers.map(user => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleUserSelect(user)}
                className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 ${
                  selectedUser?.id === user.id ? 'bg-green-50 text-green-700' : 'text-gray-900'
                }`}
              >
                <UserAvatar name={user.name} size="sm" />
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              </button>
            ))}
            {filteredUsers.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">
                No se encontraron usuarios
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDropdown;
