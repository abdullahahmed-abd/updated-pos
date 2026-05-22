import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import Navbar from './Navbar'
import { AppContext } from './Contextapi'

const Additems = () => {
  const [productdata, setproductdata] = useState([]);
  const [variantdata, setvariantdata] = useState([]);
  const [inventorydata, setInventorydata] = useState([]);

  const [updatevariantName, setupdatevariantName] = useState("");
  const [updatevariantValue, setupdatevariantValue] = useState("");
  const [updatevariantprice, setupdatevariantprice] = useState("");
  const [updatevariantproductId, setupdatevariantproductId] = useState("");
  const [index, setindex] = useState("");
  const [activeTab, setActiveTab] = useState('product');

  const data = useContext(AppContext);
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
  ] = data;

  // ===== axios instance + new backend request helpers =====
  const api = axios.create({
    baseURL: BaseUrl,
    headers: { 'ngrok-skip-browser-warning': 'true' },
  });

  const productRequest = (payload) => api.post('/product', payload);
  const categoryRequest = (payload) => api.post('/category', payload);
  const variantRequest = (payload) => api.post('/variant', payload);
  const inventoryRequest = (payload) => api.post('/inventory', payload);

  // ===== safe helpers =====
  const getCategoryIdSafe = (c) => c?.categoryId ?? c?.id ?? null;
  const getVariantIdSafe = (v) => v?.variantId ?? v?.productVariantId ?? v?.id ?? null;
  const getInventoryVariantIdSafe = (inv) =>
    inv?.variantId ?? inv?.productVariant?.id ?? inv?.productVariant?.productVariantId ?? null;

  const theme = {
    // Primary: Modern Blue
    primary: '#3B82F6',
    primaryLight: '#60A5FA',
    primaryDark: '#1E40AF',

    // Secondary: Purple
    secondary: '#8B5CF6',
    secondaryLight: '#A78BFA',

    // Danger: Rose
    danger: '#EF4444',
    dangerLight: '#F87171',

    // Warning: Amber
    warning: '#F59E0B',
    warningLight: '#FBBF24',

    // Success: Emerald
    success: '#10B981',
    successLight: '#34D399',

    // Background
    pageBg: '#F9FAFB',
    cardBg: '#FFFFFF',
    cardBgHover: '#F3F4F6',
    inputBg: '#F3F4F6',
    inputBorder: '#E5E7EB',
    inputFocus: '#3B82F6',

    textPrimary: '#111827',
    textSecondary: '#374151',
    textMuted: '#9CA3AF',
    textOnPrimary: '#FFFFFF',

    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    shadow: '0 1px 3px 0 rgba(59, 130, 246, 0.1), 0 1px 2px -1px rgba(59, 130, 246, 0.1)',
    shadowMd: '0 4px 6px -1px rgba(59, 130, 246, 0.12), 0 2px 4px -2px rgba(59, 130, 246, 0.08)',
    shadowLg: '0 10px 15px -3px rgba(59, 130, 246, 0.12), 0 4px 6px -4px rgba(59, 130, 246, 0.08)',
    shadowXl: '0 20px 25px -5px rgba(59, 130, 246, 0.12), 0 8px 10px -6px rgba(59, 130, 246, 0.08)',

    gradientPrimary: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
    gradientSuccess: 'linear-gradient(135deg, #10B981, #34D399)',
    gradientWarning: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
    gradientDanger: 'linear-gradient(135deg, #EF4444, #F87171)',
    gradientSecondary: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',

    badgePrimaryBg: '#DBEAFE',
    badgePrimaryText: '#1E40AF',
    badgeSuccessBg: '#DCFCE7',
    badgeSuccessText: '#15803D',
    badgeWarningBg: '#FEF3C7',
    badgeWarningText: '#92400E',
    badgeDangerBg: '#FEE2E2',
    badgeDangerText: '#991B1B',
    badgeAccentBg: '#DCFCE7',
    badgeAccentText: '#10B981',

    radiusSm: '6px',
    radiusMd: '8px',
    radiusLg: '12px',
    radiusXl: '16px',
    radiusFull: '9999px',
  };

  const styles = {
    page: {
      minHeight: '100vh',
      background: theme.pageBg,
      position: 'relative',
      overflow: 'hidden',
    },
    container: {
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '32px 16px',
      minHeight: '100vh',
    },
    card: {
      background: theme.cardBg,
      border: `1.5px solid ${theme.border}`,
      borderRadius: theme.radiusXl,
      padding: '24px',
      boxShadow: theme.shadowLg,
      backdropFilter: 'blur(10px)',
    },
    input: {
      width: '100%',
      background: theme.inputBg,
      border: `2px solid ${theme.inputBorder}`,
      borderRadius: theme.radiusMd,
      padding: '12px 16px 12px 42px',
      color: theme.textPrimary,
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      boxSizing: 'border-box',
    },
    inputNoIcon: {
      width: '100%',
      background: theme.inputBg,
      border: `2px solid ${theme.inputBorder}`,
      borderRadius: theme.radiusMd,
      padding: '10px 16px',
      color: theme.textPrimary,
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      boxSizing: 'border-box',
    },
    select: {
      width: '100%',
      background: theme.inputBg,
      border: `2px solid ${theme.inputBorder}`,
      borderRadius: theme.radiusMd,
      padding: '12px 40px 12px 42px',
      color: theme.textPrimary,
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      appearance: 'none',
      cursor: 'pointer',
      boxSizing: 'border-box',
    },
    textarea: {
      width: '100%',
      background: theme.inputBg,
      border: `2px solid ${theme.inputBorder}`,
      borderRadius: theme.radiusMd,
      padding: '12px 16px 12px 42px',
      color: theme.textPrimary,
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      resize: 'none',
      boxSizing: 'border-box',
    },
    label: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '600',
      color: theme.textSecondary,
      marginBottom: '6px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: theme.textPrimary,
      margin: 0,
    },
    iconBox: (gradient) => ({
      width: '36px',
      height: '36px',
      background: gradient,
      borderRadius: theme.radiusSm,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
    }),
    badge: (bg, text) => ({
      background: bg,
      color: text,
      fontSize: '12px',
      fontWeight: '600',
      padding: '4px 12px',
      borderRadius: theme.radiusFull,
      border: `1px solid ${text}30`,
    }),
    primaryButton: {
      width: '100%',
      background: theme.gradientPrimary,
      color: theme.textOnPrimary,
      fontWeight: '600',
      padding: '14px',
      borderRadius: theme.radiusMd,
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: `0 4px 14px 0 rgba(59, 130, 246, 0.5)`,
    },
    warningButton: {
      width: '100%',
      background: theme.gradientWarning,
      color: theme.textOnPrimary,
      fontWeight: '600',
      padding: '14px',
      borderRadius: theme.radiusMd,
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: `0 4px 14px 0 rgba(245, 158, 11, 0.5)`,
    },
    cancelButton: {
      flex: 1,
      background: theme.inputBg,
      border: `2px solid ${theme.border}`,
      color: theme.textSecondary,
      fontWeight: '600',
      padding: '14px',
      borderRadius: theme.radiusMd,
      cursor: 'pointer',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      textDecoration: 'none',
    },
    submitButton: (isUpdate) => ({
      flex: 1,
      background: isUpdate ? theme.gradientWarning : theme.gradientPrimary,
      color: theme.textOnPrimary,
      fontWeight: '600',
      padding: '14px',
      borderRadius: theme.radiusMd,
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isUpdate
        ? `0 4px 14px 0 rgba(245, 158, 11, 0.5)`
        : `0 4px 14px 0 rgba(59, 130, 246, 0.5)`,
    }),
    variantCard: {
      background: '#F0F9FF',
      border: `1px solid ${theme.borderLight}`,
      borderRadius: theme.radiusMd,
      padding: '16px',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    variantNumber: (gradient) => ({
      width: '26px',
      height: '26px',
      background: gradient,
      borderRadius: theme.radiusFull,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: '700',
      color: theme.textOnPrimary,
      flexShrink: 0,
      boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)',
    }),
    deleteButton: {
      width: '32px',
      height: '32px',
      background: theme.badgeDangerBg,
      borderRadius: theme.radiusSm,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: `1px solid ${theme.danger}30`,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      opacity: 0,
    },
    divider: {
      position: 'relative',
      margin: '24px 0',
    },
    dividerLine: {
      width: '100%',
      height: '1.5px',
      background: `linear-gradient(90deg, transparent, ${theme.border}, transparent)`,
    },
    dividerText: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: theme.cardBg,
      padding: '0 12px',
      fontSize: '11px',
      color: theme.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '2px',
      fontWeight: '600',
    },
    sectionDot: (color) => ({
      width: '8px',
      height: '8px',
      background: color,
      borderRadius: theme.radiusFull,
      flexShrink: 0,
      boxShadow: `0 0 8px ${color}60`,
    }),
    sectionLabel: (color) => ({
      fontSize: '12px',
      fontWeight: '600',
      color: color,
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
    }),
    infoTag: (color) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '13px',
      color: color,
      fontWeight: '500',
    }),
    inputIcon: {
      position: 'absolute',
      top: '50%',
      left: '12px',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    selectArrow: {
      position: 'absolute',
      top: '50%',
      right: '12px',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
    },
  };

  // ===== fetchers (NEW BACKEND) =====
  const getproductData = () => {
    productRequest({ requestType: "READ_ALL" }).then((res) => {
      setproductdata(res.data?.products || []);
    });
  };

  const getcategorydata = () => {
    categoryRequest({ requestType: "READ_ALL" }).then((res) => {
      setcategorydata(res.data?.categories || []);
    });
  };

  const getvariantdata = () => {
    variantRequest({ requestType: "READ_ALL" }).then((res) => {
      setvariantdata(res.data?.variants || []);
    });
  };

  const getInventoryData = () => {
    inventoryRequest({ requestType: "READ_ALL" }).then((res) => {
      setInventorydata(res.data?.inventories || []);
    });
  };

  useEffect(() => {
    getproductData();
    getcategorydata();
    getvariantdata();
    getInventoryData();
    // eslint-disable-next-line
  }, []);

  // ===== update-mode: select variant -> fill fields + attach inventoryId =====
  function getproductvariant(val) {
    const parsed = JSON.parse(val);

    setupdatevariantName(parsed.variantName);
    setupdatevariantValue(parsed.variantValue);
    setupdatevariantprice(parsed.variantprice);
    setupdatevariantproductId(parsed.variantproductId);
    setindex(parsed.index);

    const vid = parsed.variantproductId;

    const inv = inventorydata.find((inv) => String(getInventoryVariantIdSafe(inv)) === String(vid));
    const loc = inv?.location ?? "";
    const qty = inv?.quantity ?? "";
    const invId = inv?.inventoryId ?? null;

    setinventorylocation(loc);
    setinventoryquantity(qty);

    setproductvariants((prev) => {
      const copy = [...prev];
      if (copy[parsed.index]) {
        copy[parsed.index] = {
          ...copy[parsed.index],
          inventorylocation: loc,
          inventoryquantity: qty,
          inventoryId: invId,
        };
      }
      return copy;
    });
  }

  // ===== reset form =====
  function resetForm() {
    setName("");
    setSku("");
    setDescription("");
    setCategoryId(null);

    setvariantsarray([]);
    setCategoryId("");

    setvariantName("");
    setvariantValue("");
    setvariantprice("");
    setinventoryquantity("");
    setinventorylocation("");
  }

  // ===== create-mode: add variant+inventory to variantsarray =====
  function getinventory(e) {
    e.preventDefault();
    if (variantName !== "" && variantValue !== "" && variantprice !== "" && inventoryquantity !== "" && inventorylocation !== "") {
      let obj = {
        variantName: variantName,
        variantValue: variantValue,
        price: variantprice,
        quantity: inventoryquantity,
        location: inventorylocation
      };
      variantsarray.push(obj);
      setvariantsarray([...variantsarray]);
    } else if (variantName === "") {
      window.alert("Please enter variantname");
    } else if (variantValue === "") {
      window.alert("Please enter variantvalue");
    } else if (variantprice === "") {
      window.alert("Please enter variantprice");
    } else if (inventoryquantity === "") {
      window.alert("Please enter quantity");
    } else if (inventorylocation === "") {
      window.alert("Please enter location");
    }

    setvariantName("");
    setvariantValue("");
    setvariantprice("");
    setinventoryquantity("");
    setinventorylocation("");
  }

  // ===== update-mode: update local productvariants array =====
  function updateinventory(e) {
    e.preventDefault();

    if (updatevariantName !== "" && updatevariantValue !== "" && updatevariantprice !== "" && inventorylocation !== "" && inventoryquantity !== "") {
      setproductvariants((prev) => {
        const copy = [...prev];
        const old = copy[index] || {};
        copy.splice(index, 1, {
          ...old,
          variantName: updatevariantName,
          variantValue: updatevariantValue,
          variantprice: updatevariantprice,
          variantproductId: updatevariantproductId,
          inventorylocation: inventorylocation,
          inventoryquantity: inventoryquantity,
          inventoryId: old.inventoryId ?? null,
        });
        return copy;
      });

      setupdatevariantName("");
      setupdatevariantValue("");
      setupdatevariantprice("");
      setinventorylocation("");
      setinventoryquantity("");
    } else {
      window.alert("please fill all fields");
    }
  }

  function removeVariant(idx) {
    const updated = variantsarray.filter((_, i) => i !== idx);
    setvariantsarray(updated);
  }

  // ===== input focus/blur animation =====
  const handleFocus = (e) => {
    e.target.style.borderColor = theme.inputFocus;
    e.target.style.boxShadow = `0 0 0 4px ${theme.inputFocus}25, 0 4px 12px ${theme.inputFocus}15`;
    e.target.style.background = '#EFF6FF';
    e.target.style.transform = 'translateY(-1px)';
    const icon = e.target.parentElement.querySelector('.input-icon-wrapper');
    if (icon) {
      icon.style.color = theme.primary;
      icon.style.transform = 'translateY(-50%) scale(1.15)';
    }
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = theme.inputBorder;
    e.target.style.boxShadow = 'none';
    e.target.style.background = theme.inputBg;
    e.target.style.transform = 'translateY(0)';
    const icon = e.target.parentElement.querySelector('.input-icon-wrapper');
    if (icon) {
      icon.style.color = theme.textMuted;
      icon.style.transform = 'translateY(-50%) scale(1)';
    }
  };

  // ===== SUBMIT (NEW BACKEND) =====
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (productName === "") return window.alert("please enter product name");
    if (sku === "") return window.alert("please enter sku");
    if (description === "") return window.alert("please enter description");
    if (categoryId === "" || categoryId == null) return window.alert("please select category name");

    try {
      if (updateActive === false) {
        // CREATE product (POST /product)
        if (!variantsarray || variantsarray.length === 0) {
          return window.alert("please enter variants");
        }

        const payload = {
          requestType: "CREATE",
          productName: productName,
          sku: sku,
          categoryId: Number(categoryId),
          description: description,
          variantRequests: variantsarray.map(v => ({
            variantName: v.variantName,
            variantValue: v.variantValue,
            price: Number(v.price),
            isRefundable: true,
            inventoryRequest: {
              quantity: Number(v.quantity),
              location: v.location,
            }
          }))
        };

        await productRequest(payload);

        resetForm();
        window.alert("Product added successfully");
      } else {
        // UPDATE product basic (POST /product)
        await productRequest({
          requestType: "UPDATE",
          productId: Number(productId),
          productName: productName,
          sku: sku,
          description: description,
          categoryId: Number(categoryId),
        });

        // For each variant update (POST /variant)
        const variantPromises = (productvariants || []).map(v => (
          variantRequest({
            requestType: "UPDATE",
            variantId: Number(v.variantproductId),
            productId: Number(productId),
            variantName: v.variantName,
            variantValue: v.variantValue,
            price: Number(v.variantprice),
            isRefundable: true,
          })
        ));

        // inventory update/create (POST /inventory)
        const inventoryPromises = (productvariants || []).map(v => {
          // try to find inventoryId if missing
          let invId = v.inventoryId ?? null;
          if (!invId) {
            const inv = inventorydata.find((inv) => String(getInventoryVariantIdSafe(inv)) === String(v.variantproductId));
            invId = inv?.inventoryId ?? null;
          }

          const base = {
            variantId: Number(v.variantproductId),
            quantity: Number(v.inventoryquantity ?? 0),
            location: String(v.inventorylocation ?? ""),
          };

          if (invId) {
            return inventoryRequest({
              requestType: "UPDATE",
              inventoryId: Number(invId),
              ...base,
            });
          }
          return inventoryRequest({
            requestType: "CREATE",
            ...base,
          });
        });

        await Promise.all([...variantPromises, ...inventoryPromises]);

        resetForm();
        setproductvariants([]);
        setupdatevariantName("");
        setupdatevariantValue("");
        setupdatevariantprice("");
        setUpdateActive(false);

        window.alert("Product updated successfully");
      }
    } catch (err) {
      console.log("Submit error:", err);
      window.alert("Something went wrong. Check console.");
    }
  };

  return (
    <div style={styles.page}>
      {/* <Navbar /> */}

      {/* ===== ANIMATED BACKGROUND BLOBS ===== */}
      <style>{`
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
        @keyframes blob3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.15; }
          33% { transform: translate(40px, 40px) scale(1.2); opacity: 0.3; }
          66% { transform: translate(-30px, -30px) scale(0.85); opacity: 0.1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .input-icon-wrapper {
          position: absolute;
          top: 50%;
          left: 12px;
          transform: translateY(-50%) scale(1);
          pointer-events: none;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          color: ${theme.textMuted};
        }
        .input-icon-wrapper-top {
          position: absolute;
          top: 12px;
          left: 12px;
          pointer-events: none;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          color: ${theme.textMuted};
        }
      `}</style>

      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '350px', height: '350px',
          background: 'radial-gradient(circle, rgba(30, 64, 175, 0.3), rgba(59, 130, 246, 0.1), transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'blob1 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', left: '-100px',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(96, 165, 250, 0.25), rgba(16, 185, 129, 0.1), transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(70px)',
          animation: 'blob2 10s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '50%',
          width: '300px', height: '300px',
          marginLeft: '-150px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2), rgba(96, 165, 250, 0.08), transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          animation: 'blob3 12s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '15%', left: '10%',
          width: '200px', height: '200px',
          background: 'radial-gradient(circle, rgba(52, 211, 153, 0.2), transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(50px)',
          animation: 'blob1 14s ease-in-out infinite reverse',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '15%',
          width: '250px', height: '250px',
          background: 'radial-gradient(circle, rgba(30, 64, 175, 0.18), transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'blob2 11s ease-in-out infinite reverse',
        }} />
      </div>

      <div style={styles.container}>
        <div style={{ width: '100%', maxWidth: '1100px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '8px', animation: 'float 3s ease-in-out infinite' }}>
              <div style={styles.iconBox(theme.gradientPrimary)}>
                <svg style={{ width: '22px', height: '22px', color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: '800', color: theme.primaryDark, margin: 0 }}>
                {updateActive ? "Update Product" : "Add New Product"}
              </h1>
            </div>
            <p style={{ color: theme.textMuted, fontSize: '14px', margin: 0 }}>
              {updateActive ? "Modify your product details, variants and inventory" : "Create a new product with variants and inventory management"}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '24px',
            }}>

              {/* ===== LEFT COLUMN ===== */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Product Information Card */}
                <div style={styles.card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={styles.iconBox(theme.gradientPrimary)}>
                      <svg style={{ width: '18px', height: '18px', color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h2 style={styles.sectionTitle}>Product Information</h2>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Product Name */}
                    <div>
                      <label style={styles.label}>
                        Product Name <span style={{ color: theme.danger }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <div className="input-icon-wrapper">
                          <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <input
                          style={styles.input}
                          type="text"
                          placeholder="Enter product name..."
                          value={productName}
                          onChange={(e) => setName(e.target.value)}
                          onFocus={handleFocus}
                          onBlur={handleBlur}
                        />
                      </div>
                    </div>

                    {/* SKU & Category */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={styles.label}>
                          SKU <span style={{ color: theme.danger }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                          <div className="input-icon-wrapper">
                            <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <input
                            style={styles.input}
                            type="text"
                            placeholder="SKU-001"
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={styles.label}>
                          Category <span style={{ color: theme.danger }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                          <div className="input-icon-wrapper">
                            <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                          <select
                            value={categoryId}
                            style={styles.select}
                            onChange={(e) => setCategoryId(e.target.value)}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                          >
                            <option value="">Select</option>
                            {categorydata.map((v) => (
                              <option key={getCategoryIdSafe(v)} value={getCategoryIdSafe(v)}>
                                {v.name || v.categoryName}
                              </option>
                            ))}
                          </select>
                          <div style={styles.selectArrow}>
                            <svg style={{ width: '16px', height: '16px', color: theme.textMuted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label style={styles.label}>
                        Description <span style={{ color: theme.danger }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <div className="input-icon-wrapper-top">
                          <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                          </svg>
                        </div>
                        <textarea
                          style={styles.textarea}
                          rows="3"
                          placeholder="Describe your product..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          onFocus={handleFocus}
                          onBlur={handleBlur}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Variants List Card (Create Mode) */}
                {!updateActive && variantsarray.length > 0 && (
                  <div style={styles.card}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={styles.iconBox(theme.gradientSuccess)}>
                          <svg style={{ width: '18px', height: '18px', color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                        </div>
                        <h2 style={styles.sectionTitle}>Added Variants</h2>
                      </div>
                      <span style={styles.badge(theme.badgeSuccessBg, theme.badgeSuccessText)}>
                        {variantsarray.length} variant{variantsarray.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
                      {variantsarray.map((v, i) => (
                        <div
                          key={i}
                          style={styles.variantCard}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#E0F2FE';
                            e.currentTarget.style.borderColor = theme.primary;
                            e.currentTarget.style.transform = 'translateX(4px)';
                            e.currentTarget.style.boxShadow = `0 4px 12px rgba(59, 130, 246, 0.15)`;
                            const btn = e.currentTarget.querySelector('.delete-btn');
                            if (btn) btn.style.opacity = '1';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#F0F9FF';
                            e.currentTarget.style.borderColor = theme.borderLight;
                            e.currentTarget.style.transform = 'translateX(0)';
                            e.currentTarget.style.boxShadow = 'none';
                            const btn = e.currentTarget.querySelector('.delete-btn');
                            if (btn) btn.style.opacity = '0';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <span style={styles.variantNumber(theme.gradientPrimary)}>{i + 1}</span>
                                <span style={{ color: theme.textPrimary, fontWeight: '600', fontSize: '14px' }}>{v.variantName}</span>
                                <span style={{ color: theme.textMuted }}>•</span>
                                <span style={{ color: theme.textSecondary, fontSize: '14px' }}>{v.variantValue}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                <span style={styles.infoTag(theme.primaryDark)}>
                                  Rs {v.price}
                                </span>
                                <span style={styles.infoTag(theme.secondary)}>
                                  Qty: {v.quantity}
                                </span>
                                <span style={styles.infoTag(theme.warning)}>
                                  {v.location}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="delete-btn"
                              onClick={() => removeVariant(i)}
                              style={styles.deleteButton}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#FECACA'; e.currentTarget.style.transform = 'scale(1.1)' }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = theme.badgeDangerBg; e.currentTarget.style.transform = 'scale(1)' }}
                            >
                              <svg style={{ width: '16px', height: '16px', color: theme.danger }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Update Variants List */}
                {updateActive && productvariants.length > 0 && (
                  <div style={styles.card}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={styles.iconBox(theme.gradientWarning)}>
                          <svg style={{ width: '18px', height: '18px', color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </div>
                        <h2 style={styles.sectionTitle}>Product Variants</h2>
                      </div>
                      <span style={styles.badge(theme.badgeWarningBg, theme.badgeWarningText)}>
                        {productvariants.length} variant{productvariants.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
                      {productvariants.map((v, i) => (
                        <div key={i} style={{ ...styles.variantCard, padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={styles.variantNumber(theme.gradientWarning)}>{i + 1}</span>
                            <span style={{ color: theme.textPrimary, fontWeight: '600', fontSize: '14px' }}>{v.variantName}</span>
                            <span style={{ color: theme.textMuted }}>:</span>
                            <span style={{ color: theme.textSecondary, fontSize: '14px' }}>{v.variantValue}</span>
                            <span style={{ marginLeft: 'auto', color: theme.primaryDark, fontWeight: '700', fontSize: '14px' }}>
                              Rs {v.variantprice}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ===== RIGHT COLUMN ===== */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {updateActive === false ? (
                  /* CREATE MODE */
                  <div style={styles.card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                      <div style={styles.iconBox(theme.gradientPrimary)}>
                        <svg style={{ width: '18px', height: '18px', color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                      </div>
                      <h2 style={styles.sectionTitle}>Variant & Inventory</h2>
                    </div>

                    {/* Variant Section */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        <div style={styles.sectionDot(theme.primary)} />
                        <span style={styles.sectionLabel(theme.primary)}>Variant Details</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                          <label style={{ ...styles.label, color: theme.textMuted }}>Variant Name</label>
                          <input
                            style={styles.inputNoIcon}
                            type="text"
                            placeholder="e.g., Color, Size"
                            value={variantName}
                            onChange={(e) => setvariantName(e.target.value)}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <label style={{ ...styles.label, color: theme.textMuted }}>Value</label>
                            <input
                              style={styles.inputNoIcon}
                              type="text"
                              placeholder="e.g., Red, XL"
                              value={variantValue}
                              onChange={(e) => setvariantValue(e.target.value)}
                              onFocus={handleFocus}
                              onBlur={handleBlur}
                            />
                          </div>
                          <div>
                            <label style={{ ...styles.label, color: theme.textMuted }}>Price (Rs)</label>
                            <input
                              style={styles.inputNoIcon}
                              type="number"
                              placeholder="0.00"
                              value={variantprice}
                              onChange={(e) => setvariantprice(e.target.value)}
                              onFocus={handleFocus}
                              onBlur={handleBlur}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div style={styles.divider}>
                      <div style={styles.dividerLine} />
                      <span style={styles.dividerText}>Inventory</span>
                    </div>

                    {/* Inventory Section */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        <div style={styles.sectionDot(theme.primaryLight)} />
                        <span style={styles.sectionLabel(theme.primaryLight)}>Inventory Details</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ ...styles.label, color: theme.textMuted }}>Quantity</label>
                          <input
                            style={styles.inputNoIcon}
                            type="number"
                            placeholder="0"
                            value={inventoryquantity}
                            onChange={(e) => setinventoryquantity(e.target.value)}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                          />
                        </div>
                        <div>
                          <label style={{ ...styles.label, color: theme.textMuted }}>Location</label>
                          <input
                            style={styles.inputNoIcon}
                            type="text"
                            placeholder="Warehouse A"
                            value={inventorylocation}
                            onChange={(e) => setinventorylocation(e.target.value)}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => getinventory(e)}
                      style={styles.primaryButton}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = `0 8px 25px 0 rgba(59, 130, 246, 0.4)`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = `0 4px 14px 0 rgba(59, 130, 246, 0.5)`;
                      }}
                    >
                      Add Variant & Inventory
                    </button>
                  </div>
                ) : (
                  /* UPDATE MODE */
                  <div style={styles.card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                      <div style={styles.iconBox(theme.gradientWarning)}>
                        <svg style={{ width: '18px', height: '18px', color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <h2 style={styles.sectionTitle}>Update Variant & Inventory</h2>
                    </div>

                    {/* Select Variant */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={styles.label}>Select Variant to Update</label>
                      <div style={{ position: 'relative' }}>
                        <select
                          onChange={(e) => { if (e.target.value) getproductvariant(e.target.value) }}
                          style={{ ...styles.select, paddingLeft: '16px' }}
                          onFocus={handleFocus}
                          onBlur={handleBlur}
                        >
                          <option value="">Choose a variant...</option>
                          {productvariants.map((v, i) => (
                            <option
                              key={v.variantproductId}
                              value={JSON.stringify({
                                variantName: v.variantName,
                                variantValue: v.variantValue,
                                variantprice: v.variantprice,
                                variantproductId: v.variantproductId,
                                index: i
                              })}
                            >
                              {v.variantName}: {v.variantValue} — Rs {v.variantprice}
                            </option>
                          ))}
                        </select>
                        <div style={styles.selectArrow}>
                          <svg style={{ width: '16px', height: '16px', color: theme.textMuted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Variant Fields */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <div style={styles.sectionDot(theme.warning)} />
                        <span style={styles.sectionLabel(theme.warning)}>Variant Details</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                          <label style={{ ...styles.label, color: theme.textMuted }}>Variant Name</label>
                          <input
                            style={styles.inputNoIcon}
                            type="text"
                            placeholder="Variant name"
                            value={updatevariantName}
                            onChange={(e) => setupdatevariantName(e.target.value)}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <label style={{ ...styles.label, color: theme.textMuted }}>Value</label>
                            <input
                              style={styles.inputNoIcon}
                              type="text"
                              placeholder="Value"
                              value={updatevariantValue}
                              onChange={(e) => setupdatevariantValue(e.target.value)}
                              onFocus={handleFocus}
                              onBlur={handleBlur}
                            />
                          </div>
                          <div>
                            <label style={{ ...styles.label, color: theme.textMuted }}>Price (Rs)</label>
                            <input
                              style={styles.inputNoIcon}
                              type="number"
                              placeholder="0.00"
                              value={updatevariantprice}
                              onChange={(e) => setupdatevariantprice(e.target.value)}
                              onFocus={handleFocus}
                              onBlur={handleBlur}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div style={styles.divider}>
                      <div style={styles.dividerLine} />
                      <span style={styles.dividerText}>Inventory</span>
                    </div>

                    {/* Inventory Fields */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <div style={styles.sectionDot(theme.primaryLight)} />
                        <span style={styles.sectionLabel(theme.primaryLight)}>Inventory Details</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ ...styles.label, color: theme.textMuted }}>Quantity</label>
                          <input
                            style={styles.inputNoIcon}
                            type="number"
                            placeholder="0"
                            value={inventoryquantity}
                            onChange={(e) => setinventoryquantity(e.target.value)}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                          />
                        </div>
                        <div>
                          <label style={{ ...styles.label, color: theme.textMuted }}>Location</label>
                          <input
                            style={styles.inputNoIcon}
                            type="text"
                            placeholder="Location"
                            value={inventorylocation}
                            onChange={(e) => setinventorylocation(e.target.value)}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => updateinventory(e)}
                      style={styles.warningButton}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = `0 8px 25px 0 rgba(245, 158, 11, 0.4)`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = `0 4px 14px 0 rgba(245, 158, 11, 0.5)`;
                      }}
                    >
                      Update Variant & Inventory
                    </button>
                  </div>
                )}

                {/* Submit Button Card */}
                <div style={styles.card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <NavLink to="/dashboard" style={styles.cancelButton}>
                      Cancel
                    </NavLink>

                    <button
                      type="submit"
                      style={styles.submitButton(updateActive)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = updateActive
                          ? `0 8px 25px 0 rgba(245, 158, 11, 0.4)`
                          : `0 8px 25px 0 rgba(59, 130, 246, 0.4)`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = updateActive
                          ? `0 4px 14px 0 rgba(245, 158, 11, 0.5)`
                          : `0 4px 14px 0 rgba(59, 130, 246, 0.5)`;
                      }}
                    >
                      {updateActive ? "Update Product" : "Add Product"}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </form>

        </div>
      </div>
    </div>
  )
}

export default Additems;
