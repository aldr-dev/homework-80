import mysql, {Connection} from 'mysql2/promise';
import config from './config';

let connection: Connection;

const mysqlDb = {
  init: async () => {
    connection = await mysql.createConnection(config.database);
  },
  getConnection: () => {
    return connection;
  },
};

export default mysqlDb;