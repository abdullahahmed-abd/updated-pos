// Filename: ADDCART.jsx (FINAL - taxPrice Double fixed)
import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./Navbar";
import { AppContext } from "./Contextapi";

const ADDCART = () => {
  const ctx = useContext(AppContext);
  const [token, settoken, count, setcount, user, setuser] = ctx;
  const BaseUrl = ctx[ctx.length - 1];

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

  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [discountData, setDiscountData] = useState([]);

  const [filteredVariants, setFilteredVariants] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [cartItems, setCartItems] = useState([]);

  const [dis, setDis] = useState("");
  // ✅ tax is plain number string like "18" = 18%
  const [tax, setTax] = useState("18");
  const [totalAmount, setTotalAmount] = useState("0.00");

  const [no, setNo] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("PENDING");

  const [payment, setPayment] = useState("CASH");
  const [cashAmount, setCashAmount] = useState("");
  const [onlineAmount, setOnlineAmount] = useState("");

  const [showSidebar, setShowSidebar] = useState(false);
  const [ismenu, setismenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const getProductId = (p) =>
    p?.productId ?? p?.id ?? p?.product_id ?? null;

  const getVariantId = (v) =>
    v?.variantId ?? v?.id ?? v?.productVariantId ?? null;

  const getVariantProductId = (v) =>
    v?.productId ?? v?.product?.productId ?? v?.product?.id ?? null;

  const getInventoryVariantId = (inv) =>
    inv?.variantId ??
    inv?.productVariant?.id ??
    inv?.productVariant?.productVariantId ??
    null;

  const normalizeList = (resData, key) => {
    if (Array.isArray(resData)) return resData;
    if (Array.isArray(resData?.[key])) return resData[key];
    if (Array.isArray(resData?.data?.[key])) return resData.data[key];
    return [];
  };

  useEffect(() => {
    if (!BaseUrl) return;
    Promise.all([
      productRequest({ requestType: "READ_ALL" }),
      variantRequest({ requestType: "READ_ALL" }),
      inventoryRequest({ requestType: "READ_ALL" }),
      discountRequest({ requestType: "READ_ALL" }),
    ])
      .then(([pRes, vRes, iRes, dRes]) => {
        setProducts(normalizeList(pRes.data, "products"));
        setVariants(normalizeList(vRes.data, "variants"));
        setInventory(normalizeList(iRes.data, "inventories"));
        setDiscountData(normalizeList(dRes.data, "discounts"));
      })
      .catch((err) => {
        console.error("ADDCART fetch error:", err);
        toast.error("Failed to load data");
      });
    // eslint-disable-next-line
  }, [BaseUrl, count]);

  useEffect(() => {
    if (selectedProduct && variants.length) {
      const filtered = variants.filter((v) => {
        const vPid = getVariantProductId(v);
        return Number(vPid) === Number(selectedProduct.value);
      });
      setFilteredVariants(filtered);
    } else {
      setFilteredVariants([]);
    }
    setSelectedVariant(null);
    // eslint-disable-next-line
  }, [selectedProduct, variants]);

  useEffect(() => {
    if (!selectedVariant) {
      setDis("");
      return;
    }
    const now = new Date();
    const activeDiscount = discountData.find((d) => {
      const did = d?.variant?.id ?? d?.variantId;
      if (Number(did) !== Number(selectedVariant.value)) return false;
      if (!d?.isActive) return false;
      const start = d?.startDateTime ? new Date(d.startDateTime) : null;
      const end = d?.endDateTime ? new Date(d.endDateTime) : null;
      if (start && now < start) return false;
      if (end && now > end) return false;
      return true;
    });
    if (activeDiscount) {
      setDis(
        activeDiscount.waiverMode === "PERCENT"
          ? `${activeDiscount.discountValue}%`
          : `${activeDiscount.discountValue}`
      );
    } else {
      setDis("");
    }
  }, [selectedVariant, discountData]);

  const productOptions = products.map((p) => ({
    value: getProductId(p),
    label: p.productName,
    product: p,
  }));

  const variantOptions = filteredVariants.map((v) => {
    const id = getVariantId(v);
    return {
      value: id,
      label: `${v.variantName} — ${v.variantValue} (₹${v.price})`,
      variant: v,
    };
  });

  const handleAddToCart = () => {
    if (!selectedProduct || !selectedVariant || currentQuantity < 1) {
      toast.error("Select product, variant and quantity");
      return;
    }
    const inv = inventory.find(
      (i) => Number(getInventoryVariantId(i)) === Number(selectedVariant.value)
    );
    if (!inv || Number(inv.quantity) < Number(currentQuantity)) {
      toast.error(`Stock not available. Available: ${inv?.quantity ?? 0}`);
      return;
    }
    const existingIndex = cartItems.findIndex(
      (item) => Number(item.variantId) === Number(selectedVariant.value)
    );
    if (existingIndex !== -1) {
      setCartItems((prev) => {
        const arr = [...prev];
        arr[existingIndex] = {
          ...arr[existingIndex],
          quantity: Number(arr[existingIndex].quantity) + Number(currentQuantity),
        };
        return arr;
      });
      toast.success("Quantity updated!");
    } else {
      const v = selectedVariant.variant;
      setCartItems((prev) => [
        ...prev,
        {
          variantId: selectedVariant.value,
          productName: selectedProduct.label,
          variantName: v.variantName,
          variantValue: v.variantValue,
          unitPrice: Number(v.price || 0),
          quantity: Number(currentQuantity),
        },
      ]);
      toast.success("Item added to cart!");
    }
    setSelectedProduct(null);
    setSelectedVariant(null);
    setCurrentQuantity(1);
  };

  const increase = (idx) => {
    setCartItems((items) => {
      const arr = [...items];
      arr[idx] = { ...arr[idx], quantity: Number(arr[idx].quantity) + 1 };
      return arr;
    });
  };

  const decrease = (idx) => {
    setCartItems((items) => {
      const arr = [...items];
      if (Number(arr[idx].quantity) > 1) {
        arr[idx] = { ...arr[idx], quantity: Number(arr[idx].quantity) - 1 };
      }
      return arr;
    });
  };

  const dlt = (i) => {
    setCartItems((prev) => prev.filter((_, index) => index !== i));
  };

  // ✅ tax = plain percent number like 18 means 18%
  const calculateTotal = () => {
    const subtotal = cartItems.reduce(
      (sum, it) => sum + Number(it.unitPrice) * Number(it.quantity),
      0
    );

    const discountVal = String(dis).includes("%")
      ? (parseFloat(dis) / 100) * subtotal
      : parseFloat(dis) || 0;

    const afterDiscount = subtotal - discountVal;

    // ✅ tax is plain number like 18 = 18%
    const taxPercent = parseFloat(tax) || 0;
    const taxAmount = (taxPercent / 100) * afterDiscount;

    return (afterDiscount + taxAmount).toFixed(2);
  };

  useEffect(() => {
    setTotalAmount(calculateTotal());
    // eslint-disable-next-line
  }, [cartItems, dis, tax]);

  // ===== Submit =====
  const handleSubmit = (e) => {
    e.preventDefault();

    if (String(no).trim().length < 10)
      return toast.error("Invalid phone number");
    if (cartItems.length === 0)
      return toast.error("Cart is empty");

    const totalDouble = parseFloat(totalAmount);

    // ✅ String type for backend String field
    const cashVal =
      payment === "ONLINE_UPI"
        ? "0"
        : String(Math.round(parseFloat(cashAmount || 0)));

    const onlineVal =
      payment === "CASH"
        ? "0"
        : String(Math.round(parseFloat(onlineAmount || 0)));

    const paid = parseFloat(cashVal) + parseFloat(onlineVal);
    if (paid < totalDouble)
      return toast.error(`Paid ₹${paid} is less than total ₹${totalDouble}`);

    // ✅ taxPrice = plain percent number (Double in backend)
    const taxPercent = parseFloat(tax) || 0;

    // ✅ discount = number (Double in backend)
    const discountVal = String(dis).includes("%")
      ? parseFloat(dis)
      : parseFloat(dis) || 0;

    const paymentMode =
      payment === "BOTH"
        ? "BOTH"
        : payment === "ONLINE_UPI"
        ? "ONLINE_UPI"
        : "CASH";

  // ✅ AFTER (correct types matching backend Double) 
const payload = {
  requestType: "CREATE",
  userPhoneNumber: String(no).trim(),
  ...(email.trim() ? { email: email.trim() } : {}),
  status: String(status).toUpperCase(),
  paymentMode,
  cashAmount: cashVal,                          // ✅ String
  onlineAmount: onlineVal,                      // ✅ String
  taxPrice: parseFloat(tax) || 0,               // ✅ sends 18.0 → backend Double
  discount: parseFloat(String(dis).replace("%","")) || 0, // ✅ Double
  totalAmount: Math.round(totalDouble),         // ✅ Long
  orderItemRequests: cartItems.map((it) => ({
    variantId: Number(it.variantId),
    quantity: Number(it.quantity),
  })),
};

// ✅ Debug log to verify
console.log("✅ FINAL PAYLOAD →", JSON.stringify(payload, null, 2));

    console.log("✅ ORDER PAYLOAD →", JSON.stringify(payload, null, 2));

    orderRequest(payload)
      .then((res) => {
        console.log("✅ Order Success →", res.data);
        toast.success("Order placed successfully!");
        setcount((p) => p + 1);
        setNo("");
        setEmail("");
        setStatus("PENDING");
        setDis("");
        setTax("18");
        setTotalAmount("0.00");
        setPayment("CASH");
        setCashAmount("");
        setOnlineAmount("");
        setCartItems([]);
        setShowSidebar(false);
      })
      .catch((err) => {
        console.error("❌ Order Error:", err.response?.data || err);
        toast.error(
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Order failed!"
        );
      });
  };

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      background: theme.inputBg,
      borderColor: state.isFocused ? theme.primary : theme.inputBorder,
      borderWidth: "2px",
      borderRadius: theme.radiusMd,
      boxShadow: state.isFocused ? `0 0 0 3px rgba(59,130,246,0.2)` : "none",
      "&:hover": { borderColor: theme.primaryLight },
      minHeight: "44px",
      fontWeight: 700,
      fontSize: "13px",
    }),
    option: (base, state) => ({
      ...base,
      background: state.isSelected
        ? theme.primary
        : state.isFocused
        ? `rgba(59,130,246,0.1)`
        : "white",
      color: state.isSelected ? "white" : theme.textPrimary,
      fontWeight: 700,
      fontSize: "13px",
    }),
    singleValue: (base) => ({
      ...base,
      color: theme.textPrimary,
      fontWeight: 800,
      fontSize: "13px",
    }),
    placeholder: (base) => ({
      ...base,
      color: theme.textMuted,
      fontSize: "13px",
      fontWeight: 700,
    }),
    menu: (base) => ({
      ...base,
      borderRadius: theme.radiusMd,
      overflow: "hidden",
      boxShadow: `0 8px 30px rgba(59,130,246,0.15)`,
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
    fontWeight: 800,
    color: theme.textPrimary,
    outline: "none",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
  };

  return (
    <>
      <style>{`
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
        .cart-row {
          animation: slideInRow 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;
          transition: all 0.4s cubic-bezier(0.34,1.56,0.64,1);
          opacity:0;
        }
        .cart-row:hover {
          transform:translateX(6px) scale(1.01);
          box-shadow:0 6px 24px rgba(59,130,246,0.18),
            0 0 0 1.5px rgba(96,165,250,0.5);
          border-color:rgba(96,165,250,0.6);
          z-index:10;
        }
        .panel {
          animation: slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1);
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

        <div style={{
          position:"relative", zIndex:10,
          maxWidth:"1100px", margin:"0 auto",
        }}>
          {/* Header */}
          <div style={{ marginBottom:"16px" }}>
            <div style={{ fontSize:"26px", fontWeight:900, color:theme.primaryDark }}>
              Add Cart / Create Order
            </div>
            <div style={{ fontSize:"13px", color:theme.textMuted, fontWeight:600, marginTop:"6px" }}>
              Select product → variant → quantity → add to cart → place order
            </div>
          </div>

          {/* Selector Card */}
          <div style={{
            background:theme.cardBg,
            border:`1.5px solid ${theme.border}`,
            borderRadius:theme.radiusXl,
            padding:"18px",
            boxShadow:`0 10px 15px -3px rgba(59,130,246,0.12)`,
            marginBottom:"18px",
          }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div>
                <div style={{ fontSize:"12px", fontWeight:800, color:theme.textSecondary, marginBottom:"6px" }}>
                  Product
                </div>
                <Select
                  options={productOptions}
                  value={selectedProduct}
                  onChange={(val) => setSelectedProduct(val)}
                  placeholder="Select Product"
                  styles={selectStyles}
                />
              </div>

              <div>
                <div style={{ fontSize:"12px", fontWeight:800, color:theme.textSecondary, marginBottom:"6px" }}>
                  Variant
                </div>
                <Select
                  options={variantOptions}
                  value={selectedVariant}
                  onChange={(option) => setSelectedVariant(option)}
                  placeholder={selectedProduct ? "Select Variant" : "Select product first"}
                  isDisabled={!selectedProduct}
                  styles={selectStyles}
                  noOptionsMessage={() =>
                    selectedProduct ? "No variants found" : "Select a product first"
                  }
                />
              </div>

              <div>
                <div style={{ fontSize:"12px", fontWeight:800, color:theme.textSecondary, marginBottom:"6px" }}>
                  Quantity
                </div>
                <input
                  type="number"
                  min={1}
                  value={currentQuantity}
                  onChange={(e) => setCurrentQuantity(Number(e.target.value))}
                  style={inputStyle}
                />
              </div>

              <div style={{ display:"flex", alignItems:"flex-end" }}>
                <button
                  onClick={handleAddToCart}
                  type="button"
                  style={{
                    width:"100%", height:"44px",
                    background:theme.gradientSuccess,
                    border:"none", borderRadius:theme.radiusMd,
                    color:"white", fontWeight:900, cursor:"pointer",
                    boxShadow:"0 6px 18px rgba(16,185,129,0.25)",
                  }}
                >Add to Cart</button>
              </div>
            </div>

            <div style={{ marginTop:"12px", fontSize:"12px", fontWeight:700, color:theme.textMuted }}>
              Auto Discount (if active):{" "}
              <span style={{ color: dis ? theme.success : theme.textMuted, fontWeight:900 }}>
                {dis || "None"}
              </span>
            </div>
          </div>

          {/* Cart */}
          <div>
            <div style={{
              display:"flex", justifyContent:"space-between",
              alignItems:"baseline", marginBottom:"10px",
            }}>
              <div style={{ fontSize:"18px", fontWeight:900, color:theme.textPrimary }}>
                Cart{" "}
                {cartItems.length > 0 && (
                  <span style={{ fontSize:"12px", fontWeight:700, color:theme.textMuted }}>
                    ({cartItems.length} item{cartItems.length > 1 ? "s" : ""})
                  </span>
                )}
              </div>
              {cartItems.length > 0 && (
                <div style={{ fontSize:"14px", fontWeight:900, color:theme.primaryDark }}>
                  Total: ₹{totalAmount}
                </div>
              )}
            </div>

            {cartItems.length === 0 ? (
              <div style={{
                background:theme.cardBg,
                border:`1.5px solid ${theme.border}`,
                borderRadius:theme.radiusXl,
                padding:"24px", textAlign:"center",
                color:theme.textMuted, fontWeight:700,
              }}>
                Cart is empty. Add items above.
              </div>
            ) : (
              <>
                <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                  {cartItems.map((item, i) => (
                    <div
                      key={i}
                      className="cart-row"
                      style={{
                        background:theme.cardBg,
                        border:`1.5px solid rgba(229,231,235,0.7)`,
                        borderRadius:theme.radiusLg,
                        display:"flex", alignItems:"center",
                        boxShadow:"0 2px 8px rgba(59,130,246,0.06)",
                        animationDelay:`${i * 0.05}s`,
                        padding:"12px 14px", gap:"12px",
                      }}
                    >
                      <div style={{
                        width:"40px", height:"40px",
                        background:theme.gradientPrimary,
                        borderRadius:theme.radiusMd,
                        display:"flex", alignItems:"center",
                        justifyContent:"center",
                        color:"white", fontWeight:900, flexShrink:0,
                        boxShadow:"0 3px 10px rgba(59,130,246,0.3)",
                      }}>
                        {(item.productName || "P").charAt(0).toUpperCase()}
                      </div>

                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{
                          fontSize:"13px", fontWeight:900, color:theme.textPrimary,
                          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                        }}>
                          {item.productName}
                        </div>
                        <div style={{ fontSize:"11px", fontWeight:700, color:theme.textMuted, marginTop:"2px" }}>
                          {item.variantName} • {item.variantValue}
                        </div>
                        <div style={{ fontSize:"12px", fontWeight:800, color:theme.textSecondary, marginTop:"6px" }}>
                          ₹{item.unitPrice} × {item.quantity} ={" "}
                          <span style={{ color:theme.primaryDark, fontWeight:900 }}>
                            ₹{(Number(item.unitPrice) * Number(item.quantity)).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div style={{ display:"flex", alignItems:"center", gap:"8px", flexShrink:0 }}>
                        <button onClick={() => decrease(i)} type="button" style={{
                          width:"32px", height:"32px",
                          background:theme.gradientPrimary,
                          border:"none", borderRadius:theme.radiusSm,
                          color:"white", fontWeight:900, cursor:"pointer",
                          boxShadow:"0 2px 8px rgba(59,130,246,0.25)",
                        }}>−</button>

                        <div style={{ width:"26px", textAlign:"center", fontWeight:900, color:theme.textPrimary }}>
                          {item.quantity}
                        </div>

                        <button onClick={() => increase(i)} type="button" style={{
                          width:"32px", height:"32px",
                          background:theme.gradientPrimary,
                          border:"none", borderRadius:theme.radiusSm,
                          color:"white", fontWeight:900, cursor:"pointer",
                          boxShadow:"0 2px 8px rgba(59,130,246,0.25)",
                        }}>+</button>
                      </div>

                      <button onClick={() => dlt(i)} type="button" style={{
                        width:"34px", height:"34px",
                        background:theme.gradientDanger,
                        border:"none", borderRadius:theme.radiusSm,
                        color:"white", fontWeight:900, cursor:"pointer",
                        boxShadow:"0 2px 8px rgba(239,68,68,0.25)",
                        flexShrink:0,
                      }} title="Remove item">X</button>
                    </div>
                  ))}
                </div>

                {/* Summary Bar */}
                <div style={{
                  marginTop:"12px", background:theme.cardBg,
                  border:`1.5px solid ${theme.border}`,
                  borderRadius:theme.radiusXl,
                  padding:"14px 16px",
                  display:"flex", justifyContent:"space-between",
                  alignItems:"center", flexWrap:"wrap", gap:"10px",
                  boxShadow:"0 2px 8px rgba(59,130,246,0.06)",
                }}>
                  <div style={{ fontSize:"14px", fontWeight:900, color:theme.primaryDark }}>
                    Total: ₹{totalAmount}
                  </div>
                  <button
                    onClick={() => setShowSidebar(true)}
                    type="button"
                    style={{
                      height:"44px", padding:"0 18px",
                      background:theme.gradientSecondary,
                      border:"none", borderRadius:theme.radiusFull,
                      color:"white", fontWeight:900, cursor:"pointer",
                      boxShadow:"0 8px 20px rgba(139,92,246,0.25)",
                    }}
                  >Place Order →</button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ===== SIDEBAR ===== */}
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
              width:"420px", maxWidth:"100%",
              height:"100vh", background:theme.cardBg,
              borderLeft:`2px solid ${theme.border}`,
              boxShadow:"0 20px 60px rgba(0,0,0,0.25)",
              padding:"18px", overflowY:"auto",
            }}>
              {/* Header */}
              <div style={{
                display:"flex", justifyContent:"space-between",
                alignItems:"center", marginBottom:"12px",
              }}>
                <div>
                  <div style={{ fontSize:"18px", fontWeight:900, color:theme.textPrimary }}>
                    Place Order
                  </div>
                  <div style={{ fontSize:"12px", fontWeight:700, color:theme.textMuted, marginTop:"4px" }}>
                    Verify summary and payment
                  </div>
                </div>
                <button onClick={() => setShowSidebar(false)} type="button" style={{
                  width:"34px", height:"34px",
                  borderRadius:theme.radiusMd, border:"none",
                  background:"rgba(239,68,68,0.12)",
                  color:theme.danger, fontWeight:900, cursor:"pointer",
                }}>X</button>
              </div>

              {/* Summary Box */}
              <div style={{
                background:theme.inputBg,
                border:`1.5px solid ${theme.border}`,
                borderRadius:theme.radiusLg,
                padding:"12px", marginBottom:"12px",
              }}>
                <div style={{ fontSize:"12px", fontWeight:900, color:theme.textSecondary, marginBottom:"10px" }}>
                  Order Summary
                </div>

                {cartItems.map((item, i) => (
                  <div key={i} style={{
                    display:"flex", justifyContent:"space-between",
                    gap:"10px", marginBottom:"6px",
                  }}>
                    <div style={{ fontSize:"11px", fontWeight:800, color:theme.textSecondary, minWidth:0 }}>
                      <span style={{ color:theme.textPrimary }}>{item.productName}</span>{" "}
                      <span style={{ color:theme.textMuted }}>•</span>{" "}
                      {item.variantName} × {item.quantity}
                    </div>
                    <div style={{ fontSize:"11px", fontWeight:900, color:theme.textPrimary, whiteSpace:"nowrap" }}>
                      ₹{(Number(item.unitPrice) * Number(item.quantity)).toFixed(2)}
                    </div>
                  </div>
                ))}

                <div style={{ height:"1px", background:"rgba(17,24,39,0.08)", margin:"10px 0" }}/>

                {/* Subtotal */}
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
                  <span style={{ fontSize:"11px", fontWeight:700, color:theme.textMuted }}>Subtotal</span>
                  <span style={{ fontSize:"11px", fontWeight:800, color:theme.textSecondary }}>
                    ₹{cartItems.reduce((s,it) => s + Number(it.unitPrice)*Number(it.quantity), 0).toFixed(2)}
                  </span>
                </div>

                {/* Discount */}
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
                  <span style={{ fontSize:"11px", fontWeight:700, color:theme.textMuted }}>Discount</span>
                  <span style={{ fontSize:"11px", fontWeight:800, color:theme.danger }}>
                    {dis || "0"}
                  </span>
                </div>

                {/* Tax */}
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
                  <span style={{ fontSize:"11px", fontWeight:700, color:theme.textMuted }}>Tax</span>
                  <span style={{ fontSize:"11px", fontWeight:800, color:theme.warning }}>
                    {tax}%
                  </span>
                </div>

                {/* Total */}
                <div style={{ display:"flex", justifyContent:"space-between", fontWeight:900 }}>
                  <span style={{ color:theme.textSecondary, fontSize:"13px" }}>Total (Payable)</span>
                  <span style={{ color:theme.primaryDark, fontSize:"14px" }}>₹{totalAmount}</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"12px" }}>

                {/* Phone */}
                <div>
                  <div style={{ fontSize:"12px", fontWeight:900, color:theme.textSecondary, marginBottom:"6px" }}>
                    Customer Phone
                  </div>
                  <input
                    value={no}
                    onChange={(e) => setNo(e.target.value)}
                    placeholder="e.g. 9876543210"
                    style={inputStyle} required
                  />
                </div>

                {/* Email */}
                <div>
                  <div style={{ fontSize:"12px", fontWeight:900, color:theme.textSecondary, marginBottom:"6px" }}>
                    Email (optional)
                  </div>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. user@example.com"
                    style={inputStyle}
                  />
                </div>

                {/* Status + Payment */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                  <div>
                    <div style={{ fontSize:"12px", fontWeight:900, color:theme.textSecondary, marginBottom:"6px" }}>
                      Status
                    </div>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle} required>
                      <option value="PENDING">PENDING</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </div>

                  <div>
                    <div style={{ fontSize:"12px", fontWeight:900, color:theme.textSecondary, marginBottom:"6px" }}>
                      Payment Mode
                    </div>
                    <select
                      value={payment}
                      onChange={(e) => {
                        setPayment(e.target.value);
                        setCashAmount("");
                        setOnlineAmount("");
                      }}
                      style={inputStyle} required
                    >
                      <option value="CASH">CASH</option>
                      <option value="ONLINE_UPI">ONLINE_UPI</option>
                      <option value="BOTH">BOTH</option>
                    </select>
                  </div>
                </div>

                {/* Discount + Tax */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                  <div>
                    <div style={{ fontSize:"12px", fontWeight:900, color:theme.textSecondary, marginBottom:"6px" }}>
                      Discount
                    </div>
                    <input
                      value={dis}
                      onChange={(e) => setDis(e.target.value)}
                      placeholder="e.g. 10% or 50"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <div style={{ fontSize:"12px", fontWeight:900, color:theme.textSecondary, marginBottom:"6px" }}>
                      Tax (% only)
                    </div>
                    <input
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

                {/* Payable */}
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
                    ₹{totalAmount}
                  </span>
                </div>

                {/* BOTH */}
                {payment === "BOTH" && (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                    <div>
                      <div style={{ fontSize:"12px", fontWeight:900, color:theme.textSecondary, marginBottom:"6px" }}>
                        Cash Amount (₹)
                      </div>
                      <input type="number" min="0" value={cashAmount}
                        onChange={(e) => setCashAmount(e.target.value)}
                        placeholder="0" style={inputStyle} required/>
                    </div>
                    <div>
                      <div style={{ fontSize:"12px", fontWeight:900, color:theme.textSecondary, marginBottom:"6px" }}>
                        Online Amount (₹)
                      </div>
                      <input type="number" min="0" value={onlineAmount}
                        onChange={(e) => setOnlineAmount(e.target.value)}
                        placeholder="0" style={inputStyle} required/>
                    </div>
                  </div>
                )}

                {/* CASH */}
                {payment === "CASH" && (
                  <div>
                    <div style={{ fontSize:"12px", fontWeight:900, color:theme.textSecondary, marginBottom:"6px" }}>
                      Cash Amount (₹)
                    </div>
                    <input type="number" min="0" value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      placeholder="0" style={inputStyle} required/>
                    <div style={{ fontSize:"11px", fontWeight:700, color:theme.textMuted, marginTop:"6px" }}>
                      Online amount will be sent as "0"
                    </div>
                  </div>
                )}

                {/* ONLINE_UPI */}
                {payment === "ONLINE_UPI" && (
                  <div>
                    <div style={{ fontSize:"12px", fontWeight:900, color:theme.textSecondary, marginBottom:"6px" }}>
                      Online Amount (₹)
                    </div>
                    <input type="number" min="0" value={onlineAmount}
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
                  color:"white", fontWeight:900,
                  fontSize:"14px", cursor:"pointer",
                  boxShadow:"0 8px 24px rgba(16,185,129,0.28)",
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

export default ADDCART;