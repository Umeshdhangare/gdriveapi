const express = require("express");
const { authorize } = require("../utils/driveService");
const { google } = require("googleapis");
const fs = require("fs");

const uploadRouter = express.Router();

let uploadedBytes = 0;
async function uploadFile(authClient, folderId, res) {
	const drive = google.drive({ version: "v3", auth: authClient });

	const fileMetadata = {
		name: "uploaded_video.mp4",
		parents: [folderId],
	};

	const media = {
		mimeType: "video/mp4",
		body: fs.createReadStream(`${process.env.DOWNLOAD_PATH}`),
	};

	const uploadStream = drive.files.create(
		{
			resource: fileMetadata,
			media: media,
			fields: "id",
		},
		(err, file) => {
			if (err) {
				console.error("Error uploading video:", err);
				res.status(500).send("Error uploading video");
				return;
			}
			res.send("Upload complete");
		}
	);

	uploadStream.on("error", (err) => {
		console.error("Error during upload:", err);
	});

	uploadStream.on("data", (chunk) => {
		uploadedBytes += chunk.length;
		// console.log("Uploaded Bytes: ", uploadedBytes);
	});
}

uploadRouter.get("/:folderId", (req, res) => {
	const folderId = req.params.folderId;
	authorize()
		.then((client) => uploadFile(client, folderId, res))
		.catch(console.error);
});

uploadRouter.get("/progress", (req, res) => {
	const progress = ((uploadedBytes * 100) / fileSize).toFixed(2);
	res.send(`Upload Progress: ${progress}%`);
});
module.exports = uploadRouter;
