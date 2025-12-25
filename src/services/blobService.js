const { BlobServiceClient } = require("@azure/storage-blob");

if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
  throw new Error("AZURE_STORAGE_CONNECTION_STRING environment variable is not set");
}

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);

const containerName = "ecucontainer";

async function getLatestBlobData() {
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

