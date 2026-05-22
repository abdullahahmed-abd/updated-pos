// Filename: Singlepage.jsx (FINAL - payload fixed)
import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Navbar from "./Navbar";
import { AppContext } from "./Contextapi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Singleproduct = () => {
  const { id } = useParams();
  const productIdParam = Number(id);

  const ctx = useContext(AppContext);
  const [token, settoken, count, setcount, user, setuser] = ctx;
  const BaseUrl = ctx[ctx.length - 1];

  const [ismenu, setismenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [discounts, setDiscounts] = useState([]);

  const [cartItems, setCartItems] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("PENDING");

  const [paymentModeUI, setPaymentModeUI] = useState("CASH");
  const [cashAmount, setCashAmount] = useState("");
  const [onlineAmount, setOnlineAmount] = useState("");

  const [extraDiscount, setExtraDiscount] = useState("");
  const [tax, setTax] = useState("18");

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
    gradientSecondary: "linear-gradient(135deg, #8B5CF6, #A78BFA)",
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

  const productRequest = (payload) => api.post("/product", payload);
  const variantRequest = (payload) => api.post("/variant", payload);
  const inventoryRequest = (payload) => api.post("/inventory", payload);
  const discountRequest = (payload) => api.post("/discount", payload);
  const orderRequest = (payload) => api.post("/order", payload);

  const normalizeList = (resData, key) => {
    if (Array.isArray(resData)) return resData;
    if (Array.isArray(resData?.[key])) return resData[key];
    if (Array.isArray(resData?.data?.[key])) return resData.data[key];
    return [];
  };

  const getVariantId = (v) =>
    v?.id ?? v?.variantId ?? v?.productVariantId ?? null;

  const getInventoryVariantId = (inv) =>
    inv?.variantId ??
    inv?.productVariant?.id ??
    inv?.productVariant?.productVariantId ??
    null;

  const isDiscountActiveNow = (d) => {
    if (!d?.isActive) return false;
    const now = new Date();
    const start = d?.startDateTime ? new Date(d.startDateTime) : null;
    const end = d?.endDateTime ? new Date(d.endDateTime) : null;
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  };

  const findActiveDiscountForVariant = (variantId) => {
    return discounts.find((d) => {
      const did =
        d?.variantId ?? d?.variant?.id ?? d?.variant?.productVariantId;
      return Number(did) === Number(variantId) && isDiscountActiveNow(d);
    });
  };

  const computeEffectiveUnitPrice = (basePrice, discountObj) => {
    const price = Number(basePrice || 0);
    if (!discountObj) return { effective: price, label: "" };
    const dv = Number(discountObj.discountValue || 0);
    if (discountObj.waiverMode === "PERCENT") {
      const effective = Math.max(0, price - (dv / 100) * price);
      return { effective, label: `${dv}%` };
    }
    const effective = Math.max(0, price - dv);
    return { effective, label: `${dv}` };
  };

  const getProductData = async () => {
    if (!BaseUrl || !productIdParam) return;
    try {
      const [prRes, vRes, invRes, disRes] = await Promise.all([
        productRequest({ requestType: "READ_BY_ID", productId: productIdParam }),
        variantRequest({ requestType: "READ_BY_PRODUCT_ID", productId: productIdParam }),
        inventoryRequest({ requestType: "READ_ALL" }),
        discountRequest({ requestType: "READ_ALL" }),
      ]);
      setProduct(prRes.data || null);
      setVariants(normalizeList(vRes.data, "variants"));
      setInventories(normalizeList(invRes.data, "inventories"));
      setDiscounts(normalizeList(disRes.data, "discounts"));
    } catch (err) {
      console.error("Singleproduct load error:", err);
      toast.error("Failed to load product");
    }
  };

  useEffect(() => {
    getProductData();
    // eslint-disable-next-line
  }, [BaseUrl, productIdParam, count]);

  const variantCards = useMemo(() => {
    const invMap = new Map();
    inventories.forEach((inv) => {
      const vid = getInventoryVariantId(inv);
      if (vid != null) invMap.set(String(vid), inv);
    });

    const q = searchQuery.trim().toLowerCase();

    return variants
      .map((v) => {
        const vid = getVariantId(v);
        const inv = invMap.get(String(vid));
        const stock = Number(inv?.quantity ?? 0);
        const location = inv?.location ?? "—";
        const activeDis = findActiveDiscountForVariant(vid);
        const { effective, label } = computeEffectiveUnitPrice(v.price, activeDis);
        return {
          raw: v,
          variantId: vid,
          variantName: v.variantName,
          variantValue: v.variantValue,
          price: Number(v.price || 0),
          refundable: v.refundable ?? v.isRefundable ?? true,
          stock,
          location,
          activeDiscount: activeDis,
          effectivePrice: effective,
          discountLabel: label,
        };
      })
      .filter((x) => {
        if (!q) return true;
        const name = String(x.variantName || "").toLowerCase();
        const val = String(x.variantValue || "").toLowerCase();
        const loc = String(x.location || "").toLowerCase();
        return name.includes(q) || val.includes(q) || loc.includes(q);
      });
    // eslint-disable-next-line
  }, [variants, inventories, discounts, searchQuery]);

  const addToCart = (variantObj, qty = 1) => {
    if (!variantObj?.variantId) return;
    const quantity = Math.max(1, Number(qty || 1));
    if (variantObj.stock < quantity) {
      toast.error(`Stock not available. Available: ${variantObj.stock}`);
      return;
    }
    setCartItems((prev) => {
      const idx = prev.findIndex(
        (x) => Number(x.variantId) === Number(variantObj.variantId)
      );
      if (idx !== -1) {
        const nextQty = Number(prev[idx].quantity) + quantity;
        if (nextQty > variantObj.stock) {
          toast.error(`Stock not available. Available: ${variantObj.stock}`);
          return prev;
        }
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: nextQty };
        toast.success("Quantity updated in cart");
        return copy;
      }
      toast.success("Added to cart");
      return [
        ...prev,
        {
          variantId: Number(variantObj.variantId),
          variantName: variantObj.variantName,
          variantValue: variantObj.variantValue,
          unitPrice: Number(variantObj.price),
          effectiveUnitPrice: Number(variantObj.effectivePrice),
          discountLabel: variantObj.discountLabel,
          stock: Number(variantObj.stock),
          location: variantObj.location,
          quantity,
        },
      ];
    });
  };

  const increase = (idx) => {
    setCartItems((prev) => {
      const copy = [...prev];
      const item = copy[idx];
      const nextQty = Number(item.quantity) + 1;
      if (nextQty > Number(item.stock)) {
        toast.error(`Stock not available. Available: ${item.stock}`);
        return prev;
      }
      copy[idx] = { ...item, quantity: nextQty };
      return copy;
    });
  };

  const decrease = (idx) => {
    setCartItems((prev) => {
      const copy = [...prev];
      const item = copy[idx];
      const nextQty = Math.max(1, Number(item.quantity) - 1);
      copy[idx] = { ...item, quantity: nextQty };
      return copy;
    });
  };

  const removeItem = (idx) => {
    setCartItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // ✅ tax = plain number like "18" = 18%
  const calcTotals = useMemo(() => {
    const subtotal = cartItems.reduce(
      (sum, it) => sum + Number(it.effectiveUnitPrice) * Number(it.quantity),
      0
    );

    const extraDisVal = String(extraDiscount || "").includes("%")
      ? (parseFloat(extraDiscount) / 100) * subtotal
      : parseFloat(extraDiscount) || 0;

    const afterDiscount = Math.max(0, subtotal - extraDisVal);

    // ✅ tax plain number like 18 = 18%
    const taxPercent = parseFloat(tax) || 0;
    const taxAmount = (taxPercent / 100) * afterDiscount;

    const total = afterDiscount + taxAmount;

    return {
      subtotal: subtotal.toFixed(2),
      extraDiscountAmount: extraDisVal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2),
    };
  }, [cartItems, extraDiscount, tax]);

  // ===== Place Order =====
  const placeOrder = (e) => {
    e.preventDefault();

    if (phone.trim().length < 10) return toast.error("Invalid phone number");
    if (cartItems.length === 0) return toast.error("Cart is empty");

    const totalDouble = parseFloat(calcTotals.total);

    // ✅ String type (backend String field)
    const cashVal =
      paymentModeUI === "ONLINE_UPI"
        ? "0"
        : String(Math.round(parseFloat(cashAmount || 0)));

    const onlineVal =
      paymentModeUI === "CASH"
        ? "0"
        : String(Math.round(parseFloat(onlineAmount || 0)));

    const paid = parseFloat(cashVal) + parseFloat(onlineVal);
    if (paid < totalDouble)
      return toast.error(`Paid ₹${paid} is less than total ₹${totalDouble}`);

    // ✅ taxPrice -> number (Double) plain percent
    const taxPercent = parseFloat(tax) || 0;

    // ✅ discount -> number (Double)
    const discountVal = String(extraDiscount).includes("%")
      ? parseFloat(extraDiscount)
      : parseFloat(extraDiscount) || 0;

    const paymentMode =
      paymentModeUI === "BOTH"
        ? "BOTH"
        : paymentModeUI === "ONLINE_UPI"
        ? "ONLINE_UPI"
        : "CASH";

    const payload = {
      requestType: "CREATE",
      userPhoneNumber: phone.trim(),
      ...(email.trim() ? { email: email.trim() } : {}),
      status: status.toUpperCase(),
      paymentMode,
      cashAmount: cashVal,                    // ✅ String "400"
      onlineAmount: onlineVal,               // ✅ String "0"
      taxPrice: taxPercent,                  // ✅ Double 18.0
      discount: discountVal,                 // ✅ Double 0.0
      totalAmount: Math.round(totalDouble),  // ✅ number
      orderItemRequests: cartItems.map((it) => ({
        variantId: Number(it.variantId),
        quantity: Number(it.quantity),
      })),
    };

    console.log("✅ ORDER PAYLOAD →", JSON.stringify(payload, null, 2));

    orderRequest(payload)
      .then((res) => {
        console.log("✅ Order Success →", res.data);
        toast.success("Order created successfully");
        setcount((p) => p + 1);
        setShowSidebar(false);
        setCartItems([]);
        setPhone("");
        setEmail("");
        setStatus("PENDING");
        setPaymentModeUI("CASH");
        setCashAmount("");
        setOnlineAmount("");
        setExtraDiscount("");
        setTax("18");
      })
      .catch((err) => {
        console.error("Order create error:", err.response?.data || err);
        toast.error(
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Order failed!"
        );
      });
  };

  const inputStyle = {
    width: "100%",
    height: "44px",
    background: theme.inputBg,
    border: `2px solid ${theme.inputBorder}`,
    borderRadius: theme.radiusMd,
    padding: "0 14px",
    fontSize: "13px",
    fontWeight: 800,
    color: theme.textPrimary,
    outline: "none",
    boxSizing: "border-box",
    transition: "all 0.3s ease",
  };

  return (
    <>
      <style>{`
        @keyframes slideInCard {
          0% { opacity:0; transform:translateY(30px) scale(0.96); }
          60% { opacity:1; transform:translateY(-6px) scale(1.01); }
          100% { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes slideInRow {
          0% { opacity:0; transform:translateX(-40px); }
          60% { opacity:1; transform:translateX(6px); }
          100% { opacity:1; transform:translateX(0); }
        }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(30px); }
          to { opacity:1; transform:translateY(0); }
        }
        @keyframes blob1 {
          0%,100% { transform:translate(0,0) scale(1); opacity:0.25; }
          25% { transform:translate(30px,-50px) scale(1.1); opacity:0.35; }
          50% { transform:translate(-20px,20px) scale(0.95); opacity:0.2; }
          75% { transform:translate(50px,30px) scale(1.05); opacity:0.3; }
        }
        @keyframes blob2 {
          0%,100% { transform:translate(0,0) scale(1); opacity:0.2; }
          25% { transform:translate(-40px,30px) scale(1.15); opacity:0.35; }
          50% { transform:translate(30px,-40px) scale(0.9); opacity:0.15; }
          75% { transform:translate(-20px,-20px) scale(1.1); opacity:0.3; }
        }
        @keyframes float {
          0%,100% { transform:translateY(0px); }
          50% { transform:translateY(-6px); }
        }
        .variant-card {
          animation: slideInCard 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards;
          transition: all 0.45s cubic-bezier(0.34,1.56,0.64,1);
          opacity:0;
        }
        .variant-card:hover {
          transform:translateY(-10px) scale(1.02);
          box-shadow:0 20px 50px rgba(59,130,246,0.18), 0 0 0 2px rgba(96,165,250,0.5);
          border-color:rgba(96,165,250,0.7);
        }
        .cart-row {
          animation: slideInRow 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;
          transition: all 0.4s cubic-bezier(0.34,1.56,0.64,1);
          opacity:0;
        }
        .cart-row:hover {
          transform:translateX(6px) scale(1.01);
          box-shadow:0 6px 24px rgba(59,130,246,0.18), 0 0 0 1.5px rgba(96,165,250,0.5);
          border-color:rgba(96,165,250,0.6);
        }
        .panel { animation: slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1); }
        .add-fab {
          transition: all 0.4s cubic-bezier(0.34,1.56,0.64,1);
          animation: float 3s ease-in-out infinite;
        }
        .add-fab:hover {
          transform:translateY(-6px) scale(1.12) !important;
          box-shadow:0 14px 40px rgba(59,130,246,0.5) !important;
          animation-play-state:paused;
        }
        .sp-input:focus {
          border-color:#3B82F6 !important;
          box-shadow:0 0 0 3px rgba(59,130,246,0.2);
          background:#EFF6FF;
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
          padding: "90px 28px 110px 28px",
          position: "relative",
        }}
      >
        {/* Blobs */}
        <div style={{
          position:"fixed", inset:0, overflow:"hidden",
          pointerEvents:"none", zIndex:0,
        }}>
          <div style={{
            position:"absolute", top:"-80px", right:"-80px",
            width:"400px", height:"400px",
            background:"radial-gradient(circle, rgba(30,64,175,0.25), transparent 70%)",
            borderRadius:"50%", filter:"blur(70px)",
            animation:"blob1 10s ease-in-out infinite",
          }}/>
          <div style={{
            position:"absolute", bottom:"-100px", left:"-100px",
            width:"450px", height:"450px",
            background:"radial-gradient(circle, rgba(96,165,250,0.2), transparent 70%)",
            borderRadius:"50%", filter:"blur(80px)",
            animation:"blob2 12s ease-in-out infinite",
          }}/>
        </div>

        <div style={{ position:"relative", zIndex:10, maxWidth:"1200px", margin:"0 auto" }}>

          {/* Product Header */}
          <div style={{
            background:theme.cardBg,
            border:`1.5px solid ${theme.border}`,
            borderRadius:theme.radiusXl,
            overflow:"hidden",
            boxShadow:"0 10px 20px rgba(59,130,246,0.08)",
            marginBottom:"16px",
          }}>
            <div style={{
              background:theme.gradientPrimary,
              padding:"18px",
              position:"relative",
              overflow:"hidden",
            }}>
              <div style={{
                position:"absolute", top:"-40px", right:"-40px",
                width:"160px", height:"160px",
                borderRadius:"50%",
                background:"rgba(255,255,255,0.12)",
              }}/>

              <div style={{
                display:"flex", alignItems:"center",
                justifyContent:"space-between",
                gap:"12px", flexWrap:"wrap",
              }}>
                <div style={{ minWidth:0 }}>
                  <div style={{
                    color:"rgba(255,255,255,0.9)",
                    fontSize:"12px", fontWeight:800,
                    letterSpacing:"1px", textTransform:"uppercase",
                  }}>
                    Product Details
                  </div>
                  <div style={{
                    marginTop:"6px", color:"white",
                    fontSize:"26px", fontWeight:900,
                    lineHeight:1.1,
                    whiteSpace:"nowrap", overflow:"hidden",
                    textOverflow:"ellipsis", maxWidth:"780px",
                  }}>
                    {product?.productName || "Loading..."}
                  </div>
                  <div style={{
                    marginTop:"8px",
                    color:"rgba(255,255,255,0.85)",
                    fontSize:"13px", fontWeight:700,
                  }}>
                    {product?.sku ? `SKU: ${product.sku}` : ""}
                  </div>
                </div>

                <div style={{
                  display:"flex", alignItems:"center",
                  gap:"10px", flexWrap:"wrap",
                  justifyContent:"flex-end",
                }}>
                  <div style={{
                    background:"rgba(255,255,255,0.22)",
                    border:"1.5px solid rgba(255,255,255,0.25)",
                    borderRadius:theme.radiusFull,
                    padding:"6px 14px",
                    color:"white", fontWeight:900, fontSize:"12px",
                  }}>
                    Category: {product?.category?.name || "—"}
                  </div>

                  <div style={{
                    background:"rgba(255,255,255,0.22)",
                    border:"1.5px solid rgba(255,255,255,0.25)",
                    borderRadius:theme.radiusFull,
                    padding:"6px 14px",
                    color:"white", fontWeight:900, fontSize:"12px",
                  }}>
                    Variants: {variantCards.length}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding:"16px 18px" }}>
              <div style={{
                fontSize:"12px", fontWeight:900, color:theme.textMuted,
                textTransform:"uppercase", letterSpacing:"1px",
              }}>
                Description
              </div>
              <div style={{
                marginTop:"6px", fontSize:"14px",
                fontWeight:700, color:theme.textSecondary, lineHeight:1.6,
              }}>
                {product?.description || "No description available."}
              </div>
            </div>
          </div>

          {/* Variants Grid Header */}
          <div style={{
            display:"flex", alignItems:"center",
            justifyContent:"space-between",
            marginBottom:"10px", gap:"12px", flexWrap:"wrap",
          }}>
            <div style={{ fontSize:"18px", fontWeight:900, color:theme.textPrimary }}>
              Variants & Inventory
            </div>

            {cartItems.length > 0 && (
              <button
                className="add-fab"
                type="button"
                onClick={() => setShowSidebar(true)}
                style={{
                  height:"46px", padding:"0 18px",
                  background:theme.gradientSecondary,
                  border:"none", borderRadius:theme.radiusFull,
                  color:"white", fontWeight:900, cursor:"pointer",
                  boxShadow:"0 10px 26px rgba(139,92,246,0.28)",
                }}
              >
                Checkout (₹{calcTotals.total})
              </button>
            )}
          </div>

          {/* Variants Grid */}
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",
            gap:"14px",
          }}>
            {variantCards.length > 0 ? (
              variantCards.map((v, i) => (
                <div
                  key={v.variantId ?? i}
                  className="variant-card"
                  style={{
                    background:theme.cardBg,
                    border:`1.5px solid rgba(229,231,235,0.75)`,
                    borderRadius:theme.radiusXl,
                    overflow:"hidden",
                    boxShadow:"0 2px 8px rgba(59,130,246,0.06)",
                    animationDelay:`${i * 0.06}s`,
                  }}
                >
                  <div style={{
                    background:theme.gradientPrimary,
                    padding:"14px",
                    position:"relative",
                    overflow:"hidden",
                  }}>
                    <div style={{
                      position:"absolute", top:"-22px", right:"-22px",
                      width:"90px", height:"90px",
                      borderRadius:"50%",
                      background:"rgba(255,255,255,0.10)",
                    }}/>

                    <div style={{
                      display:"flex", alignItems:"center",
                      justifyContent:"space-between", gap:"10px",
                    }}>
                      <div style={{
                        width:"40px", height:"40px",
                        background:"rgba(255,255,255,0.18)",
                        border:"1.5px solid rgba(255,255,255,0.22)",
                        borderRadius:theme.radiusMd,
                        display:"flex", alignItems:"center",
                        justifyContent:"center",
                        color:"white", fontWeight:900,
                        fontSize:"16px", flexShrink:0,
                      }}>
                        {(v.variantName || "V").charAt(0).toUpperCase()}
                      </div>

                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{
                          color:"white", fontSize:"14px", fontWeight:900,
                          whiteSpace:"nowrap", overflow:"hidden",
                          textOverflow:"ellipsis",
                        }}>
                          {v.variantName}
                        </div>
                        <div style={{
                          marginTop:"2px",
                          color:"rgba(255,255,255,0.85)",
                          fontSize:"12px", fontWeight:700,
                          whiteSpace:"nowrap", overflow:"hidden",
                          textOverflow:"ellipsis",
                        }}>
                          {v.variantValue}
                        </div>
                      </div>

                      <div style={{
                        background:"rgba(255,255,255,0.18)",
                        border:"1.5px solid rgba(255,255,255,0.22)",
                        borderRadius:theme.radiusFull,
                        padding:"6px 10px",
                        color:"white", fontWeight:900, fontSize:"12px",
                        flexShrink:0,
                      }}>
                        Stock: {v.stock}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding:"14px" }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                      <div style={{
                        background:"rgba(59,130,246,0.08)",
                        border:"1.5px solid rgba(59,130,246,0.12)",
                        borderRadius:theme.radiusMd,
                        padding:"10px 12px",
                      }}>
                        <div style={{
                          fontSize:"10px", fontWeight:900, color:theme.textMuted,
                          textTransform:"uppercase", letterSpacing:"0.6px",
                        }}>
                          Price
                        </div>
                        <div style={{ marginTop:"4px", fontSize:"14px", fontWeight:900, color:theme.primaryDark }}>
                          ₹{v.price}
                        </div>
                      </div>

                      <div style={{
                        background: v.discountLabel
                          ? "rgba(16,185,129,0.08)"
                          : "rgba(229,231,235,0.5)",
                        border: v.discountLabel
                          ? "1.5px solid rgba(16,185,129,0.14)"
                          : `1.5px solid ${theme.borderLight}`,
                        borderRadius:theme.radiusMd,
                        padding:"10px 12px",
                      }}>
                        <div style={{
                          fontSize:"10px", fontWeight:900, color:theme.textMuted,
                          textTransform:"uppercase", letterSpacing:"0.6px",
                        }}>
                          Discounted
                        </div>
                        <div style={{
                          marginTop:"4px", fontSize:"14px", fontWeight:900,
                          color: v.discountLabel ? theme.success : theme.textSecondary,
                          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                        }}>
                          ₹{v.effectivePrice.toFixed(2)}{" "}
                          {v.discountLabel ? `(${v.discountLabel})` : ""}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      marginTop:"10px",
                      display:"flex", alignItems:"center",
                      justifyContent:"space-between", gap:"10px",
                      padding:"10px 12px",
                      background:theme.inputBg,
                      border:`1.5px solid ${theme.borderLight}`,
                      borderRadius:theme.radiusMd,
                    }}>
                      <div style={{ fontSize:"12px", fontWeight:900, color:theme.textSecondary }}>
                        Location
                      </div>
                      <div style={{ fontSize:"12px", fontWeight:900, color:theme.textPrimary }}>
                        {v.location}
                      </div>
                    </div>

                    <div style={{ display:"flex", gap:"10px", marginTop:"12px" }}>
                      <button
                        type="button"
                        onClick={() => addToCart(v, 1)}
                        disabled={v.stock <= 0}
                        style={{
                          flex:1, height:"40px",
                          background: v.stock > 0
                            ? theme.gradientSuccess
                            : "linear-gradient(135deg,#9CA3AF,#CBD5E1)",
                          border:"none", borderRadius:theme.radiusMd,
                          color:"white", fontWeight:900,
                          cursor: v.stock > 0 ? "pointer" : "not-allowed",
                          boxShadow: v.stock > 0
                            ? "0 8px 20px rgba(16,185,129,0.18)"
                            : "none",
                        }}
                      >
                        Add to Cart
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          addToCart(v, 1);
                          setShowSidebar(true);
                        }}
                        disabled={v.stock <= 0}
                        style={{
                          width:"40px", height:"40px",
                          background:theme.gradientSecondary,
                          border:"none", borderRadius:theme.radiusMd,
                          color:"white", fontWeight:900,
                          cursor: v.stock > 0 ? "pointer" : "not-allowed",
                          boxShadow:"0 8px 20px rgba(139,92,246,0.16)",
                        }}
                        title="Add & Checkout"
                      >→</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{
                gridColumn:"1 / -1",
                background:theme.cardBg,
                border:`1.5px solid ${theme.border}`,
                borderRadius:theme.radiusXl,
                padding:"40px 20px",
                textAlign:"center",
                color:theme.textMuted, fontWeight:800,
              }}>
                No variants found.
              </div>
            )}
          </div>

          {/* Cart Preview */}
          <div style={{ marginTop:"18px" }}>
            <div style={{
              display:"flex", justifyContent:"space-between",
              alignItems:"baseline", gap:"10px", flexWrap:"wrap",
            }}>
              <div style={{ fontSize:"18px", fontWeight:900, color:theme.textPrimary }}>
                Cart
                {cartItems.length > 0 && (
                  <span style={{ marginLeft:"8px", fontSize:"12px", fontWeight:800, color:theme.textMuted }}>
                    ({cartItems.length} item{cartItems.length > 1 ? "s" : ""})
                  </span>
                )}
              </div>

              <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
                <div style={{
                  background:theme.cardBg,
                  border:`1.5px solid ${theme.border}`,
                  borderRadius:theme.radiusFull,
                  padding:"8px 14px",
                  fontSize:"12px", fontWeight:900, color:theme.primaryDark,
                }}>
                  Total: ₹{calcTotals.total}
                </div>

                <button
                  type="button"
                  onClick={() => setShowSidebar(true)}
                  disabled={cartItems.length === 0}
                  style={{
                    height:"38px", padding:"0 14px",
                    borderRadius:theme.radiusFull, border:"none",
                    cursor: cartItems.length ? "pointer" : "not-allowed",
                    background: cartItems.length
                      ? theme.gradientSecondary
                      : "linear-gradient(135deg,#9CA3AF,#CBD5E1)",
                    color:"white", fontWeight:900,
                    boxShadow: cartItems.length
                      ? "0 10px 24px rgba(139,92,246,0.18)"
                      : "none",
                  }}
                >
                  Checkout
                </button>
              </div>
            </div>

            {cartItems.length === 0 ? (
              <div style={{
                marginTop:"10px",
                background:theme.cardBg,
                border:`1.5px solid ${theme.border}`,
                borderRadius:theme.radiusXl,
                padding:"18px",
                color:theme.textMuted, fontWeight:800,
                textAlign:"center",
              }}>
                Your cart is empty.
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"10px", marginTop:"10px" }}>
                {cartItems.map((it, i) => (
                  <div
                    key={`${it.variantId}-${i}`}
                    className="cart-row"
                    style={{
                      background:theme.cardBg,
                      border:`1.5px solid rgba(229,231,235,0.75)`,
                      borderRadius:theme.radiusLg,
                      padding:"12px 14px",
                      display:"flex", alignItems:"center",
                      gap:"12px",
                      boxShadow:"0 2px 8px rgba(59,130,246,0.06)",
                      animationDelay:`${i * 0.05}s`,
                    }}
                  >
                    <div style={{
                      width:"38px", height:"38px",
                      background:theme.gradientPrimary,
                      borderRadius:theme.radiusMd,
                      display:"flex", alignItems:"center",
                      justifyContent:"center",
                      color:"white", fontWeight:900, flexShrink:0,
                    }}>
                      {(it.variantName || "V").charAt(0).toUpperCase()}
                    </div>

                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{
                        fontSize:"13px", fontWeight:900, color:theme.textPrimary,
                        whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                      }}>
                        {it.variantName} • {it.variantValue}
                      </div>
                      <div style={{
                        marginTop:"4px", fontSize:"12px",
                        fontWeight:800, color:theme.textSecondary,
                      }}>
                        ₹{it.effectiveUnitPrice.toFixed(2)} × {it.quantity} ={" "}
                        <span style={{ color:theme.primaryDark, fontWeight:900 }}>
                          ₹{(Number(it.effectiveUnitPrice) * Number(it.quantity)).toFixed(2)}
                        </span>
                        {it.discountLabel ? (
                          <span style={{ marginLeft:"8px", color:theme.success, fontWeight:900 }}>
                            ({it.discountLabel})
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div style={{ display:"flex", alignItems:"center", gap:"8px", flexShrink:0 }}>
                      <button type="button" onClick={() => decrease(i)} style={{
                        width:"32px", height:"32px",
                        background:theme.gradientPrimary,
                        border:"none", borderRadius:theme.radiusSm,
                        color:"white", fontWeight:900, cursor:"pointer",
                      }}>−</button>

                      <div style={{ width:"22px", textAlign:"center", fontWeight:900, color:theme.textPrimary }}>
                        {it.quantity}
                      </div>

                      <button type="button" onClick={() => increase(i)} style={{
                        width:"32px", height:"32px",
                        background:theme.gradientPrimary,
                        border:"none", borderRadius:theme.radiusSm,
                        color:"white", fontWeight:900, cursor:"pointer",
                      }}>+</button>
                    </div>

                    <button type="button" onClick={() => removeItem(i)} style={{
                      width:"34px", height:"34px",
                      background:theme.gradientDanger,
                      border:"none", borderRadius:theme.radiusSm,
                      color:"white", fontWeight:900, cursor:"pointer",
                      flexShrink:0,
                    }} title="Remove">X</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Checkout Sidebar */}
        {showSidebar && (
          <div
            style={{
              position:"fixed", inset:0, zIndex:300,
              background:"rgba(0,0,0,0.35)",
              backdropFilter:"blur(8px)",
              display:"flex", justifyContent:"flex-end",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowSidebar(false);
            }}
          >
            <div className="panel" style={{
              width:"440px", maxWidth:"100%",
              height:"100vh", background:theme.cardBg,
              borderLeft:`2px solid ${theme.border}`,
              boxShadow:"0 20px 60px rgba(0,0,0,0.25)",
              padding:"18px", overflowY:"auto",
            }}>
              {/* Sidebar Header */}
              <div style={{
                display:"flex", justifyContent:"space-between",
                alignItems:"center", marginBottom:"12px",
              }}>
                <div>
                  <div style={{ fontSize:"18px", fontWeight:900, color:theme.textPrimary }}>
                    Checkout
                  </div>
                  <div style={{ fontSize:"12px", fontWeight:700, color:theme.textMuted, marginTop:"4px" }}>
                    Confirm payment and create order
                  </div>
                </div>
                <button onClick={() => setShowSidebar(false)} type="button" style={{
                  width:"34px", height:"34px",
                  borderRadius:theme.radiusMd, border:"none",
                  background:"rgba(239,68,68,0.12)",
                  color:theme.danger, fontWeight:900, cursor:"pointer",
                }}>X</button>
              </div>

              {/* Summary */}
              <div style={{
                background:theme.inputBg,
                border:`1.5px solid ${theme.border}`,
                borderRadius:theme.radiusLg,
                padding:"12px", marginBottom:"12px",
              }}>
                <div style={{ fontSize:"12px", fontWeight:900, color:theme.textSecondary, marginBottom:"10px" }}>
                  Summary
                </div>

                {cartItems.map((it, i) => (
                  <div key={i} style={{
                    display:"flex", justifyContent:"space-between",
                    gap:"10px", marginBottom:"6px",
                  }}>
                    <div style={{ fontSize:"11px", fontWeight:800, color:theme.textSecondary, minWidth:0 }}>
                      <span style={{ color:theme.textPrimary }}>{it.variantName}</span>{" "}
                      <span style={{ color:theme.textMuted }}>•</span>{" "}
                      {it.variantValue} × {it.quantity}
                    </div>
                    <div style={{ fontSize:"11px", fontWeight:900, color:theme.textPrimary }}>
                      ₹{(Number(it.effectiveUnitPrice) * Number(it.quantity)).toFixed(2)}
                    </div>
                  </div>
                ))}

                <div style={{ height:"1px", background:"rgba(17,24,39,0.08)", margin:"10px 0" }}/>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                  <div>
                    <div style={{ fontSize:"10px", fontWeight:900, color:theme.textMuted, textTransform:"uppercase" }}>
                      Subtotal
                    </div>
                    <div style={{ fontSize:"13px", fontWeight:900, color:theme.textPrimary }}>
                      ₹{calcTotals.subtotal}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize:"10px", fontWeight:900, color:theme.textMuted, textTransform:"uppercase" }}>
                      Extra Discount
                    </div>
                    <div style={{ fontSize:"13px", fontWeight:900, color:theme.success }}>
                      −₹{calcTotals.extraDiscountAmount}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize:"10px", fontWeight:900, color:theme.textMuted, textTransform:"uppercase" }}>
                      Tax ({tax}%)
                    </div>
                    <div style={{ fontSize:"13px", fontWeight:900, color:theme.warning }}>
                      +₹{calcTotals.taxAmount}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize:"10px", fontWeight:900, color:theme.textMuted, textTransform:"uppercase" }}>
                      Total
                    </div>
                    <div style={{ fontSize:"14px", fontWeight:900, color:theme.primaryDark }}>
                      ₹{calcTotals.total}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={placeOrder} style={{ display:"flex", flexDirection:"column", gap:"12px" }}>

                <div>
                  <div style={{ fontSize:"12px", fontWeight:900, color:theme.textSecondary, marginBottom:"6px" }}>
                    Customer Phone
                  </div>
                  <input
                    className="sp-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    style={inputStyle} required
                  />
                </div>

                <div>
                  <div style={{ fontSize:"12px", fontWeight:900, color:theme.textSecondary, marginBottom:"6px" }}>
                    Email (optional)
                  </div>
                  <input
                    className="sp-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. user@example.com"
                    style={inputStyle}
                  />
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                  <div>
                    <div style={{ fontSize:"12px", fontWeight:900, color:theme.textSecondary, marginBottom:"6px" }}>
                      Status
                    </div>
                    <select className="sp-input" value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
                      <option value="PENDING">PENDING</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </div>

                  <div>
                    <div style={{ fontSize:"12px", fontWeight:900, color:theme.textSecondary, marginBottom:"6px" }}>
                      Payment Mode
                    </div>
                    <select
                      className="sp-input"
                      value={paymentModeUI}
                      onChange={(e) => {
                        setPaymentModeUI(e.target.value);
                        setCashAmount("");
                        setOnlineAmount("");
                      }}
                      style={inputStyle}
                    >
                      <option value="CASH">CASH</option>
                      <option value="ONLINE_UPI">ONLINE_UPI</option>
                      <option value="BOTH">BOTH</option>
                    </select>
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                  <div>
                    <div style={{ fontSize:"12px", fontWeight:900, color:theme.textSecondary, marginBottom:"6px" }}>
                      Extra Discount
                    </div>
                    <input
                      className="sp-input"
                      value={extraDiscount}
                      onChange={(e) => setExtraDiscount(e.target.value)}
                      placeholder="e.g. 10% or 50"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize:"12px", fontWeight:900, color:theme.textSecondary, marginBottom:"6px" }}>
                      Tax (% only)
                    </div>
                    <input
                      className="sp-input"
                      type="number"
                      min="0"
                      max="100"
                      value={tax}
                      onChange={(e) => setTax(e.target.value)}
                      placeholder="e.g. 18"
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Payable box */}
                <div style={{
                  background:"rgba(16,185,129,0.10)",
                  border:"1.5px solid rgba(16,185,129,0.20)",
                  borderRadius:theme.radiusMd,
                  padding:"10px 12px",
                  display:"flex", justifyContent:"space-between", alignItems:"center",
                }}>
                  <span style={{ fontSize:"12px", fontWeight:900, color:theme.textSecondary }}>
                    Payable Amount
                  </span>
                  <span style={{ fontSize:"15px", fontWeight:900, color:theme.success }}>
                    ₹{calcTotals.total}
                  </span>
                </div>

                {/* BOTH */}
                {paymentModeUI === "BOTH" && (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                    <div>
                      <div style={{ fontSize:"12px", fontWeight:900, color:theme.textSecondary, marginBottom:"6px" }}>
                        Cash Amount (₹)
                      </div>
                      <input className="sp-input" type="number" min="0"
                        value={cashAmount}
                        onChange={(e) => setCashAmount(e.target.value)}
                        placeholder="0" style={inputStyle} required/>
                    </div>
                    <div>
                      <div style={{ fontSize:"12px", fontWeight:900, color:theme.textSecondary, marginBottom:"6px" }}>
                        Online Amount (₹)
                      </div>
                      <input className="sp-input" type="number" min="0"
                        value={onlineAmount}
                        onChange={(e) => setOnlineAmount(e.target.value)}
                        placeholder="0" style={inputStyle} required/>
                    </div>
                  </div>
                )}

                {/* CASH */}
                {paymentModeUI === "CASH" && (
                  <div>
                    <div style={{ fontSize:"12px", fontWeight:900, color:theme.textSecondary, marginBottom:"6px" }}>
                      Cash Amount (₹)
                    </div>
                    <input className="sp-input" type="number" min="0"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      placeholder="0" style={inputStyle} required/>
                    <div style={{ fontSize:"11px", fontWeight:700, color:theme.textMuted, marginTop:"6px" }}>
                      Online amount will be sent as "0"
                    </div>
                  </div>
                )}

                {/* ONLINE_UPI */}
                {paymentModeUI === "ONLINE_UPI" && (
                  <div>
                    <div style={{ fontSize:"12px", fontWeight:900, color:theme.textSecondary, marginBottom:"6px" }}>
                      Online Amount (₹)
                    </div>
                    <input className="sp-input" type="number" min="0"
                      value={onlineAmount}
                      onChange={(e) => setOnlineAmount(e.target.value)}
                      placeholder="0" style={inputStyle} required/>
                    <div style={{ fontSize:"11px", fontWeight:700, color:theme.textMuted, marginTop:"6px" }}>
                      Cash amount will be sent as "0"
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button type="submit" style={{
                  height:"46px",
                  background:theme.gradientSuccess,
                  border:"none", borderRadius:theme.radiusMd,
                  color:"white", fontWeight:900, cursor:"pointer",
                  boxShadow:"0 10px 24px rgba(16,185,129,0.25)",
                  marginTop:"6px",
                }}>
                  Confirm Order
                </button>
              </form>
            </div>
          </div>
        )}

        <ToastContainer position="top-center" autoClose={1500} />
      </div>
    </>
  );
};

export default Singleproduct;