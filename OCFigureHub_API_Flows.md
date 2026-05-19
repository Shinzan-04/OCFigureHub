# OCFigureHub - API & System Flows Overview

Tài liệu này tổng hợp các luồng (flows), các API đã được thực hiện ở Backend (ASP.NET Core) và đã tích hợp ở Frontend (React/Vite). Đồng thời liệt kê các tính năng/API cần bổ sung để Frontend hoàn toàn gỡ bỏ dữ liệu giả (mock data) và chuyển sang dùng 100% dữ liệu thật.

---

## 🎯 Các Flow và API Đã Hoàn Thành

### 1. Authentication & Authorization Flow
Hệ thống sử dụng JWT (JSON Web Token) cho việc xác thực. Token được trả về và lưu ở Zustand store (`authStore.ts`) trên Frontend.
*   **Đăng ký / Đăng nhập nội bộ:**
    *   `POST /api/auth/register`: Tạo tài khoản mới.
    *   `POST /api/auth/login`: Đăng nhập bằng Email/Password.
*   **Social OAuth Login (Google & Facebook):**
    *   `POST /api/auth/google`: Gửi Token từ Google Client về BE để xác thực chữ ký và tự động cấp/tạo tài khoản.
    *   `POST /api/auth/facebook`: Gửi Access Token của Facebook về BE, BE gọi Graph API để lấy thông tin và cấp/tạo tài khoản.

### 2. Product Management Flow (Public & Admin)
*   **Public (Customer):**
    *   `GET /api/products`: Lấy danh sách toàn bộ sản phẩm.
    *   `GET /api/products/{id}`: Lấy chi tiết sản phẩm.
*   **Admin:**
    *   `POST /api/admin/products`: Tạo sản phẩm mới.
    *   `PUT /api/admin/products/{id}`: Cập nhật thông tin.
    *   `DELETE /api/admin/products/{id}`: Xóa sản phẩm.
    *   `POST /api/admin/products/{id}/upload`: Upload file cho sản phẩm (Model 3D, Preview, Thumbnail) lưu trữ trên Azure Blob.

### 3. Secure Download Flow (Anti-leak)
Luồng tải file chống chia sẻ link trái phép (One-time token & Auth validation).
*   `POST /api/downloads/request`: Yêu cầu cấp `tokenId` sử dụng 1 lần, có thời hạn 5 phút.
*   `GET /api/downloads/file/{tokenId}`: Trình duyệt chuyển hướng tới link này. BE xác thực `tokenId`, stream file trực tiếp từ Azure Blob về cho Client (cho phép dễ dàng chèn Watermark trong tương lai).
*   `GET /api/downloads/history`: Lịch sử tải file của User.

### 4. Order & Payment Flow (VNPay)
*   `POST /api/orders/buy-now`: Tạo đơn hàng trực tiếp.
*   `POST /api/payments/vnpay-create`: Tạo URL thanh toán VNPay cho đơn hàng.
*   `GET /api/payments/vnpay-return`: Xử lý khi User được VNPay redirect về Frontend, FE gọi API này để check tính hợp lệ.
*   `POST /api/payments/vnpay-ipn`: Webhook ẩn cho VNPay gọi vào BE để cập nhật trạng thái đơn hàng (Đảm bảo an toàn không bị drop).

### 5. Subscription Flow (Gói thành viên)
*   `GET /api/subscription-plans`: Lấy danh sách các gói (Pro, Max, v.v...).
*   `GET /api/subscriptions/me`: Xem trạng thái gói thành viên hiện tại của User.
*   `POST /api/subscriptions/subscribe`: Đăng ký nâng cấp gói.

---

## 🚀 Các API Cần Làm Thêm (Để FE gỡ bỏ Mock Data)

Sau khi rà soát Frontend, dưới đây là những dữ liệu đang bị "cứng" (hardcode) trên React cần được thay thế bằng API thực tế:

### 1. Wishlist / Saved Items API
Hiện tại trang `SavedPage.tsx` đang đọc từ `PRODUCTS` giả lập.
*   **Cần làm ở BE:**
    *   `POST /api/users/me/saved/{productId}`: Thêm vào danh sách yêu thích.
    *   `DELETE /api/users/me/saved/{productId}`: Xóa khỏi danh sách yêu thích.
    *   `GET /api/users/me/saved`: Lấy danh sách các sản phẩm đã lưu.

### 2. Category & Tag API
Trang chủ (`HomePage.tsx`) đang hardcode mảng `CATEGORIES` (`all`, `free`, `anime`, `monsters`).
*   **Cần làm ở BE:**
    *   `GET /api/categories`: Lấy danh sách danh mục thực tế từ Database.
    *   (Tùy chọn) `GET /api/tags`: Lấy danh sách các tags phổ biến.

### 3. Phân trang, Lọc & Tìm kiếm Sản phẩm (Pagination & Filtering)
Hiện tại `GET /api/products` trả về toàn bộ và FE đang dùng `useMemo` để lọc (Client-side filtering). Điều này sẽ làm sập trình duyệt nếu có 10.000+ sản phẩm.
*   **Cần làm ở BE:**
    *   Cập nhật `GET /api/products` nhận các Query Params: 
        *   `?page=1&pageSize=20` (Phân trang)
        *   `?search=naruto` (Tìm kiếm theo tên/mô tả)
        *   `?categoryId=...` (Lọc danh mục)
        *   `?isFree=true` (Lọc hàng miễn phí)

### 4. Featured/Trending Products
Tại `HomePage.tsx`, mục "Hero Carousel" đang cắt 4 sản phẩm đầu tiên (`products.slice(0, 4)`) để làm nổi bật.
*   **Cần làm ở BE:**
    *   `GET /api/products/featured`: Trả về top 4-5 sản phẩm nổi bật (dựa trên lượt xem, lượt tải, hoặc do Admin đánh dấu `IsFeatured`).

### 5. User Profile
*   **Cần làm ở BE:**
    *   `GET /api/users/me`: Lấy đầy đủ thông tin User (Avatar, Ngày tham gia, Cấp bậc...).
    *   `PUT /api/users/me`: Cập nhật thông tin cá nhân.
    *   `POST /api/users/me/avatar`: Upload Avatar lên Azure Blob.

### 6. Review & Rating (Đánh giá)
(Nếu dự án có yêu cầu).
*   **Cần làm ở BE:**
    *   `POST /api/products/{id}/reviews`: Thêm đánh giá (Chỉ cho người đã mua/tải).
    *   `GET /api/products/{id}/reviews`: Lấy danh sách đánh giá của sản phẩm đó.
