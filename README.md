# Google Drive API for Download and Upload Video in Node.js

This repository provides a Node.js application for interacting with Google Drive through the Google Drive API. You can use this application to upload and download files from and to your Google Drive account.

## Prerequisites

Make sure you have the following

- Node.js installed on your machine.
- A Google Cloud Platform project with the Google Drive API enabled.
- Service Account credentials (credentials.json) for your project.

## Setup

1. Clone the repository

```bash
  git clone https://github.com/yourusername/google-drive-nodejs.git
  cd google-drive-nodejs
```

2. Install dependencies

```bash
  npm install
```

3. Add your credentials.json file to the root directory.
   ([Google documentation](https://developers.google.com/drive/api/quickstart/nodejs) for generating credentials file)

4. Start the server and access API points in Web Browser or Postman.

## Usage

#### Downloading a File

- To download a file pass the folder and file id's to the downloading endpoint and send the API request.
- The video file will get download in the root directory.

#### Uploding a File

- To upload the video file pass the folder id in the uploading endpoint and the send the request.
- The video file will get uploaded on the specified folder.

## Technologies

- [Node.js](https://nodejs.org/en)
- [Express.js](https://expressjs.com/)
- [Google Drive API](https://developers.google.com/drive/api/guides/about-sdk)
