const ImageKit = require("@imagekit/nodejs");
const { toFile } = require("@imagekit/nodejs");
require("dotenv").config();

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const uploadVideo = async (fileBuffer, fileName) => {
    const result = await imagekit.files.upload({
        file: await toFile(fileBuffer, fileName),
        fileName: fileName,
        folder: "food-videos"
    });
    return { url: result.url, fileId: result.fileId };
}

const deleteVideo = async (fileId) => {
    return await imagekit.deleteFile(fileId);
}

module.exports = { uploadVideo, deleteVideo };