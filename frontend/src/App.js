import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import TaskList from './components/TaskList';
import TaskDetail from './components/TaskDetail';
import Sidebar from './components/Sidebar';
import { useTasks, useTaskLists } from './hooks/useTasks';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAddTask, setShowAddTask] = useState(false);
  const [currentListId, setCurrentListId] = useState(1);
  const [currentListTitle, setCurrentListTitle] = useState('Lista Principal');

  const taskOperations = useTasks(currentListId);
  const { taskLists } = useTaskLists();

  function handleListChange(listId, listTitle) {
    console.log('Changing list to:', listId, listTitle); // Debug log
    setCurrentListId(listId);
    setCurrentListTitle(listTitle);
    setShowAddTask(false);

    // If we're viewing a task detail, navigate back to the main list
    if (location.pathname.startsWith('/task/')) {
      navigate('/');
    }
  }

  function handleTitleChange(newTitle) {
    setCurrentListTitle(newTitle);
  }

  async function handleAddTask(taskData) {
    const result = await taskOperations.addTask(taskData);
    if (result.success) {
      setShowAddTask(false);
    }
    return result;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        currentListId={currentListId}
        onListChange={handleListChange}
      />
      <div className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <TaskList
                tasks={taskOperations.tasks}
                loading={taskOperations.loading}
                onToggleTask={taskOperations.toggleTask}
                onShowAddTask={() => setShowAddTask(true)}
                showAddTask={showAddTask}
                onAddTask={handleAddTask}
                onCloseAddTask={() => setShowAddTask(false)}
                onUpdateTask={taskOperations.updateTask}
                onDeleteTask={taskOperations.deleteTask}
                currentListId={currentListId}
                currentListTitle={currentListTitle}
                onTitleChange={handleTitleChange}
              />
            }
          />
          <Route
            path="/task/:id"
            element={
              <TaskDetail
                onListChange={(listId, listTitle) => {
                  setCurrentListId(listId);
                  setCurrentListTitle(listTitle);
                }}
              />
            }
          />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </Router>
  );
}

export default App;


