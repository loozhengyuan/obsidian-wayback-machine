import { WaybackMachineClient } from "./wayback.ts";

// TODO: Avoid links from matching prematurely?
export const URL_REGEX = /https?:\/\/[^\s\)>\]]+/g;

export type LinkProcessCallback = (link: string) => void;
export type LinkIgnoreCallback = (link: string) => void;
export type LinkReplaceCallback = (link: string) => void;

export type LinkReplacerOptions = {
  onLinkProcess?: LinkProcessCallback;
  onLinkIgnore?: LinkIgnoreCallback;
  onLinkReplace?: LinkReplaceCallback;
};

/**
 * Logic to convert hyperlinks to archive web links
 */
export class LinkReplacer {
  private client: WaybackMachineClient;
  private onLinkProcess?: LinkProcessCallback;
  private onLinkIgnore?: LinkIgnoreCallback;
  private onLinkReplace?: LinkReplaceCallback;

  constructor(client: WaybackMachineClient, options?: LinkReplacerOptions) {
    this.client = client;
    this.onLinkProcess = options?.onLinkProcess;
    this.onLinkIgnore = options?.onLinkIgnore;
    this.onLinkReplace = options?.onLinkReplace;
  }

  /**
   * Replace all HTTP/HTTPS links in the given content with their Wayback Machine URLs
   * @param content - The text content to process
   * @returns Promise resolving to the content with replaced links
   */
  async replace(content: string): Promise<string> {
    const matches = content.match(URL_REGEX);
    if (!matches) {
      return content;
    }
    const links = matches.unique();

    let result = content;
    for (const link of links) {
      this.onLinkProcess?.(link);

      if (!this.isLinkValid(link)) {
        console.warn(`Ignoring hostname: ${link}`);
        this.onLinkIgnore?.(link);
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

      this.onLinkReplace?.(link);
    }

    return result;
  }

  private isLinkValid(link: string): boolean {
    const url = new URL(link);
    if (!url.hostname || url.hostname.trim() === "") {
      return false;
    }
    if (
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "::1"
    ) {
      return false;
    }
    if (url.hostname === "web.archive.org") {
      return false;
    }
    return true;
  }
}
