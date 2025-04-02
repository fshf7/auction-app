//config\db.js
const mongoose = require('mongoose');
const colors = require('colors'); // Для цветного вывода в консоль
const Category = require('../models/Category'); // Модель категории
const { initialCategories } = require('./initialData');

/**
 * Функция для подключения к базе данных MongoDB
 */
const connectDB = async () => {
    try {
        // Подключение к MongoDB
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Таймаут подключения (5 секунд)
        });

        // Логирование успешного подключения
        console.log(`MongoDB connected: ${conn.connection.host}`.cyan.underline);

        // Обработка событий MongoDB
        mongoose.connection.on('connected', () => {
            console.log('Mongoose connected to DB'.green);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose disconnected from DB'.yellow);
        });

        mongoose.connection.on('error', (err) => {
            console.error(`Mongoose connection error: ${err.message}`.red);
        });

        // Проверка и добавление начальных категорий
        await seedCategories();

    } catch (error) {
        // Логирование ошибки подключения
        console.error(`Error connecting to MongoDB: ${error.message}`.red);

        // Завершение процесса при неудачном подключении
        process.exit(1);
    }
};

/**
 * Функция для добавления начальных категорий
 */
const seedCategories = async () => {
    try {
        const existingCategories = await Category.find({}); // Получаем все существующие категории

        if (existingCategories.length === 0) {
            // Если категорий нет, добавляем начальные
            const categoriesToInsert = initialCategories.map((name) => ({ name }));
            await Category.insertMany(categoriesToInsert);
            console.log('Initial categories added successfully'.green);
        } else {
            console.log('Categories already exist in the database'.yellow);
        }
    } catch (error) {
        console.error(`Error seeding categories: ${error.message}`.red);
    }
};

module.exports = connectDB;