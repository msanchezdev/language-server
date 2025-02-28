import type { WorkspaceClientCapabilities } from './workspace';

export interface ClientCapabilities {
  /**
   * Workspace specific client capabilities.
   */
  workspace?: WorkspaceClientCapabilities;
}
