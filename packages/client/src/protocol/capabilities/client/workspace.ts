/**
 * Workspace specific client capabilities.
 */
export interface WorkspaceClientCapabilities {
  /**
   * The client supports applying batch edits to the workspace by supporting
   * the request 'workspace/applyEdit'
   */
  applyEdit?: boolean;
}
