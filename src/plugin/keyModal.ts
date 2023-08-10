import {App, Modal, Setting} from "obsidian";
import {appendFileSync, writeFileSync} from "fs";
import apiController from "../controller/apiController";

export class KeyModal extends Modal {
	basePath: string;

	constructor(app: App,){
		super(app);
		this.basePath = (this.app.vault.adapter as any).basePath + "/.obsidian/plugins/obsidian-smart-paste";
	}

	onOpen() {
		const { contentEl } = this;
		let key: string;
		let numberOfReq: string;
//		contentEl.createEl("h1", {text: "Add an API key and the number of free requests"});
		contentEl.createEl("h1", {text: "Add a remove.bg API key"});
		new Setting(contentEl)
			.setName("API-Key")
			.addText((text) => text.onChange((newText) => key = newText));
		/*
		new Setting(contentEl)
			.setName("# Free requests")
			.addText((text) => text.onChange((newText) => numberOfReq = newText));
		 */
		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText("Submit")
					.setCta()
					.onClick(() => {
						this.updateAPIKeyFile(key);
						this.close();
					}));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	private updateAPIKeyFile(key: string) {
		const filePath = this.basePath + "/.key.txt"
		writeFileSync(filePath, key);
		apiController.setAPIKey(key);
	}
}
