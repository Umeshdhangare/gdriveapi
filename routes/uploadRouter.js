const express = require("express");
const { authorize } = require("../utils/driveService");
const fs = require("fs");
const axios = require("axios");
const path = require("path");

const uploadRouter = express.Router();

var uploadProgress = 0;

// Function to upload the file using folder id
const uploadFile = async (authClient, folderId, res) => {
	const filePath = path.join(__dirname, `../${process.env.UPLOAD_PATH}`);
	const fileContent = fs.readFileSync(filePath);
	const fileSize = fileContent.length;

	const CHUNK_SIZE = 1024 * 1024; // Chunks of size 1MB

	const access_token = await authClient.getAccessToken();

	axios
		.post(
			"https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
			{
				name: "uploaded_video.mp4",
				mimeType: "video/mp4",
				parents: [folderId],
			},
			{
				headers: {
					Authorization: `Bearer ${access_token.token}`,
					// "Content-Type": "application/json; charset=UTF-8",
				},
			}
		)
		.then((response) => {
			const uploadUrl = response.headers.location;

			let startByte = 0;
			let endByte = Math.min(CHUNK_SIZE, fileSize);

			const uploadChunk = (sByte, eByte) => {
				const chunk = fileContent.slice(sByte, eByte);

				axios
					.put(uploadUrl, chunk, {
						headers: {
							"Content-Length": chunk.length,
							"Content-Range": `bytes ${sByte}-${eByte - 1}/${fileSize}`,
						},
					})
					.then(() => {
						// This will only run after uploading of all the chunks
						uploadProgress = (eByte * 100) / fileSize;
						res.status(200).send("Upload Completed Successfully!");
					})
					.catch((error) => {
						// axios response is error with status 308, instead of success with status 200
						// After uploading chunk response is error with status 308, therefore if condition used to upload the next chunk and so on
						if (error.response.status === 308) {
							sByte = eByte;
							eByte = Math.min(sByte + CHUNK_SIZE, fileSize);

							uploadProgress = (eByte * 100) / fileSize;
							if (sByte <= fileSize) {
								uploadChunk(sByte, eByte);
							} else {
								res.status(200).send("Completed Uploading");
							}
						} else {
							// console.error("Error uploading chunk:", error);
							let err = new Error(`Error uploading chunk: ${error}`);
							throw err;
						}
					});
			};

			uploadChunk(startByte, endByte);
		})
		.catch((error) => {
			console.error("Error initiating resumable upload:", error);
		});
};

// API endpoint to track the progress of uploading file.
uploadRouter.get("/progress", (req, res) => {
	const progress = uploadProgress.toFixed(2);
	res.send(`Upload Progress: ${progress}%`);
});

// API endpoint to upload the file at specified folder id.
uploadRouter.get("/:folderId", (req, res) => {
	const folderId = req.params.folderId;
	authorize()
		.then((client) => uploadFile(client, folderId, res))
		.catch(console.error);
});

module.exports = uploadRouter;
