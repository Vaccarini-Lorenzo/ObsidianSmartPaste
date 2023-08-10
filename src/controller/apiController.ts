import clipboardController from "./clipboardController";
import axios from "axios";
import {readFileSync, writeFileSync} from "fs";
const FormData = require('form-data');

export enum RequestStatus {
	PROCESSED,
	INVALID_KEY,
	ERROR
}

class ApiController {
	private apiKey: string;
	basePath: string;

	injectPath(basePath: string){
		this.basePath = basePath;
		try {
			this.apiKey = readFileSync(`${this.basePath}/.key.txt`).toString();
		} catch (e) {
			if (e.code == "ENOENT") writeFileSync(`${this.basePath}/.key.txt`, "");
		}
	}

	setAPIKey(apiKey: string){
		this.apiKey = apiKey;
	}

	async processClipboard(): Promise<RequestStatus> {
		console.log("Processing clipboard");
		const blob = clipboardController.blob;
		const formData = new FormData();
		formData.append('size', 'auto');
		formData.append('image_file', blob);
		let axiosResponse = await axios({
			method: "post",
			url: "https://api.remove.bg/v1.0/removebg",
			data: formData,
			responseType: 'arraybuffer',
			headers: {
				'Content-Type': 'multipart/form-data',
				'X-Api-Key': this.apiKey,
			},
		})
		clipboardController.setClipboard(Buffer.from(axiosResponse.data));
		if (axiosResponse.status == 200) return RequestStatus.PROCESSED;
		if(axiosResponse.status == 403) return RequestStatus.INVALID_KEY;
		return RequestStatus.ERROR;
	}
}

const apiController = new ApiController();
export default apiController;
