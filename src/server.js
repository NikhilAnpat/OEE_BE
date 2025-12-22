const dotenv = require('dotenv');
const createApp = require('./app');

dotenv.config();

const app = createApp();

const port = process.env.PORT || 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${port}`);
});
