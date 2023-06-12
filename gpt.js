csharp
Copy code
npm init -y
Install the necessary dependencies by running the following command:
Copy code
npm install express mysql
Create the following directory structure:

diff
Copy code
- project
  |- controllers
  |  |- userController.js
  |- models
  |  |- userModel.js
  |- routers
  |  |- userRouter.js
  |- server.js
  |- package.json
Create the MySQL database and table:

Follow the instructions from the previous response to create the registration_db database and users table.
Update the code in the respective files as shown below:

userModel.js

const mysql = require('mysql');

// MySQL connection configuration
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'registration_db'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database');
});

class UserModel {
  static createUser(user, callback) {
    connection.query('INSERT INTO users SET ?', user, (err, result) => {
      if (err) {
        console.error('Error registering user: ', err);
        callback(err);
      } else {
        console.log('User registered successfully');
        callback(null, result);
      }
    });
  }
}

module.exports = UserModel;


userController.js

const UserModel = require('../models/userModel');

class UserController {
  static registerUser(req, res) {
    const { name, email, password } = req.body;
    const user = { name, email, password };

    UserModel.createUser(user, (err, result) => {
      if (err) {
        res.status(500).json({ error: 'Failed to register user' });
      } else {
        res.status(200).json({ message: 'User registered successfully' });
      }
    });
  }
}

module.exports = UserController;


userRouter.js

const express = require('express');
const UserController = require('../controllers/userController');

const router = express.Router();

router.post('/register', UserController.registerUser);

module.exports = router;


server.js

const express = require('express');
const app = express();
const port = 3000;

const userRouter = require('./routers/userRouter');

app.use(express.json());
app.use('/user', userRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
