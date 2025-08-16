import { Plugin, TFile } from "obsidian";
import { WaybackMachineClient } from "./wayback.ts";
import { LinkReplacer } from "./replacer.ts";

// TODO: Expose plugin settings
export default class WaybackMachinePlugin extends Plugin {
  private isActive: boolean = false;
  private linkReplacer!: LinkReplacer;

  public override onload() {
    const status = this.addStatusBarItem();

    const client = new WaybackMachineClient();
    this.linkReplacer = new LinkReplacer(client);

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
          const result = await this.linkReplacer.replaceLinksInContent(
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
}
