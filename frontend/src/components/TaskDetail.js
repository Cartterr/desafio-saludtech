import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import AddTask from './AddTask';
import axios from 'axios';
import { API_BASE } from '../utils/config';

function TaskDetail({ onListChange }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('Usuario Actual');

  useEffect(() => {
    fetchTask();
    fetchComments();
  }, [id]);

    async function fetchTask() {
    try {
      const response = await axios.get(`${API_BASE}/tasks/${id}`);
      const taskData = response.data;

      // Ensure attachments is always an array
      if (taskData.attachments) {
        try {
          taskData.attachments = typeof taskData.attachments === 'string'
            ? JSON.parse(taskData.attachments)
            : taskData.attachments;
        } catch (e) {
          console.error('Error parsing attachments:', e);
          taskData.attachments = [];
        }
      } else {
        taskData.attachments = [];
      }

      setTask(taskData);

      // Update sidebar to show the correct list
      if (taskData.list_id && onListChange) {
        try {
          const listResponse = await axios.get(`${API_BASE}/task-lists/${taskData.list_id}`);
          onListChange(taskData.list_id, listResponse.data.title);
        } catch (e) {
          console.error('Error fetching task list:', e);
          // Fallback to default if list fetch fails
          onListChange(taskData.list_id || 1, 'Lista Principal');
        }
      }
    } catch (e) {
      console.error('Error fetching task:', e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchComments() {
    try {
      const response = await axios.get(`${API_BASE}/tasks/${id}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }

  async function addComment() {
    if (!newComment.trim()) return;

    const mentions = extractMentions(newComment);

    try {
      const response = await axios.post(`${API_BASE}/tasks/${id}/comments`, {
        content: newComment,
        author: commentAuthor,
        mentions: mentions.length > 0 ? JSON.stringify(mentions) : null
      });
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  }

  function extractMentions(text) {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  }

  function renderCommentWithMentions(text) {
    const mentionRegex = /@(\w+)/g;
    const parts = text.split(mentionRegex);

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <span key={index} className="bg-blue-100 text-blue-800 px-1 rounded font-medium">
            @{part}
          </span>
        );
      }
      return part;
    });
  }

  function getFileIcon(type) {
    if (!type) return '📎';
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('doc')) return '📝';
    if (type.includes('excel') || type.includes('sheet')) return '📊';
    return '📎';
  }

  function downloadFile(file) {
    // For now, just show an alert since we're not actually storing files
    // In a real implementation, this would download the file from the server
    alert(`Descargando: ${file.name}\n\nNota: En una implementación completa, esto descargaría el archivo desde el servidor.`);
  }

  async function toggleTask() {
    try {
      const newCompleted = !task.completed;
      await axios.put(`${API_BASE}/tasks/${id}`, { completed: newCompleted });
      setTask({ ...task, completed: newCompleted ? 1 : 0 });
    } catch (e) {}
  }

  async function updateTask(taskData) {
    try {
      await axios.put(`${API_BASE}/tasks/${id}`, taskData);
      setTask({ ...task, ...taskData });
      setIsEditing(false);
    } catch (e) {}
  }

  async function deleteTask() {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return;
    try {
      await axios.delete(`${API_BASE}/tasks/${id}`);
      navigate('/');
    } catch (e) {}
  }

  if (loading) return <div className="max-w-4xl mx-auto p-6">Cargando...</div>;
  if (!task) return <div className="max-w-4xl mx-auto p-6">Tarea no encontrada</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
            ← Volver a la lista
          </Link>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <button
                onClick={toggleTask}
                className={`w-6 h-6 border-2 rounded flex items-center justify-center mt-1 ${
                  task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-500'
                }`}
              >
                {task.completed === 1 && (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <div className="flex-1">
                <h1 className={`text-xl font-medium leading-tight ${task.completed === 1 ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {task.title}
                </h1>
              </div>
            </div>
                      <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
              title="Editar tarea"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={deleteTask}
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
              title="Eliminar tarea"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          </div>
        </div>

              <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Asignado a</label>
            {task.assigned_to ? (
              <div className="flex items-center space-x-2">
                <UserAvatar name={task.assigned_to} />
                <span className="text-gray-900">{task.assigned_to}</span>
              </div>
            ) : (
              <span className="text-gray-500">Sin asignar</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha límite</label>
            <span className="text-gray-500">{task.due_date || 'Seleccionar fecha...'}</span>
          </div>
        </div>

        {task.estimated_time && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tiempo estimado</label>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{task.estimated_time}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-900">{task.notes || task.description || 'Sin notas adicionales'}</p>
          </div>
        </div>

        {/* File Attachments Section */}
        {task.attachments && Array.isArray(task.attachments) && task.attachments.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivos adjuntos ({task.attachments.length})
            </label>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {task.attachments.map((file, index) => (
                  <div key={index} className="bg-white border rounded-lg p-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getFileIcon(file.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{file.name}</div>
                        <div className="text-xs text-gray-500">
                          {file.size ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : 'Archivo'}
                        </div>
                      </div>
                      <button
                        onClick={() => downloadFile(file)}
                        className="p-1 text-gray-400 hover:text-blue-600 rounded"
                        title="Descargar archivo"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    </div>

                    {/* Image Preview */}
                    {file.type && file.type.startsWith('image/') && file.url && (
                      <div className="mt-2">
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-24 object-cover rounded border"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

          <div className="border-t pt-4">
            <div className="text-xs text-gray-500">
              Creada por <span className="font-medium">{task.created_by || 'Sistema'}</span> el {new Date(task.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-lg font-medium text-gray-900">Comentarios ({comments.length})</h2>
          </div>

          <div className="p-6">
            <div className="space-y-4 mb-6">
              {comments.map(comment => (
                <div key={comment.id} className="flex space-x-3">
                  <UserAvatar name={comment.author} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm text-gray-900">{comment.author}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString('es-ES', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700">
                      {renderCommentWithMentions(comment.content)}
                    </div>
                    {comment.photo_url && (
                      <img
                        src={comment.photo_url}
                        alt="Adjunto"
                        className="mt-2 max-w-xs rounded-lg border"
                      />
                    )}
                  </div>
                </div>
              ))}

              {comments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <div className="flex space-x-3">
                <UserAvatar name={commentAuthor} size="sm" />
                <div className="flex-1">
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="Tu nombre"
                      value={commentAuthor}
                      onChange={(e) => setCommentAuthor(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <textarea
                    placeholder="Escribe un comentario... Usa @ para mencionar usuarios"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows="3"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-3">
                      <button className="text-gray-500 hover:text-gray-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <span className="text-xs text-gray-500">
                        Menciona usuarios con @nombre
                      </span>
                    </div>
                    <button
                      onClick={addComment}
                      disabled={!newComment.trim()}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Comentar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="max-w-4xl mx-auto mt-6">
          <AddTask
            task={task}
            onSubmit={updateTask}
            onClose={() => setIsEditing(false)}
            isEditing={true}
          />
        </div>
      )}
    </div>
  );
}

export default TaskDetail;



