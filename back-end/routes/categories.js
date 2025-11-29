const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.getCategories);

router.get('/:id', categoryController.getCategoryById);

router.post('/', categoryController.createCategory);

router.put('/:id', categoryController.updateCategory);

router.delete('/:id', categoryController.deleteCategory);

router.get('/suggest/:merchant', categoryController.suggestCategoriesForMerchant);

module.exports = router;
