export interface DownloadRequest {
  productId: string;
  format: string; // "STL" | "OBJ"
}

export interface DownloadResponse {
  signedUrl: string;
  expiresAtUtc: string;
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
