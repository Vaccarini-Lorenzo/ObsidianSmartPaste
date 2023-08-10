import {createReadStream, readFileSync, ReadStream, writeFileSync} from "fs";
import imageController from "./imageController";
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
	filePath: string;
	cachedExternal: Buffer;

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
				if(ref.cachedExternal != undefined && ref.cachedExternal.toString() == externalDeviceData.toString()) return ClipboardStatus.EXTERNAL_DATA;
				console.log("Updating external device data")
				ref.cachedExternal = externalDeviceData;
				ref.filePath = ref.basePath + "/.tmp.png";
				writeFileSync(ref.filePath, externalDeviceData);
				let fileBuffer = readFileSync(ref.filePath)
				ref.blob = new Blob([fileBuffer]);
				return ClipboardStatus.EXTERNAL_DATA;
			}
			if (localFileURL != ""){
				if(localFileURL.substring(localFileURL.length - 3) != "png") return ClipboardStatus.EMPTY;
				if (ref.filePath != undefined && localFileURL == ref.filePath) return ClipboardStatus.LOCAL_DATA;
				console.log("Updating local device data");
				ref.filePath = localFileURL;
				const fileBuffer = ref.getFileContent(ref.filePath);
				ref.blob = new Blob([fileBuffer]);
				return ClipboardStatus.LOCAL_DATA;
			}
		}
		return ClipboardStatus.EMPTY;
	}

	private getFileContent(url: string): Buffer{
		return readFileSync(decodeURI(url));
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
