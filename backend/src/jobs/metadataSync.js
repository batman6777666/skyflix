const { runMetadataSync } = require("./services/metadata");

runMetadataSync().then(() => {
  console.log("Sync job finished");
  process.exit(0);
}).catch(err => {
  console.error("Sync job failed:", err);
  process.exit(1);
});
