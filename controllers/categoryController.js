//controllers\categoryController.js
const Category = require('../models/Category');
const { body, validationResult } = require('express-validator');

// Создание новой категории
exports.createCategory = [
    // Валидация входных данных
    body('name').notEmpty().withMessage('Category name is required'),

    async (req, res) => {
        // Проверка ошибок валидации
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name } = req.body;

            // Проверка уникальности имени категории
            const existingCategory = await Category.findOne({ name });
            if (existingCategory) {
                return res.status(400).json({ message: 'Category already exists' });
            }

            // Создание новой категории
            const category = new Category({ name });
            await category.save();

            res.status(201).json(category);
        } catch (error) {
            res.status(500).json({ message: 'Error creating category', error });
        }
    },
];

// Получение всех категорий
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error });
    }
};