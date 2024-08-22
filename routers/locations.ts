import express from 'express';
import mysqlDb from '../mysqlDb';
import {Resources, ResourcesWithoutId} from '../types';
import {ResultSetHeader, RowDataPacket} from 'mysql2';

const locationsRouter = express.Router();

locationsRouter.get('/', async (_, res, next) => {
  try {
    const result = await mysqlDb.getConnection().query(
      'SELECT id, name FROM locations'
    );

    const location = result[0] as Resources[];

    if (location.length === 0) {
      res.status(404).send({'Ошибка': 'Список названий местоположений пуст!'});
    }
    return res.send(location);
  } catch (error) {
    next(error);
  }
});

locationsRouter.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await mysqlDb.getConnection().query(
      'SELECT * FROM locations WHERE id = ?',
      [id]
    );

    const location = result[0] as Resources[];

    if (location.length === 0) {
      return res.status(404).send({'Ошибка': 'Название местоположения с данным id не найдено!'});
    }
    return res.send(location[0]);
  } catch (error) {
    next(error);
  }
});

locationsRouter.post('/', async (req, res, next) => {
  try {

    if (!req.body.name) {
      return res.status(400).send({'Ошибка': 'Название местоположения должно присутствовать!'});
    }

    const location: ResourcesWithoutId = {
      name: req.body.name,
      description: req.body.description ? req.body.description : null,
    };

    const insertResult = await mysqlDb.getConnection().query(
      'INSERT INTO locations (name, description) VALUES (?, ?)',
      [location.name, location.description],
    );

    const resultHeader = insertResult[0] as ResultSetHeader;

    const getNewResult = await mysqlDb.getConnection().query(
      'SELECT * FROM locations WHERE id = ?',
      [resultHeader.insertId],
    );

    const locationResult = getNewResult[0] as Resources[];
    return res.send(locationResult[0]);
  } catch (error) {
    next(error);
  }
});

locationsRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;

    const [relatedResources] = await mysqlDb.getConnection().query(
      'SELECT * FROM items WHERE location_id = ?',
      [id]
    ) as RowDataPacket[];

    if (relatedResources.length > 0) {
      return res.status(400).send({'Ошибка': 'Нельзя удалить связанные записи!'});
    }

    const result = await mysqlDb.getConnection().query<ResultSetHeader>(
      'DELETE FROM locations WHERE id = ?',
      [id],
    );

    if (result[0].affectedRows === 0) {
      return res.status(404).send({'Ошибка': `Не удалось удалить местоположение, так-как данного id ${id} не существует!`});
    }

    return res.send(`Местоположение с ID ${id} удалено!`);
  } catch (error) {
    next(error);
  }
});

locationsRouter.put('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!req.body.name) {
      return res.status(400).send({'Ошибка': 'Название местоположения должно присутствовать!'});
    }

    const location: ResourcesWithoutId = {
      name: req.body.name,
      description: req.body.description ? req.body.description : null,
    };

    const searchLocation = await mysqlDb.getConnection().query(
      'SELECT * FROM locations WHERE id = ?',
      [id],
    );

    const selectLocation = searchLocation[0] as Resources[];

    if (selectLocation.length === 0) {
      return res.status(404).send({'Ошибка': 'ID для обновления местоположения не найдено!'});
    }

    await mysqlDb.getConnection().query(
      'UPDATE locations SET name = ?, description = ? WHERE id = ?',
      [location.name, location.description, id],
    );

    const result = await mysqlDb.getConnection().query(
      'SELECT * FROM locations WHERE id = ?',
      [id],
    );

    const locationResult = result[0] as Resources[];
    return res.send(locationResult[0]);
  } catch (error) {
    next(error);
  }
});

export default locationsRouter;