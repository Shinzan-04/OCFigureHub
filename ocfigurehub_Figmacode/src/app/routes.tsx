import { createBrowserRouter } from 'react-router';
import { Root } from './pages/Root';
import { HomePage } from './pages/HomePage';
import { MembershipPage } from './pages/MembershipPage';
import { AboutPage } from './pages/AboutPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { SavedPage } from './pages/SavedPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { CategoryPage } from './pages/CategoryPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { PaymentMembershipPage } from './pages/PaymentMembershipPage';
import { PaymentProductPage } from './pages/PaymentProductPage';
import { PaymentResultPage } from './pages/PaymentResultPage';
import { DownloadHistoryPage } from './pages/DownloadHistoryPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Route guards
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';

// Admin
import { AdminLayout } from './admin/AdminLayout';
import { AdminDashboard } from './admin/AdminDashboard';
import { AdminResources } from './admin/AdminResources';
import { AdminCategories } from './admin/AdminCategories';
import { AdminUsers } from './admin/AdminUsers';
import { AdminOrders } from './admin/AdminOrders';
import { AdminMembership } from './admin/AdminMembership';
import { AdminSavedItems } from './admin/AdminSavedItems';
import { AdminAnalytics } from './admin/AdminAnalytics';
import { AdminContent } from './admin/AdminContent';
import { AdminSettings } from './admin/AdminSettings';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: 'upgrade', Component: MembershipPage },
      { path: 'about-us', Component: AboutPage },
      { path: 'sign-in', Component: SignInPage },
      { path: 'sign-up', Component: SignUpPage },
      { path: 'forgot-password', Component: ForgotPasswordPage },
      { path: 'free', Component: CategoryPage },
      { path: 'anime', Component: CategoryPage },
      { path: 'monsters', Component: CategoryPage },
      { path: 'product/:id', Component: ProductDetailPage },
      { path: 'vnpay-return', Component: PaymentResultPage },
      // Protected routes (require login)
      {
        Component: ProtectedRoute,
        children: [
          { path: 'saved', Component: SavedPage },
          { path: 'payment-membership', Component: PaymentMembershipPage },
          { path: 'payment-product', Component: PaymentProductPage },
          { path: 'download-history', Component: DownloadHistoryPage },
        ],
      },
      { path: '*', Component: NotFoundPage },
    ],
  },
  {
    path: '/admin',
    Component: AdminRoute,
    children: [
      {
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminDashboard },
          { path: 'resources', Component: AdminResources },
          { path: 'categories', Component: AdminCategories },
          { path: 'users', Component: AdminUsers },
          { path: 'orders', Component: AdminOrders },
          { path: 'membership', Component: AdminMembership },
          { path: 'saved', Component: AdminSavedItems },
          { path: 'analytics', Component: AdminAnalytics },
          { path: 'content', Component: AdminContent },
          { path: 'settings', Component: AdminSettings },
        ],
      },
    ],
  },
]);
