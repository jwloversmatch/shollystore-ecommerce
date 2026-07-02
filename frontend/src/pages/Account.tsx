import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../features/auth/authSlice';
import toast from 'react-hot-toast';
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  Package,
  LogOut,
  Mail,
  User,
  Phone,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

// ---------- Types ----------
interface OrderItem {
  _id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  orderItems: Array<{ name: string; qty: number; price: number }>;
}

// Helper: Status Icon & Color (React.ReactNode avoids JSX.Element import)
const getStatusInfo = (status: string): { icon: React.ReactNode; color: string } => {
  const map: Record<string, { icon: React.ReactNode; color: string }> = {
    Paid: { icon: <CheckCircle className="w-4 h-4" />, color: 'bg-green-100 text-green-700' },
    Pending: { icon: <Clock className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-700' },
    Shipped: { icon: <Truck className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700' },
    Delivered: { icon: <Package className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700' },
  };
  return map[status] || { icon: <AlertCircle className="w-4 h-4" />, color: 'bg-gray-100 text-gray-700' };
};

const Account = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/my-orders`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(data);
        setError(null);
      } catch {
        setError('Could not load your orders. Please try again.');
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    toast.success('Logged out');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-pastel-pink via-pastel-green to-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-leaf-green" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 pt-20 md:pt-24 max-w-6xl mx-auto space-y-8"
    >
      {/* ---------- Header with User Info ---------- */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">My Account</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            {user?.email}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-full font-medium shadow-sm hover:shadow-md transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </motion.button>
      </motion.div>

      {/* ---------- Tabs ---------- */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-1 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'orders'
              ? 'border-leaf-green text-leaf-green'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          🧾 My Orders
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-1 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'profile'
              ? 'border-leaf-green text-leaf-green'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          👤 Profile Settings
        </button>
      </div>

      {/* ---------- Tab Content ---------- */}
      <AnimatePresence mode="wait">
        {activeTab === 'orders' ? (
          <motion.div
            key="orders"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Error State */}
            {error && (
              <div className="bg-red-50 text-red-700 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {/* Empty State */}
            {!error && orders.length === 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-6">Looks like you haven't placed any orders. Start shopping!</p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/')}
                  className="bg-leaf-green text-white px-6 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition"
                >
                  Browse Products
                </motion.button>
              </div>
            )}

            {/* Order List */}
            {orders.map((order, idx) => {
              const { icon, color } = getStatusInfo(order.status);
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100">
                    <div>
                      <p className="font-semibold text-gray-800">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('en-NG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${color}`}>
                      {icon}
                      {order.status}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="p-4 sm:p-6">
                    <div className="space-y-3">
                      {order.orderItems.map((item) => (
                        <div key={item.name} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700 font-medium">{item.name}</span>
                          <span className="text-gray-500">
                            {item.qty} × ₦{item.price.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                      <span className="text-gray-800 font-semibold">Total</span>
                      <span className="text-xl font-bold text-leaf-green">
                        ₦{order.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* View Details (optional) */}
                  <div className="bg-gray-50/50 px-4 sm:px-6 py-3 flex justify-end">
                    <button className="text-sm text-leaf-green font-medium hover:underline flex items-center gap-1">
                      View Details <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          /* Profile Settings Tab – now includes phone number */
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-leaf-green/10 flex items-center justify-center text-2xl">
                <User className="w-8 h-8 text-leaf-green" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{user?.name || 'User'}</h3>
                <p className="text-gray-500 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-gray-50/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Full Name</p>
                  <p className="font-medium text-gray-800 mt-1">{user?.name || 'Not set'}</p>
                </div>
                <div className="bg-gray-50/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Email Address</p>
                  <p className="font-medium text-gray-800 mt-1">{user?.email}</p>
                </div>
                {/* Phone Number */}
                <div className="bg-gray-50/50 rounded-xl p-4 sm:col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Phone Number</p>
                  <p className="font-medium text-gray-800 mt-1 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {user?.phone || 'Not set'}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50/50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Member Since</p>
                <p className="font-medium text-gray-800 mt-1">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-NG')
                    : 'N/A'}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-400">
              Profile editing coming soon. For now, enjoy your shopping experience!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Account;