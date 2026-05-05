require('dotenv').config();
const { getDb } = require('./database');

const db = getDb();
console.log('Migration complete — schema applied.');
