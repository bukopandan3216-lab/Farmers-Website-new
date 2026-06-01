import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { X, ChevronDown, Search, TrendingUp, Users, Package, ShoppingBag, BarChart3, ClipboardCheck, Mail, Trash2, ArrowUpRight, DollarSign } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { OrderDetailsModal } from "../components/OrderDetailsModal";
import { Textarea } from "../components/ui/textarea";
import { marketplaceApi, orderApi, messageApi, applicationApi, userApi } from "../services/api";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

/* ─── PLACEHOLDER IMAGE ─────────────────────────────────────────────── */

const PLACEHOLDER = "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400&q=80";

/* ─── STATUS BADGE ──────────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const normalized = (status || "").toString().toLowerCase();
  const cfg: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700",
    pending: "bg-amber-50 text-amber-700",
    "pending-setup": "bg-amber-50 text-amber-700",
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold ${cfg[normalized] || "bg-gray-100 text-gray-600"}`}>
      {normalized.charAt(0).toUpperCase() + normalized.slice(1).replace(/-/g, " ")}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const normalized = (role || "").toString().toLowerCase();
  const cfg: Record<string, string> = {
    farmer: "bg-green-100 text-green-800",
    buyer: "bg-blue-100 text-blue-800",
    admin: "bg-purple-100 text-purple-800",
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold ${cfg[normalized] || "bg-gray-100 text-gray-600"}`}>
      {normalized.charAt(0).toUpperCase() + normalized.slice(1)}
    </span>
  );
}

/* ─── USER DETAILS MODAL ────────────────────────────────────── */

