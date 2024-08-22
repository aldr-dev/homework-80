import express from 'express';
import {Resources, ResourcesWithoutId} from '../types';
import mysqlDb from '../mysqlDb';
import {ResultSetHeader, RowDataPacket} from 'mysql2';

const categoriesRouter = express.Router();

categoriesRouter.get('/', async (_, res, next) => {
  try {
    const result = await mysqlDb.getConnection().query(
      'SELECT id, title FROM categories'
    );

    const category = result[0] as Resources[];

    if (category.length === 0) {
      res.status(404).send({'Ошибка': 'Список категорий пуст!'});
    }
    return res.send(category);
  } catch (error) {
    next(error);
  }
});

categoriesRouter.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await mysqlDb.getConnection().query(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );

    const category = result[0] as Resources[];

    if (category.length === 0) {
      return res.status(404).send({'Ошибка': 'Категория не найдена!'});
    }
    return res.send(category[0]);
  } catch (error) {
    next(error);
  }
});

categoriesRouter.post('/', async (req, res, next) => {
  try {

    if (!req.body.title) {
      return res.status(400).send({'Ошибка': 'Название категории должно присутствовать!'});
    }

    const category: ResourcesWithoutId = {
      title: req.body.title,
      description: req.body.description ? req.body.description : null,
    };

    const insertResult = await mysqlDb.getConnection().query(
      'INSERT INTO categories (title, description) VALUES (?, ?)',
      [category.title, category.description],
    );

    const resultHeader = insertResult[0] as ResultSetHeader;

    const getNewResult = await mysqlDb.getConnection().query(
      'SELECT * FROM categories WHERE id = ?',
      [resultHeader.insertId],
    );

    const categoryResult = getNewResult[0] as Resources[];
    return res.send(categoryResult[0]);
  } catch (error) {
    next(error);
  }
});

categoriesRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;

    const [relatedResources] = await mysqlDb.getConnection().query(
      'SELECT * FROM items WHERE category_id = ?',
      [id]
    ) as RowDataPacket[];

    if (relatedResources.length > 0) {
      return res.status(400).send({'Ошибка': 'Нельзя удалить связанные записи!'});
    }

    const result = await mysqlDb.getConnection().query<ResultSetHeader>(
      'DELETE FROM categories WHERE id = ?',
      [id],
    );

    if (result[0].affectedRows === 0) {
      return res.status(404).send({'Ошибка': `Не удалось удалить категорию, так-как данного id ${id} не существует!`});
    }

    return res.send(`Категория с ID ${id} удалена!`);
  } catch (error) {
    next(error);
  }
});

categoriesRouter.put('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!req.body.title) {
      return res.status(400).send({'Ошибка': 'Название категории должно присутствовать!'});
    }

    const category: ResourcesWithoutId = {
      title: req.body.title,
      description: req.body.description ? req.body.description : null,
    };

    const searchCategory = await mysqlDb.getConnection().query(
      'SELECT * FROM categories WHERE id = ?',
      [id],
    );

    const selectCategory = searchCategory[0] as Resources[];

    if (selectCategory.length === 0) {
      return res.status(404).send({'Ошибка': 'ID для обновления категории не найдено!'});
    }

    await mysqlDb.getConnection().query(
      'UPDATE categories SET title = ?, description = ? WHERE id = ?',
      [category.title, category.description, id],
    );

    const result = await mysqlDb.getConnection().query(
      'SELECT * FROM categories WHERE id = ?',
      [id],
    );

    const categoryResult = result[0] as Resources[];
    return res.send(categoryResult[0]);
  } catch (error) {
    next(error);
  }
});

export default categoriesRouter;