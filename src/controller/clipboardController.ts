import {readFileSync} from "fs";

const {clipboard} = require('electron')

enum ClipboardStatus {
	EMPTY,
	EXTERNAL_DATA,
	LOCAL_DATA
}

class ClipboardController {
	os: string;
	dataBuffer: Buffer;

	constructor() {
		this.os = process.platform;
	}

	checkClipboard(ref: any): ClipboardStatus{
		// TODO: Test win32
		if (ref.os == "win32"){
			// var rawFilePath = clipboard.read("FileNameW");
		} else if (ref.os == "darwin") {
			const externalDeviceData =  clipboard.readBuffer("public.png");
			const localFileURL = clipboard.read("public.file-url").replace("file://", "")
			if (externalDeviceData != ""){
				console.log("Found external data");
				ref.dataBuffer = externalDeviceData;
				return ClipboardStatus.EXTERNAL_DATA;
			}
			if (localFileURL != ""){
				console.log("Found local data");
				ref.getFileContent(localFileURL);
				return ClipboardStatus.LOCAL_DATA;
			}
		}
		return ClipboardStatus.EMPTY;
	}

	private getFileContent(url: string){
		this.dataBuffer = readFileSync(url);
	}
}

const clipboardController = new ClipboardController();
export default clipboardController;
