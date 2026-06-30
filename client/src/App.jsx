import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import LandingPage from './pages/LandingPage';
import ReviewsPage from './pages/ReviewsPage';
import TeacherDetailPage from './pages/TeacherDetailPage';

export default function App() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main className="main-content">
        <div key={location.pathname} className="page-enter">
          <Routes location={location}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/teacher/:id" element={<TeacherDetailPage />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </>
  );
}
