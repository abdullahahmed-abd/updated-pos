// Customer.jsx  (NEW backend + same theme/UI style as Product/Variant/Inventory)
import axios from "axios";
import { useContext, useEffect, useMemo, useState } from "react";
import Navbar from "./Navbar";
import { AppContext } from "./Contextapi";
import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";

const Customer = () => {
  const dataa = useContext(AppContext);
  const [
    token, settoken,
    count, setcount,
    user, setuser,
    categorydata, setcategorydata,
    productName, setName,
    sku, setSku,
    categoryId, setCategoryId,
    description, setDescription,
    updateActive, setUpdateActive,
    variantName, setvariantName,
    variantValue, setvariantValue,
    variantprice, setvariantprice,
    inventoryquantity, setinventoryquantity,
    inventorylocation, setinventorylocation,
    variantsarray, setvariantsarray,
    productvariants, setproductvariants,
    productId, setproductId,
    BaseUrl
  ] = dataa;

  const [customers, setCustomers] = useState([]);
  const [ismenu, setismenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // form (docs me phoneNumber + email shown)
  const [form, setForm] = useState({
    customerId: null,
    phoneNumber: "",
    email: "",
  });

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

    gradientPrimary: "linear-gradient(135deg, #3B82F6, #60A5FA)",
    gradientDanger: "linear-gradient(135deg, #EF4444, #F87171)",
    gradientWarning: "linear-gradient(135deg, #F59E0B, #FBBF24)",

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

  const customerRequest = (payload) => api.post("/customer", payload);

  const normalizeCustomers = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.customers)) return data.customers;
    if (Array.isArray(data?.data?.customers)) return data.data.customers;
    return [];
  };

  const getCustomers = () => {
    if (!BaseUrl) return;
    customerRequest({ requestType: "READ_ALL" })
      .then((res) => {
        setCustomers(normalizeCustomers(res.data));
      })
      .catch((err) => {
        console.error("Customer READ_ALL error:", err);
        setCustomers([]);
      });
  };

  useEffect(() => {
    getCustomers();
    // eslint-disable-next-line
  }, [BaseUrl, count]);

  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      String(c.phoneNumber || "").toLowerCase().includes(q) ||
      String(c.email || "").toLowerCase().includes(q) ||
      String(c.customerId || "").toLowerCase().includes(q)
    );
  });

  const resetForm = () => {
    setForm({ customerId: null, phoneNumber: "", email: "" });
    setIsEditing(false);
    setShowForm(false);
  };

  const onEdit = (c) => {
    setForm({
      customerId: c.customerId ?? c.id ?? null,
      phoneNumber: c.phoneNumber ?? "",
      email: c.email ?? "",
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const onDelete = (customerId) => {
    if (!customerId) return;
    if (!window.confirm("Are you sure you want to delete this customer?")) return;

    customerRequest({ requestType: "DELETE", customerId: Number(customerId) })
      .then(() => {
        setcount((p) => p + 1); // refresh everywhere
        getCustomers();
      })
      .catch((err) => {
        console.error("Customer DELETE error:", err);
        window.alert("Delete failed");
      });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    // docs notes: don't send empty strings
    const payloadBase = {
      phoneNumber: form.phoneNumber?.trim() || undefined,
      email: form.email?.trim() || undefined,
    };

    if (isEditing) {
      const payload = {
        requestType: "UPDATE",
        customerId: Number(form.customerId),
        ...payloadBase,
      };

      customerRequest(payload)
        .then(() => {
          setcount((p) => p + 1);
          getCustomers();
          resetForm();
        })
        .catch((err) => {
          console.error("Customer UPDATE error:", err);
          window.alert("Update failed");
        });
    } else {
      // NOTE: docs screenshot me CREATE mention nahi hai, but UI me Add button hai.
      // Agar backend me CREATE available hai to ye work karega.
      const payload = {
        requestType: "CREATE",
        ...payloadBase,
      };

      customerRequest(payload)
        .then(() => {
          setcount((p) => p + 1);
          getCustomers();
          resetForm();
        })
        .catch((err) => {
          console.error("Customer CREATE error:", err);
          window.alert("Create not supported by backend (or validation failed)");
        });
    }
  };

  const inputStyle = {
    width: "100%",
    height: "44px",
    background: theme.inputBg,
    border: `2px solid ${theme.inputBorder}`,
    borderRadius: theme.radiusMd,
    padding: "0 14px",
    fontSize: "13px",
    fontWeight: "600",
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
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
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
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        .cus-row {
          animation: slideInRow 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .cus-row:hover {
          transform: translateX(6px) scale(1.01);
          box-shadow: 0 6px 24px rgba(59, 130, 246, 0.18), 0 0 0 1.5px rgba(96, 165, 250, 0.5);
          border-color: rgba(96, 165, 250, 0.6);
          z-index: 10;
        }
        .cus-avatar { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .cus-row:hover .cus-avatar {
          transform: scale(1.12) rotate(-6deg);
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
        }
        .cus-edit, .cus-delete { transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .cus-edit:hover { transform: translateY(-3px) scale(1.12) !important; box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5) !important; }
        .cus-delete:hover { transform: translateY(-3px) scale(1.12) !important; box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5) !important; }

        .form-panel { animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }

        .add-fab {
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          animation: float 3s ease-in-out infinite;
        }
        .add-fab:hover {
          transform: translateY(-6px) scale(1.12) !important;
          box-shadow: 0 14px 40px rgba(59, 130, 246, 0.5) !important;
          animation-play-state: paused;
        }

        .cus-input:focus {
          border-color: #3B82F6 !important;
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
        {/* Background blobs */}
        <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
          <div
            style={{
              position: "absolute",
              top: "-80px",
              right: "-80px",
              width: "400px",
              height: "400px",
              background: "radial-gradient(circle, rgba(30, 64, 175, 0.25), transparent 70%)",
              borderRadius: "50%",
              filter: "blur(70px)",
              animation: "blob1 10s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-100px",
              left: "-100px",
              width: "450px",
              height: "450px",
              background: "radial-gradient(circle, rgba(96, 165, 250, 0.2), transparent 70%)",
              borderRadius: "50%",
              filter: "blur(80px)",
              animation: "blob2 12s ease-in-out infinite",
            }}
          />
        </div>

        <div style={{ position: "relative", zIndex: 10, maxWidth: "1100px", margin: "0 auto" }}>
          {/* Stats Bar */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
            <div
              style={{
                background: theme.cardBg,
                border: `1.5px solid ${theme.border}`,
                borderRadius: theme.radiusLg,
                padding: "16px 24px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                boxShadow: `0 2px 8px rgba(59, 130, 246, 0.08)`,
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  background: "rgba(59, 130, 246, 0.12)",
                  borderRadius: theme.radiusMd,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg style={{ width: "22px", height: "22px", color: "#3B82F6" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.341A8 8 0 104.572 15.34" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "24px", fontWeight: "800", color: theme.textPrimary, lineHeight: 1 }}>
                  {customers.length}
                </div>
                <div style={{ fontSize: "11px", fontWeight: "600", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "1px" }}>
                  Total Customers
                </div>
              </div>
            </div>

            {searchQuery && (
              <div
                style={{
                  background: "rgba(59, 130, 246, 0.1)",
                  border: `1.5px solid rgba(59, 130, 246, 0.25)`,
                  borderRadius: theme.radiusLg,
                  padding: "16px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#3B82F6" }}>
                  {filteredCustomers.length} results for "{searchQuery}"
                </div>
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    background: "rgba(59, 130, 246, 0.15)",
                    border: "none",
                    borderRadius: theme.radiusFull,
                    padding: "4px 10px",
                    fontSize: "11px",
                    fontWeight: "800",
                    color: "#3B82F6",
                    cursor: "pointer",
                  }}
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Customer rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((c, i) => (
                <div
                  key={c.customerId ?? i}
                  className="cus-row"
                  style={{
                    width: "100%",
                    background: theme.cardBg,
                    border: `1.5px solid rgba(229, 231, 235, 0.7)`,
                    borderRadius: theme.radiusLg,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    boxShadow: `0 2px 8px rgba(59, 130, 246, 0.06)`,
                    animationDelay: `${i * 0.05}s`,
                    opacity: 0,
                  }}
                >
                  {/* Accent */}
                  <div style={{ width: "4px", alignSelf: "stretch", background: theme.gradientPrimary, flexShrink: 0 }} />

                  {/* Avatar */}
                  <div style={{ padding: "12px 0 12px 14px", flexShrink: 0 }}>
                    <div
                      className="cus-avatar"
                      style={{
                        width: "42px",
                        height: "42px",
                        background: theme.gradientPrimary,
                        borderRadius: theme.radiusMd,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        fontWeight: "900",
                        color: theme.textOnPrimary,
                        boxShadow: `0 3px 10px rgba(59, 130, 246, 0.3)`,
                      }}
                    >
                      {(String(c.phoneNumber || "C").charAt(0) || "C").toUpperCase()}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "12px 16px", gap: "20px", minWidth: 0 }}>
                    <div style={{ minWidth: "140px" }}>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "1px" }}>
                        Phone
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: "800", color: theme.textPrimary }}>
                        {c.phoneNumber || "N/A"}
                      </div>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "1px" }}>
                        Email
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: theme.textSecondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {c.email || "—"}
                      </div>
                    </div>

                    <div style={{ minWidth: "90px", textAlign: "right" }}>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "1px" }}>
                        ID
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: "800", color: theme.textPrimary }}>
                        #{c.customerId}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 14px 12px 0", flexShrink: 0 }}>
                    <button
                      className="cus-edit"
                      onClick={() => onEdit(c)}
                      style={{
                        width: "34px",
                        height: "34px",
                        background: theme.gradientPrimary,
                        border: "none",
                        borderRadius: theme.radiusSm,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: `0 2px 8px rgba(59, 130, 246, 0.3)`,
                      }}
                      title="Edit"
                    >
                      <CiEdit style={{ width: "16px", height: "16px", color: "white" }} />
                    </button>

                    <button
                      className="cus-delete"
                      onClick={() => onDelete(c.customerId)}
                      style={{
                        width: "34px",
                        height: "34px",
                        background: theme.gradientDanger,
                        border: "none",
                        borderRadius: theme.radiusSm,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: `0 2px 8px rgba(239, 68, 68, 0.3)`,
                      }}
                      title="Delete"
                    >
                      <MdDelete style={{ width: "16px", height: "16px", color: "white" }} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", padding: "60px 20px", color: theme.textMuted }}>
                <div style={{ fontSize: "18px", fontWeight: "900", color: theme.textPrimary }}>
                  {searchQuery ? "No results found" : "No customers yet"}
                </div>
                <div style={{ fontSize: "13px", marginTop: "6px" }}>
                  {searchQuery ? "Try a different search term" : "Click the + button to add customer"}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FORM MODAL */}
        {showForm && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 200,
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) resetForm();
            }}
          >
            <div
              className="form-panel"
              style={{
                width: "100%",
                maxWidth: "440px",
                background: theme.cardBg,
                border: `2px solid ${theme.border}`,
                borderRadius: theme.radiusXl,
                padding: "28px",
                boxShadow: `0 20px 60px rgba(0,0,0,0.2)`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "22px" }}>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: "900", color: theme.textPrimary, margin: 0 }}>
                    {isEditing ? "Update Customer" : "Add Customer"}
                  </h2>
                  <p style={{ fontSize: "12px", color: theme.textMuted, margin: "4px 0 0" }}>
                    {isEditing ? "Update customer details" : "Create a new customer"}
                  </p>
                </div>
                <button
                  onClick={resetForm}
                  style={{
                    width: "34px",
                    height: "34px",
                    background: "rgba(239, 68, 68, 0.12)",
                    border: "none",
                    borderRadius: theme.radiusMd,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#EF4444",
                    fontWeight: 900,
                  }}
                  title="Close"
                  type="button"
                >
                  X
                </button>
              </div>

              <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: theme.textSecondary, marginBottom: "6px" }}>
                    Phone Number
                  </label>
                  <input
                    className="cus-input"
                    style={inputStyle}
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={form.phoneNumber}
                    onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: theme.textSecondary, marginBottom: "6px" }}>
                    Email (optional)
                  </label>
                  <input
                    className="cus-input"
                    style={inputStyle}
                    type="email"
                    placeholder="e.g. user@example.com"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                  <button
                    type="button"
                    onClick={resetForm}
                    style={{
                      flex: 1,
                      height: "46px",
                      background: theme.inputBg,
                      border: `2px solid ${theme.inputBorder}`,
                      borderRadius: theme.radiusMd,
                      fontSize: "14px",
                      fontWeight: "800",
                      color: theme.textSecondary,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      height: "46px",
                      background: isEditing ? theme.gradientWarning : theme.gradientPrimary,
                      border: "none",
                      borderRadius: theme.radiusMd,
                      fontSize: "14px",
                      fontWeight: "900",
                      color: theme.textOnPrimary,
                      cursor: "pointer",
                      boxShadow: `0 4px 14px ${
                        isEditing ? "rgba(245, 158, 11, 0.4)" : "rgba(59, 130, 246, 0.4)"
                      }`,
                    }}
                  >
                    {isEditing ? "Update" : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* FAB */}
        <button
          className="add-fab"
          onClick={() => {
            resetForm();
            setShowForm(true);
            setIsEditing(false);
          }}
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            zIndex: 100,
            height: "52px",
            padding: "0 24px",
            background: theme.gradientPrimary,
            border: "none",
            borderRadius: theme.radiusFull,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            cursor: "pointer",
            boxShadow: `0 8px 30px rgba(59, 130, 246, 0.5)`,
          }}
        >
          <svg style={{ width: "20px", height: "20px", color: "#FFFFFF" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span style={{ color: "#FFFFFF", fontSize: "14px", fontWeight: "900", whiteSpace: "nowrap" }}>
            Add Customer
          </span>
        </button>
      </div>
    </>
  );
};

export default Customer;