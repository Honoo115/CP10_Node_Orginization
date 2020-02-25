const express = require("express");
const uuid = require("uuid/v4");
const logger = require("../logger");
const store = require("../store");

const bookmarkRouter = express.Router();
const bodyParser = express.json();

bookmarkRouter
  .route("/bookmarks")
  .get((req, res) => {
    res.json(store.bookmarks);
  })
  .post(bodyParser, (req, res) => {
    for (const property of ["title", "rating"]) {
      if (!req.body[property]) {
        logger.error(`'${property}' is required`);
        return res.status(400).send(`'${property}' is required`);
      }
    }
    const { title, description, rating } = req.body;
    if (rating < 0) {
      logger.error("Really? Below Zero? Try again....");
    }
    if (rating > 5) {
      logger.error("Rating is not less than 5");
    }
    if (!Number.isInteger(rating)) {
      logger.error("Not even a number....");
    }

    const bookmark = { id: uuid(), title, description, rating };

    store.bookmarks.push(bookmark);

    logger.info(`A new Bookmark with id ${bookmark.id} has spawned`);
    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${bookmark.id}`)
      .json(bookmark);
  });

bookmarkRouter
  .route("/bookmarks/:bookmark_id")
  .get((req, res) => {
    const { bookmark_id } = req.params;

    const bookmark = store.bookmarks.find(c => c.id == bookmark_id);

    if (!bookmark) {
      logger.error(`The ID labled: ${bookmark_id} ain't real.`);
      return res.status(404).send("Bookmark could not be found");
    }

    res.json(bookmark);
  })
  .delete((req, res) => {
    const { bookmark_id } = req.params;

    const bookmarkIndex = store.bookmarks.findIndex(b => b.id === bookmark_id);

    if (bookmarkIndex === -1) {
      logger.error(`The ID labled: ${bookmark_id} ain't real.`);
      return res.status(404).send("Bookmark could not be found");
    }

    store.bookmarks.splice(bookmarkIndex, 1);

    logger.info(`Bookmark Labled ${bookmark_id} has been destroyed.`);
    res.status(204).end();
  });

module.exports = bookmarkRouter;
