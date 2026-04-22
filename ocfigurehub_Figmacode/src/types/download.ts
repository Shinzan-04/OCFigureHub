export interface DownloadRequest {
  productId: string;
  format: string; // "STL" | "OBJ"
}

export interface DownloadResponse {
  tokenId: string;
  expiresAtUtc: string;
  expireInSeconds: number;
  requiresDownloadStep: boolean;
}

export interface DownloadHistory {
  id: string;
  productId: string;
  productName: string;
  thumbnailUrl: string | null;
  orderId: string | null;
  subscriptionId: string | null;
  success: boolean;
  failureReason: string | null;
  downloadedAt: string;
}
