import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001/api';

function Sidebar({ currentListId, onListChange }) {
  const [taskLists, setTaskLists] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  // AI generation removed

  useEffect(() => {
    fetchTaskLists();
  }, []);

  async function fetchTaskLists() {
    try {
      const response = await axios.get(`${API_BASE}/task-lists`);
      setTaskLists(response.data);
    } catch (error) {
      console.error('Error fetching task lists:', error);
    }
  }

  async function createList() {
    if (!newListTitle.trim()) return;

    try {
      const response = await axios.post(`${API_BASE}/task-lists`, {
        title: newListTitle,
        description: '',
        created_by: 'Usuario'
      });

      setTaskLists([response.data, ...taskLists]);
      setNewListTitle('');
      setIsCreating(false);
      onListChange(response.data.id, response.data.title);
    } catch (error) {
      console.error('Error creating list:', error);
    }
  }

    // AI generation function removed

  async function deleteList(listId) {
    if (listId === 1) {
      alert('No se puede eliminar la lista principal');
      return;
    }

    if (!window.confirm('¿Estás seguro de que quieres eliminar esta lista?')) return;

    try {
      await axios.delete(`${API_BASE}/task-lists/${listId}`);
      setTaskLists(taskLists.filter(list => list.id !== listId));
      if (parseInt(currentListId) === parseInt(listId)) {
        onListChange(1, 'Lista Principal');
      }
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Listas de Tareas</h2>
      </div>

      {/* Lists */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {taskLists.map(list => (
            <div
              key={list.id}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer mb-1 ${
                parseInt(currentListId) === parseInt(list.id)
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onListChange(list.id, list.title)}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{list.title}</div>
                <div className="text-xs text-gray-500 truncate">
                  {list.created_by} • {new Date(list.created_at).toLocaleDateString('es-ES')}
                </div>
              </div>
              {list.id !== 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteList(list.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 rounded"
                  title="Eliminar lista"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {/* Create New List */}
        {isCreating ? (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Nombre de la lista"
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && createList()}
            />
            <div className="flex space-x-2">
              <button
                onClick={createList}
                className="flex-1 bg-green-500 text-white px-3 py-1 text-sm rounded-md hover:bg-green-600"
              >
                Crear
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewListTitle('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-3 py-1 text-sm rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Nueva Lista</span>
          </button>
        )}

        {/* AI generation button removed */}
      </div>

      {/* AI Generator Modal removed */}
    </div>
  );
}

export default Sidebar;
