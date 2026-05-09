import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Login } from './components/Login';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Authentications } from './pages/Authentications';
import { Rewards } from './pages/Rewards';
import { Transactions } from './pages/Transactions';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { GenerateRewardQR } from './pages/GenerateRewardQR';
import { QRCodeLabels } from './pages/QRCodeLabels';
import { Layout } from './components/Layout';
import { Sliders } from './pages/Sliders';
import { Ledger } from './pages/Ledger';
import { PriceList } from './pages/PriceList';
import { ProductCatalog } from './pages/ProductCatalog';
import { Schemes } from './pages/Schemes';
import { SendGift } from './pages/SendGift';
import './App.css';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#111111]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#E31E24]/30 border-t-[#E31E24] rounded-full animate-spin"></div>
          <p className="text-white/60 font-ubuntu-light">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <Users />
            </PrivateRoute>
          }
        />
        <Route
          path="/authentications"
          element={
            <PrivateRoute>
              <Authentications />
            </PrivateRoute>
          }
        />
        <Route
          path="/rewards"
          element={
            <PrivateRoute>
              <Rewards />
            </PrivateRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <PrivateRoute>
              <Transactions />
            </PrivateRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <PrivateRoute>
              <Analytics />
            </PrivateRoute>
          }
        />
        <Route
          path="/sliders"
          element={
            <PrivateRoute>
              <Sliders />
            </PrivateRoute>
          }
        />
        <Route
          path="/price-list"
          element={
            <PrivateRoute>
              <PriceList />
            </PrivateRoute>
          }
        />
        <Route
          path="/product-catalog"
          element={
            <PrivateRoute>
              <ProductCatalog />
            </PrivateRoute>
          }
        />
        <Route
          path="/ledger"
          element={
            <PrivateRoute>
              <Ledger />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route
          path="/generate-qr"
          element={
            <PrivateRoute>
              <GenerateRewardQR />
            </PrivateRoute>
          }
        />
        <Route
          path="/qr-labels"
          element={
            <PrivateRoute>
              <QRCodeLabels />
            </PrivateRoute>
          }
        />
        <Route
          path="/schemes"
          element={
            <PrivateRoute>
              <Schemes />
            </PrivateRoute>
          }
        />
        <Route
          path="/send-gift"
          element={
            <PrivateRoute>
              <SendGift />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
