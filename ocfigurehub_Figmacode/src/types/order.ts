export interface BuyNowRequest {
  productId: string;
  licenseType: number; // 0=Personal, 1=Commercial
}

export interface OrderDto {
  orderId: string;
  status: number; // 0=Pending, 1=Paid, 2=Expired
  totalAmount: number;
}

export interface CreatePaymentRequest {
  orderId: string;
  amount: number;
}

export interface CreatePaymentResponse {
  orderId: string;
  paymentUrl: string;
}
