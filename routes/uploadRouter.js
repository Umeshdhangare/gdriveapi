const express = require("express");
const { authorize } = require("../utils/driveService");
const { google } = require("googleapis");
const fs = require("fs");

const uploadRouter = express.Router();

let uploadedBytes = 0;
// Function to upload the file using folder id
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
			res.status(200).send(`Upload complete`);
		}
	);

	uploadStream.on("error", (err) => {
		res.status(500).send(`Error during upload: ${err.message}`);
	});

	uploadStream.on("data", (chunk) => {
		uploadedBytes += chunk.length;
	});
}

// API endpoint to upload the file at specified folder id.
uploadRouter.get("/:folderId", (req, res) => {
	const folderId = req.params.folderId;
	authorize()
		.then((client) => uploadFile(client, folderId, res))
		.catch(console.error);
});

// API endpoint to track the progress of uploading file.
uploadRouter.get("/progress", (req, res) => {
	const progress = ((uploadedBytes * 100) / fileSize).toFixed(2);
	res.send(`Upload Progress: ${progress}%`);
});
module.exports = uploadRouter;
