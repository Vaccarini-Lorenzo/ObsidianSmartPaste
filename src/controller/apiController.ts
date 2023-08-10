import clipboardController from "./clipboardController";
import axios from "axios";
const FormData = require('form-data');
import path from "path";
import {createReadStream} from "fs";
const { Readable } = require('stream');

export enum RequestStatus {
	PROCESSED,
	INVALID_KEY,
	ERROR
}

class ApiController {
	async processClipboard(): Promise<RequestStatus> {
		const testURL = "/Users/lorenzovaccarini/Desktop/ts_clipboard/test.png"
		console.log("Processing clipboard");
		const blob = clipboardController.blob;
		const formData = new FormData();
		formData.append('size', 'auto');
		formData.append('image_file', blob , path.basename(testURL));
		let axiosResponse = await axios({
			method: "post",
			url: "https://api.remove.bg/v1.0/removebg",
			data: formData,
			responseType: 'arraybuffer',
			headers: {
				'Content-Type': 'multipart/form-data',
				'X-Api-Key': 'API-KEY',
			},
		})
		console.log(axiosResponse.data);
		clipboardController.setClipboard(Buffer.from(axiosResponse.data));
		if (axiosResponse.status == 200) return RequestStatus.PROCESSED;
		if(axiosResponse.status == 403) return RequestStatus.INVALID_KEY;
		return RequestStatus.ERROR;
	}
}

const apiController = new ApiController();
export default apiController;
