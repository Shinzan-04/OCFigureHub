Enhance the OC Figure Hub marketplace prototype with authentication, membership subscriptions, and QR payment flows.

The website should simulate real behavior but run entirely on the client side without a backend.

Use localStorage or client-side state to store user login status, membership plan, and purchased products.

---

AUTHENTICATION SYSTEM

Create a login system using client-side logic.

Login form fields:
Email
Password

If the credentials match:

Email: [admin@gmail.com](mailto:admin@gmail.com)
Password: 123123

Then assign the user role = admin.

Otherwise assign role = user.

Store login state in localStorage.

Example:

localStorage.user = {
email,
role
}

After login redirect to Home.

---

ADMIN BUTTON VISIBILITY

In the navbar:

Show a button called:

Admin Dashboard

Only display this button if:

user.role === "admin"

Normal users must not see this button.

---

ADMIN DASHBOARD ACCESS

Admin dashboard route:

/admin-dashboard

If a non-admin tries to open this page:

Redirect them to Home.

Show message:

"You do not have permission to access this page."

---

MEMBERSHIP SYSTEM

Create 3 membership plans.

FREE
Price: 0 VND
Access: limited resources

PRO
Price: 250,000 VND
Access: premium resources

ULTIMATE
Price: 620,000 VND
Access: all resources + exclusive models

Store membership plan in localStorage.

Example:

localStorage.membership = "FREE" | "PRO" | "ULTIMATE"

---

MEMBERSHIP PURCHASE FLOW

When user clicks "Đăng kí ngay" on membership page:

Redirect to:

/payment-membership

Display selected plan information:

Plan name
Price
Benefits

Show a large QR payment block.

Payment instructions:

1. Scan QR code with banking app
2. Transfer correct amount
3. Click "Tôi đã thanh toán"

When user clicks confirm:

Update membership in localStorage.

Example:

localStorage.membership = selectedPlan

Show success message:

"Thanh toán thành công. Membership đã được kích hoạt."

Redirect to Home.

---

PRODUCT PURCHASE FLOW

On each resource page:

Add button:

Mua ngay

If resource is FREE:

Allow direct download.

If resource requires PRO or ULTIMATE:

Check membership.

If user does not have required plan:

Show message:

"Bạn cần nâng cấp membership để tải sản phẩm này."

Provide upgrade button.

---

PAID PRODUCT PAYMENT

If user chooses to buy product individually:

Redirect to:

/payment-product

Payment page includes:

Product image
Product name
Price
QR payment code

Payment steps:

1. Scan QR
2. Transfer payment
3. Click "Tôi đã thanh toán"

After confirmation:

Save purchase in localStorage.

Example:

localStorage.purchasedProducts = [productId]

Allow download.

---

SAVED PRODUCTS

Users can click the heart icon on cards.

Saved items are stored in localStorage.

Example:

localStorage.savedProducts = [productId]

Display saved items in:

/saved

---

DEMO PAYMENT SYSTEM

This is only a simulated payment.

The QR code does not connect to a real payment gateway.

When the user clicks:

"Tôi đã thanh toán"

The system should simulate success and unlock access.

---

ADMIN DASHBOARD FEATURES

Admin can manage:

Resources
Users
Membership plans
Orders

Dashboard sections:

Overview statistics
Resource management
User list
Membership subscribers
Orders history

Admin can:

Add resource
Edit resource
Delete resource

---

RESPONSIVE DESIGN

Ensure all features work on:

Desktop
Tablet
Mobile

Navbar collapses to hamburger menu on mobile.

Tables convert to cards on small screens.

Use Auto Layout and responsive components.
