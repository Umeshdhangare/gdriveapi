const express = require("express");
const { authorize } = require("../utils/driveService");
const { google } = require("googleapis");
const fs = require("fs");

const downloadRouter = express.Router();

let downloadedBytes = 0;
let fileSize = 0;

// Function to download video file
async function downloadFile(authClient, fileId, folderId, res) {
	const drive = google.drive({ version: "v3", auth: authClient });

	downloadedBytes = 0;
	// The stream for downloading the file.
	drive.files.get(
		{ fileId, alt: "media" },
		{ responseType: "stream" },
		(err, response) => {
			if (err) {
				console.error("Error fetching video:", err);
				res.status(500).send("Error fetching video");
				return;
			}

			fileSize = parseInt(response.headers["content-length"], 10);

			// Created stream to store the file at specific location in root directory. Download path can be change by changing the value in .env file.
			response.data.pipe(fs.createWriteStream(`${process.env.DOWNLOAD_PATH}`));

			response.data.on("data", (chunk) => {
				downloadedBytes += chunk.length;
			});

			response.data.on("end", () => {
				res.status(200).send("Download Completed Successfully");
			});

			response.data.on("error", (err) => {
				res.status(500).send(`Error during download: ${err.message}`);
			});
		}
	);
}

// API to show progress of the download file
downloadRouter.get("/progress", (req, res) => {
	const progress = ((downloadedBytes * 100) / fileSize).toFixed(2);
	res.send(`Download Progress: ${progress}%`);
});

// API end point for downloading file using folder and file id.
downloadRouter.get("/:folderId/:fileId", (req, res) => {
	const fileId = req.params.fileId;
	const folderId = req.params.folderId;

	authorize()
		.then((client) => downloadFile(client, fileId, folderId, res))
		.catch(console.error);
});

module.exports = downloadRouter;
