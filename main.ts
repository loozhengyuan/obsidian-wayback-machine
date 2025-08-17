import { App, Plugin, PluginSettingTab, Setting, TFile } from "obsidian";

import { WaybackMachineClient } from "./wayback.ts";
import { LinkReplacer } from "./replacer.ts";

interface WaybackMachinePluginSettings {
  debugMode: boolean;
}

const DEFAULT_SETTINGS: WaybackMachinePluginSettings = {
  debugMode: false,
};

export default class WaybackMachinePlugin extends Plugin {
  public settings: WaybackMachinePluginSettings = DEFAULT_SETTINGS;
  private isActive: boolean = false;

  public override async onload() {
    const status = this.addStatusBarItem();

    await this.loadSettings();
    const settingTab = new WaybackMachinePluginSettingTab(this.app, this);
    this.addSettingTab(settingTab);

    const client = new WaybackMachineClient();
    const linkReplacer = new LinkReplacer(client);

    // TODO: Handle link paste in Editor mode
    // TODO: Handle highlight and replace
    // TODO: Handle command trigger
    // TODO: Optional confirmation modal

    this.registerEvent(this.app.vault.on("modify", async (f) => {
      try {
        console.debug("Handling 'modify' event");

        // Prevent duplicate invocations
        if (this.isActive) {
          console.debug("Plugin already running, exiting!");
          return;
        }
        this.isActive = true;

        if (f instanceof TFile && f.extension === "md") {
          const content = await this.app.vault.read(f);
          const result = await linkReplacer.replaceLinksInContent(
            content,
            status,
          );

          if (result !== content) {
            this.app.vault.modify(f, result);
          }
        }
      } catch (err) {
        console.error("Error replacing links", err);
      } finally {
        status.setText("Wayback: Ready");
        this.isActive = false;
      }
    }));

    status.setText("Wayback: Ready");
  }

  public override onunload() {
  }

  public async loadSettings() {
    const userSettings = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, userSettings);
  }

  public async saveSettings() {
    await this.saveData(this.settings);
  }
}

export class WaybackMachinePluginSettingTab extends PluginSettingTab {
  private plugin: WaybackMachinePlugin;

  public constructor(app: App, plugin: WaybackMachinePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  public display(): void {
    this.containerEl.empty();

    new Setting(this.containerEl)
      .setName("Debug mode")
      .setDesc("Whether to enable debug logs")
      .addToggle((e) =>
        e
          .setValue(this.plugin.settings.debugMode)
          .onChange(async (v) => {
            this.plugin.settings.debugMode = v;
            await this.plugin.saveSettings();
            this.display();
          })
      );
  }
}
