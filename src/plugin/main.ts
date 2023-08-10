import {Notice, Plugin} from 'obsidian';
import {KeyModal} from "./keyModal";
import clipboardController from "../controller/clipboardController";
import apiController, {RequestStatus} from "../controller/apiController";
import {DEFAULT_SETTINGS, SettingInterface, Settings} from "./settings";

export default class ObsidianSmartPaste extends Plugin {
	settings: SettingInterface;
	keyModal: KeyModal;

	async onload() {
		await this.loadSettings();

		let basePath = (this.app.vault.adapter as any).basePath
		basePath =`${basePath}/.obsidian/plugins/obsidian-smart-paste`;
		clipboardController.injectPath(basePath);
		apiController.injectPath(basePath);
		this.keyModal = new KeyModal(this.app);
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
				const highContrast = this.settings.highContrast;
				new Notice("Removing the copied image background.\nPlease wait...")
				apiController.processClipboard(highContrast).then(requestStatus => {
					if(requestStatus == RequestStatus.PROCESSED){
						new Notice("Background removed!");
					} else if (requestStatus == RequestStatus.INVALID_KEY){
						new Notice("There has been an error with your API key");
					}
				});
			}
		})
		this.addCommand({
			id: 'test',
			name: 'test',
			callback: () => {
				console.log("clipboard controller ", clipboardController.filePath);
				//imageController.loadImage(clipboardController.filePath)
			}
		})
		this.addSettingTab(new Settings(this.app, this));
	}
}
