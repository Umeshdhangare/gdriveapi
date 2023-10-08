require("dotenv").config();
const express = require("express");
const uploadRouter = require("./routes/uploadRouter");
const downloadRouter = require("./routes/downloadRouter");

// Express server
const app = express();

// Route 1: Download video file

app.use("/download", downloadRouter);

// Router 2: Upload video file in chunks
app.use("/upload", uploadRouter);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
