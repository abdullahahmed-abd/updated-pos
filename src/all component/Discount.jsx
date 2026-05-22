// Discount.jsx (FINAL) — New backend: POST /discount (requestType) + theme/UI matched with Product/Variant/Inventory
import React, { useEffect, useMemo, useState, useContext } from "react";
import axios from "axios";
import Select from "react-select";
import { AppContext } from "./Contextapi";
import Navbar from "./Navbar";

const Discount = () => {
  const ctx = useContext(AppContext);

  // keep count refresh working (same as your other screens)
  const [token, settoken, count, setcount, user, setuser] = ctx;

  // BaseUrl always last in your context (as used in other screens)
  const BaseUrl = ctx[ctx.length - 1];

  const [data, setData] = useState([]);
  const [variants, setVariants] = useState([]);

  const [disName, setDisname] = useState("");
  const [varId, setvarId] = useState("");
  const [mode, setmode] = useState("");
  const [disvalue, setdisvalue] = useState("");

  // NEW: start + end per docs
  const [startDate, setStartDate] = useState("");
  const [enddate, setend] = useState("");

  const [isActive, setIsActive] = useState(true);

  const [update, setupdate] = useState(false);
  const [updateId, setupdateId] = useState(null);

  const [ismenu, setismenu] = useState(false);
  const [showForm, setShowForm] = useState(false);
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
    cardBgHover: "#F3F4F6",
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

  const discountRequest = (payload) => api.post("/discount", payload);
  const variantRequest = (payload) => api.post("/variant", payload);

  const toISO = (datetimeLocal) => {
    if (!datetimeLocal) return null;
    // datetime-local -> ISO Z
    return new Date(datetimeLocal).toISOString();
  };

  const isoToLocalInput = (iso) => {
    if (!iso) return "";
    const date = new Date(iso);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    return local;
  };

  const normalizeDiscounts = (resData) => {
    if (Array.isArray(resData)) return resData;
    if (Array.isArray(resData?.discounts)) return resData.discounts;
    if (Array.isArray(resData?.data?.discounts)) return resData.data.discounts;
    return [];
  };

  const normalizeVariants = (resData) => {
    if (Array.isArray(resData)) return resData;
    if (Array.isArray(resData?.variants)) return resData.variants;
    if (Array.isArray(resData?.data?.variants)) return resData.data.variants;
    return [];
  };

  const getdata = () => {
    if (!BaseUrl) return;
    discountRequest({ requestType: "READ_ALL" })
      .then((res) => setData(normalizeDiscounts(res.data)))
      .catch((err) => console.log("Discount READ_ALL error:", err));
  };

  const fetchVariants = () => {
    if (!BaseUrl) return;

    // NEW backend variant endpoint (POST /variant)
    variantRequest({ requestType: "READ_ALL" })
      .then((res) => setVariants(normalizeVariants(res.data)))
      .catch((err) => console.log("Variant READ_ALL error:", err));
  };

  useEffect(() => {
    getdata();
    fetchVariants();
    // eslint-disable-next-line
  }, [BaseUrl, count]);

  const reset = () => {
    setDisname("");
    setdisvalue("");
    setmode("");
    setvarId("");
    setStartDate("");
    setend("");
    setIsActive(true);

    setupdate(false);
    setupdateId(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    // same reset but keep modal open
    setDisname("");
    setdisvalue("");
    setmode("");
    setvarId("");
    setStartDate("");
    setend("");
    setIsActive(true);

    setupdate(false);
    setupdateId(null);
    setShowForm(true);
  };

  const sbt = (e) => {
    e.preventDefault();

    const startISO = toISO(startDate);
    const endISO = toISO(enddate);

    // docs show "stateDateTime" (typo) in request, but response uses startDateTime.
    // We'll send BOTH to be safe.
    const obj = {
      requestType: update ? "UPDATE" : "CREATE",

      // for UPDATE: include discountId (docs may have missed it)
      ...(update ? { discountId: Number(updateId) } : {}),

      discountName: disName,
      variantId: Number(varId),
      waiverMode: mode,
      discountValue: Number(disvalue),
      isActive: Boolean(isActive),

      // send both keys for compatibility
      stateDateTime: startISO,
      startDateTime: startISO,
      endDateTime: endISO,
    };

    const req = discountRequest(obj);

    req
      .then(() => {
        setcount((p) => p + 1);
        getdata();
        reset();
      })
      .catch((err) => {
        console.error(
          update ? "Update error:" : "Create error:",
          err.response?.data || err.message
        );
        window.alert("Discount save failed (check console)");
      });
  };

  const handleDelete = (id) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this discount?")) return;

    discountRequest({ requestType: "DELETE", discountId: Number(id) })
      .then(() => {
        setcount((p) => p + 1);
        getdata();
      })
      .catch((err) => {
        console.error("Delete error:", err.response?.data || err.message);
        window.alert("Delete failed");
      });
  };

  const getVariantIdFromDiscount = (d) =>
    d?.variantId ??
    d?.variant?.id ??
    d?.variant?.variantId ??
    d?.variant?.productVariantId ??
    "";

  const handleEdit = (v) => {
    setupdateId(v.discountId);
    setupdate(true);
    setDisname(v.discountName || "");
    setvarId(getVariantIdFromDiscount(v));
    setmode(v.waiverMode || "");
    setdisvalue(v.discountValue ?? "");

    setStartDate(isoToLocalInput(v.startDateTime || v.stateDateTime));
    setend(isoToLocalInput(v.endDateTime));

    setIsActive(v.isActive ?? true);
    setShowForm(true);
  };

  const variantOptions = variants.map((v) => {
    const id = v.id ?? v.variantId ?? v.productVariantId;
    const productName = v.product?.productName ? ` • ${v.product.productName}` : "";
    return {
      value: Number(id),
      label: `${v.variantName} — ${v.variantValue}${productName}`,
    };
  });

  const filteredData = data.filter((v) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = (v.discountName || "").toLowerCase();
    const variant = (v.variant?.variantName || "").toLowerCase();
    const mode_ = (v.waiverMode || "").toLowerCase();
    const product = (v.variant?.product?.productName || "").toLowerCase();
    return name.includes(q) || variant.includes(q) || mode_.includes(q) || product.includes(q);
  });

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      background: theme.inputBg,
      borderColor: state.isFocused ? theme.primary : theme.inputBorder,
      borderWidth: "2px",
      borderRadius: theme.radiusMd,
      boxShadow: state.isFocused ? `0 0 0 3px rgba(59, 130, 246, 0.2)` : "none",
      "&:hover": { borderColor: theme.primaryLight },
      minHeight: "44px",
    }),
    option: (base, state) => ({
      ...base,
      background: state.isSelected
        ? theme.primary
        : state.isFocused
        ? `rgba(59, 130, 246, 0.1)`
        : "white",
      color: state.isSelected ? "white" : theme.textPrimary,
      fontWeight: "600",
      fontSize: "13px",
    }),
    singleValue: (base) => ({
      ...base,
      color: theme.textPrimary,
      fontWeight: "600",
      fontSize: "13px",
    }),
    placeholder: (base) => ({ ...base, color: theme.textMuted, fontSize: "13px" }),
    menu: (base) => ({
      ...base,
      borderRadius: theme.radiusMd,
      overflow: "hidden",
      boxShadow: `0 8px 30px rgba(59, 130, 246, 0.15)`,
    }),
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

  const calculateStats = () => {
    const totalDiscounts = data.length;
    const percentDiscounts = data.filter((d) => d.waiverMode === "PERCENT").length;
    const fixedDiscounts = data.filter((d) => d.waiverMode === "FIXED").length;

    const avgDiscount =
      data.length > 0
        ? (
            data.reduce((sum, d) => sum + Number(d.discountValue || 0), 0) / data.length
          ).toFixed(1)
        : 0;

    const activeCount = data.filter((d) => d.isActive === true).length;

    return { totalDiscounts, percentDiscounts, fixedDiscounts, avgDiscount, activeCount };
  };

  const stats = calculateStats();

  return (
    <>
      <style>{`
        @keyframes slideInCard {
          0% { opacity: 0; transform: translateY(30px) scale(0.95); }
          60% { opacity: 1; transform: translateY(-5px) scale(1.01); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
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

        .discount-card {
          animation: slideInCard 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          opacity: 0;
        }
        .discount-card:hover {
          transform: translateY(-6px) scale(1.015);
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.2);
          border-color: rgba(96, 165, 250, 0.5);
        }
        .discount-card:hover .discount-badge {
          transform: scale(1.1) rotate(-2deg);
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.35);
        }
        .discount-card:hover .discount-title { color: #3B82F6; }

        .discount-badge { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .discount-title { transition: color 0.3s ease; }

        .discount-edit, .discount-delete {
          transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .discount-edit:hover {
          transform: translateY(-2px) scale(1.08);
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.45);
        }
        .discount-delete:hover {
          transform: translateY(-2px) scale(1.08);
          box-shadow: 0 4px 16px rgba(239, 68, 68, 0.45);
        }

        .discount-input:focus {
          border-color: #3B82F6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          background: #EFF6FF;
        }

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

        .stat-card { transition: all 0.3s ease; }
        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);
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

        <div style={{ position: "relative", zIndex: 10, maxWidth: "1400px", margin: "0 auto" }}>
          {/* Stats Bar */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
            <div className="stat-card" style={{
              background: theme.cardBg,
              border: `1.5px solid ${theme.border}`,
              borderRadius: theme.radiusLg,
              padding: "12px 18px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: `0 2px 8px rgba(59, 130, 246, 0.08)`,
            }}>
              <div style={{
                width: "38px",
                height: "38px",
                background: "rgba(59, 130, 246, 0.12)",
                borderRadius: theme.radiusMd,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <svg style={{ width: "18px", height: "18px", color: "#3B82F6" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "20px", fontWeight: "800", color: theme.textPrimary, lineHeight: 1 }}>
                  {stats.totalDiscounts}
                </div>
                <div style={{ fontSize: "10px", fontWeight: "600", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                  Total Discounts
                </div>
              </div>
            </div>

            <div className="stat-card" style={{
              background: theme.cardBg,
              border: `1.5px solid ${theme.border}`,
              borderRadius: theme.radiusLg,
              padding: "12px 18px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: `0 2px 8px rgba(59, 130, 246, 0.08)`,
            }}>
              <div style={{
                width: "38px",
                height: "38px",
                background: "rgba(139, 92, 246, 0.12)",
                borderRadius: theme.radiusMd,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <svg style={{ width: "18px", height: "18px", color: "#8B5CF6" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "20px", fontWeight: "800", color: theme.textPrimary, lineHeight: 1 }}>
                  {stats.percentDiscounts}
                </div>
                <div style={{ fontSize: "10px", fontWeight: "600", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                  Percent Off
                </div>
              </div>
            </div>

            <div className="stat-card" style={{
              background: theme.cardBg,
              border: `1.5px solid ${theme.border}`,
              borderRadius: theme.radiusLg,
              padding: "12px 18px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: `0 2px 8px rgba(59, 130, 246, 0.08)`,
            }}>
              <div style={{
                width: "38px",
                height: "38px",
                background: "rgba(16, 185, 129, 0.12)",
                borderRadius: theme.radiusMd,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <svg style={{ width: "18px", height: "18px", color: "#10B981" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m-4-4h8" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "20px", fontWeight: "800", color: theme.textPrimary, lineHeight: 1 }}>
                  {stats.fixedDiscounts}
                </div>
                <div style={{ fontSize: "10px", fontWeight: "600", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                  Fixed
                </div>
              </div>
            </div>

            <div className="stat-card" style={{
              background: theme.cardBg,
              border: `1.5px solid ${theme.border}`,
              borderRadius: theme.radiusLg,
              padding: "12px 18px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: `0 2px 8px rgba(59, 130, 246, 0.08)`,
            }}>
              <div style={{
                width: "38px",
                height: "38px",
                background: "rgba(245, 158, 11, 0.12)",
                borderRadius: theme.radiusMd,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <svg style={{ width: "18px", height: "18px", color: "#F59E0B" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "20px", fontWeight: "800", color: theme.textPrimary, lineHeight: 1 }}>
                  {stats.activeCount}
                </div>
                <div style={{ fontSize: "10px", fontWeight: "600", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                  Active
                </div>
              </div>
            </div>

            {searchQuery && (
              <div className="stat-card" style={{
                background: "rgba(59, 130, 246, 0.1)",
                border: `1.5px solid rgba(59, 130, 246, 0.25)`,
                borderRadius: theme.radiusLg,
                padding: "12px 18px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#3B82F6" }}>
                  {filteredData.length} results for "{searchQuery}"
                </div>
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    background: "rgba(59, 130, 246, 0.15)",
                    border: "none",
                    borderRadius: theme.radiusFull,
                    padding: "3px 8px",
                    fontSize: "10px",
                    fontWeight: "700",
                    color: "#3B82F6",
                    cursor: "pointer",
                  }}
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "14px",
          }}>
            {filteredData.length > 0 ? (
              filteredData.map((v, i) => {
                const badgeValue =
                  v.waiverMode === "PERCENT"
                    ? `${v.discountValue}%`
                    : `₹${v.discountValue}`;

                return (
                  <div
                    key={v.discountId}
                    className="discount-card"
                    style={{
                      background: theme.cardBg,
                      border: `1.5px solid ${theme.border}`,
                      borderRadius: theme.radiusLg,
                      overflow: "hidden",
                      boxShadow: `0 2px 10px rgba(59, 130, 246, 0.07)`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  >
                    <div style={{
                      background: v.isActive ? theme.gradientPrimary : "linear-gradient(135deg, #9CA3AF, #CBD5E1)",
                      padding: "14px",
                      position: "relative",
                      overflow: "hidden",
                    }}>
                      <div style={{
                        position: "absolute",
                        top: "-20px",
                        right: "-20px",
                        width: "80px",
                        height: "80px",
                        background: "rgba(255, 255, 255, 0.08)",
                        borderRadius: "50%",
                      }} />

                      <div className="discount-badge" style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(10px)",
                        border: "1.5px solid rgba(255, 255, 255, 0.3)",
                        borderRadius: theme.radiusMd,
                        padding: "8px 14px",
                        marginBottom: "8px",
                      }}>
                        <div style={{ fontSize: "24px", fontWeight: "900", color: "white", lineHeight: 1 }}>
                          {badgeValue}
                        </div>
                      </div>

                      <div className="discount-title" style={{
                        fontSize: "15px",
                        fontWeight: "800",
                        color: "white",
                        marginBottom: "5px",
                        textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}>
                        {v.discountName}
                      </div>

                      <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                      }}>
                        <div style={{
                          background: "rgba(255, 255, 255, 0.25)",
                          borderRadius: theme.radiusFull,
                          padding: "3px 10px",
                          fontSize: "9px",
                          fontWeight: "800",
                          color: "white",
                          textTransform: "uppercase",
                          letterSpacing: "0.8px",
                        }}>
                          {v.waiverMode}
                        </div>

                        <div style={{
                          background: "rgba(255, 255, 255, 0.25)",
                          borderRadius: theme.radiusFull,
                          padding: "3px 10px",
                          fontSize: "9px",
                          fontWeight: "800",
                          color: "white",
                          textTransform: "uppercase",
                          letterSpacing: "0.8px",
                        }}>
                          {v.isActive ? "Active" : "Inactive"}
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: "12px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px",
                          background: theme.inputBg,
                          borderRadius: theme.radiusSm,
                        }}>
                          <div style={{
                            width: "30px",
                            height: "30px",
                            background: theme.gradientPrimary,
                            borderRadius: theme.radiusSm,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: "900",
                            color: "white",
                            flexShrink: 0,
                          }}>
                            {(v.variant?.variantName || "V").charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: "12px",
                              fontWeight: "800",
                              color: theme.textPrimary,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}>
                              {v.variant?.variantName || "No Variant"}
                            </div>
                            <div style={{
                              fontSize: "10px",
                              fontWeight: "600",
                              color: theme.textMuted,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}>
                              {v.variant?.product?.productName ? v.variant.product.productName : ""}
                            </div>
                          </div>
                        </div>

                        {(v.startDateTime || v.endDateTime) && (
                          <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "8px",
                          }}>
                            <div style={{
                              padding: "8px",
                              background: "rgba(59, 130, 246, 0.06)",
                              border: "1px solid rgba(59, 130, 246, 0.12)",
                              borderRadius: theme.radiusSm,
                            }}>
                              <div style={{ fontSize: "9px", fontWeight: "800", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Start
                              </div>
                              <div style={{ fontSize: "11px", fontWeight: "800", color: theme.textSecondary }}>
                                {v.startDateTime ? new Date(v.startDateTime).toLocaleString() : "—"}
                              </div>
                            </div>

                            <div style={{
                              padding: "8px",
                              background: "rgba(239, 68, 68, 0.06)",
                              border: "1px solid rgba(239, 68, 68, 0.12)",
                              borderRadius: theme.radiusSm,
                            }}>
                              <div style={{ fontSize: "9px", fontWeight: "800", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                End
                              </div>
                              <div style={{ fontSize: "11px", fontWeight: "800", color: "#EF4444" }}>
                                {v.endDateTime ? new Date(v.endDateTime).toLocaleString() : "—"}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{
                        display: "flex",
                        gap: "6px",
                        marginTop: "10px",
                        paddingTop: "10px",
                        borderTop: `1px solid ${theme.borderLight}`,
                      }}>
                        <button
                          className="discount-edit"
                          onClick={() => handleEdit(v)}
                          style={{
                            flex: 1,
                            height: "32px",
                            background: theme.gradientPrimary,
                            border: "none",
                            borderRadius: theme.radiusSm,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            cursor: "pointer",
                            boxShadow: `0 2px 6px rgba(59, 130, 246, 0.25)`,
                            color: "white",
                            fontWeight: 800,
                            fontSize: "11px",
                          }}
                          type="button"
                        >
                          Edit
                        </button>

                        <button
                          className="discount-delete"
                          onClick={() => handleDelete(v.discountId)}
                          style={{
                            flex: 1,
                            height: "32px",
                            background: theme.gradientDanger,
                            border: "none",
                            borderRadius: theme.radiusSm,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            cursor: "pointer",
                            boxShadow: `0 2px 6px rgba(239, 68, 68, 0.25)`,
                            color: "white",
                            fontWeight: 800,
                            fontSize: "11px",
                          }}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "50px 20px",
                color: theme.textMuted,
              }}>
                <div style={{
                  width: "60px",
                  height: "60px",
                  background: "rgba(59, 130, 246, 0.1)",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                  animation: "float 3s ease-in-out infinite",
                }}>
                  <svg style={{ width: "28px", height: "28px", color: "#3B82F6", opacity: 0.6 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: theme.textPrimary, margin: "0 0 4px" }}>
                  {searchQuery ? "No results found" : "No discounts yet"}
                </h3>
                <p style={{ fontSize: "12px", margin: 0 }}>
                  {searchQuery ? "Try a different search term" : "Click the + button to add a discount"}
                </p>
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
            onClick={(e) => { if (e.target === e.currentTarget) reset(); }}
          >
            <div
              className="form-panel"
              style={{
                width: "100%",
                maxWidth: "520px",
                background: theme.cardBg,
                border: `2px solid ${theme.border}`,
                borderRadius: theme.radiusXl,
                padding: "28px",
                boxShadow: `0 20px 60px rgba(0,0,0,0.2)`,
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    background: update ? theme.gradientWarning : theme.gradientPrimary,
                    borderRadius: theme.radiusMd,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 3px 12px ${update ? "rgba(245, 158, 11, 0.35)" : "rgba(59, 130, 246, 0.35)"}`,
                  }}>
                    <svg style={{ width: "20px", height: "20px", color: "white" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={update ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
                    </svg>
                  </div>
                  <div>
                    <h2 style={{ fontSize: "18px", fontWeight: "900", color: theme.textPrimary, margin: 0 }}>
                      {update ? "Edit Discount" : "Add Discount"}
                    </h2>
                    <p style={{ fontSize: "12px", color: theme.textMuted, margin: 0 }}>
                      {update ? "Update discount details" : "Create a new discount offer"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={reset}
                  type="button"
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
                >
                  X
                </button>
              </div>

              <form onSubmit={sbt} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: theme.textSecondary, marginBottom: "6px" }}>
                    Discount Name
                  </label>
                  <input
                    className="discount-input"
                    type="text"
                    placeholder="e.g. Eid Offer"
                    value={disName}
                    onChange={(e) => setDisname(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: theme.textSecondary, marginBottom: "6px" }}>
                    Select Variant
                  </label>
                  <Select
                    options={variantOptions}
                    value={variantOptions.find((opt) => Number(opt.value) === Number(varId)) || null}
                    onChange={(selected) => setvarId(selected?.value ?? "")}
                    placeholder="Choose a variant..."
                    isSearchable
                    styles={selectStyles}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: theme.textSecondary, marginBottom: "6px" }}>
                      Waiver Mode
                    </label>
                    <select
                      className="discount-input"
                      value={mode}
                      onChange={(e) => setmode(e.target.value)}
                      style={inputStyle}
                      required
                    >
                      <option value="">Select...</option>
                      <option value="PERCENT">PERCENT</option>
                      <option value="FIXED">FIXED</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: theme.textSecondary, marginBottom: "6px" }}>
                      Discount Value
                    </label>
                    <input
                      className="discount-input"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={mode === "PERCENT" ? "5" : "50"}
                      value={disvalue}
                      onChange={(e) => setdisvalue(e.target.value)}
                      style={inputStyle}
                      required
                    />
                  </div>
                </div>

                {/* Start + End */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: theme.textSecondary, marginBottom: "6px" }}>
                      Start DateTime
                    </label>
                    <input
                      className="discount-input"
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      style={inputStyle}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: theme.textSecondary, marginBottom: "6px" }}>
                      End DateTime
                    </label>
                    <input
                      className="discount-input"
                      type="datetime-local"
                      value={enddate}
                      onChange={(e) => setend(e.target.value)}
                      style={inputStyle}
                      required
                    />
                  </div>
                </div>

                {/* Active */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  background: theme.inputBg,
                  border: `2px solid ${theme.inputBorder}`,
                  borderRadius: theme.radiusMd,
                }}>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: "900", color: theme.textPrimary }}>
                      Active
                    </div>
                    <div style={{ fontSize: "11px", fontWeight: "600", color: theme.textMuted }}>
                      Turn discount ON/OFF
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    style={{ width: "18px", height: "18px" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                  <button
                    type="button"
                    onClick={reset}
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
                      transition: "all 0.3s ease",
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      height: "46px",
                      background: update ? theme.gradientWarning : theme.gradientPrimary,
                      border: "none",
                      borderRadius: theme.radiusMd,
                      fontSize: "14px",
                      fontWeight: "900",
                      color: theme.textOnPrimary,
                      cursor: "pointer",
                      boxShadow: `0 4px 14px ${update ? "rgba(245, 158, 11, 0.4)" : "rgba(59, 130, 246, 0.4)"}`,
                      transition: "all 0.3s ease",
                    }}
                  >
                    {update ? "Update Discount" : "Create Discount"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* FAB */}
        <button
          className="add-fab"
          onClick={openCreateForm}
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
            Add Discount
          </span>
        </button>
      </div>
    </>
  );
};

export default Discount;