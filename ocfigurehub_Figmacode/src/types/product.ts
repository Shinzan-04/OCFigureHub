export interface Product {
  id: string;
  name: string;
  category: string;
  creator: string;
  price: number;
  previewModelUrl?: string;
  isPro: boolean;
  isEnabled: boolean;
  thumbnailUrl?: string;
  tags?: string;
}

export interface ProductFile {
  id: string;
  fileType: number; // 1=Model, 2=Preview, 3=Thumbnail
  format: string;
  fileSize: number;
}

export interface ProductDetail extends Product {
  description: string;
  files: ProductFile[];
  isOwnedByUser: boolean;
  hasActiveSubscription: boolean;
  remainingDownloads: number;
}
