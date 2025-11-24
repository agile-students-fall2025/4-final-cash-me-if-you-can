const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Transaction validators
const transactionValidators = {
  create: [
    body('transaction_id').notEmpty().withMessage('transaction_id is required'),
    body('account_id').notEmpty().withMessage('account_id is required'),
    body('date').isISO8601().withMessage('date must be a valid ISO8601 date'),
    body('name').notEmpty().withMessage('name is required'),
    body('amount').isFloat().withMessage('amount must be a number'),
    body('category').optional().isArray().withMessage('category must be an array'),
    body('pending').optional().isBoolean().withMessage('pending must be a boolean'),
    body('payment_channel')
      .optional()
      .isIn(['in store', 'online', 'other'])
      .withMessage('payment_channel must be one of: in store, online, other'),
  ],
  update: [
    param('id').isMongoId().withMessage('id must be a valid MongoDB ID'),
    body('category').optional().isArray().withMessage('category must be an array'),
    body('pending').optional().isBoolean().withMessage('pending must be a boolean'),
  ],
  filter: [
    query('start_date').optional().isISO8601().withMessage('start_date must be valid'),
    query('end_date').optional().isISO8601().withMessage('end_date must be valid'),
    query('category').optional().isString().withMessage('category must be a string'),
    query('account_id').optional().isString().withMessage('account_id must be a string'),
  ],
};

// Account validators
const accountValidators = {
  create: [
    body('account_id').notEmpty().withMessage('account_id is required'),
    body('item_id').notEmpty().withMessage('item_id is required'),
    body('name').notEmpty().withMessage('name is required'),
    body('type')
      .isIn(['depository', 'credit', 'loan', 'investment', 'other'])
      .withMessage('type must be valid'),
    body('subtype')
      .isIn([
        'checking',
        'savings',
        'money market',
        'prepaid',
        'cash management',
        'credit card',
        'paypal',
        'auto',
        'mortgage',
        'line of credit',
        'student',
        'investment',
        'other',
      ])
      .withMessage('subtype must be valid'),
    body('balances.current').optional().isFloat().withMessage('balance must be a number'),
    body('balances.available').optional().isFloat().withMessage('balance must be a number'),
  ],
  update: [
    param('id').isMongoId().withMessage('id must be a valid MongoDB ID'),
    body('balances').optional().isObject().withMessage('balances must be an object'),
    body('balances.current').optional().isFloat().withMessage('balance must be a number'),
  ],
};

// Category validators
const categoryValidators = {
  create: [
    body('name').notEmpty().trim().withMessage('name is required'),
    body('icon').optional().isString().withMessage('icon must be a string'),
    body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('color must be valid hex'),
    body('keywords').optional().isArray().withMessage('keywords must be an array'),
  ],
  update: [
    param('id').isMongoId().withMessage('id must be a valid MongoDB ID'),
    body('name').optional().notEmpty().trim().withMessage('name cannot be empty'),
    body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('color must be valid hex'),
  ],
};

module.exports = {
  handleValidationErrors,
  transactionValidators,
  accountValidators,
  categoryValidators,
};
