import { App, Editor, Plugin, PluginSettingTab, Setting } from "obsidian";

import { WaybackMachineClient } from "./wayback.ts";
import { LinkReplacer } from "./replacer.ts";

interface WaybackMachinePluginSettings {
  debugMode: boolean;
}

const DEFAULT_SETTINGS: WaybackMachinePluginSettings = {
  debugMode: false,
};

export class WaybackMachinePlugin extends Plugin {
  public settings: WaybackMachinePluginSettings = DEFAULT_SETTINGS;
  private isActive: boolean = false;
  private status?: HTMLElement;

  public override async onload() {
    await this.loadSettings();
    const settingTab = new WaybackMachinePluginSettingTab(this.app, this);
    this.addSettingTab(settingTab);

    const client = new WaybackMachineClient();
    const linkReplacer = new LinkReplacer(client);

    // TODO: Handle link paste in Editor mode
    // TODO: Optional confirmation modal

    this.addCommand({
      id: "replace-current-selection",
      name: "Replace links in current selection",
      editorCallback: async (editor) => {
        await this.replaceLinksInSelection(editor, linkReplacer);
      },
    });

    this.addCommand({
      id: "replace-current-document",
      name: "Replace links in current document",
      editorCallback: async (editor) => {
        await this.replaceLinksInDocument(editor, linkReplacer);
      },
    });

    this.registerEvent(this.app.workspace.on("editor-menu", (menu, editor) => {
      menu.addItem((item) => {
        item
          .setTitle("Replace links in current selection")
          .setIcon("link")
          .onClick(async () => {
            await this.replaceLinksInSelection(editor, linkReplacer);
          });
      });

      menu.addItem((item) => {
        item
          .setTitle("Replace links in current document")
          .setIcon("link")
          .onClick(async () => {
            await this.replaceLinksInDocument(editor, linkReplacer);
          });
      });
    }));

    this.setStatus("Wayback: Ready");
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

  /**
   * Replace links in current selection
   */
  private async replaceLinksInSelection(editor: Editor, linkReplacer: LinkReplacer) {
    try {
      // Prevent duplicate invocations
      if (this.isActive) {
        console.warn("Plugin already running, exiting!");
        return;
      }
      this.isActive = true;

      const content = editor.getSelection();
      if (content) {
        const result = await linkReplacer.replaceLinksInContent(
          content,
          (text) => this.setStatus(text),
        );

        if (result !== content) {
          editor.replaceSelection(result);
        }
      }
    } catch (err) {
      console.error("Error replacing links", err);
    } finally {
      this.setStatus("Wayback: Ready");
      this.isActive = false;
    }
  }

  /**
   * Replace links in current document
   */
  private async replaceLinksInDocument(editor: Editor, linkReplacer: LinkReplacer) {
    try {
      // Prevent duplicate invocations
      if (this.isActive) {
        console.warn("Plugin already running, exiting!");
        return;
      }
      this.isActive = true;

      const content = editor.getValue();
      if (content) {
        const result = await linkReplacer.replaceLinksInContent(
          content,
          (text) => this.setStatus(text),
        );

        if (result !== content) {
          editor.setValue(result);
        }
      }
    } catch (err) {
      console.error("Error replacing links", err);
    } finally {
      this.setStatus("Wayback: Ready");
      this.isActive = false;
    }
  }

  /**
   * Set status text with automatic initialization if needed
   * @param text - The status text to display
   */
  private setStatus(text: string): void {
    if (!this.status) {
      this.status = this.addStatusBarItem();
    }
    this.status.setText(text);
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
