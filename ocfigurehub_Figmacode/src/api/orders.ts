import API from './client';
import type { BuyNowRequest, OrderDto, CreatePaymentRequest, CreatePaymentResponse } from '../types/order';

export const ordersApi = {
  buyNow: async (data: BuyNowRequest): Promise<OrderDto> => {
    const res = await API.post<OrderDto>('/orders/buy-now', data);
    return res.data;
  },

  createPayment: async (data: CreatePaymentRequest): Promise<CreatePaymentResponse> => {
    const res = await API.post<CreatePaymentResponse>('/payments/vnpay-create', data);
    return res.data;
  },

  verifyPayment: async (queryString: string): Promise<{ success: boolean; orderId?: string; message: string }> => {
    const res = await API.get(`/payments/vnpay-return${queryString}`);
    return res.data;
  },
};
