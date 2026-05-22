// Filename: Inventory.jsx (FULL FINAL FILE)
// Fixes:
// 1) Product dropdown added + working (POST /product {requestType:"READ_ALL"})
// 2) Variant dropdown fixed (POST /variant {requestType:"READ_ALL"}) + filtered by selected product
// 3) Inventory CRUD uses POST /inventory (requestType)
// 4) UI theme matched with your other screens (blobs, cards, modal, FAB)
// NOTE: If you don’t want product dropdown, tell me — I can remove it and show all variants directly.

import { useEffect, useMemo, useState, useContext } from "react";
import axios from "axios";
import Select from "react-select";
import Navbar from "./Navbar";
import { AppContext } from "./Contextapi";

let Inventory = () => {
  const ctx = useContext(AppContext);
  const BaseUrl = ctx?.[ctx.length - 1];

  const count = ctx?.[2];
  const setcount = ctx?.[3];

  const [inventory, setInventory] = useState([]);
  const [variants, setVariants] = useState([]);
  const [products, setProducts] = useState([]);

  // NEW: product filter dropdown
  const [selectedProductId, setSelectedProductId] = useState("");

  const [variantId, setVariantId] = useState(""); // number or ""
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [ismenu, setismenu] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    inventoryId: null,
    quantity: "",
    location: "",
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

  const inventoryRequest = (payload) => api.post("/inventory", payload);
  const variantRequest = (payload) => api.post("/variant", payload);
  const productRequest = (payload) => api.post("/product", payload);

  const normalize = (resData, key) => {
    if (Array.isArray(resData)) return resData;
    if (Array.isArray(resData?.[key])) return resData[key];
    if (Array.isArray(resData?.data?.[key])) return resData.data[key];
    return [];
  };

  const getProductIdSafe = (p) => p?.productId ?? p?.id ?? null;
  const getVariantIdSafe = (v) => v?.variantId ?? v?.id ?? v?.productVariantId ?? null;

  const getVariantProductId = (v) =>
    v?.productId ?? v?.product?.productId ?? v?.product?.id ?? null;

  const getInventoryVariantId = (inv) =>
    inv?.variantId ??
    inv?.productVariant?.id ??
    inv?.productVariant?.productVariantId ??
    inv?.variant?.id ??
    null;

  const getInventoryVariantObj = (inv) => inv?.productVariant ?? inv?.variant ?? null;

  // ================= Fetchers =================
  const getInventoryData = async () => {
    try {
      const res = await inventoryRequest({ requestType: "READ_ALL" });
      setInventory(normalize(res.data, "inventories"));
    } catch (err) {
      console.error("Inventory READ_ALL error:", err);
      setInventory([]);
    }
  };

  const getVariantData = async () => {
    try {
      const res = await variantRequest({ requestType: "READ_ALL" });
      setVariants(normalize(res.data, "variants"));
    } catch (err) {
      console.error("Variant READ_ALL error:", err);
      setVariants([]);
    }
  };

  const getProductData = async () => {
    try {
      const res = await productRequest({ requestType: "READ_ALL" });
      setProducts(normalize(res.data, "products"));
    } catch (err) {
      console.error("Product READ_ALL error:", err);
      setProducts([]);
    }
  };

  useEffect(() => {
    if (!BaseUrl) return;
    getInventoryData();
    getVariantData();
    getProductData();
    // eslint-disable-next-line
  }, [BaseUrl, count]);

  // ================= Form handlers =================
  const resetForm = () => {
    setForm({ inventoryId: null, quantity: "", location: "" });
    setVariantId("");
    setSelectedProductId("");
    setIsEditing(false);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payloadBase = {
      variantId: Number(variantId),
      quantity: Number(form.quantity),
      location: String(form.location || "").trim(),
    };

    if (!payloadBase.variantId) return;
    if (!payloadBase.location) return;

    try {
      if (isEditing) {
        await inventoryRequest({
          requestType: "UPDATE",
          inventoryId: Number(form.inventoryId),
          ...payloadBase,
        });
      } else {
        await inventoryRequest({
          requestType: "CREATE",
          ...payloadBase,
        });
      }

      if (typeof setcount === "function") setcount((p) => p + 1);
      await getInventoryData();
      resetForm();
    } catch (err) {
      console.error(isEditing ? "Inventory UPDATE error:" : "Inventory CREATE error:", err.response?.data || err.message);
      window.alert("Save failed (check console).");
    }
  };

  const handleEdit = (item) => {
    setForm({
      inventoryId: item.inventoryId,
      quantity: item.quantity ?? "",
      location: item.location ?? "",
    });

    const vid = item.variantId ?? getInventoryVariantId(item);
    setVariantId(vid ? Number(vid) : "");

    // set product filter as well (for convenience)
    const vObj = getInventoryVariantObj(item);
    const pid = vObj ? getVariantProductId(vObj) : null;
    setSelectedProductId(pid ? String(pid) : "");

    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inventory?")) return;

    try {
      await inventoryRequest({ requestType: "DELETE", inventoryId: Number(id) });
      if (typeof setcount === "function") setcount((p) => p + 1);
      await getInventoryData();
    } catch (err) {
      console.error("Inventory DELETE error:", err.response?.data || err.message);
      window.alert("Delete failed (check console).");
    }
  };

  // ================= Options =================
  const productOptions = products.map((p) => ({
    value: String(getProductIdSafe(p)),
    label: p.productName,
  }));

  const filteredVariantList = selectedProductId
    ? variants.filter((v) => String(getVariantProductId(v)) === String(selectedProductId))
    : variants;

  const variantOptions = filteredVariantList.map((v) => {
    const id = getVariantIdSafe(v);
    const pName = v.product?.productName
      ? ` • ${v.product.productName}`
      : "";
    return {
      value: Number(id),
      label: `${v.variantName} — ${v.variantValue} (₹${v.price})${pName}`,
    };
  });

  // ================= Search =================
  const filteredInventory = inventory.filter((inv) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();

    const vObj = getInventoryVariantObj(inv);
    const name = (vObj?.variantName || "").toLowerCase();
    const value = (vObj?.variantValue || "").toLowerCase();
    const location = (inv.location || "").toLowerCase();
    const qty = String(inv.quantity ?? "");
    const productName = (vObj?.product?.productName || "").toLowerCase();

    return (
      name.includes(q) ||
      value.includes(q) ||
      location.includes(q) ||
      qty.includes(q) ||
      productName.includes(q)
    );
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
      fontWeight: 700,
      fontSize: "13px",
    }),
    option: (base, state) => ({
      ...base,
      background: state.isSelected
        ? theme.primary
        : state.isFocused
        ? `rgba(59, 130, 246, 0.1)`
        : "white",
      color: state.isSelected ? "white" : theme.textPrimary,
      fontWeight: 700,
      fontSize: "13px",
    }),
    singleValue: (base) => ({ ...base, color: theme.textPrimary, fontWeight: 800, fontSize: "13px" }),
    placeholder: (base) => ({ ...base, color: theme.textMuted, fontSize: "13px", fontWeight: 700 }),
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

        .inv-row {
          animation: slideInRow 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          opacity: 0;
        }
        .inv-row:hover {
          transform: translateX(6px) scale(1.01);
          box-shadow: 0 6px 24px rgba(59, 130, 246, 0.18), 0 0 0 1.5px rgba(96, 165, 250, 0.5);
          border-color: rgba(96, 165, 250, 0.6);
          z-index: 10;
        }
        .form-panel { animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .add-fab { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); animation: float 3s ease-in-out infinite; }
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
          {/* Inventory Rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredInventory.length > 0 ? (
              filteredInventory.map((inv, i) => {
                const vObj = getInventoryVariantObj(inv);
                return (
                  <div
                    key={inv.inventoryId ?? i}
                    className="inv-row"
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
                    }}
                  >
                    <div style={{ width: "4px", alignSelf: "stretch", background: theme.gradientPrimary }} />

                    <div style={{ padding: "12px 16px", flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "14px", fontWeight: 900, color: theme.textPrimary }}>
                        {vObj?.variantName || "N/A"} — {vObj?.variantValue || ""}
                      </div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: theme.textMuted, marginTop: 4 }}>
                        {vObj?.product?.productName ? `Product: ${vObj.product.productName}` : ""}
                      </div>

                      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 10 }}>
                        <div style={{ fontSize: "12px", fontWeight: 800, color: theme.primaryDark }}>
                          Qty: {inv.quantity}
                        </div>
                        <div style={{ fontSize: "12px", fontWeight: 800, color: theme.textSecondary }}>
                          Location: {inv.location}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, padding: "12px 14px" }}>
                      <button
                        onClick={() => handleEdit(inv)}
                        style={{
                          width: 36,
                          height: 36,
                          border: "none",
                          borderRadius: theme.radiusSm,
                          cursor: "pointer",
                          background: theme.gradientPrimary,
                          color: "white",
                          fontWeight: 900,
                        }}
                        type="button"
                      >
                        E
                      </button>
                      <button
                        onClick={() => handleDelete(inv.inventoryId)}
                        style={{
                          width: 36,
                          height: 36,
                          border: "none",
                          borderRadius: theme.radiusSm,
                          cursor: "pointer",
                          background: theme.gradientDanger,
                          color: "white",
                          fontWeight: 900,
                        }}
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
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: theme.textPrimary, margin: 0 }}>
                  {searchQuery ? "No results found" : "No inventory yet"}
                </h3>
                <p style={{ fontSize: "13px", marginTop: 8 }}>
                  Click the + button to add inventory
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
            onClick={(e) => {
              if (e.target === e.currentTarget) resetForm();
            }}
          >
            <div
              className="form-panel"
              style={{
                width: "100%",
                maxWidth: "460px",
                background: theme.cardBg,
                border: `2px solid ${theme.border}`,
                borderRadius: theme.radiusXl,
                padding: "24px",
                boxShadow: `0 20px 60px rgba(0,0,0,0.2)`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: theme.textPrimary }}>
                  {isEditing ? "Update Inventory" : "Add Inventory"}
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: theme.radiusMd,
                    border: "none",
                    background: "rgba(239,68,68,0.12)",
                    color: theme.danger,
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  X
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Product dropdown */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: theme.textSecondary, marginBottom: 6 }}>
                    Product (filter variants)
                  </div>
                  <Select
                    options={productOptions}
                    value={productOptions.find((p) => String(p.value) === String(selectedProductId)) || null}
                    onChange={(p) => {
                      setSelectedProductId(p?.value ?? "");
                      setVariantId(""); // reset variant when product changes
                    }}
                    placeholder="Select product..."
                    isSearchable
                    styles={selectStyles}
                  />
                </div>

                {/* Variant dropdown */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: theme.textSecondary, marginBottom: 6 }}>
                    Variant
                  </div>
                  <Select
                    options={variantOptions}
                    value={variantOptions.find((opt) => Number(opt.value) === Number(variantId)) || null}
                    onChange={(selected) => setVariantId(selected?.value ?? "")}
                    placeholder={selectedProductId ? "Choose a variant..." : "Choose product first (or select variant directly)"}
                    isSearchable
                    styles={selectStyles}
                    isDisabled={variantOptions.length === 0}
                  />
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: theme.textSecondary, marginBottom: 6 }}>
                    Quantity
                  </div>
                  <input
                    className="inv-input"
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: theme.textSecondary, marginBottom: 6 }}>
                    Location
                  </div>
                  <input
                    className="inv-input"
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    height: 46,
                    border: "none",
                    borderRadius: theme.radiusMd,
                    background: theme.gradientPrimary,
                    color: "white",
                    fontWeight: 900,
                    cursor: "pointer",
                    marginTop: 6,
                  }}
                >
                  {isEditing ? "Update" : "Create"}
                </button>
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
            color: "white",
            fontWeight: 900,
          }}
          type="button"
        >
          + Add Inventory
        </button>
      </div>
    </>
  );
};

export default Inventory;