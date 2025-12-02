/**
 * Validation middleware for API requests
 */

/**
 * Validate required fields in request body
 */
const validateRequired = (fields) => {
  return (req, res, next) => {
    const missing = [];
    
    for (const field of fields) {
      if (!req.body[field]) {
        missing.push(field);
      }
    }
    
    if (missing.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Missing required fields: ' + missing.join(', '),
        missing_fields: missing
      });
    }
    
    next();
  };
};

/**
 * Validate date format (YYYY-MM-DD)
 */
const validateDateFormat = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Validate transaction date parameters
 */
const validateTransactionDates = (req, res, next) => {
  const { start_date, end_date } = req.body;
  
  if (start_date && !validateDateFormat(start_date)) {
    return res.status(400).json({
      error: 'Invalid date format',
      message: 'start_date must be in YYYY-MM-DD format'
    });
  }
  
  if (end_date && !validateDateFormat(end_date)) {
    return res.status(400).json({
      error: 'Invalid date format',
      message: 'end_date must be in YYYY-MM-DD format'
    });
  }
  
  if (start_date && end_date && start_date > end_date) {
    return res.status(400).json({
      error: 'Invalid date range',
      message: 'start_date must be before or equal to end_date'
    });
  }
  
  next();
};

/**
 * Validate access token format
 */
const validateAccessToken = (req, res, next) => {
  const { access_token } = req.body;
  
  if (!access_token || typeof access_token !== 'string') {
    return res.status(400).json({
      error: 'Invalid access token',
      message: 'access_token must be a valid string'
    });
  }
  
  next();
};

/**
 * Validate pagination parameters
 */
const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;
  
  if (page && (isNaN(page) || parseInt(page) < 1)) {
    return res.status(400).json({
      error: 'Invalid pagination',
      message: 'page must be a positive integer'
    });
  }
  
  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 500)) {
    return res.status(400).json({
      error: 'Invalid pagination',
      message: 'limit must be between 1 and 500'
    });
  }
  
  // Set defaults
  req.query.page = parseInt(page) || 1;
  req.query.limit = parseInt(limit) || 50;
  
  next();
};

module.exports = {
  validateRequired,
  validateTransactionDates,
  validateAccessToken,
  validatePagination
};
