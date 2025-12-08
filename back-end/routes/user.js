const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getMe, updateMe, clearMyData, deleteMe } = require("../controllers/userController");

router.get("/me", auth, getMe);
router.patch("/me", auth, updateMe);
router.delete("/me/data", auth, clearMyData);
router.delete("/me", auth, deleteMe);

module.exports = router;
