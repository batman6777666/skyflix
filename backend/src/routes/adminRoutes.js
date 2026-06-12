const router = require("express").Router();
const ctrl = require("../controllers/adminController");
const { adminGuard } = require("../middleware/authMiddleware");

router.get("/stats", ctrl.getStats);
router.get("/files", adminGuard, ctrl.getRPMFiles);
router.post("/files/rename", adminGuard, ctrl.renameRPMFiles);
router.get("/posts", adminGuard, ctrl.getAllPosts);
router.get("/post", adminGuard, ctrl.getPostDetails);
router.put("/post", adminGuard, ctrl.updatePost);
router.delete("/post", adminGuard, ctrl.deletePost);
router.delete("/posts/all", adminGuard, ctrl.deleteAllPosts);
router.get("/homepage", adminGuard, ctrl.getHomepageConfig);
router.put("/homepage", adminGuard, ctrl.updateHomepageConfig);
router.get("/duplicates", adminGuard, ctrl.getDuplicates);
router.post("/fix-indexes", adminGuard, ctrl.fixDatabaseRules);
router.get("/requests", adminGuard, ctrl.getRequests);
router.delete("/request", adminGuard, ctrl.deleteRequest);

module.exports = router;
