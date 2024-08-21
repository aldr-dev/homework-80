import express from 'express';
import cors from 'cors';
import config from './config';
import mysqlDb from './mysqlDb';
import categoriesRouter from './routers/categories';
import locationsRouter from './routers/locations';
import itemsRouter from './routers/items';

const app = express();
const port = 8000;

app.use(cors(config.corsOptions));
app.use(express.json());
app.use(express.static('public'));
app.use('/categories', categoriesRouter);
app.use('/locations', locationsRouter);
app.use('/items', itemsRouter);

const run = async () => {
  await mysqlDb.init();

  app.listen(port, () => {
    console.log(`Server running at http://127.0.0.1:${port}`);
  });
};

run().catch(console.error);