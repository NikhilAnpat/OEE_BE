const { BlobServiceClient } = require("@azure/storage-blob");

const containerName = "ecucontainer";

function createBlobServiceClient() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    const err = new Error(
      "AZURE_STORAGE_CONNECTION_STRING environment variable is not set"
    );
    err.code = "AZURE_CONFIG_MISSING";
    throw err;
  }
  return BlobServiceClient.fromConnectionString(connectionString);
}

async function getLatestBlobData() {
  const blobServiceClient = createBlobServiceClient();
  const containerClient = blobServiceClient.getContainerClient(containerName);

  let latestBlob = null;

  for await (const blob of containerClient.listBlobsFlat()) {
    if (!latestBlob || blob.properties.lastModified > latestBlob.properties.lastModified) {
      latestBlob = blob;
    }
  }

  if (!latestBlob) return null;

  const blobClient = containerClient.getBlobClient(latestBlob.name);
  const download = await blobClient.download();

  if (!download.readableStreamBody) return "";
  return await streamToString(download.readableStreamBody);
}

function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", d => chunks.push(d.toString()));
    stream.on("end", () => resolve(chunks.join("")));
    stream.on("error", reject);
  });
}

module.exports = { getLatestBlobData };

