const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', routes);

const port = 5000;
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
