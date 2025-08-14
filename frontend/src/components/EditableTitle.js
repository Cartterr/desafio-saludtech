import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../utils/config';

function EditableTitle({ listId, title, onTitleChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);

  async function saveTitle() {
    if (!editTitle.trim() || editTitle === title) {
      setIsEditing(false);
      setEditTitle(title);
      return;
    }

    try {
      await axios.put(`${API_BASE}/task-lists/${listId}`, {
        title: editTitle.trim(),
        description: ''
      });
      onTitleChange(editTitle.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating list title:', error);
      setEditTitle(title);
      setIsEditing(false);
    }
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      saveTitle();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditTitle(title);
    }
  }

  if (isEditing) {
    return (
      <input
        type="text"
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
        onBlur={saveTitle}
        onKeyDown={handleKeyPress}
        className="text-2xl font-semibold text-gray-900 bg-transparent border-b-2 border-green-500 focus:outline-none"
        autoFocus
      />
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      <button
        onClick={() => setIsEditing(true)}
        className="p-1 text-gray-400 hover:text-gray-600 rounded"
        title="Editar nombre de lista"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
    </div>
  );
}

export default EditableTitle;
