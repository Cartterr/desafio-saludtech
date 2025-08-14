import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import AddTask from './AddTask';
import EditableTitle from './EditableTitle';

function TaskList({ tasks, onToggleTask, onShowAddTask, showAddTask, onAddTask, onCloseAddTask, onDeleteTask, onUpdateTask, currentListId, currentListTitle, onTitleChange }) {
  const [viewMode, setViewMode] = useState('all');
  const [editingTask, setEditingTask] = useState(null);

  const completedTasks = tasks.filter(t => t.completed === 1);
  const pendingTasks = tasks.filter(t => t.completed === 0);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <EditableTitle
              listId={currentListId}
              title={currentListTitle}
              onTitleChange={onTitleChange}
            />
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              {completedTasks.length}/{tasks.length}
            </span>
          </div>
          <div className="flex items-center space-x-3">
                        <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="all">Ver todas</option>
              <option value="pending">Ver pendientes</option>
              <option value="completed">Ver completadas</option>
            </select>
            <div className="text-sm text-gray-500">
              {pendingTasks.length} pendientes • {completedTasks.length} completadas • {tasks.length} total
            </div>
          </div>
        </div>

        <div className="p-6">
          <button
            onClick={onShowAddTask}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium mb-6 flex items-center space-x-2"
          >
            <span>+</span>
            <span>Nueva Tarea</span>
          </button>

          {showAddTask && <AddTask onSubmit={onAddTask} onClose={onCloseAddTask} />}

          {editingTask && (
            <AddTask
              task={editingTask}
              onSubmit={(updatedTask) => {
                onUpdateTask(editingTask.id, updatedTask);
                setEditingTask(null);
              }}
              onClose={() => setEditingTask(null)}
              isEditing={true}
            />
          )}

          {(viewMode === 'all' || viewMode === 'pending') && pendingTasks.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Tareas Pendientes ({pendingTasks.length})
              </h2>
              <div className="space-y-3">
                {pendingTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={() => onToggleTask(task.id, true)}
                    onEdit={() => setEditingTask(task)}
                    onDelete={() => onDeleteTask && onDeleteTask(task.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {(viewMode === 'all' || viewMode === 'completed') && completedTasks.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-lg font-medium text-gray-900">Tareas Completadas</h2>
              </div>
              <p className="text-sm text-gray-500 mb-4">{completedTasks.length} completadas</p>
              <div className="space-y-3">
                {completedTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    completed={true}
                    onToggle={() => onToggleTask(task.id, false)}
                    onEdit={() => setEditingTask(task)}
                    onDelete={() => onDeleteTask && onDeleteTask(task.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {viewMode === 'pending' && pendingTasks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">¡Todas las tareas completadas!</h3>
              <p className="text-gray-500">No tienes tareas pendientes en este momento.</p>
            </div>
          )}

          {viewMode === 'completed' && completedTasks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tareas completadas</h3>
              <p className="text-gray-500">Completa algunas tareas para verlas aquí.</p>
            </div>
          )}

          {tasks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tareas</h3>
              <p className="text-gray-500 mb-4">Crea tu primera tarea para comenzar.</p>
              <button
                onClick={onShowAddTask}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                + Nueva Tarea
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskItem({ task, completed = false, onToggle, onEdit, onDelete }) {
  return (
    <div className="flex items-center space-x-3 py-2 group">
      <button
        onClick={onToggle}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
          completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-500'
        }`}
      >
        {completed && (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <Link to={`/task/${task.id}`} className={`block truncate ${completed ? 'line-through text-gray-500' : 'text-gray-900 hover:text-blue-600'}`}>
            <span className="flex items-center space-x-2">
              <span>{task.title}</span>
              {task.attachments && task.attachments.length > 0 && (
                <span className="text-sm" title={`${task.attachments.length} archivo(s) adjunto(s)`}>
                  📎
                </span>
              )}
            </span>
          </Link>
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-1 text-gray-400 hover:text-blue-600 rounded"
              title="Editar tarea"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-gray-400 hover:text-red-600 rounded"
              title="Eliminar tarea"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-1">
          {task.assigned_to && <UserAvatar name={task.assigned_to} />}
          {task.estimated_time && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{task.estimated_time}</span>}
          {task.due_date && (
            <span className="text-xs text-gray-500">
              📅 {new Date(task.due_date).toLocaleDateString('es-ES')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskList;


