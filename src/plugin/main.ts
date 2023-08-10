import {Notice, Plugin} from 'obsidian';
import {KeyModal} from "./keyModal";
import clipboardController from "../controller/clipboardController";
import apiController, {RequestStatus} from "../controller/apiController";

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

/*
function getClipboardFileURL() {
	let filePath = "";
	if (process.platform === "win32") {
		var rawFilePath = clipboard.read("FileNameW");
		filePath = rawFilePath.replace(
			new RegExp(String.fromCharCode(0), "g"),
			""
		);
	} else if (process.platform === "darwin") {
		filePath = clipboard.readBuffer("public.png")
		writeFileSync("/Users/lorenzovaccarini/test.png", filePath);
	} else {
		filePath = "";
	}
	return filePath;
}

*/

export default class ObsidianSmartPaste extends Plugin {
	settings: MyPluginSettings;
	keyModal: KeyModal;

	async onload() {
		let basePath = (this.app.vault.adapter as any).basePath
		basePath =`${basePath}/.obsidian/plugins/obsidian-smart-paste`;
		clipboardController.injectPath(basePath);
		apiController.injectPath(basePath);
		this.keyModal = new KeyModal(this.app);
		await this.loadSettings();
		this.registerCommands();
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private registerCommands() {
		this.registerInterval(
			window.setInterval(clipboardController.checkClipboard, 1000, clipboardController)
		);

		this.addCommand({
			id: 'add-api-key',
			name: 'Add API key',
			callback: () => {
				this.keyModal.open();
			}
		});

		this.addCommand({
			id: 'paste-no-bg',
			name: 'Smart paste',
			callback: () => {
				new Notice("Removing the copied image background.\nPlease wait...")
				apiController.processClipboard().then(requestStatus => {
					if(requestStatus == RequestStatus.PROCESSED){
						new Notice("Background removed!");
					} else if (requestStatus == RequestStatus.INVALID_KEY){
						new Notice("There has been an error with your API key");
					}
				});
			}
		})
	}
}
