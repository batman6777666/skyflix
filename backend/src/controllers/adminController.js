const Movie = require("../models/Movie");
const Series = require("../models/Series");
const Homepage = require("../models/Homepage");
const Request = require("../models/Request");
const { fetchAllFiles, renameFile, deleteFile } = require("../services/rpmshare");

exports.getRPMFiles = async (req, res) => {
  try {
    const files = await fetchAllFiles();
    res.json(files);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.renameRPMFiles = async (req, res) => {
  const { updates } = req.body;
  if (!Array.isArray(updates)) {
    return res.status(400).json({ success: false, message: "updates must be an array" });
  }
  const results = await Promise.all(updates.map(async (item) => {
    try {
      await renameFile(item.id, item.newName);
      return { id: item.id, status: "Success" };
    } catch {
      return { id: item.id, status: "Failed" };
    }
  }));
  res.json({ success: true, results });
};

exports.getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const matchStage = search ? { title: new RegExp(search, "i") } : {};

    const pipeline = [
      { $addFields: { type: "Movie", sortDate: "$createdAt" } },
      {
        $unionWith: {
          coll: "series",
          pipeline: [
            { $addFields: { type: "Series", title: "$name", sortDate: "$createdAt" } },
          ],
        },
      },
      { $match: matchStage },
      { $sort: { sortDate: -1 } },
      { $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limit }],
      }},
    ];

    const results = await Movie.aggregate(pipeline);
    const posts = results[0].data;
    const total = results[0].metadata[0]?.total || 0;

    res.json({ posts, totalPages: Math.ceil(total / limit), currentPage: page, totalItems: total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPostDetails = async (req, res) => {
  try {
    const { id, type } = req.query;
    const Model = type === "Movie" ? Movie : Series;
    const post = await Model.findById(id);
    if (!post) return res.status(404).json({ success: false, message: "Not found" });
    res.json(post);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { id, type, data } = req.body;
    const Model = type === "Movie" ? Movie : Series;
    const oldDoc = await Model.findById(id);
    if (!oldDoc) return res.status(404).json({ success: false, message: "Not found" });

    const newTitle = type === "Movie" ? data.title : data.name;
    const oldTitle = type === "Movie" ? oldDoc.title : oldDoc.name;

    if (type === "Movie" && newTitle && newTitle !== oldTitle && oldDoc.fileCode) {
      try {
        await renameFile(oldDoc.fileCode, newTitle);
      } catch (e) {
        console.error("RPMShare rename failed:", e.message);
      }
    }

    const { _id, createdAt, __v, ...updateData } = data;
    await Model.findByIdAndUpdate(id, { $set: updateData });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id, type } = req.query;
    if (!id || !type) return res.status(400).json({ success: false, message: "id and type required" });

    const Model = type === "Movie" ? Movie : Series;
    const post = await Model.findById(id);
    if (!post) return res.status(404).json({ success: false, message: "Not found" });

    const filesToDelete = [];
    if (type === "Movie" && post.fileCode) filesToDelete.push(post.fileCode);
    if (type === "Series" && post.seasons) {
      post.seasons.forEach(s => s.episodes?.forEach(ep => { if (ep.fileCode) filesToDelete.push(ep.fileCode); }));
    }

    if (filesToDelete.length) {
      await Promise.all(filesToDelete.map(fc => deleteFile(fc).catch(e => console.error(`Delete ${fc} failed:`, e.message))));
    }

    await Model.findByIdAndDelete(id);
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHomepageConfig = async (req, res) => {
  let config = await Homepage.findOne().populate("bannerItems.contentId");
  if (!config) {
    config = new Homepage({ bannerItems: [], categories: [] });
    await config.save();
  }
  res.json(config);
};

exports.updateHomepageConfig = async (req, res) => {
  try {
    const { bannerItems, categories } = req.body;
    const clean = (bannerItems || []).filter(i => i.contentId).map(i => ({
      ...i,
      contentId: i.contentId._id || i.contentId,
    }));
    await Homepage.findOneAndUpdate({}, { bannerItems: clean, categories: categories || [] }, { upsert: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDuplicates = async (req, res) => {
  try {
    const movies = await Movie.aggregate([
      { $group: { _id: "$tmdbId", count: { $sum: 1 }, ids: { $push: "$_id" }, name: { $first: "$title" } } },
      { $match: { count: { $gt: 1 } } },
    ]).allowDiskUse(true);
    res.json({ movies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAllPosts = async (req, res) => {
  try {
    await Movie.deleteMany({});
    await Series.deleteMany({});
    res.json({ success: true, message: "All posts deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.fixDatabaseRules = async (req, res) => {
  try {
    const movieColl = mongoose.connection.collection("movies");
    const seriesColl = mongoose.connection.collection("series");
    const logs = [];

    for (const coll of [movieColl, seriesColl]) {
      const indexes = await coll.indexes();
      for (const idx of indexes) {
        if (idx.key.tmdbId) {
          await coll.dropIndex(idx.name);
          logs.push(`Dropped index: ${idx.name}`);
        }
      }
    }
    res.json({ success: true, message: "Indexes fixed", logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.query.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [totalMovies, totalSeries] = await Promise.all([
      Movie.countDocuments(),
      Series.countDocuments(),
    ]);
    const recentMovies = await Movie.find().sort({ createdAt: -1 }).limit(5).select("title createdAt").lean();
    const recentSeries = await Series.find().sort({ createdAt: -1 }).limit(5).select("name createdAt").lean();
    const pendingRequests = await Request.countDocuments({ status: "pending" });
    res.json({ totalMovies, totalSeries, recentMovies, recentSeries, pendingRequests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