function UserDetailsModal({ user, onClose, onApprove, onReject }: {
  user: any;
  onClose: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}) {
  if (!user) return null;

  const profileImage = user.profileImageUrl || user.avatar || user.face_photo || PLACEHOLDER;
  const idImage = user.photoWithIdUrl || user.validIdUrl || user.valid_id_url || user.id_photo || PLACEHOLDER;
  const normalizedRole = (user.role || "").toString().toLowerCase();
  const normalizedStatus = (user.status || "active").toString().toLowerCase();
  const createdAt = user.createdAt || user.created_at;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">User Details & Verification</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 3-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Photos */}
          <div className="space-y-3">
            <div>
              <ImageWithFallback
                src={profileImage}
                alt={user.fullName || user.full_name || "Applicant"}
                className="w-full h-48 object-cover rounded-xl"
              />
              <p className="text-xs text-gray-400 mt-1">Profile Photo</p>
            </div>
            <div>
              <ImageWithFallback
                src={idImage}
                alt="Valid ID"
                className="w-full h-48 object-cover rounded-xl"
              />
              <p className="text-xs text-gray-400 mt-1">Valid ID</p>
            </div>
          </div>

          {/* Column 2: User Info */}
          <div className="space-y-3">
            {[
              { label: "Full Name", value: user.fullName || user.full_name },
              { label: "Email", value: user.email },
              { label: "Role", value: <RoleBadge role={normalizedRole} /> },
              { label: "Status", value: <StatusBadge status={normalizedStatus} /> },
              { label: "Applied Date", value: new Date(createdAt).toLocaleDateString("en-PH") },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-400">{label}</p>
                <div className="font-medium text-gray-900">{value}</div>
              </div>
            ))}
            <hr className="border-gray-200" />
            {normalizedRole === "farmer" && (
              <div className="space-y-2 text-sm text-gray-700">
                <p><span className="font-semibold">Store:</span> {user.store_name || "N/A"}</p>
                <p><span className="font-semibold">Farm Location:</span> {user.farm_location || "N/A"}</p>
                <p><span className="font-semibold">Bio:</span> {user.bio || "N/A"}</p>
                <p><span className="font-semibold">Products:</span> {user.product_count ?? 0}</p>
                <p><span className="font-semibold">Total Orders:</span> {user.total_orders ?? 0}</p>
                <p><span className="font-semibold">Revenue:</span> ₱{(user.total_revenue ?? 0).toLocaleString()}</p>
                <p><span className="font-semibold">Avg Rating:</span> {(user.avg_rating ?? 0).toFixed(2)} ⭐</p>
              </div>
            )}
            {normalizedRole === "buyer" && (
              <div className="space-y-2 text-sm text-gray-700">
                <p><span className="font-semibold">City:</span> {user.buyer_city || "N/A"}</p>
                <p><span className="font-semibold">Province:</span> {user.buyer_province || "N/A"}</p>
                <p><span className="font-semibold">Delivery Address:</span> {user.delivery_address || "N/A"}</p>
                <p><span className="font-semibold">Total Orders:</span> {user.order_count ?? 0}</p>
                <p><span className="font-semibold">Total Spent:</span> ₱{(user.total_spent ?? 0).toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Column 3: Analytics */}
          <div>
            {user.role === "farmer" && user.analytics?.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: "Products", value: user.product_count ?? 0 },
                    { label: "Orders", value: user.total_orders ?? 0 },
                    { label: "Revenue", value: `₱${(user.total_revenue ?? 0).toLocaleString()}` },
                    { label: "Rating", value: `${(user.avg_rating ?? 0).toFixed(2)} ⭐` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="font-bold text-gray-900 text-sm mt-1">{value}</p>
                    </div>
                  ))}
                </div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Monthly Analytics</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 text-left">Month</th>
                        <th className="p-2 text-left">Sales</th>
                        <th className="p-2 text-left">Orders</th>
                        <th className="p-2 text-left">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.analytics.map((row: any) => (
                        <tr key={`${row.month}-${row.year}`} className="border-t border-gray-100">
                          <td className="p-2">{row.month}/{row.year}</td>
                          <td className="p-2">₱{Number(row.total_sales).toLocaleString()}</td>
                          <td className="p-2">{row.total_orders}</td>
                          <td className="p-2">{Number(row.avg_rating).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-400 flex flex-col items-center justify-center h-full min-h-32 gap-2">
                <BarChart3 className="w-8 h-8 opacity-30" />
                <p>No analytics data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          {normalizedStatus === "pending" && onApprove && onReject ? (
            <>
              <button
                onClick={() => { onApprove(user.id); onClose(); }}
                className="px-5 py-2 rounded-lg bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-colors"
              >
                ✓ Approve Application
              </button>
              <button
                onClick={() => { onReject(user.id); onClose(); }}
                className="px-5 py-2 rounded-lg bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors"
              >
                ✗ Reject Application
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── STAT CARD ─────────────────────────────────────────────── */

function StatCard({ label, value, colorClass, borderClass }: {
  label: string; value: string | number; colorClass: string; borderClass?: string;
}) {
  return (
    <div className={`${colorClass} ${borderClass ? `border-l-4 ${borderClass}` : ""} p-5 rounded-xl`}>
      <p className="text-xs uppercase font-semibold opacity-70 mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

/* ─── TAB BUTTON ────────────────────────────────────────────── */

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 text-sm font-semibold border-b-[3px] transition-colors -mb-[2px] ${
        active
          ? "text-emerald-600 border-emerald-500"
          : "text-gray-500 border-transparent hover:text-gray-800"
      }`}
    >
      {label}
    </button>
  );
}

function SubTabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-xs font-semibold rounded-lg border-[1.5px] transition-colors ${
        active
          ? "bg-emerald-500 text-white border-emerald-500"
          : "bg-white text-gray-500 border-gray-300 hover:border-emerald-500 hover:text-emerald-600"
      }`}
    >
      {label}
    </button>
  );
}

/* ─── ADMIN DASHBOARD ───────────────────────────────────────── */

export function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const userFirstName =
    user?.full_name?.trim()?.split(" ")[0] ||
    user?.fullName?.trim()?.split(" ")[0] ||
    "Admin";

  const [activeTab, setActiveTab] = useState("analytics");
  const [applicantRole, setApplicantRole] = useState<"farmer" | "buyer">("farmer");
  const [userFilter, setUserFilter] = useState("all");
  const [productSearch, setProductSearch] = useState("");
  const [productSort, setProductSort] = useState("name-asc");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalAction, setModalAction] = useState<"verify" | "view">("view");
  const [contactFilter, setContactFilter] = useState("all");
  const [contactSearch, setContactSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const [applicants, setApplicants] = useState<{ farmer: any[]; buyer: any[] }>({ farmer: [], buyer: [] });
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isRefreshingUsers, setIsRefreshingUsers] = useState(false);

  useEffect(() => {
    if (isLoading) return; // Wait for auth to be restored
    if (!isAuthenticated || user?.role !== "ADMIN") {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return; // Wait for auth to be restored
    
    let mounted = true;

    const fetchPendingApplications = async () => {
      try {
        const data = await applicationApi.list({ status: "PENDING", take: 100 });
        if (!mounted) return;

        const apps = Array.isArray(data?.applications) ? data.applications : [];
        const normalizedApplications = apps.map((app: any) => ({
          ...app,
          role: (app.role || "").toString().toLowerCase(),
          createdAt: app.createdAt || app.created_at,
          imageUrl: app.profileImageUrl || app.photoWithIdUrl || app.validIdUrl || PLACEHOLDER,
          farmLocation: app.farmAddress || app.farm_location,
          status: (app.status || "pending").toString().toLowerCase(),
        }));

        setApplicants({
          farmer: normalizedApplications.filter((app: any) => app.role === "farmer"),
          buyer: normalizedApplications.filter((app: any) => app.role === "buyer"),
        });
      } catch (error) {
        console.error("Failed to load pending applications:", error);
        if (!mounted) return;
        setApplicants({ farmer: [], buyer: [] });
      }
    };

    const fetchUsers = async () => {
      try {
        const users = await userApi.list();
        if (!mounted) return;
        setAllUsers(
          (Array.isArray(users) ? users : []).map((u: any) => {
            const roleLower = (u.role || "").toString().toLowerCase();
            const accountSetupCompleted = u.accountSetupCompleted ?? true; // treat undefined as already completed
            const status = roleLower === 'admin' ? 'active' : (accountSetupCompleted ? (u.status || 'active').toString().toLowerCase() : 'pending-setup');
            return {
              ...u,
              status,
              role: roleLower,
              createdAt: u.createdAt || u.created_at,
            };
          })
        );
      } catch (error) {
        console.error("Failed to load users:", error);
        if (!mounted) return;
        setAllUsers([]);
      }
    };

    orderApi.list()
      .then((data) => {
        if (!mounted) return;
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!mounted) return;
        setOrders([]);
      });

    marketplaceApi.products({ take: 100 })
      .then((res) => {
        if (!mounted) return;
        setProducts(res?.products || res || []);
      })
      .catch(() => {
        if (!mounted) return;
        setProducts([]);
      });

    messageApi.list()
      .then((msgs) => {
        if (!mounted) return;
        const groups: Record<string, any> = {};
        msgs.forEach((m: any, idx: number) => {
          const key = m.sender?.id || m.senderId || m.sender?.fullName || `msg-${idx}`;
          if (!groups[key]) {
            groups[key] = {
              id: key,
              full_name: m.sender?.fullName || m.sender?.id || "Unknown",
              email: m.sender?.email || "",
              subject: m.content?.slice(0, 60),
              message: m.content,
              createdAt: m.createdAt || m.created_at,
              status: m.read ? "replied" : "new",
              senderId: m.sender?.id || m.senderId,
            };
          }
        });
        setContactMessages(Object.values(groups));
      })
      .catch(() => {
        if (!mounted) return;
        setContactMessages([]);
      });

    fetchPendingApplications();
    fetchUsers();

    // Auto-refresh user list every 10 seconds to show real-time status updates
    const userListInterval = setInterval(() => {
      if (mounted) fetchUsers();
    }, 10000);

    return () => { 
      mounted = false;
      clearInterval(userListInterval);
    };
  }, [isLoading, isAuthenticated]);

  if (!user || user.role !== "ADMIN") return null;

  /* ─── FETCH FUNCTIONS ──────────────────────────────────────────────── */

  const fetchUsers = async () => {
    try {
      setIsRefreshingUsers(true);
      const users = await userApi.list();
      setAllUsers(
        (Array.isArray(users) ? users : []).map((u: any) => {
          const roleLower = (u.role || "").toString().toLowerCase();
          const accountSetupCompleted = u.accountSetupCompleted ?? true; // treat undefined as already completed
          const status = roleLower === 'admin' ? 'active' : (accountSetupCompleted ? (u.status || 'active').toString().toLowerCase() : 'pending-setup');
          return {
            ...u,
            status,
            role: roleLower,
            createdAt: u.createdAt || u.created_at,
          };
        })
      );
    } catch (error) {
      console.error("Failed to load users:", error);
      setAllUsers([]);
    } finally {
      setIsRefreshingUsers(false);
    }
  };

  /* ─── HANDLERS ─────────────────────────────────────────────── */

  const openUserModal = (u: any, action: "verify" | "view") => {
    setSelectedUser(u);
    setModalAction(action);
  };

  const handleApprove = async (id: string) => {
    try {
      await applicationApi.approve(id);
      setApplicants(prev => ({
        farmer: prev.farmer.filter(a => a.id !== id),
        buyer: prev.buyer.filter(a => a.id !== id),
      }));
      try {
        const users = await userApi.list();
        setAllUsers(
          (Array.isArray(users) ? users : []).map((u: any) => {
            const roleLower = (u.role || '').toString().toLowerCase();
            const accountSetupCompleted = u.accountSetupCompleted ?? true;
            const status = roleLower === 'admin' ? 'active' : (accountSetupCompleted ? (u.status || 'active').toString().toLowerCase() : 'pending-setup');
            return {
              ...u,
              status,
              role: roleLower,
              createdAt: u.createdAt || u.created_at,
            };
          })
        );
      } catch (err) {
        console.error('Failed to refresh users after approval:', err);
      }
    } catch (error) {
      console.error("Approve application failed:", error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await applicationApi.reject(id, "Application rejected by admin");
      setApplicants(prev => ({
        farmer: prev.farmer.filter(a => a.id !== id),
        buyer: prev.buyer.filter(a => a.id !== id),
      }));
    } catch (error) {
      console.error("Reject application failed:", error);
    }
  };

  /* ─── DERIVED DATA ──────────────────────────────────────────── */

  const currentApplicants = applicants[applicantRole] || [];

  const filteredUsers = allUsers.filter(u => {
    if (userFilter === "all") return true;
    if (userFilter === "pending-setup") return u.status === "pending-setup";
    return u.role === userFilter || u.status === userFilter;
  });

  const ordersList = orders;
  const productsList = products;

  const filteredProducts = (() => {
    const term = (productSearch ?? "").toLowerCase();
    let list = productsList.filter(p =>
      (p.name ?? "").toLowerCase().includes(term) ||
      (p.store_name ?? "").toLowerCase().includes(term) ||
      (p.category ?? "").toLowerCase().includes(term)
    );
    switch (productSort) {
      case "name-asc": list = list.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")); break;
      case "name-desc": list = list.sort((a, b) => (b.name ?? "").localeCompare(a.name ?? "")); break;
      case "newest": list = list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case "oldest": list = list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
      case "farmer-asc": list = list.sort((a, b) => (a.store_name ?? "").localeCompare(b.store_name ?? "")); break;
      case "farmer-desc": list = list.sort((a, b) => (b.store_name ?? "").localeCompare(a.store_name ?? "")); break;
    }
    return list;
  })();

  const totalRevenue = (ordersList || []).reduce((s: number, o: any) => s + (o.total_amount || o.totalAmount || 0), 0);
  const pendingOrders = (ordersList || []).filter((o: any) => (o.status || o.order_status) === "pending").length;
  const lowStockCount = (productsList || []).filter((p: any) => (p.stock_qty ?? p.stock ?? p.stockQuantity ?? 0) < 10).length;
  const pendingFarmersCount = applicants.farmer.length;
  const pendingBuyersCount = applicants.buyer.length;
  const activeCount = (role: string) => allUsers.filter(u => u.role === role && u.status === "active").length;

  const recentActivities = [
    ...applicants.farmer.slice(0, 2).map((app: any) => ({
      id: `app-f-${app.id}`,
      activity: `New farmer application from ${app.fullName}`,
      created_at: app.createdAt || app.created_at,
    })),
    ...applicants.buyer.slice(0, 2).map((app: any) => ({
      id: `app-b-${app.id}`,
      activity: `New buyer application from ${app.fullName}`,
      created_at: app.createdAt || app.created_at,
    })),
    ...ordersList.slice(0, 2).map((order: any) => ({
      id: `order-${order.id}`,
      activity: `Order #${order.id} placed by ${order.buyer_name || order.buyerName || 'buyer'}`,
      created_at: order.created_at || order.createdAt || order.created,
    })),
    ...contactMessages.slice(0, 2).map((msg: any) => ({
      id: `msg-${msg.id}`,
      activity: `Message from ${msg.full_name}`,
      created_at: msg.createdAt,
    })),
  ]
    .filter(item => item.created_at)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  /* ─── RENDER ────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-lg">🌾</div>
            <div>
              <span className="font-bold text-gray-900 text-lg">FarmDirect</span>
              <span className="ml-2 text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">Hi, {userFirstName}</span>
            <button onClick={() => navigate("/")} className="text-emerald-600 font-semibold hover:underline">
              Go to Store
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage users, verify applications, and monitor platform activity.</p>
        </div>

        {/* Summary stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center"><ClipboardCheck className="w-5 h-5 text-amber-600" /></div>
            <div><p className="text-xs text-gray-500">Pending</p><p className="text-2xl font-bold text-gray-900">{pendingFarmersCount + pendingBuyersCount}</p></div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-xs text-gray-500">Total Users</p><p className="text-2xl font-bold text-gray-900">{allUsers.length}</p></div>
          </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><ShoppingBag className="w-5 h-5 text-purple-600" /></div>
            <div><p className="text-xs text-gray-500">Orders</p><p className="text-2xl font-bold text-gray-900">{ordersList.length}</p></div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center"><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
            <div><p className="text-xs text-gray-500">Revenue</p><p className="text-2xl font-bold text-gray-900">₱{totalRevenue.toLocaleString()}</p></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b-2 border-gray-200 mb-6 overflow-x-auto">
          {[
            { key: "analytics", label: "📊 Analytics" },
            { key: "verification", label: "📋 Pending Verification" },
            { key: "users", label: "👥 All Users" },
            { key: "products", label: "📦 All Products" },
            { key: "orders", label: "🛒 Orders & Sales" },
            { key: "reports", label: "📈 Reports" },
            { key: "contact", label: "📬 Contact Messages" },
          ].map(tab => (
            <TabBtn key={tab.key} label={tab.label} active={activeTab === tab.key} onClick={() => setActiveTab(tab.key)} />
          ))}
        </div>

        {/* ── ANALYTICS TAB ────────────────────────────────────── */}
        {activeTab === "analytics" && (() => {
          const platformMonthly = [
            { month: "Dec", revenue: 32000, orders: 58, farmers: 8, buyers: 24 },
            { month: "Jan", revenue: 41000, orders: 74, farmers: 10, buyers: 31 },
            { month: "Feb", revenue: 38500, orders: 68, farmers: 11, buyers: 29 },
            { month: "Mar", revenue: 52000, orders: 93, farmers: 13, buyers: 37 },
            { month: "Apr", revenue: 64000, orders: 115, farmers: 15, buyers: 44 },
            { month: "May", revenue: 78500, orders: 141, farmers: 18, buyers: 52 },
          ];
          const categoryRevenue = [
            { name: "Vegetables", value: 45, color: "#2d7a3a" },
            { name: "Fruits", value: 25, color: "#f0a500" },
            { name: "Grains", value: 18, color: "#4da8da" },
            { name: "Herbs", value: 7, color: "#8b5cf6" },
            { name: "Others", value: 5, color: "#e85d2f" },
          ];
          const topFarmers = [
            { name: "Juan Dela Cruz", revenue: 24500, orders: 45, rating: 4.8 },
            { name: "Maria Reyes", revenue: 18200, orders: 33, rating: 4.7 },
            { name: "Pedro Santos", revenue: 14800, orders: 28, rating: 4.9 },
            { name: "Ana Garcia", revenue: 11200, orders: 21, rating: 4.6 },
            { name: "Jose Bautista", revenue: 9700, orders: 18, rating: 4.5 },
          ];
          const paymentBreakdown = [
            { method: "GCash", count: 85, color: "#0066cc" },
            { method: "PayMaya", count: 48, color: "#e53e3e" },
            { method: "COD", count: 27, color: "#f0a500" },
          ];
          const platformKPIs = [
            { label: "Platform Revenue", value: "₱306,000", change: "+24%", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Total Orders", value: "549", change: "+31%", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Active Farmers", value: "18", change: "+8", icon: Users, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Commission Earned", value: "₱15,300", change: "+24%", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
          ];

          const renderKpiCard = (kpi: { label: string; value: string; change: string; icon: any; color: string; bg: string }) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" />{kpi.change}
                  </span>
                </div>
                <p className="mt-4 text-2xl font-bold text-gray-900">{kpi.value}</p>
                <p className="text-sm text-gray-500 mt-2">{kpi.label}</p>
              </div>
            );
          };

          return (
            <div className="animate-[fadeIn_.2s_ease-in] space-y-6">
              {/* KPI Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {platformKPIs.map(renderKpiCard)}
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-4">Sales by Category</h3>
                  <ResponsiveContainer width="100%" height={230}>
                    <PieChart>
                      <Pie data={categoryRevenue} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                        {categoryRevenue.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => [`${v}%`, "Share"]} />
                      <Legend iconType="circle" iconSize={8} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-4">Growth: Orders vs New Users</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={platformMonthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="orders" stroke="#2d7a3a" strokeWidth={2} dot={{ r: 4 }} name="Orders" />
                      <Line type="monotone" dataKey="buyers" stroke="#4da8da" strokeWidth={2} dot={{ r: 4 }} name="New Buyers" strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="farmers" stroke="#f0a500" strokeWidth={2} dot={{ r: 4 }} name="New Farmers" strokeDasharray="2 3" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-4">Payment Methods</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={paymentBreakdown} layout="vertical" barSize={20}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="method" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Transactions">
                        {paymentBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-4">Top Performing Farmers</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b-2 border-gray-200">
                          <th className="p-3 text-left font-semibold text-gray-600">#</th>
                          <th className="p-3 text-left font-semibold text-gray-600">Farmer</th>
                          <th className="p-3 text-left font-semibold text-gray-600">Revenue</th>
                          <th className="p-3 text-left font-semibold text-gray-600">Orders</th>
                          <th className="p-3 text-left font-semibold text-gray-600">Rating</th>
                          <th className="p-3 text-left font-semibold text-gray-600">Commission</th>
                          <th className="p-3 text-left font-semibold text-gray-600">Performance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topFarmers.map((f, i) => (
                          <tr key={f.name} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="p-3 text-gray-400 font-semibold">{i + 1}</td>
                            <td className="p-3 font-semibold text-gray-900">{f.name}</td>
                            <td className="p-3 font-bold text-emerald-600">₱{f.revenue.toLocaleString()}</td>
                            <td className="p-3 text-gray-700">{f.orders}</td>
                            <td className="p-3">
                              <span className="flex items-center gap-1 text-amber-500 font-semibold">
                                ★ {f.rating}
                              </span>
                            </td>
                            <td className="p-3 text-gray-600">₱{(f.revenue * 0.05).toLocaleString()}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-gray-100 rounded-full w-24">
                                  <div
                                    className="h-full bg-emerald-500 rounded-full"
                                    style={{ width: `${(f.revenue / topFarmers[0].revenue) * 100}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500">{Math.round((f.revenue / topFarmers[0].revenue) * 100)}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── VERIFICATION TAB ──────────────────────────────────── */}
        {activeTab === "verification" && (
          <div className="animate-[fadeIn_.2s_ease-in]">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Pending Applications</h2>
              <div className="flex gap-3 mb-6">
                <SubTabBtn
                  label={`Pending Farmers (${pendingFarmersCount})`}
                  active={applicantRole === "farmer"}
                  onClick={() => setApplicantRole("farmer")}
                />
                <SubTabBtn
                  label={`Pending Buyers (${pendingBuyersCount})`}
                  active={applicantRole === "buyer"}
                  onClick={() => setApplicantRole("buyer")}
                />
              </div>

              {currentApplicants.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No pending {applicantRole} applications.</p>
                  <p className="text-sm">All {applicantRole}s are verified!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {currentApplicants.map(app => (
                    <div key={app.id} className="bg-gray-50 rounded-xl border border-gray-200 p-5 flex flex-col sm:flex-row gap-5 items-start">
                      <ImageWithFallback
                        src={app.imageUrl}
                        alt={app.fullName}
                        className="w-24 h-24 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 space-y-1 text-sm">
                        <h3 className="text-lg font-bold text-gray-900">{app.fullName}</h3>
                        <p><span className="text-gray-500">Email:</span> {app.email}</p>
                        <p><span className="text-gray-500">Phone:</span> {app.phone}</p>
                        <p className="flex items-center gap-2"><span className="text-gray-500">Role:</span> <RoleBadge role={app.role} /></p>
                        <p><span className="text-gray-500">Applied:</span> {new Date(app.createdAt).toLocaleDateString("en-PH")}</p>
                        {app.farmLocation && <p><span className="text-gray-500">Farm Location:</span> {app.farmLocation}</p>}
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() => openUserModal(app, "verify")}
                          className="px-4 py-2 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 transition-colors whitespace-nowrap"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleReject(app.id)}
                          className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors whitespace-nowrap"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── USERS TAB ────────────────────────────────────────── */}
        {activeTab === "users" && (
          <div className="animate-[fadeIn_.2s_ease-in]">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                <button
                  onClick={fetchUsers}
                  disabled={isRefreshingUsers}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                >
                  {isRefreshingUsers ? "Refreshing..." : "↻ Refresh"}
                </button>
              </div>
              <div className="flex gap-2 flex-wrap mb-5">
                {["all", "farmer", "buyer", "admin", "pending-setup", "rejected"].map(f => (
                  <SubTabBtn
                    key={f}
                    label={
                      f === "all"
                        ? "All Users"
                        : f === "pending-setup"
                        ? "Pending Setup"
                        : f === "rejected"
                        ? "Rejected"
                        : `${f.charAt(0).toUpperCase() + f.slice(1)}s`
                    }
                    active={userFilter === f}
                    onClick={() => setUserFilter(f)}
                  />
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      {["ID", "Name", "Email", "Role", "Status", "Joined", "Actions"].map(h => (
                        <th key={h} className={`p-3 text-left font-semibold text-gray-600 ${h === "Actions" ? "text-center" : ""}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan={7} className="p-6 text-center text-gray-400">No users found</td></tr>
                    ) : filteredUsers.map(u => (
                      <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-3 text-gray-500">#{u.id}</td>
                        <td className="p-3 font-medium text-gray-900">{u.fullName}</td>
                        <td className="p-3 text-gray-600">{u.email}</td>
                        <td className="p-3"><RoleBadge role={u.role} /></td>
                        <td className="p-3"><StatusBadge status={u.status} /></td>
                        <td className="p-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString("en-PH")}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => openUserModal(u, "view")}
                            className="text-blue-600 hover:underline font-medium text-xs"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── PRODUCTS TAB ─────────────────────────────────────── */}
        {activeTab === "products" && (
          <div className="animate-[fadeIn_.2s_ease-in]">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Product Inventory</h2>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard label="Total Products" value={productsList.length} colorClass="bg-sky-50 text-sky-700" />
                <StatCard label="Low Stock (< 10)" value={lowStockCount} colorClass="bg-pink-50 text-pink-700" />
                <StatCard label="Total Revenue" value={`₱${totalRevenue.toLocaleString()}`} colorClass="bg-blue-50 text-blue-700" />
              </div>

              {/* Controls */}
              <div className="flex gap-3 mb-6 flex-wrap items-center">
                <div className="relative flex-1 min-w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="relative">
                  <select
                    value={productSort}
                    onChange={e => setProductSort(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="name-asc">A – Z</option>
                    <option value="name-desc">Z – A</option>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="farmer-asc">Farmer (A-Z)</option>
                    <option value="farmer-desc">Farmer (Z-A)</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Product grid */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-400"><Package className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No products found.</p></div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map(prod => (
                    <div key={prod.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                      <ImageWithFallback src={prod.photo} alt={prod.name} className="w-full h-44 object-cover" />
                      <div className="p-3">
                        <h3 className="font-bold text-gray-900 text-sm mb-1 truncate">{prod.name}</h3>
                        <p className="text-xs text-gray-500 mb-1">by {prod.store_name}</p>
                        <p className="text-base font-bold text-emerald-600 mb-1">₱{prod.price.toLocaleString()}</p>
                        <p className={`text-xs font-medium ${prod.stock_qty < 10 ? "text-red-500" : "text-gray-500"}`}>
                          Stock: {prod.stock_qty} {prod.stock_qty < 10 ? "⚠ Low" : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ORDERS TAB ───────────────────────────────────────── */}
        {activeTab === "orders" && (
          <div className="animate-[fadeIn_.2s_ease-in]">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Orders & Sales</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard label="Total Orders" value={ordersList.length} colorClass="bg-emerald-50 text-emerald-700" borderClass="border-emerald-400" />
                <StatCard label="Pending Delivery" value={pendingOrders} colorClass="bg-amber-50 text-amber-700" borderClass="border-amber-400" />
                <StatCard label="Commission (5%)" value={`₱${(totalRevenue * 0.05).toLocaleString()}`} colorClass="bg-indigo-50 text-indigo-700" borderClass="border-indigo-400" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      {["Order ID", "Buyer", "Total Amount", "Status", "Date", "Details"].map(h => (
                        <th key={h} className={`p-3 text-left font-semibold text-gray-600 ${h === "Details" ? "text-center" : ""}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(ordersList || []).map((order: any) => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-3 font-medium text-gray-700">#{order.id}</td>
                        <td className="p-3 text-gray-900">{order.buyer_name || order.buyer?.fullName || order.buyerName}</td>
                        <td className="p-3 font-semibold text-gray-900">₱{(order.total_amount || order.totalAmount || 0).toLocaleString()}</td>
                        <td className="p-3"><StatusBadge status={(order.status || order.order_status || 'unknown')} /></td>
                        <td className="p-3 text-gray-500">{new Date(order.created_at || order.createdAt || order.created).toLocaleDateString("en-PH")}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-blue-600 hover:underline font-medium text-xs"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── REPORTS TAB ──────────────────────────────────────── */}
        {activeTab === "reports" && (
          <div className="animate-[fadeIn_.2s_ease-in]">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Platform Reports</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: "👨‍🌾", value: activeCount("farmer"), label: "Active Farmers" },
                  { icon: "👥", value: activeCount("buyer"), label: "Active Buyers" },
                  { icon: "📦", value: 6, label: "Product Categories" },
                  { icon: "💰", value: `₱${totalRevenue.toLocaleString()}`, label: "Total Platform Sales" },
                ].map(({ icon, value, label }) => (
                  <div key={label} className="bg-white border border-gray-200 rounded-xl p-5 text-center">
                    <div className="text-4xl mb-3">{icon}</div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
                    <div className="text-sm text-gray-500">{label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity Log</h3>
                <div className="space-y-3">
                  {recentActivities.map(act => (
                    <div key={act.id} className="bg-white rounded-lg p-4 border-l-4 border-blue-400 shadow-sm">
                      <p className="font-semibold text-gray-900 text-sm">{act.activity}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(act.created_at).toLocaleString("en-PH")}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── CONTACT MESSAGES TAB ─────────────────────────────── */}
        {activeTab === "contact" && (
          <div className="animate-[fadeIn_.2s_ease-in]">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-gray-900">Contact Messages</h2>
                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={contactSearch}
                      onChange={e => setContactSearch(e.target.value)}
                      className="w-full sm:w-64 pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <select
                    value={contactFilter}
                    onChange={e => setContactFilter(e.target.value)}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">All Messages</option>
                    <option value="new">New</option>
                    <option value="replied">Replied</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      {["ID", "Full Name", "Email", "Subject", "Status", "Date Submitted", "Actions"].map(h => (
                        <th key={h} className={`p-3 text-left font-semibold text-gray-600 ${h === "Actions" ? "text-center" : ""}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {contactMessages
                      .filter(msg => {
                        if (contactFilter !== "all" && msg.status !== contactFilter) return false;
                        if (contactSearch) {
                          const term = contactSearch.toLowerCase();
                          return msg.full_name.toLowerCase().includes(term) ||
                                 msg.email.toLowerCase().includes(term) ||
                                 msg.subject.toLowerCase().includes(term);
                        }
                        return true;
                      })
                      .map(msg => (
                        <tr key={msg.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="p-3 font-medium text-gray-700">#{msg.id}</td>
                          <td className="p-3 text-gray-900">{msg.full_name}</td>
                          <td className="p-3 text-gray-600">{msg.email}</td>
                          <td className="p-3 text-gray-900 max-w-xs truncate">{msg.subject}</td>
                          <td className="p-3">
                            <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold ${
                              msg.status === "new" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"
                            }`}>
                              {msg.status === "new" ? "New" : "Replied"}
                            </span>
                          </td>
                          <td className="p-3 text-gray-500">
                            {new Date(msg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setSelectedMessage(msg)}
                                className="text-blue-600 hover:underline font-medium text-xs"
                              >
                                View
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete message from ${msg.full_name}?`)) {
                                    setContactMessages(prev => prev.filter(m => m.id !== msg.id));
                                  }
                                }}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {contactMessages.filter(msg => {
                if (contactFilter !== "all" && msg.status !== contactFilter) return false;
                if (contactSearch) {
                  const term = contactSearch.toLowerCase();
                  return msg.full_name.toLowerCase().includes(term) ||
                         msg.email.toLowerCase().includes(term) ||
                         msg.subject.toLowerCase().includes(term);
                }
                return true;
              }).length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No contact messages found.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Contact Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedMessage(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Message Details</h2>
              <button onClick={() => setSelectedMessage(null)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">From</p>
                <p className="font-semibold text-gray-900">{selectedMessage.full_name}</p>
                <p className="text-sm text-gray-600">{selectedMessage.email}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Subject</p>
                <p className="font-semibold text-gray-900">{selectedMessage.subject}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold ${
                  selectedMessage.status === "new" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"
                }`}>
                  {selectedMessage.status === "new" ? "New" : "Replied"}
                </span>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Date Submitted</p>
                <p className="text-sm text-gray-700">
                  {new Date(selectedMessage.created_at).toLocaleString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit"
                  })}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-2">Message</p>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{selectedMessage.message}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-2">Reply</p>
                <Textarea
                  value={replyText}
                  onChange={(e: any) => setReplyText(e.target.value)}
                  placeholder={selectedMessage.senderId ? "Type a reply to send via the app" : "Type a reply or use the 'Open email' link"}
                  rows={4}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              {selectedMessage.status === "new" && (
                <>
                  {selectedMessage.senderId ? (
                    <button
                      onClick={async () => {
                        if (!replyText.trim()) return alert('Please write a reply');
                        setIsReplying(true);
                        try {
                          await messageApi.send(String(selectedMessage.senderId), replyText.trim());
                          setContactMessages(prev => prev.map(m => m.id === selectedMessage.id ? { ...m, status: 'replied' } : m));
                          setSelectedMessage((prev: any) => ({ ...prev, status: 'replied' }));
                          setReplyText('');
                        } catch (err) {
                          alert('Failed to send reply via messages API');
                        } finally {
                          setIsReplying(false);
                        }
                      }}
                      className="px-5 py-2 rounded-lg bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-colors"
                    >
                      {isReplying ? 'Sending…' : 'Send Reply'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const to = selectedMessage.email || '';
                        const subject = `Re: ${selectedMessage.subject || ''}`;
                        const body = replyText;
                        window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        setContactMessages(prev => prev.map(m => m.id === selectedMessage.id ? { ...m, status: 'replied' } : m));
                        setSelectedMessage((prev: any) => ({ ...prev, status: 'replied' }));
                        setReplyText('');
                      }}
                      className="px-5 py-2 rounded-lg bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-colors"
                    >
                      Open Email
                    </button>
                  )}
                </>
              )}
              <button
                onClick={() => { setSelectedMessage(null); setReplyText(''); }}
                className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onApprove={modalAction === "verify" ? handleApprove : undefined}
          onReject={modalAction === "verify" ? handleReject : undefined}
        />
      )}
      {/* Order Details Modal (admin) */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          userRole="admin"
        />
      )}
    </div>
  );
}
