import clipboardController from "./clipboardController";
import axios from "axios";
const FormData = require('form-data');
import path from "path";
import {createReadStream} from "fs";
const { Readable } = require('stream');

class ApiController {
	processClipboard() {
		const testURL = "/Users/lorenzovaccarini/Desktop/ts_clipboard/test.png"
		console.log("Processing clipboard");
		const blob = clipboardController.blob;
		const formData = new FormData();
		formData.append('size', 'auto');
		formData.append('image_file', blob , path.basename(testURL));
		axios({
			method: "post",
			url: "https://api.remove.bg/v1.0/removebg",
			data: formData,
			responseType: 'arraybuffer',
			headers: {
				'Content-Type': 'multipart/form-data',
				'X-Api-Key': 'API-KEY',
			},
		})
			.then(function (response) {
				//writeFileSync("no-bg.png", response.data);
				console.log(response.data);
				clipboardController.setClipboard(Buffer.from(response.data));
			})
			.catch(function (response) {
				//handle error
				console.log(response);
			})
	}
}

const apiController = new ApiController();
export default apiController;
