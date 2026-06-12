const router = require("express").Router();
const ctrl = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");

router.post("/register", validate({ body: { username: { required: true }, email: { required: true }, password: { required: true, minLength: 6 } } }), ctrl.register);
router.post("/login", ctrl.login);
router.post("/logout", ctrl.logout);
router.get("/me", protect, ctrl.getMe);
router.put("/history", protect, ctrl.updateHistory);

module.exports = router;
