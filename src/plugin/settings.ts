import {App, PluginSettingTab, Setting} from "obsidian";
import ObsidianSmartPaste from "./main";

export interface SettingInterface {
	highContrast: boolean;
}

export const DEFAULT_SETTINGS: Partial<SettingInterface> = {
	highContrast: false,
};


export class Settings extends PluginSettingTab {
	plugin: ObsidianSmartPaste;

	constructor(app: App, plugin: ObsidianSmartPaste) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("High contrast")
			.addToggle((toggle) => {
				toggle.onChange(async value => {
					console.log(value);
					this.plugin.settings.highContrast = value;
					await this.plugin.saveSettings();
				})
			} )
	}
}
