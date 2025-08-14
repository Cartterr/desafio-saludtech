const handleDbOperation = (res, operation, successMessage = 'Operación exitosa') => {
  return new Promise((resolve, reject) => {
    operation((err, result) => {
      if (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message });
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const validateRequired = (fields, res) => {
  for (const [field, value] of Object.entries(fields)) {
    if (!value || (typeof value === 'string' && !value.trim())) {
      res.status(400).json({ error: `${field} es requerido` });
      return false;
    }
  }
  return true;
};

const sendSuccess = (res, data, message = 'Operación exitosa') => {
  res.json(typeof data === 'object' ? data : { message, data });
};

const sendError = (res, error, status = 500) => {
  console.error('API Error:', error);
  res.status(status).json({
    error: typeof error === 'string' ? error : error.message || 'Error interno del servidor'
  });
};

const sendNotFound = (res, resource = 'Recurso') => {
  res.status(404).json({ error: `${resource} no encontrado` });
};

module.exports = {
  handleDbOperation,
  validateRequired,
  sendSuccess,
  sendError,
  sendNotFound
};
