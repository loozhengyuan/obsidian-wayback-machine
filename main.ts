import { Plugin, TFile } from "obsidian";

// TODO: Avoid links from matching prematurely?
const URL_REGEX = /https?:\/\/[^\s\)>\]]+/g;

const HOSTNAMES_BLOCKED = [
  "0.0.0.0",
  // Localhost
  "localhost",
  "127.0.0.1",
  "::1",
  // Wayback Machine
  "web.archive.org",
];

// TODO: Expose plugin settings
export default class WaybackMachinePlugin extends Plugin {
  private isActive: boolean = false;

  public override onload() {
    const status = this.addStatusBarItem();

    const client = new WaybackMachineClient();

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

          const links = [...new Set(content.match(URL_REGEX) || [])];
          if (links.length === 0) {
            return;
          }

          let result = content;
          for (const [idx, link] of links.entries()) {
            status.setText(
              `Wayback: Replacing ${idx + 1} of ${links.length} link(s)...`,
            );

            const url = new URL(link);
            if (HOSTNAMES_BLOCKED.includes(url.hostname)) {
              console.warn(`Ignoring blocked hostname: ${url.hostname}`);
              continue;
            }

            const waybackUrl = await client.getWaybackUrl(link);
            if (waybackUrl === null) {
              console.warn(`Detected unarchived link: ${link}`);
              // TODO: Implement optimistic saving so it can be retrieved in future?
              // await client.saveToWayback(link)
              continue;
            }
            if (!waybackUrl) {
              console.warn("Wayback URL is not null but not truthy either");
              continue;
            }
            result = result.replaceAll(link, waybackUrl);
          }

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

class WaybackMachineClient {
  async getWaybackUrl(url: string): Promise<string | null> {
    const apiUrl = `https://archive.org/wayback/available?url=${
      encodeURIComponent(url)
    }`;
    const response = await fetch(apiUrl);
    console.debug(`Get Wayback Machine link: ${response}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.archived_snapshots?.closest?.url || null;
  }

  async saveToWayback(url: string): Promise<void> {
    const saveUrl = `https://web.archive.org/save/${url}`;
    const response = await fetch(saveUrl, { method: "POST" });
    console.debug(`Save to Wayback Machine: ${response}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
}
