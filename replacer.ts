import { WaybackMachineClient } from "./wayback.ts";

// TODO: Avoid links from matching prematurely?
export const URL_REGEX = /https?:\/\/[^\s\)>\]]+/g;

export const HOSTNAMES_BLOCKED = [
  "0.0.0.0",
  // Localhost
  "localhost",
  "127.0.0.1",
  "::1",
  // Wayback Machine
  "web.archive.org",
];

export type StatusCallback = (text: string) => void;

/**
 * Logic to convert hyperlinks to archive web links
 */
export class LinkReplacer {
  private client: WaybackMachineClient;

  constructor(client: WaybackMachineClient) {
    this.client = client;
  }

  /**
   * Replace all HTTP/HTTPS links in the given content with their Wayback Machine URLs
   * @param content - The text content to process
   * @param statusCallback - Callback for progress updates
   * @returns Promise resolving to the content with replaced links
   */
  async replaceLinksInContent(
    content: string,
    statusCallback: StatusCallback,
  ): Promise<string> {
    const links = [...new Set(content.match(URL_REGEX) || [])];
    if (links.length === 0) {
      return content;
    }

    let result = content;
    for (const [idx, link] of links.entries()) {
      statusCallback(
        `Wayback: Replacing ${idx + 1} of ${links.length} link(s)...`,
      );

      const url = new URL(link);
      if (HOSTNAMES_BLOCKED.includes(url.hostname)) {
        console.warn(`Ignoring blocked hostname: ${url.hostname}`);
        continue;
      }

      const waybackUrl = await this.client.getWaybackUrl(link);
      if (waybackUrl === null) {
        console.warn(`Detected unarchived link: ${link}`);
        // TODO: Implement optimistic saving so it can be retrieved in future?
        // await this.client.saveToWayback(link)
        continue;
      }
      if (!waybackUrl) {
        console.warn("Wayback URL is not null but not truthy either");
        continue;
      }
      result = result.replaceAll(link, waybackUrl);
    }

    return result;
  }
}
