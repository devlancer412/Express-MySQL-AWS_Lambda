/**
 * Import express and store in a constant.
 */
const express = require('express');

/**
 * Create an express application by running express as a function,
 * and store it to a constant.
 */
const app = express();

/**
 * Define the port number that the express application should use.
 */
const port = 3000;

/**
 * Import the database connection file.
 */
const db = require('./database');

/**
 * Create a anonymous function to establish the database connection.
 * After the connection is established, start the server.
 */
const initApp = async () => {
  console.log('Testing the database connection..');
  /**
   * Test the connection.
   * You can use the .authenticate() function to test if the connection works.
   */
  try {
    await db.authenticate();
    console.log('Connection has been established successfully.');

    /**
     * Start the web server on the specified port.
     */
    app.listen(port, () => {
      console.log(`Server is up and running at: http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error.original);
  }
};

/**
 * Initialize the application.
 */
initApp();
