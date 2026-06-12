const router = require("express").Router();
const ctrl = require("../controllers/contentController");
const { validate } = require("../middleware/validate");

router.get("/home", ctrl.getHomeContent);
router.get("/movies", ctrl.getMovies);
router.get("/series", ctrl.getSeries);
router.get("/search", validate({ query: { query: { required: false } } }), ctrl.searchContent);
router.get("/movie/:id", ctrl.getMovieDetails);
router.get("/tv/:id", ctrl.getTVDetails);
router.get("/tv/:id/season/:seasonNum", ctrl.getTVSeasonEpisodes);
router.get("/similar/:type/:id", ctrl.getSimilar);
router.get("/genres", ctrl.getGenres);
router.post("/request", ctrl.requestContent);

module.exports = router;
