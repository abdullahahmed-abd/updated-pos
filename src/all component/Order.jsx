// Order.jsx (FINAL) — New backend: POST /order (requestType) + UI/theme matched with Product/Variant/Inventory screens
import React, { useEffect, useMemo, useState, useContext } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AppContext } from "./Contextapi";

const Order = () => {
  const ctx = useContext(AppContext);

  // count refresh pattern (same as other screens)
  const [token, settoken, count, setcount, user, setuser] = ctx;

  // BaseUrl always last in your context (as used in other screens)
  const BaseUrl = ctx[ctx.length - 1];

  const [orders, setOrders] = useState([]);
  const [filteredStatus, setFilteredStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [ismenu, setismenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const theme = {
    primary: "#3B82F6",
    primaryLight: "#60A5FA",
    primaryDark: "#1E40AF",

    secondary: "#8B5CF6",
    secondaryLight: "#A78BFA",

    danger: "#EF4444",
    dangerLight: "#F87171",

    warning: "#F59E0B",
    warningLight: "#FBBF24",

    success: "#10B981",
    successLight: "#34D399",

    pageBg: "#F9FAFB",
    cardBg: "#FFFFFF",
    inputBg: "#F3F4F6",
    inputBorder: "#E5E7EB",

    textPrimary: "#111827",
    textSecondary: "#374151",
    textMuted: "#9CA3AF",
    textOnPrimary: "#FFFFFF",

    border: "#E5E7EB",
    borderLight: "#F3F4F6",

    gradientPrimary: "linear-gradient(135deg, #3B82F6, #60A5FA)",
    gradientDanger: "linear-gradient(135deg, #EF4444, #F87171)",
    gradientWarning: "linear-gradient(135deg, #F59E0B, #FBBF24)",
    gradientSuccess: "linear-gradient(135deg, #10B981, #34D399)",

    radiusSm: "6px",
    radiusMd: "8px",
    radiusLg: "12px",
    radiusXl: "16px",
    radiusFull: "9999px",
  };

  const api = useMemo(() => {
    return axios.create({
      baseURL: BaseUrl || "",
      headers: { "ngrok-skip-browser-warning": "true" },
    });
  }, [BaseUrl]);

  const orderRequest = (payload) => api.post("/order", payload);

  const normalizeOrders = (resData) => {
    if (Array.isArray(resData)) return resData;
    if (Array.isArray(resData?.orders)) return resData.orders;
    if (Array.isArray(resData?.data?.orders)) return resData.data.orders;
    return [];
  };

  const getOrderId = (o) => o?.orderId ?? o?.orderID ?? o?.id ?? null;

  const getCustomerPhone = (o) =>
    o?.userPhoneNumber ??
    o?.customer?.phoneNumber ??
    o?.phoneNumber ??
    "N/A";

  const getCustomerEmail = (o) =>
    o?.email ?? o?.customer?.email ?? "—";

  const getOrderDate = (o) =>
    o?.orderDate ?? o?.createdAt ?? o?.customer?.createdAt ?? null;

  const toDateOnlyKey = (val) => {
    if (!val) return "";
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return "";
    return d.toDateString();
  };

  const formatDateTime = (val) => {
    if (!val) return "—";
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return String(val);
    return d.toLocaleString();
  };

  const getdata = () => {
    if (!BaseUrl) return;

    orderRequest({ requestType: "READ_ALL" })
      .then((res) => {
        setOrders(normalizeOrders(res.data));
      })
      .catch((err) => {
        console.error("Order READ_ALL error:", err);
        setOrders([]);
      });
  };

  useEffect(() => {
    getdata();
    // eslint-disable-next-line
  }, [BaseUrl, count]);

  const updateStatus = (order, nextStatus) => {
    const orderId = getOrderId(order);
    if (!orderId) return;

    // Optimistic UI
    setOrders((prev) =>
      prev.map((o) =>
        getOrderId(o) === orderId ? { ...o, status: nextStatus } : o
      )
    );

    orderRequest({
      requestType: "UPDATE",
      orderId: Number(orderId),
      status: nextStatus,
    })
      .then(() => {
        setcount((p) => p + 1);
        // optional: re-fetch for correctness
        getdata();
      })
      .catch((err) => {
        console.error("Order UPDATE error:", err.response?.data || err.message);
        window.alert("Status update failed");
        // rollback by re-fetch
        getdata();
      });
  };

  const handleDelete = (order) => {
    const orderId = getOrderId(order);
    if (!orderId) return;

    if (!window.confirm("Are you sure you want to delete this order?")) return;

    orderRequest({ requestType: "DELETE", orderId: Number(orderId) })
      .then(() => {
        setcount((p) => p + 1);
        getdata();
      })
      .catch((err) => {
        console.error("Order DELETE error:", err.response?.data || err.message);
        window.alert("Delete failed");
      });
  };

  const filteredOrders = orders.filter((o) => {
    const statusOk = filteredStatus ? o.status === filteredStatus : true;

    const dateOk = selectedDate
      ? toDateOnlyKey(getOrderDate(o)) === selectedDate.toDateString()
      : true;

    const q = searchQuery.trim().toLowerCase();
    const searchOk = q
      ? String(getOrderId(o) ?? "").toLowerCase().includes(q) ||
        String(getCustomerPhone(o) ?? "").toLowerCase().includes(q) ||
        String(getCustomerEmail(o) ?? "").toLowerCase().includes(q) ||
        String(o.status ?? "").toLowerCase().includes(q) ||
        String(o.paymentMode ?? "").toLowerCase().includes(q)
      : true;

    return statusOk && dateOk && searchOk;
  });

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "PENDING").length;
    const completed = orders.filter((o) => o.status === "COMPLETED").length;
    const revenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    return { total, pending, completed, revenue };
  }, [orders]);

  const inputStyle = {
    width: "100%",
    height: "44px",
    background: theme.inputBg,
    border: `2px solid ${theme.inputBorder}`,
    borderRadius: theme.radiusMd,
    padding: "0 14px",
    fontSize: "13px",
    fontWeight: "700",
    color: theme.textPrimary,
    outline: "none",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
  };

  return (
    <>
      <style>{`
        @keyframes slideInRow {
          0% { opacity: 0; transform: translateX(-40px); }
          60% { opacity: 1; transform: translateX(6px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes blob1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.25; }
          25% { transform: translate(30px, -50px) scale(1.1); opacity: 0.35; }
          50% { transform: translate(-20px, 20px) scale(0.95); opacity: 0.2; }
          75% { transform: translate(50px, 30px) scale(1.05); opacity: 0.3; }
        }
        @keyframes blob2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.2; }
          25% { transform: translate(-40px, 30px) scale(1.15); opacity: 0.35; }
          50% { transform: translate(30px, -40px) scale(0.9); opacity: 0.15; }
          75% { transform: translate(-20px, -20px) scale(1.1); opacity: 0.3; }
        }

        .order-row {
          animation: slideInRow 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          opacity: 0;
        }
        .order-row:hover {
          transform: translateX(6px) scale(1.01);
          box-shadow: 0 6px 24px rgba(59, 130, 246, 0.18), 0 0 0 1.5px rgba(96, 165, 250, 0.5);
          border-color: rgba(96, 165, 250, 0.6);
          z-index: 10;
        }

        .order-input:focus {
          border-color: #3B82F6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          background: #EFF6FF;
        }

        /* DatePicker input to match */
        .dp-input {
          width: 100%;
          height: 44px;
          background: #F3F4F6;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          padding: 0 14px;
          font-size: 13px;
          font-weight: 700;
          color: #111827;
          outline: none;
          box-sizing: border-box;
        }
        .dp-input:focus {
          border-color: #3B82F6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          background: #EFF6FF;
        }
      `}</style>

      <Navbar
        ismenu={ismenu}
        setismenu={setismenu}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div
        onClick={() => setismenu(false)}
        style={{
          minHeight: "100vh",
          background: theme.pageBg,
          padding: "90px 28px 100px 28px",
          position: "relative",
        }}
      >
        {/* Background Blobs */}
        <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
          <div style={{
            position: "absolute", top: "-80px", right: "-80px", width: "400px", height: "400px",
            background: "radial-gradient(circle, rgba(30, 64, 175, 0.25), transparent 70%)",
            borderRadius: "50%", filter: "blur(70px)", animation: "blob1 10s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", bottom: "-100px", left: "-100px", width: "450px", height: "450px",
            background: "radial-gradient(circle, rgba(96, 165, 250, 0.2), transparent 70%)",
            borderRadius: "50%", filter: "blur(80px)", animation: "blob2 12s ease-in-out infinite",
          }} />
        </div>

        <div style={{ position: "relative", zIndex: 10, maxWidth: "1100px", margin: "0 auto" }}>
          {/* Header + Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "26px", fontWeight: "900", color: theme.primaryDark, lineHeight: 1.1 }}>
                  Orders
                </div>
                <div style={{ fontSize: "13px", color: theme.textMuted, fontWeight: "600", marginTop: "6px" }}>
                  Manage orders, filter by status/date, and update completion.
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <div style={{
                  background: theme.cardBg, border: `1.5px solid ${theme.border}`,
                  borderRadius: theme.radiusLg, padding: "12px 16px",
                  boxShadow: `0 2px 8px rgba(59, 130, 246, 0.08)`,
                }}>
                  <div style={{ fontSize: "20px", fontWeight: "900", color: theme.textPrimary, lineHeight: 1 }}>
                    {stats.total}
                  </div>
                  <div style={{ fontSize: "10px", fontWeight: "700", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                    Total
                  </div>
                </div>

                <div style={{
                  background: theme.cardBg, border: `1.5px solid ${theme.border}`,
                  borderRadius: theme.radiusLg, padding: "12px 16px",
                  boxShadow: `0 2px 8px rgba(59, 130, 246, 0.08)`,
                }}>
                  <div style={{ fontSize: "20px", fontWeight: "900", color: theme.warning, lineHeight: 1 }}>
                    {stats.pending}
                  </div>
                  <div style={{ fontSize: "10px", fontWeight: "700", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                    Pending
                  </div>
                </div>

                <div style={{
                  background: theme.cardBg, border: `1.5px solid ${theme.border}`,
                  borderRadius: theme.radiusLg, padding: "12px 16px",
                  boxShadow: `0 2px 8px rgba(59, 130, 246, 0.08)`,
                }}>
                  <div style={{ fontSize: "20px", fontWeight: "900", color: theme.success, lineHeight: 1 }}>
                    {stats.completed}
                  </div>
                  <div style={{ fontSize: "10px", fontWeight: "700", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                    Completed
                  </div>
                </div>

                <div style={{
                  background: theme.cardBg, border: `1.5px solid ${theme.border}`,
                  borderRadius: theme.radiusLg, padding: "12px 16px",
                  boxShadow: `0 2px 8px rgba(59, 130, 246, 0.08)`,
                }}>
                  <div style={{ fontSize: "18px", fontWeight: "900", color: theme.primaryDark, lineHeight: 1 }}>
                    ₹{Math.round(stats.revenue)}
                  </div>
                  <div style={{ fontSize: "10px", fontWeight: "700", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                    Revenue
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}>
              <select
                className="order-input"
                value={filteredStatus}
                onChange={(e) => setFilteredStatus(e.target.value)}
                style={inputStyle}
              >
                <option value="">All Status</option>
                <option value="PENDING">PENDING</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>

              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                placeholderText="Filter by Date"
                className="dp-input"
                dateFormat="yyyy-MM-dd"
                isClearable
              />
            </div>
          </div>

          {/* Orders list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, i) => {
                const id = getOrderId(order);
                const status = order.status || "PENDING";
                const phone = getCustomerPhone(order);
                const email = getCustomerEmail(order);

                const totalAmount = Number(order.totalAmount || 0);
                const cashAmount = Number(order.cashAmount || 0);
                const onlineAmount = Number(order.onlineAmount || 0);

                const paymentMode = order.paymentMode || "—";
                const orderDate = getOrderDate(order);
                const updatedAt = order.updatedAt || order.updatedDateTime || "—";

                return (
                  <div
                    key={id ?? i}
                    className="order-row"
                    style={{
                      background: theme.cardBg,
                      border: `1.5px solid rgba(229, 231, 235, 0.7)`,
                      borderRadius: theme.radiusLg,
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "stretch",
                      boxShadow: `0 2px 8px rgba(59, 130, 246, 0.06)`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  >
                    {/* Accent */}
                    <div
                      style={{
                        width: "4px",
                        background:
                          status === "COMPLETED" ? theme.gradientSuccess : theme.gradientWarning,
                        flexShrink: 0,
                      }}
                    />

                    {/* Content */}
                    <div style={{ flex: 1, padding: "14px 16px", minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "flex-start" }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: "14px", fontWeight: "900", color: theme.textPrimary }}>
                            Order #{id}
                          </div>
                          <div style={{ fontSize: "12px", fontWeight: "700", color: theme.textMuted, marginTop: "4px" }}>
                            {phone} {email !== "—" ? `• ${email}` : ""}
                          </div>
                        </div>

                        <div style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "6px 12px",
                          borderRadius: theme.radiusFull,
                          background: status === "COMPLETED" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                          border: status === "COMPLETED"
                            ? "1.5px solid rgba(16,185,129,0.22)"
                            : "1.5px solid rgba(245,158,11,0.22)",
                          flexShrink: 0,
                        }}>
                          <span style={{
                            fontSize: "11px",
                            fontWeight: "900",
                            color: status === "COMPLETED" ? "#10B981" : "#F59E0B",
                            letterSpacing: "0.6px",
                          }}>
                            {status}
                          </span>

                          {/* toggle */}
                          <input
                            type="checkbox"
                            checked={status === "COMPLETED"}
                            onChange={(e) =>
                              updateStatus(order, e.target.checked ? "COMPLETED" : "PENDING")
                            }
                            style={{ width: "16px", height: "16px", cursor: "pointer" }}
                            title="Toggle status"
                          />
                        </div>
                      </div>

                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "10px",
                        marginTop: "12px",
                      }}>
                        <div style={{
                          background: "rgba(59, 130, 246, 0.08)",
                          border: "1.5px solid rgba(59, 130, 246, 0.12)",
                          borderRadius: theme.radiusMd,
                          padding: "10px 12px",
                        }}>
                          <div style={{ fontSize: "10px", fontWeight: "800", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.6px" }}>
                            Total
                          </div>
                          <div style={{ fontSize: "14px", fontWeight: "900", color: theme.primaryDark, marginTop: "2px" }}>
                            ₹{totalAmount}
                          </div>
                        </div>

                        <div style={{
                          background: "rgba(16, 185, 129, 0.08)",
                          border: "1.5px solid rgba(16, 185, 129, 0.12)",
                          borderRadius: theme.radiusMd,
                          padding: "10px 12px",
                        }}>
                          <div style={{ fontSize: "10px", fontWeight: "800", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.6px" }}>
                            Cash
                          </div>
                          <div style={{ fontSize: "14px", fontWeight: "900", color: "#10B981", marginTop: "2px" }}>
                            ₹{cashAmount}
                          </div>
                        </div>

                        <div style={{
                          background: "rgba(139, 92, 246, 0.08)",
                          border: "1.5px solid rgba(139, 92, 246, 0.12)",
                          borderRadius: theme.radiusMd,
                          padding: "10px 12px",
                        }}>
                          <div style={{ fontSize: "10px", fontWeight: "800", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.6px" }}>
                            Online
                          </div>
                          <div style={{ fontSize: "14px", fontWeight: "900", color: "#8B5CF6", marginTop: "2px" }}>
                            ₹{onlineAmount}
                          </div>
                        </div>
                      </div>

                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "12px",
                        marginTop: "12px",
                        paddingTop: "10px",
                        borderTop: `1px solid ${theme.borderLight}`,
                        color: theme.textMuted,
                        fontSize: "11px",
                        fontWeight: "700",
                        flexWrap: "wrap",
                      }}>
                        <div>
                          <span style={{ color: theme.textSecondary }}>Payment:</span> {paymentMode}
                        </div>
                        <div>
                          <span style={{ color: theme.textSecondary }}>Ordered:</span> {formatDateTime(orderDate)}
                        </div>
                        <div>
                          <span style={{ color: theme.textSecondary }}>Updated:</span> {formatDateTime(updatedAt)}
                        </div>
                      </div>
                    </div>

                    {/* Right actions */}
                    <div style={{
                      padding: "14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      justifyContent: "center",
                      borderLeft: `1px solid ${theme.borderLight}`,
                      flexShrink: 0,
                    }}>
                      <button
                        onClick={() => handleDelete(order)}
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: theme.radiusMd,
                          border: "none",
                          cursor: "pointer",
                          background: theme.gradientDanger,
                          color: "white",
                          fontWeight: 900,
                          boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
                        }}
                        title="Delete order"
                        type="button"
                      >
                        X
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: "center", padding: "60px 20px", color: theme.textMuted }}>
                <h3 style={{ fontSize: "18px", fontWeight: "900", color: theme.textPrimary, margin: 0 }}>
                  {searchQuery || filteredStatus || selectedDate ? "No orders found" : "No orders yet"}
                </h3>
                <p style={{ fontSize: "13px", margin: "8px 0 0" }}>
                  Try clearing filters/search.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Order;