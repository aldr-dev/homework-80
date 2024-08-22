import express from 'express';
import mysqlDb from '../mysqlDb';
import {Inventories, InventoriesMutation, InventoriesWithoutId} from '../types';
import {ResultSetHeader} from 'mysql2';
import {imagesUpload} from '../multer';
import {promises as fs} from 'fs';

const itemsRouter = express.Router();

itemsRouter.get('/', async (_, res, next) => {
  try {
    const result = await mysqlDb.getConnection().query(
      `SELECT 
        items.id, 
        items.name, 
        categories.id AS category_id, 
        categories.name AS category_name, 
        locations.id AS location_id, 
        locations.name AS location_name
       FROM items
       JOIN categories ON items.category_id = categories.id
       JOIN locations ON items.location_id = locations.id`
    );
    const items = result[0] as InventoriesMutation[];

    if (items.length === 0) {
      res.status(404).send({'Ошибка': 'Список предметов учета пуст!'});
    }
    res.send(items);
  } catch (error) {
    next(error);
  }
});

itemsRouter.get('/:id', async (req, res, next) => {
  const id = req.params.id;
  try {
    const result = await mysqlDb.getConnection().query(
      'SELECT id, category_id, location_id, name, description, image FROM items WHERE id = ?',
      [id]
    );

    const item = result[0] as Inventories[];

    if (item.length === 0) {
      return res.status(404).send({'Ошибка': 'Предмет учета не найден!'});
    }

    return res.send(item[0]);
  } catch (error) {
    next(error);
  }
});

itemsRouter.post('/', imagesUpload.single('image'), async (req, res, next) => {
  try {
    if (!req.body.categoryId || !req.body.locationId || !req.body.name) {
      if (req.file) {
        await fs.unlink(req.file.path);
      }
      return res.status(400).send({'Ошибка': 'Category ID, Location ID и Name должны быть указаны!'});
    }

    const item: InventoriesWithoutId = {
      category_id: parseInt(req.body.categoryId),
      location_id: parseInt(req.body.locationId),
      name: req.body.name,
      description: req.body.description ? req.body.description : null,
      image: req.file ? req.file.filename : null
    };

    const insertResult = await mysqlDb.getConnection().query(
      'INSERT INTO items (category_id, location_id, name, description, image) VALUES (?, ?, ?, ?, ?)',
      [item.category_id, item.location_id, item.name, item.description, item.image],
    );

    const resultHeader = insertResult[0] as ResultSetHeader;

    const getNewResult = await mysqlDb.getConnection().query(
      'SELECT * FROM items WHERE id = ?',
      [resultHeader.insertId],
    );

    const itemResult = getNewResult[0] as InventoriesWithoutId[];
    return res.send(itemResult[0]);
  } catch (error) {
    next(error);
  }
});

itemsRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;

    const result = await mysqlDb.getConnection().query<ResultSetHeader>(
      'DELETE FROM items WHERE id = ?',
      [id],
    );

    if (result[0].affectedRows === 0) {
      return res.status(404).send({'Ошибка': `Не удалось удалить предмет учета, так-как данного id ${id} не существует!`});
    }

    return res.send(`Предмет учета с ID ${id} удален!`);
  } catch (error) {
    next(error);
  }
});


itemsRouter.put('/:id', imagesUpload.single('image'), async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!req.body.categoryId || !req.body.locationId || !req.body.name) {
      if (req.file) {
        await fs.unlink(req.file.path);
      }
      return res.status(400).send({'Ошибка': 'Category ID, Location ID и Name должны быть указаны.'});
    }

    const item: InventoriesWithoutId = {
      category_id: parseInt(req.body.categoryId),
      location_id: parseInt(req.body.locationId),
      name: req.body.name,
      description: req.body.description ? req.body.description : null,
      image: req.file ? req.file.filename : null
    };

    const searchItem = await mysqlDb.getConnection().query(
      'SELECT * FROM items WHERE id = ?',
      [id],
    );

    const selectItem = searchItem[0] as Inventories[];

    if (selectItem.length === 0) {
      if (req.file) {
        await fs.unlink(req.file.path);
      }
      return res.status(404).send({'Ошибка': 'ID для обновления предмета учета не найдено!'});
    }

    await mysqlDb.getConnection().query(
      'UPDATE items SET category_id = ?, location_id = ?, name = ?, description = ?, image = ?  WHERE id = ?',
      [item.category_id, item.location_id, item.name, item.description, item.image, id],
    );

    const result = await mysqlDb.getConnection().query(
      'SELECT * FROM items WHERE id = ?',
      [id],
    );

    const itemResult = result[0] as Inventories[];
    return res.send(itemResult[0]);
  } catch (error) {
    next(error);
  }
});

export default itemsRouter;