const { body, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const transactionValidators = {
  create: [
    body('transaction_id').notEmpty().withMessage('Transaction ID is required'),
    body('account_id').notEmpty().withMessage('Account ID is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('name').notEmpty().withMessage('Transaction name is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('category').optional().isArray().withMessage('Category must be an array'),
    body('pending').optional().isBoolean().withMessage('Pending must be boolean'),
    body('payment_channel').optional().isIn(['in store', 'online', 'other']).withMessage('Invalid payment channel'),
  ],
  update: [
    body('category').optional().isArray().withMessage('Category must be an array'),
  ],
  filter: [
    query('start_date').optional().isISO8601().withMessage('Valid start date required'),
    query('end_date').optional().isISO8601().withMessage('Valid end date required'),
    query('category').optional().isString().withMessage('Category must be a string'),
    query('account_id').optional().isString().withMessage('Account ID must be a string'),
  ],
};

const accountValidators = {
  create: [
    body('account_id').notEmpty().withMessage('Account ID is required'),
    body('item_id').notEmpty().withMessage('Item ID is required'),
    body('name').notEmpty().withMessage('Account name is required'),
    body('type').isIn(['depository', 'credit', 'loan', 'investment', 'other']).withMessage('Invalid account type'),
    body('subtype').notEmpty().withMessage('Account subtype is required'),
    body('balances.current').isNumeric().withMessage('Current balance must be a number'),
  ],
  update: [
    body('balances.current').optional().isNumeric().withMessage('Current balance must be a number'),
    body('balances.available').optional().isNumeric().withMessage('Available balance must be a number'),
    body('balances.limit').optional().isNumeric().withMessage('Limit must be a number'),
  ],
};

const categoryValidators = {
  create: [
    body('name').notEmpty().withMessage('Category name is required'),
    body('icon').optional().isString().withMessage('Icon must be a string'),
    body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be valid hex format'),
    body('keywords').optional().isArray().withMessage('Keywords must be an array'),
  ],
  update: [
    body('name').optional().notEmpty().withMessage('Category name cannot be empty'),
    body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be valid hex format'),
    body('keywords').optional().isArray().withMessage('Keywords must be an array'),
  ],
};

module.exports = {
  handleValidationErrors,
  transactionValidators,
  accountValidators,
  categoryValidators,
};
