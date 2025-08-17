import type { WaybackMachineClient } from "./wayback.ts";
import { 
  URL_REGEX, 
  HOSTNAMES_BLOCKED, 
  STATUS_MESSAGES,
  LOG_MESSAGES 
} from "./constants.ts";

/**
 * Interface for status reporting functionality
 */
export interface StatusReporter {
  setText(text: string): void;
}

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
   * @param status - Status reporter for progress updates
   * @returns Promise resolving to the content with replaced links
   */
  async replaceLinksInContent(
    content: string,
    status: StatusReporter,
  ): Promise<string> {
    const links = [...new Set(content.match(URL_REGEX) || [])];
    if (links.length === 0) {
      return content;
    }

    let result = content;
    for (const [idx, link] of links.entries()) {
      status.setText(STATUS_MESSAGES.REPLACING(idx + 1, links.length));

      const url = new URL(link);
      if (HOSTNAMES_BLOCKED.includes(url.hostname as typeof HOSTNAMES_BLOCKED[number])) {
        console.warn(LOG_MESSAGES.IGNORING_BLOCKED_HOSTNAME(url.hostname));
        continue;
      }

      const waybackUrl = await this.client.getWaybackUrl(link);
      if (waybackUrl === null) {
        console.warn(LOG_MESSAGES.UNARCHIVED_LINK_DETECTED(link));
        // TODO: Implement optimistic saving so it can be retrieved in future?
        // await this.client.saveToWayback(link)
        continue;
      }
      if (!waybackUrl) {
        console.warn(LOG_MESSAGES.WAYBACK_URL_INVALID);
        continue;
      }
      result = result.replaceAll(link, waybackUrl);
    }

    return result;
  }
}
