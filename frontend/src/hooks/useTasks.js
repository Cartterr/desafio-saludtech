import { useState, useEffect } from 'react';
import { taskApi, listApi } from '../services/api';

export function useTasks(listId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    const result = await taskApi.getAll(listId);
    if (result.success) {
      setTasks(result.data);
    }
    setLoading(false);
  };

  const addTask = async (taskData) => {
    const result = await taskApi.create({ ...taskData, list_id: listId });
    if (result.success) {
      setTasks([result.data, ...tasks]);
      return { success: true };
    }
    return result;
  };

  const updateTask = async (taskId, taskData) => {
    const result = await taskApi.update(taskId, taskData);
    if (result.success) {
      setTasks(tasks.map(t => (t.id === taskId ? { ...t, ...taskData } : t)));
      return { success: true };
    }
    return result;
  };

  const toggleTask = async (taskId, completed) => {
    const result = await taskApi.update(taskId, { completed });
    if (result.success) {
      setTasks(tasks.map(t => (t.id === taskId ? { ...t, completed: completed ? 1 : 0 } : t)));
      return { success: true };
    }
    return result;
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return { success: false };

    const result = await taskApi.delete(taskId);
    if (result.success) {
      setTasks(tasks.filter(t => t.id !== taskId));
      return { success: true };
    }
    return result;
  };

  useEffect(() => {
    if (listId) {
      fetchTasks();
    }
  }, [listId]);

  return {
    tasks,
    loading,
    fetchTasks,
    addTask,
    updateTask,
    toggleTask,
    deleteTask
  };
}

export function useTaskLists() {
  const [taskLists, setTaskLists] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTaskLists = async () => {
    setLoading(true);
    const result = await listApi.getAll();
    if (result.success) {
      setTaskLists(result.data);
    }
    setLoading(false);
  };

  const createList = async (listData) => {
    const result = await listApi.create(listData);
    if (result.success) {
      setTaskLists([result.data, ...taskLists]);
      return { success: true, data: result.data };
    }
    return result;
  };

  const updateList = async (listId, listData) => {
    const result = await listApi.update(listId, listData);
    if (result.success) {
      setTaskLists(taskLists.map(l => (l.id === listId ? { ...l, ...listData } : l)));
      return { success: true };
    }
    return result;
  };

  const deleteList = async (listId) => {
    if (listId === 1) {
      alert('No se puede eliminar la lista principal');
      return { success: false };
    }

    if (!window.confirm('¿Estás seguro de que quieres eliminar esta lista?')) return { success: false };

    const result = await listApi.delete(listId);
    if (result.success) {
      setTaskLists(taskLists.filter(l => l.id !== listId));
      return { success: true };
    }
    return result;
  };

  // AI task generation removed

  useEffect(() => {
    fetchTaskLists();
  }, []);

  return {
    taskLists,
    loading,
    fetchTaskLists,
    createList,
    updateList,
    deleteList
  };
}
