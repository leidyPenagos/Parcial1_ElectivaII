import express from 'express';
import 'dotenv/config';
import path from 'node:path';
import bodyParser from 'body-parser'; 

import routes from './routes/index.js';

const app = express();
app.use(bodyParser.urlencoded({ extended: true })); 
app.set('view engine', 'ejs');
app.use(express.static("public"));

app.set('PORT', process.env.PORT || 3000);
app.use('/', routes);

app.listen(app.get('PORT'), () => console.log(`Server Ready ${app.get('PORT')}..`));