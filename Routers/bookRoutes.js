const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const { addBook, getBooks, getBookById, updateBook, deleteBook } = require("../Controllers/bookController");
const  protect  = require("../middlewares/authMiddleware");

router.post("/add", protect,upload.single("coverImage"), addBook);
router.get("/get", getBooks);
router.get("/get/:id", getBookById);
router.put("/update/:id",upload.single("coverImage"), updateBook);
router.delete("/delete/:id",deleteBook);

module.exports = router;
