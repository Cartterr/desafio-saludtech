import React, { useState, useEffect } from 'react';
import UserDropdown from './UserDropdown';

function AddTask({ onSubmit, onClose, task, isEditing = false }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    due_date: '',
    notes: '',
    created_by: 'Usuario Actual',
    attachments: []
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');

  useEffect(() => {
    if (task && isEditing) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        assigned_to: task.assigned_to || '',
        due_date: task.due_date || '',
        notes: task.notes || '',
        created_by: task.created_by || 'Usuario Actual',
        attachments: task.attachments || []
      });
    }
  }, [task, isEditing]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.title.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (selectedFiles.length > 0) {
        setLoadingStage('Procesando archivos adjuntos...');
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate file processing
      }

      setLoadingStage('Estimando tiempo con IA...');

      // Add timeout to prevent getting stuck
      const submitPromise = onSubmit(formData);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 15000); // 15 second timeout
      });

      await Promise.race([submitPromise, timeoutPromise]);

      if (!isEditing) {
        setFormData({ title: '', description: '', assigned_to: '', due_date: '', notes: '', created_by: 'Usuario Actual', attachments: [] });
        setSelectedFiles([]);
      }
    } catch (error) {
      console.error('Error submitting task:', error);
    } finally {
      setIsSubmitting(false);
      setLoadingStage('');
    }
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
    setFormData({
      ...formData,
      attachments: [...formData.attachments, ...files.map(f => ({ name: f.name, type: f.type, size: f.size }))]
    });
  }

  function removeFile(index) {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newAttachments = formData.attachments.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setFormData({ ...formData, attachments: newAttachments });
  }

  function getFileIcon(type) {
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('doc')) return '📝';
    if (type.includes('excel') || type.includes('sheet')) return '📊';
    return '📎';
  }

  return (
    <div className={`bg-gray-50 border rounded-lg p-4 mb-6 transition-opacity duration-300 ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {isEditing ? 'Editar Tarea' : 'Nueva Tarea'}
      </h3>

      {/* Loading Progress Bar */}
      {isSubmitting && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm font-medium text-blue-800">{loadingStage}</span>
          </div>
          <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="title"
            placeholder="Título de la tarea"
            value={formData.title}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <textarea
            name="description"
            placeholder="Descripción (opcional)"
            value={formData.description}
            onChange={handleChange}
            rows="2"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Asignado a</label>
            <UserDropdown
              value={formData.assigned_to}
              onChange={(value) => setFormData({ ...formData, assigned_to: value })}
              placeholder="Seleccionar usuario"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha límite</label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Creado por</label>
              <input
                type="text"
                name="created_by"
                placeholder="Creado por"
                value={formData.created_by}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}
        </div>
        <div>
          <textarea
            name="notes"
            placeholder="Notas adicionales"
            value={formData.notes}
            onChange={handleChange}
            rows="2"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Archivos adjuntos</label>
          <div className="border border-gray-300 rounded-md p-4">
            <div className="flex items-center justify-center">
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                />
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-300">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="text-sm text-gray-600">Adjuntar archivos</span>
                </div>
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getFileIcon(file.type)}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{file.name}</div>
                        <div className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
          >
            {isSubmitting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{isSubmitting ? 'Procesando...' : (isEditing ? 'Guardar Cambios' : 'Crear Tarea')}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddTask;


