const AWSXRay = require('aws-xray-sdk-core');
const captureMySQL = require('aws-xray-sdk-mysql');
// const mysql = captureMySQL(require('mysql2'));
const AWS = require('aws-sdk');
var mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const ase = require('aws-serverless-express');

require('dotenv').config();
const username = process.env.databaseUser;
const host = process.env.databaseHost;
const database = process.env.databaseName;
const region = process.env.AWS_REGION;
const sqlport = 3306;

const signer = new AWS.RDS.Signer({
  region: region,
  hostname: host,
  port: sqlport,
  username: username,
});

var connection = mysql.createConnection({
  host: process.env.r_ho,
  user: process.env.r_nm,
  password: process.env.r_cd,
  port: process.env.r_po,
  database: process.env.r_db,
});

connection.connect();

const app = express();
app.use(bodyParser.json());

app.get('/movies', async (req, res) => {
  const { page, size, director, genre } = req.query;

  try {
    const query = `SELECT * FROM movies LEFT JOIN movies_directors ON movies_directors.movie_id = movies.id LEFT JOIN movies_genres ON movies_genres.movie_id = movies.id WHERE movies_directors.director_id = ${director} AND movies_genres.id = ${genre} LIMIT ${size} OFFSET ${
      page * size
    }`;
    console.log(query);
    const results = await connection.query(query);
    console.log(results);

    return res.json({
      statusCode: 'success',
      data: results,
    });
  } catch (err) {
    console.log(err);
    return res.json({ status: 'failed', data: err });
  }
});

app.get('/actor_stats/:actorId', async (req, res) => {
  const { actorId } = req.params;

  try {
    const queryActorData = `SELECT * FROM actors WHERE actors.id = ${actorId}`;
    const queryTopGenreData = `SELECT movies_genres.genre FROM actors LEFT JOIN roles ON roles.actor_id = actors.id LEFT JOIN movies ON movies.id = roles.movie_id LEFT JOIN movies_genres ON movies_genres.movie_id = movies.id WHERE actors.id = ${actorId} GROUP BY movies_genres.genre ORDER BY COUNT(movies.id) DESC LIMIT 1`;
    const queryMovieCount = `SELECT COUNT(roles.movie_id) FROM roles WHERE roles.actor_id = ${actorId}`;
    const queryGenreByMovie = `SELECT movies_genre.*, COUNT(roles.movie_id) FROM roles LEFT JOIN movies_genres ON roles.movie_id = roles.movie_id WHERE roles.actor_id = ${actorId} GROUP BY roles.id`;
    const queryPartner = `SELECT actors.* FROM roles A, roles B LEFT JOIN actors ON actors.id = B.id WHERE A.id <> B.id AND A.movie_id = B.movie_id AND A.actor_id = ${actorId}  GROUP BY B.actor_id ORDER BY COUNT(B.id) LIMIT 1`;

    const actorData = await connection.query(queryActorData);
    const topGenre = await connection.query(queryTopGenreData);
    const movieCount = await connection.query(queryMovieCount);
    const genreByMovie = await connection.query(queryGenreByMovie);
    const partners = await connection.query(queryPartner);

    const result = {
      ...actorData,
      top_genre: topGenre,
      number_of_movies: movieCount,
      number_of_movies_by_genre: genreByMovie,
      most_frequently_partner: partners,
    };

    return res.json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    console.log(err);
    return res.json({ status: 'failed', data: err });
  }
});

const server = ase.createServer(app, null, binaryMimeTypes);
exports.handler = (event, context) => ase.proxy(server, event, context);
