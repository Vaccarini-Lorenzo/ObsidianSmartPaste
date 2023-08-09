import {App, Modal, Setting} from "obsidian";
import {appendFileSync, writeFileSync} from "fs";

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
		contentEl.createEl("h1", {text: "Add an API key and the number of free requests"});
		new Setting(contentEl)
			.setName("API-Key")
			.addText((text) => text.onChange((newText) => key = newText));
		new Setting(contentEl)
			.setName("# Free requests")
			.addText((text) => text.onChange((newText) => numberOfReq = newText));

		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText("Submit")
					.setCta()
					.onClick(() => {
						this.updateAPIKeyFile(key, numberOfReq);
					}));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	private updateAPIKeyFile(key: string, numberOfReq: string) {
		const filePath = this.basePath + "/.keys.txt"
		try{
			appendFileSync(filePath, `${key} ${numberOfReq}`)
		} catch (e) {
			if (e.code === 'ENOENT') {
				console.log("No tags file found: Creating one")
				writeFileSync(filePath, `${key} ${numberOfReq}`);
			}
		}
	}
}
