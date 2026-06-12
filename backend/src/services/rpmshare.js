const axios = require("axios");
const config = require("../config");

function client() {
  return axios.create({
    baseURL: config.rpmshare.baseUrl,
    headers: {
      "api-token": config.rpmshare.apiKey,
      Accept: "application/json",
    },
    timeout: 15000,
  });
}

async function fetchAllFiles(page = 1, allFiles = []) {
  const { data } = await client().get("/video/manage", {
    params: { page, perPage: 100, limit: 100 },
  });
  const items = data?.data || [];
  if (!items.length) return allFiles;
  const simplified = items.map(f => ({ id: f.id, name: f.name }));
  allFiles.push(...simplified);
  if (items.length >= 100) return fetchAllFiles(page + 1, allFiles);
  return allFiles;
}

async function renameFile(id, newName) {
  const { data } = await client().patch(`/video/manage/${id}`, { name: newName });
  return data;
}

async function deleteFile(id) {
  const { data } = await client().delete(`/video/manage/${id}`);
  return data;
}

module.exports = { fetchAllFiles, renameFile, deleteFile };
