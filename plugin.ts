import type { App, Plugin, PluginSettingTab, Setting } from "obsidian";

import { WaybackMachineClient } from "./wayback.ts";
import type { LinkReplacer, StatusReporter } from "./replacer.ts";
import { LinkReplacer } from "./replacer.ts";
import { STATUS_MESSAGES, LOG_MESSAGES } from "./constants.ts";

interface WaybackMachinePluginSettings {
  debugMode: boolean;
}

const DEFAULT_SETTINGS: WaybackMachinePluginSettings = {
  debugMode: false,
};

export class WaybackMachinePlugin extends Plugin {
  public settings: WaybackMachinePluginSettings = DEFAULT_SETTINGS;
  private isActive: boolean = false;
  private linkReplacer!: LinkReplacer;
  private status!: StatusReporter;

  public override async onload() {
    this.status = this.addStatusBarItem();

    await this.loadSettings();
    const settingTab = new WaybackMachinePluginSettingTab(this.app, this);
    this.addSettingTab(settingTab);

    const client = new WaybackMachineClient();
    this.linkReplacer = new LinkReplacer(client);

    // TODO: Handle link paste in Editor mode
    // TODO: Optional confirmation modal

    this.addCommand({
      id: "replace-current-selection",
      name: "Replace links in current selection",
      editorCallback: async (editor) => {
        await this.executeReplacement(() => editor.getSelection(), (result) => editor.replaceSelection(result));
      },
    });

    this.addCommand({
      id: "replace-current-document",
      name: "Replace links in current document",
      editorCallback: async (editor) => {
        await this.executeReplacement(() => editor.getValue(), (result) => editor.setValue(result));
      },
    });

    this.registerEvent(this.app.workspace.on("editor-menu", (menu, editor) => {
      menu.addItem((item) => {
        item
          .setTitle("Replace links in current selection")
          .setIcon("link")
          .onClick(async () => {
            await this.executeReplacement(() => editor.getSelection(), (result) => editor.replaceSelection(result));
          });
      });

      menu.addItem((item) => {
        item
          .setTitle("Replace links in current document")
          .setIcon("link")
          .onClick(async () => {
            await this.executeReplacement(() => editor.getValue(), (result) => editor.setValue(result));
          });
      });
    }));

    this.status.setText(STATUS_MESSAGES.READY);
  }

  /**
   * Execute link replacement with consistent error handling and state management
   * @param getContent - Function to get the content to process
   * @param setContent - Function to set the processed content
   */
  private async executeReplacement(
    getContent: () => string,
    setContent: (content: string) => void
  ): Promise<void> {
    try {
      // Prevent duplicate invocations
      if (this.isActive) {
        console.warn(LOG_MESSAGES.PLUGIN_ALREADY_RUNNING);
        return;
      }
      this.isActive = true;

      const content = getContent();
      if (content) {
        const result = await this.linkReplacer.replaceLinksInContent(
          content,
          this.status,
        );

        if (result !== content) {
          setContent(result);
        }
      }
    } catch (err) {
      console.error(LOG_MESSAGES.ERROR_REPLACING_LINKS, err);
    } finally {
      this.status.setText(STATUS_MESSAGES.READY);
      this.isActive = false;
    }
  }

  public override onunload() {
  }

  /**
   * Load plugin settings from data storage
   */
  public async loadSettings() {
    const userSettings = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, userSettings);
  }

  /**
   * Save plugin settings to data storage
   */
  public async saveSettings() {
    await this.saveData(this.settings);
  }
}

/**
 * Settings tab for the Wayback Machine Plugin
 */
export class WaybackMachinePluginSettingTab extends PluginSettingTab {
  private plugin: WaybackMachinePlugin;

  public constructor(app: App, plugin: WaybackMachinePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  /**
   * Display the settings interface
   */
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
