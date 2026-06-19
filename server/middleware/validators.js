const { body, validationResult } = require('express-validator');

const validateInventoryCreate = [
  body('name').isString().withMessage('name is required'),
  body('category').optional().isString(),
  body('expirationDate').optional().isISO8601().toDate(),
  body('quantity').optional().isInt({ min: 1 }).toInt(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];

const validateDonationsCreate = [
  body('ngoId').isString().withMessage('ngoId is required'),
  body('items').isArray({ min: 1 }).withMessage('items must be a non-empty array'),
  body('items.*.name').isString().withMessage('item name is required'),
  body('items.*.quantity').optional().isInt({ min: 1 }).toInt(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];

const validateChatMessage = [
  body('message').isString().withMessage('message is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];

module.exports = { validateInventoryCreate, validateDonationsCreate, validateChatMessage };
