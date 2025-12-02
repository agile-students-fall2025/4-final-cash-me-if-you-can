const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getMe, updateMe } = require("../controllers/userController");

router.get("/me", auth, getMe);
router.patch("/me", auth, updateMe);

module.exports = router;
