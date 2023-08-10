import {createReadStream, readFileSync, ReadStream, writeFileSync} from "fs";
const {clipboard} = require('electron')

enum ClipboardStatus {
	EMPTY,
	EXTERNAL_DATA,
	LOCAL_DATA
}

class ClipboardController {
	os: string;
	blob: Blob;
	basePath: string;

	constructor() {
		this.os = process.platform;
	}

	injectPath(basePath: string){
		this.basePath = basePath;
	}

	checkClipboard(ref: any): ClipboardStatus{
		// TODO: Test win32
		if (ref.os == "win32"){
			// var rawFilePath = clipboard.read("FileNameW");
		} else if (ref.os == "darwin") {
			const externalDeviceData =  clipboard.readBuffer("public.png");
			const localFileURL = clipboard.read("public.file-url").replace("file://", "")
			if (externalDeviceData != ""){
				console.log("external device data");
				writeFileSync(ref.basePath + "/.tmp.png", externalDeviceData);
				ref.blob = new Blob([readFileSync(ref.basePath + "/.tmp.png")]);
				return ClipboardStatus.EXTERNAL_DATA;
			}
			if (localFileURL != ""){
				console.log("local data");
				ref.getFileContent(localFileURL);
				return ClipboardStatus.LOCAL_DATA;
			}
		}
		return ClipboardStatus.EMPTY;
	}

	private getFileContent(url: string){
		this.blob = new Blob([readFileSync(url)]);
	}

	setClipboard(data: Buffer) {
		clipboard.clear();
		console.log("Setting clipboard");
		clipboard.writeBuffer("public.png", data);
	}

	test() {
		console.log()
	}
}

const clipboardController = new ClipboardController();
export default clipboardController;
