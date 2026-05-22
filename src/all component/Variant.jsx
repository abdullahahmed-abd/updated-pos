import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import { AppContext } from "./Contextapi";

const Variant = () => {
  const ctx = useContext(AppContext);

  const BaseUrl =
    (Array.isArray(ctx) && ctx[ctx.length - 1]) ||
    "https://rihanna-kindliest-pseudoreligiously.ngrok-free.dev";

  const count = ctx?.[2];
  const setcount = ctx?.[3];

  const [variants, setVariants] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventories, setInventories] = useState([]);

  const [variantName, setVariantName] = useState("");
  const [variantValue, setVariantValue] = useState("");
  const [price, setPrice] = useState("");
  const [productId, setProductId] = useState("");

  // IMPORTANT: backend field name is `refundable`
  const [isRefundable, setIsRefundable] = useState(true);

  // inventory on create
  const [invQty, setInvQty] = useState("");
  const [invLocation, setInvLocation] = useState("");

  const [editId, setEditId] = useState(null);

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
    gradientPrimary: "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)",
    gradientDanger: "linear-gradient(135deg, #EF4444 0%, #F87171 100%)",
    gradientWarning: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
    radiusSm: "6px",
    radiusMd: "8px",
    radiusLg: "12px",
    radiusXl: "16px",
    radiusFull: "9999px",
  };

  const api = useMemo(() => {
    return axios.create({
      baseURL: BaseUrl,
      headers: { "ngrok-skip-browser-warning": "true" },
    });
  }, [BaseUrl]);

  const productRequest = (payload) => api.post("/product", payload);
  const variantRequest = (payload) => api.post("/variant", payload);
  const inventoryRequest = (payload) => api.post("/inventory", payload);

  const normalize = (resData, key) => {
    if (Array.isArray(resData)) return resData;
    if (Array.isArray(resData?.[key])) return resData[key];
    if (Array.isArray(resData?.data?.[key])) return resData.data[key];
    return [];
  };

  const getProductIdSafe = (p) => p?.productId ?? p?.id ?? null;
  const getVariantIdSafe = (v) => v?.variantId ?? v?.id ?? v?.productVariantId ?? null;

  const getInventoryVariantIdSafe = (inv) =>
    inv?.variantId ??
    inv?.productVariant?.id ??
    inv?.productVariant?.productVariantId ??
    inv?.variant?.id ??
    null;

  const fetchProducts = async () => {
    const res = await productRequest({ requestType: "READ_ALL" });
    setProducts(normalize(res.data, "products"));
  };

  const fetchVariants = async () => {
    const res = await variantRequest({ requestType: "READ_ALL" });
    setVariants(normalize(res.data, "variants"));
  };

  const fetchInventories = async () => {
    const res = await inventoryRequest({ requestType: "READ_ALL" });
    setInventories(normalize(res.data, "inventories"));
  };

  useEffect(() => {
    if (!BaseUrl) return;
    (async () => {
      try {
        await Promise.all([fetchProducts(), fetchVariants(), fetchInventories()]);
      } catch (err) {
        console.error("Variant screen load error:", err);
      }
    })();
    // eslint-disable-next-line
  }, [BaseUrl, count]);

  const resetForm = () => {
    setVariantName("");
    setVariantValue("");
    setPrice("");
    setProductId("");
    setEditId(null);
    setIsRefundable(true);
    setInvQty("");
    setInvLocation("");
  };

  const getProductName = (v) => {
    if (v.product?.productName) return v.product.productName;
    const pid = v.productId ?? v.product?.productId ?? v.product?.id;
    const found = products.find((p) => String(getProductIdSafe(p)) === String(pid));
    return found?.productName || "N/A";
  };

  const filteredVariants = variants.filter((v) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const vn = (v.variantName || "").toLowerCase();
    const vv = (v.variantValue || "").toLowerCase();
    const pn = (getProductName(v) || "").toLowerCase();
    const pr = String(v.price ?? "");
    return vn.includes(q) || vv.includes(q) || pn.includes(q) || pr.includes(q);
  });

  const findInventoryForVariant = (variantId) => {
    return inventories.find((inv) => String(getInventoryVariantIdSafe(inv)) === String(variantId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productId) return window.alert("Select product");
    if (!variantName.trim()) return window.alert("Enter variant name");
    if (!variantValue.trim()) return window.alert("Enter variant value");
    if (price === "") return window.alert("Enter price");

    const invTouched = invQty !== "" || invLocation.trim() !== "";
    if (!editId && invTouched && (invQty === "" || invLocation.trim() === "")) {
      return window.alert("Inventory quantity + location both required");
    }

    const basePayload = {
      productId: Number(productId),
      variantName: variantName.trim(),
      variantValue: variantValue.trim(),
      price: Number(price),

      // ✅ BACKEND expects `refundable`
      refundable: Boolean(isRefundable),
    };

    try {
      if (editId) {
        await variantRequest({
          requestType: "UPDATE",
          variantId: Number(editId),
          ...basePayload,
        });

        await fetchVariants();
        if (typeof setcount === "function") setcount((p) => p + 1);
        resetForm();
        return;
      }

      // ✅ CREATE payload includes inventoryRequest (backend class supports it)
      const createPayload = {
        requestType: "CREATE",
        ...basePayload,
        ...(invTouched
          ? {
              inventoryRequest: {
                quantity: parseInt(invQty, 10), // Long
                location: invLocation.trim(),
              },
            }
          : {}),
      };

      await variantRequest(createPayload);

      // refresh variants and inventories
      await fetchVariants();
      await fetchInventories();

      // ---- SAFETY FALLBACK ----
      // if backend didn't create inventory from inventoryRequest, create it explicitly (no duplicates)
      if (invTouched) {
        const latestRes = await variantRequest({ requestType: "READ_ALL" });
        const latest = normalize(latestRes.data, "variants");
        setVariants(latest);

        const created = latest
          .filter(
            (v) =>
              String(v.productId ?? v.product?.id ?? v.product?.productId) ===
              String(basePayload.productId)
          )
          .filter((v) => String(v.variantName || "").trim() === basePayload.variantName)
          .filter((v) => String(v.variantValue || "").trim() === basePayload.variantValue)
          .filter((v) => Number(v.price || 0) === Number(basePayload.price))
          .map((v) => ({ v, id: getVariantIdSafe(v) }))
          .filter((x) => x.id != null)
          .sort((a, b) => Number(b.id) - Number(a.id))[0]?.id;

        if (created) {
          const invExists = findInventoryForVariant(created);
          if (!invExists) {
            await inventoryRequest({
              requestType: "CREATE",
              variantId: Number(created),
              quantity: parseInt(invQty, 10),
              location: invLocation.trim(),
            });
            await fetchInventories();
          }
        }
      }

      if (typeof setcount === "function") setcount((p) => p + 1);
      resetForm();
    } catch (err) {
      console.error("Variant submit error:", err.response?.data || err.message);
      window.alert("Operation failed. Check console.");
    }
  };

  const handleEdit = (v) => {
    const id = getVariantIdSafe(v);

    setVariantName(v.variantName ?? "");
    setVariantValue(v.variantValue ?? "");
    setPrice(v.price ?? "");

    const pid = v.productId ?? v.product?.productId ?? v.product?.id ?? "";
    setProductId(pid ? String(pid) : "");

    // ✅ backend field is refundable
    setIsRefundable(v.refundable ?? v.isRefundable ?? true);

    setInvQty("");
    setInvLocation("");
    setEditId(id);
  };

  // delete ONLY variant (as you want)
  const handleDelete = async (vObj) => {
    const vid = Number(getVariantIdSafe(vObj));
    if (!vid) return;

    if (!window.confirm("Are you sure you want to delete this variant?")) return;

    try {
      await variantRequest({ requestType: "DELETE", variantId: vid });
      await fetchVariants();
      if (typeof setcount === "function") setcount((p) => p + 1);
    } catch (err) {
      console.error("Variant DELETE error:", err.response?.data || err.message);
      window.alert("Delete failed (backend 500).");
    }
  };

  const getStock = (variantId) => findInventoryForVariant(variantId)?.quantity ?? 0;

  return (
    <>
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
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: theme.primaryDark, margin: 0 }}>
              {editId ? "Update Variant" : "Add New Variant"}
            </h1>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 24 }}>
            {/* Form */}
            <div
              style={{
                background: theme.cardBg,
                border: `1.5px solid ${theme.border}`,
                borderRadius: theme.radiusXl,
                padding: 24,
                boxShadow: `0 10px 15px -3px rgba(59, 130, 246, 0.12)`,
              }}
            >
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <select
                  value={productId || ""}
                  onChange={(e) => setProductId(e.target.value)}
                  style={{
                    height: 44,
                    borderRadius: theme.radiusMd,
                    border: `2px solid ${theme.inputBorder}`,
                    padding: "0 14px",
                    fontWeight: 800,
                    background: theme.inputBg,
                  }}
                  required
                >
                  <option value="">Select Product</option>
                  {products.map((p) => {
                    const pid = getProductIdSafe(p);
                    return (
                      <option key={pid} value={pid}>
                        {p.productName}
                      </option>
                    );
                  })}
                </select>

                <input
                  value={variantName}
                  onChange={(e) => setVariantName(e.target.value)}
                  placeholder="Variant Name"
                  style={{
                    height: 44,
                    borderRadius: theme.radiusMd,
                    border: `2px solid ${theme.inputBorder}`,
                    padding: "0 14px",
                    background: theme.inputBg,
                    fontWeight: 800,
                  }}
                  required
                />

                <input
                  value={variantValue}
                  onChange={(e) => setVariantValue(e.target.value)}
                  placeholder="Variant Value"
                  style={{
                    height: 44,
                    borderRadius: theme.radiusMd,
                    border: `2px solid ${theme.inputBorder}`,
                    padding: "0 14px",
                    background: theme.inputBg,
                    fontWeight: 800,
                  }}
                  required
                />

                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Price"
                  type="number"
                  style={{
                    height: 44,
                    borderRadius: theme.radiusMd,
                    border: `2px solid ${theme.inputBorder}`,
                    padding: "0 14px",
                    background: theme.inputBg,
                    fontWeight: 800,
                  }}
                  required
                />

                <label style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800 }}>
                  <input
                    type="checkbox"
                    checked={isRefundable}
                    onChange={(e) => setIsRefundable(e.target.checked)}
                  />
                  Refundable
                </label>

                {!editId && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <input
                      value={invQty}
                      onChange={(e) => setInvQty(e.target.value)}
                      placeholder="Inventory Qty"
                      type="number"
                      style={{
                        height: 44,
                        borderRadius: theme.radiusMd,
                        border: `2px solid ${theme.inputBorder}`,
                        padding: "0 14px",
                        background: theme.inputBg,
                        fontWeight: 800,
                      }}
                    />
                    <input
                      value={invLocation}
                      onChange={(e) => setInvLocation(e.target.value)}
                      placeholder="Inventory Location"
                      style={{
                        height: 44,
                        borderRadius: theme.radiusMd,
                        border: `2px solid ${theme.inputBorder}`,
                        padding: "0 14px",
                        background: theme.inputBg,
                        fontWeight: 800,
                      }}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  style={{
                    height: 46,
                    borderRadius: theme.radiusMd,
                    border: "none",
                    background: theme.gradientPrimary,
                    color: "white",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  {editId ? "Update Variant" : "Add Variant"}
                </button>

                {editId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    style={{
                      height: 46,
                      borderRadius: theme.radiusMd,
                      border: `2px solid ${theme.inputBorder}`,
                      background: theme.inputBg,
                      color: theme.textSecondary,
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    Cancel Edit
                  </button>
                )}
              </form>
            </div>

            {/* List */}
            <div
              style={{
                background: theme.cardBg,
                border: `1.5px solid ${theme.border}`,
                borderRadius: theme.radiusXl,
                padding: 24,
                boxShadow: `0 10px 15px -3px rgba(59, 130, 246, 0.12)`,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 620, overflowY: "auto" }}>
                {filteredVariants.map((v, i) => {
                  const vid = getVariantIdSafe(v);
                  return (
                    <div
                      key={vid ?? i}
                      style={{
                        border: `1.5px solid rgba(229, 231, 235, 0.7)`,
                        borderRadius: theme.radiusLg,
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 900, color: theme.textPrimary }}>
                          {v.variantName}: {v.variantValue}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: theme.textMuted, marginTop: 4 }}>
                          {getProductName(v)} • Stock: {getStock(vid)}
                        </div>
                      </div>

                      <div style={{ fontWeight: 900, color: theme.success }}>₹{v.price}</div>

                      <button
                        onClick={() => handleEdit(v)}
                        type="button"
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: theme.radiusSm,
                          border: "none",
                          background: theme.gradientPrimary,
                          color: "white",
                          cursor: "pointer",
                          fontWeight: 900,
                        }}
                        title="Edit"
                      >
                        <CiEdit />
                      </button>

                      <button
                        onClick={() => handleDelete(v)}
                        type="button"
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: theme.radiusSm,
                          border: "none",
                          background: theme.gradientDanger,
                          color: "white",
                          cursor: "pointer",
                          fontWeight: 900,
                        }}
                        title="Delete"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Variant;