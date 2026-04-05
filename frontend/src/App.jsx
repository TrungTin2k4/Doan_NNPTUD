import { Navigate, Route, Routes } from 'react-router-dom'
import AdminRoute from './components/layout/AdminRoute.jsx'
import SiteLayout from './components/layout/SiteLayout.jsx'
import ProtectedRoute from './components/layout/ProtectedRoute.jsx'
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx'
import AdminCoursesPage from './pages/admin/AdminCoursesPage.jsx'
import AdminOrdersPage from './pages/admin/AdminOrdersPage.jsx'
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import CourseDetailPage from './pages/CourseDetailPage.jsx'
import CoursesPage from './pages/CoursesPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import HomePage from './pages/HomePage.jsx'
import LearnCoursePage from './pages/LearnCoursePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import MyLearningPage from './pages/MyLearningPage.jsx'
import OrderHistoryPage from './pages/OrderHistoryPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'

function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:slug" element={<CourseDetailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <Navigate to="/profile" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-learning"
          element={
            <ProtectedRoute>
              <MyLearningPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learn/:slug"
          element={
            <ProtectedRoute>
              <LearnCoursePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <AdminRoute>
              <AdminCoursesPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminOrdersPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <AdminRoute>
              <AdminCategoriesPage />
            </AdminRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
