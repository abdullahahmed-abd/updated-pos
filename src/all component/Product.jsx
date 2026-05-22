// Product.jsx  (aap isko Main.jsx ki jagah bhi use kar sakte ho)
// UI same rakha hai — sirf backend calls + refresh logic fix kiya hai
import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import Navbar from './Navbar.jsx';
import moment from 'moment';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from './Contextapi.jsx';

const Main = () => {
  const [data, setData] = useState([]);
  const [createdAt, setCreatedAt] = useState("");
  const [updateID, setUpdateID] = useState(null);
  const [searchvalue, setsearchvalue] = useState("");
  const [variantdata, setvariantdata] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [sort, setsort] = useState("");
  const [inventorydata, setInventorydata] = useState([]);
  const [ismenu, setismenu] = useState(false);
  const [viewMode, setViewMode] = useState('row');

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

  const navigate = useNavigate();

  // ===================== API (NEW BACKEND) =====================
  const api = axios.create({
    baseURL: BaseUrl || "",
    headers: { 'ngrok-skip-browser-warning': 'true' },
  });

  const productRequest = (payload) => api.post('/product', payload);
  const categoryRequest = (payload) => api.post('/category', payload);
  const variantRequest = (payload) => api.post('/variant', payload);
  const inventoryRequest = (payload) => api.post('/inventory', payload);

  // ===================== ID helpers =====================
  const getProductId = (item) => {
    if (!item) return null;
    return item.productId ?? item.id ?? null;
  };
  const getVariantId = (item) => {
    if (!item) return null;
    return item.variantId ?? item.productVariantId ?? item.id ?? null;
  };
  const getCategoryId = (item) => {
    if (!item) return null;
    return item.categoryId ?? item.id ?? null;
  };
  const getNestedProductId = (item) => {
    if (!item) return null;
    return item.productId ?? item.product?.productId ?? item.product?.id ?? null;
  };
  const getInventoryVariantId = (inv) => {
    if (!inv) return null;
    return inv.variantId ?? inv.productVariant?.id ?? inv.productVariant?.productVariantId ?? null;
  };

  // ===================== Theme (UI SAME) =====================
  const theme = {
    // Primary: Modern Blue
    primary: '#3B82F6',
    primaryLight: '#60A5FA',
    primaryDark: '#1E40AF',

    // Secondary: Purple
    secondary: '#8B5CF6',
    secondaryLight: '#A78BFA',

    // Accent: Teal
    accent: '#14B8A6',
    accentLight: '#2DD4BF',

    // Danger: Rose
    danger: '#EF4444',
    dangerLight: '#F87171',

    // Warning: Amber
    warning: '#F59E0B',

    // Success: Emerald
    success: '#10B981',
    successLight: '#34D399',

    // Background
    pageBg: '#F9FAFB',
    cardBg: '#FFFFFF',

    // Text
    textPrimary: '#111827',
    textSecondary: '#374151',
    textMuted: '#9CA3AF',
    textOnPrimary: '#FFFFFF',

    // Border
    border: '#E5E7EB',
    borderDark: '#D1D5DB',

    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
    gradientSecondary: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
    gradientSuccess: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    gradientDanger: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',

    // Shadows
    shadowSm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    shadowXl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',

    // Radius
    radiusSm: '6px',
    radiusMd: '8px',
    radiusLg: '12px',
    radiusXl: '16px',
    radius2xl: '20px',
    radiusFull: '9999px',
  };

  // ===================== READ_ALL (ROBUST PARSE) =====================
  const getData = () => {
    if (!BaseUrl) return;

    productRequest({ requestType: "READ_ALL" })
      .then((res) => {
        // backend kabhi direct array bhejta hai, kabhi {products:[]}
        const list =
          Array.isArray(res.data) ? res.data :
          Array.isArray(res.data?.products) ? res.data.products :
          Array.isArray(res.data?.data?.products) ? res.data.data.products :
          [];

        setData(list);
      })
      .catch((err) => console.log("Product fetch error:", err));
  };

  const getcategorydata = () => {
    if (!BaseUrl) return;

    categoryRequest({ requestType: "READ_ALL" })
      .then((res) => {
        const list =
          Array.isArray(res.data) ? res.data :
          Array.isArray(res.data?.categories) ? res.data.categories :
          Array.isArray(res.data?.data?.categories) ? res.data.data.categories :
          [];
        setcategorydata(list);
      })
      .catch((err) => console.log("Category fetch error:", err));
  };

  const getvariantdata = () => {
    if (!BaseUrl) return;

    variantRequest({ requestType: "READ_ALL" })
      .then((res) => {
        const list =
          Array.isArray(res.data) ? res.data :
          Array.isArray(res.data?.variants) ? res.data.variants :
          Array.isArray(res.data?.data?.variants) ? res.data.data.variants :
          [];
        setvariantdata(list);
      })
      .catch((err) => console.log("Variant fetch error:", err));
  };

  const getinventorydata = () => {
    if (!BaseUrl) return;

    inventoryRequest({ requestType: "READ_ALL" })
      .then((res) => {
        const list =
          Array.isArray(res.data) ? res.data :
          Array.isArray(res.data?.inventories) ? res.data.inventories :
          Array.isArray(res.data?.data?.inventories) ? res.data.data.inventories :
          [];
        setInventorydata(list);
      })
      .catch((err) => console.log("Inventory fetch error:", err));
  };

  // IMPORTANT FIX: BaseUrl late aata hai + count refresh trigger
  useEffect(() => {
    if (!BaseUrl) return;
    getData();
    getcategorydata();
    getvariantdata();
    getinventorydata();
    // eslint-disable-next-line
  }, [BaseUrl, count]);

  const getVariantCount = (prodId) => {
    const pid = String(prodId);
    return variantdata.filter((v) => String(getNestedProductId(v)) === pid).length;
  };

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

  // ===================== DELETE (NEW BACKEND) =====================
  const del = (product) => {
    const pid = getProductId(product);
    if (!pid) { window.alert("Product ID not found!"); return; }

    if (window.confirm("Are you sure you want to delete this product?")) {
      productRequest({ requestType: "DELETE", productId: Number(pid) })
        .then(() => {
          // re-fetch
          getData();
          getvariantdata();
          getinventorydata();
        })
        .catch(() => window.alert("Error deleting product"));
    }
  };

  // ===================== EDIT (prepares Additems update screen) =====================
  const edit = (v) => {
    const currentProductId = getProductId(v);
    if (!currentProductId) { window.alert("Product ID not found!"); return; }

    // variants for this product
    const relatedVariants = variantdata
      .filter((variant) => String(getNestedProductId(variant)) === String(currentProductId))
      .map((variant) => {
        const vid = getVariantId(variant);

        // try to attach inventory data as well (helps update screen)
        const inv = inventorydata.find((inv) => String(getInventoryVariantId(inv)) === String(vid));

        return {
          variantName: variant.variantName,
          variantValue: variant.variantValue,
          variantprice: variant.price,
          variantproductId: vid,
          inventorylocation: inv?.location ?? "",
          inventoryquantity: inv?.quantity ?? "",
          inventoryId: inv?.inventoryId ?? null,
        };
      });

    setproductvariants(relatedVariants);

    setName(v.productName);
    setSku(v.sku);

    // product.category may be object with id/name
    setCategoryId(getCategoryId(v.category));

    setDescription(v.description);

    setUpdateActive(true);
    setproductId(currentProductId);

    navigate('/Additems');
  };

  const filterdata = data.filter((product) =>
    product.productName?.toLowerCase().includes(searchvalue.toLowerCase())
  );

  let sortproduct = [...filterdata].sort((min, max) => {
    if (sort === "min-max") return (min.price || 0) - (max.price || 0);
    else if (sort === "max-min") return (max.price || 0) - (min.price || 0);
    return 0;
  });

  const getCategoryName = (product) => {
    // if product has category object
    if (product?.category?.name) return product.category.name;

    // sometimes id field is "id" not "categoryId"
    const catId = getCategoryId(product?.category);
    if (catId) {
      const found = categorydata.find(c => String(getCategoryId(c)) === String(catId));
      if (found) return found.name || found.categoryName || "Unknown";
    }
    return "Unknown";
  };

  const safeId = (product) => getProductId(product) || Math.random();

  return (
    <div style={{ minHeight: '100vh', background: theme.pageBg, position: 'relative', overflow: 'hidden' }}>

      <style>{`
        @keyframes blob1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          25% { transform: translate(60px, -80px) scale(1.2); opacity: 0.45; }
          50% { transform: translate(-40px, 40px) scale(0.9); opacity: 0.25; }
          75% { transform: translate(80px, 50px) scale(1.1); opacity: 0.4; }
        }
        @keyframes blob2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.25; }
          25% { transform: translate(-60px, 50px) scale(1.2); opacity: 0.4; }
          50% { transform: translate(50px, -60px) scale(0.85); opacity: 0.2; }
          75% { transform: translate(-30px, -40px) scale(1.15); opacity: 0.35; }
        }
        @keyframes blob3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.2; }
          33% { transform: translate(60px, 60px) scale(1.25); opacity: 0.35; }
          66% { transform: translate(-50px, -40px) scale(0.8); opacity: 0.15; }
        }
        @keyframes blob4 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.15; }
          50% { transform: translate(-40px, 30px) scale(1.3); opacity: 0.3; }
        }
        @keyframes blob5 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.2; }
          33% { transform: translate(30px, -40px) scale(1.15) rotate(120deg); opacity: 0.35; }
          66% { transform: translate(-20px, 50px) scale(0.9) rotate(240deg); opacity: 0.15; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes slideInRow {
          0% { opacity: 0; transform: translateX(-50px); }
          60% { opacity: 1; transform: translateX(8px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes cardDrop {
          0% { opacity: 0; transform: translateY(60px) scale(0.88); }
          60% { opacity: 1; transform: translateY(-8px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        /* ===== ROW CARD ===== */
        .row-card {
          animation: slideInRow 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .row-card:hover {
          transform: translateX(8px) scale(1.015);
          box-shadow: 0 8px 30px rgba(59, 130, 246, 0.22), 0 0 0 2px #60A5FA;
          border-color: #60A5FA;
          z-index: 20;
          background: #FFFFFFee;
        }
        .row-card:hover .row-avatar {
          transform: scale(1.15) rotate(-8deg);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
        }
        .row-card:hover .row-name { color: #3B82F6; }
        .row-card:hover .row-left-accent {
          width: 6px;
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
        }
        .row-card:hover .row-stat {
          transform: translateY(-2px);
          box-shadow: 0 3px 10px rgba(59, 130, 246, 0.15);
        }
        .row-card:hover .row-edit {
          transform: translateY(-2px) scale(1.06);
          box-shadow: 0 6px 18px rgba(59, 130, 246, 0.45);
        }
        .row-card:hover .row-delete {
          transform: translateY(-2px) scale(1.06);
          box-shadow: 0 6px 18px rgba(239, 68, 68, 0.45);
        }
        .row-card:hover .row-view {
          transform: translateY(-2px) scale(1.06);
          box-shadow: 0 6px 18px rgba(139, 92, 246, 0.35);
        }
        .row-card:hover .row-desc { color: #111827; }
        .row-card:hover .row-shine { transform: translateX(110%); opacity: 0.1; }

        .row-avatar { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .row-name { transition: color 0.3s ease; }
        .row-left-accent { transition: all 0.4s ease; }
        .row-stat { transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .row-desc { transition: color 0.3s ease; }
        .row-shine { transition: all 0.8s ease; }

        .row-edit { transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .row-edit:hover { transform: translateY(-3px) scale(1.12) !important; box-shadow: 0 8px 24px rgba(59, 130, 246, 0.55) !important; }
        .row-edit:active { transform: translateY(0) scale(1.02) !important; }
        .row-delete { transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .row-delete:hover { transform: translateY(-3px) scale(1.12) !important; box-shadow: 0 8px 24px rgba(239, 68, 68, 0.55) !important; }
        .row-delete:active { transform: translateY(0) scale(1.02) !important; }
        .row-view { transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .row-view:hover { transform: translateY(-3px) scale(1.12) !important; box-shadow: 0 8px 24px rgba(139, 92, 246, 0.45) !important; }

        /* ===== GRID CARD ===== */
        .grid-card {
          animation: cardDrop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transition: all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .grid-card:hover {
          transform: translateY(-14px) scale(1.04);
          box-shadow: 0 30px 60px rgba(59, 130, 246, 0.28), 0 0 0 2.5px #60A5FA;
          border-color: #60A5FA;
          z-index: 50;
          background: #FFFFFFee;
        }
        .grid-card:hover .grid-header-bg { transform: scale(1.1); }
        .grid-card:hover .grid-title { color: #1E40AF; }
        .grid-card:hover .grid-shine { transform: translateX(380px) skewX(-15deg); opacity: 0.25; }
        .grid-card:hover .grid-stat { transform: translateY(-4px); box-shadow: 0 5px 15px rgba(59, 130, 246, 0.2); }
        .grid-card:hover .grid-desc { border-color: rgba(59, 130, 246, 0.35); background: rgba(59, 130, 246, 0.1); }
        .grid-card:hover .grid-edit { transform: translateY(-3px) scale(1.06); box-shadow: 0 8px 22px rgba(59, 130, 246, 0.48); }
        .grid-card:hover .grid-delete { transform: translateY(-3px) scale(1.06); box-shadow: 0 8px 22px rgba(239, 68, 68, 0.48); }
        .grid-card:hover .grid-badge { transform: scale(1.12); }
        .grid-card:hover .grid-bottom-line { width: 100%; opacity: 1; }

        .grid-avatar { transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); overflow: visible !important; }
        .grid-avatar-inner { transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); line-height: 1 !important; }

        .grid-card:hover .grid-avatar {
          width: 30px !important;
          height: 30px !important;
          bottom: 4px !important;
          left: 18px !important;
          transform: scale(1.5) rotate(-17deg);
          box-shadow: 0 16px 50px rgba(59, 130, 246, 0.75);
          border-width: 2px;
          border-color: #60A5FA;
        }
        .grid-card:hover .grid-avatar-inner {
          font-size: 20px !important;
          font-weight: 600 !important;
          transform: rotate(17deg);
          letter-spacing: -1px;
        }

        .grid-header-bg { transition: all 0.5s ease; }
        .grid-title { transition: all 0.3s ease; }
        .grid-shine { transition: all 0.8s ease; }
        .grid-stat { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .grid-desc { transition: all 0.4s ease; }
        .grid-badge { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .grid-bottom-line { transition: all 0.5s ease; }
        .grid-edit { transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .grid-edit:hover { transform: translateY(-5px) scale(1.12) !important; box-shadow: 0 10px 30px rgba(59, 130, 246, 0.55) !important; }
        .grid-delete { transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .grid-delete:hover { transform: translateY(-5px) scale(1.12) !important; box-shadow: 0 10px 30px rgba(239, 68, 68, 0.55) !important; }

        .view-btn { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .view-btn:hover { transform: scale(1.12); }
        .view-btn-active {
          background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%) !important;
          color: white !important;
          box-shadow: 0 3px 14px rgba(59, 130, 246, 0.45);
        }

        .add-fab {
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          animation: float 3s ease-in-out infinite;
        }
        .add-fab:hover {
          transform: translateY(-8px) scale(1.14) !important;
          box-shadow: 0 16px 50px rgba(59, 130, 246, 0.55) !important;
          animation-play-state: paused;
        }

        .total-badge { animation: float 4s ease-in-out infinite; }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #F9FAFB; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.6); }
      `}</style>

      {/* ===== ANIMATED BLUR BACKGROUND ===== */}
      <div style={{
        position: 'fixed', inset: 0, overflow: 'hidden',
        pointerEvents: 'none', zIndex: 0,
      }}>
        <div style={{
          position: 'absolute', top: '-120px', right: '-120px',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, #1E40AF40, #3B82F615, transparent 65%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          animation: 'blob1 10s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-150px', left: '-150px',
          width: '550px', height: '550px',
          background: 'radial-gradient(circle, #60A5FA35, #10B98112, transparent 65%)',
          borderRadius: '50%',
          filter: 'blur(90px)',
          animation: 'blob2 12s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '35%', left: '45%',
          width: '450px', height: '450px',
          marginLeft: '-225px', marginTop: '-225px',
          background: 'radial-gradient(circle, #8B5CF625, #60A5FA08, transparent 65%)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          animation: 'blob3 14s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '10%', left: '8%',
          width: '300px', height: '300px',
          background: 'radial-gradient(circle, #34D39928, transparent 65%)',
          borderRadius: '50%',
          filter: 'blur(70px)',
          animation: 'blob4 16s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '5%', right: '10%',
          width: '350px', height: '350px',
          background: 'radial-gradient(circle, #1E40AF22, transparent 65%)',
          borderRadius: '50%',
          filter: 'blur(75px)',
          animation: 'blob5 13s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '60%', left: '15%',
          width: '200px', height: '200px',
          background: 'radial-gradient(circle, #3B82F618, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'blob1 18s ease-in-out infinite reverse',
        }} />
        <div style={{
          position: 'absolute', top: '5%', left: '50%',
          width: '280px', height: '280px',
          marginLeft: '-140px',
          background: 'radial-gradient(circle, #A78BFA15, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(65px)',
          animation: 'blob2 15s ease-in-out infinite reverse',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 30% 20%, #3B82F606 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, #1E40AF05 0%, transparent 50%)',
        }} />
      </div>

      <Navbar
        searchQuery={searchvalue}
        setismenu={setismenu}
        ismenu={ismenu}
        setSearchQuery={setsearchvalue}
        sortdata={setsort}
      />

      {/* ===== TOP BAR - Blurred Glass ===== */}
      <div style={{
        position: 'fixed', top: '70px', left: 0, right: 0, zIndex: 30,
        padding: '14px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#F9FAFBaa',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: '1px solid #E5E7EB35',
        boxShadow: '0 4px 20px #3B82F608',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="total-badge" style={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)', color: '#FFFFFF',
            borderRadius: '9999px', padding: '7px 20px',
            fontSize: '13px', fontWeight: '700',
            boxShadow: '0 4px 14px #3B82F640',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            {sortproduct.length} Products
          </div>
          {searchvalue && (
            <div style={{
              background: '#F59E0B15', color: '#F59E0B',
              borderRadius: '9999px', padding: '6px 16px',
              fontSize: '12px', fontWeight: '600', border: '1px solid #F59E0B25',
              backdropFilter: 'blur(10px)',
            }}>
              🔍 "{searchvalue}"
            </div>
          )}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          background: '#FFFFFF80',
          backdropFilter: 'blur(12px)',
          borderRadius: '9999px',
          padding: '4px', border: '1.5px solid #E5E7EB60',
        }}>
          <button
            className={`view-btn ${viewMode === 'row' ? 'view-btn-active' : ''}`}
            onClick={() => setViewMode('row')}
            style={{
              width: '38px', height: '38px', borderRadius: '9999px',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: viewMode === 'row' ? '' : 'transparent',
              color: viewMode === 'row' ? '#FFFFFF' : '#9CA3AF',
            }}
          >
            <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            className={`view-btn ${viewMode === 'grid' ? 'view-btn-active' : ''}`}
            onClick={() => setViewMode('grid')}
            style={{
              width: '38px', height: '38px', borderRadius: '9999px',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: viewMode === 'grid' ? '' : 'transparent',
              color: viewMode === 'grid' ? '#FFFFFF' : '#9CA3AF',
            }}
          >
            <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ===== CONTENT AREA ===== */}
      <div onClick={() => { setismenu(false) }} style={{
        width: '100%',
        padding: '165px 28px 100px 28px',
        minHeight: '100vh', position: 'relative', zIndex: 10,
        ...(viewMode === 'grid' ? {
          display: 'flex', flexWrap: 'wrap', gap: '24px',
          justifyContent: 'center', alignContent: 'flex-start',
        } : {
          display: 'flex', flexDirection: 'column', gap: '14px',
          maxWidth: '1100px', margin: '0 auto',
        }),
      }}>

        {sortproduct.length > 0 ? (
          sortproduct.map((v, i) => {
            const currentId = safeId(v);
            const variantCount = getVariantCount(currentId);
            const initial = getInitial(v.productName);
            const catName = getCategoryName(v);

            if (viewMode === 'row') {
              return (
                <div
                  key={currentId}
                  className="row-card"
                  style={{
                    width: '100%',
                    background: '#FFFFFFdd',
                    border: '2px solid #E5E7EB80',
                    borderRadius: '12px',
                    overflow: 'hidden', position: 'relative', cursor: 'pointer',
                    boxShadow: '0 2px 12px #3B82F608',
                    display: 'flex', alignItems: 'center',
                    animationDelay: `${i * 0.06}s`, opacity: 0,
                  }}
                >
                  <div className="row-left-accent" style={{
                    width: '4px', alignSelf: 'stretch',
                    background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)', flexShrink: 0,
                  }} />

                  <div className="row-shine" style={{
                    position: 'absolute', top: 0, left: 0,
                    width: '100%', height: '100%',
                    background: 'linear-gradient(90deg, transparent 0%, #FFFFFF 50%, transparent 100%)',
                    transform: 'translateX(-110%)', opacity: 0,
                    pointerEvents: 'none', zIndex: 1,
                  }} />

                  <div style={{ padding: '14px 0 14px 16px', flexShrink: 0 }}>
                    <div className="row-avatar" style={{
                      width: '48px', height: '48px',
                      background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)', borderRadius: '14px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '20px', fontWeight: '800', color: '#FFFFFF',
                      boxShadow: '0 4px 14px #3B82F640',
                    }}>
                      {initial}
                    </div>
                  </div>

                  <NavLink to={`/pr/${currentId}`} style={{
                    textDecoration: 'none', color: 'inherit',
                    flex: 1, display: 'flex', alignItems: 'center',
                    padding: '14px 16px', gap: '20px',
                    minWidth: 0, position: 'relative', zIndex: 2,
                  }}>
                    <div style={{ minWidth: '180px', maxWidth: '250px' }}>
                      <div className="row-name" style={{
                        fontSize: '15px', fontWeight: '700', color: '#111827',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {v.productName}
                      </div>
                      <div style={{
                        fontSize: '11px', color: '#9CA3AF', fontWeight: '500',
                        display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px',
                      }}>
                        <svg style={{ width: '11px', height: '11px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {v.sku}
                      </div>
                    </div>

                    <div style={{
                      background: '#D1FAE5', color: '#065F46',
                      borderRadius: '9999px', padding: '5px 14px',
                      fontSize: '11px', fontWeight: '700',
                      border: '1px solid #3B82F620', whiteSpace: 'nowrap',
                      display: 'flex', alignItems: 'center', gap: '5px',
                      backdropFilter: 'blur(6px)',
                    }}>
                      <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {catName}
                    </div>

                    <div className="row-stat" style={{
                      background: '#3B82F60a',
                      border: '1.5px solid #3B82F615',
                      borderRadius: '8px',
                      padding: '6px 14px', textAlign: 'center', minWidth: '70px',
                      backdropFilter: 'blur(6px)',
                    }}>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: '#3B82F6', lineHeight: 1 }}>
                        {variantCount}
                      </div>
                      <div style={{
                        fontSize: '9px', fontWeight: '600', color: '#9CA3AF',
                        textTransform: 'uppercase', letterSpacing: '0.8px',
                      }}>
                        Variants
                      </div>
                    </div>

                    <div className="row-desc" style={{
                      flex: 1, fontSize: '12px', fontWeight: '500',
                      color: '#9CA3AF', lineHeight: '1.4',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      minWidth: 0,
                    }}>
                      {v.description || 'No description'}
                    </div>
                  </NavLink>

                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '14px 16px 14px 0',
                    flexShrink: 0, position: 'relative', zIndex: 3,
                  }}>
                    <NavLink to={`/pr/${currentId}`} className="row-view" style={{
                      width: '36px', height: '36px',
                      background: '#8B5CF618', border: '1.5px solid #8B5CF625',
                      borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', textDecoration: 'none',
                    }}>
                      <svg style={{ width: '16px', height: '16px', color: '#8B5CF6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </NavLink>

                    <button className="row-edit" onClick={() => edit(v)} style={{
                      width: '36px', height: '36px',
                      background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)', border: 'none', borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', boxShadow: '0 3px 10px #3B82F635',
                    }}>
                      <svg style={{ width: '15px', height: '15px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <button className="row-delete" onClick={() => del(v)} style={{
                      width: '36px', height: '36px',
                      background: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)', border: 'none', borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', boxShadow: '0 3px 10px #EF444435',
                    }}>
                      <svg style={{ width: '15px', height: '15px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            } else {
              // ===== GRID VIEW (same as your UI) =====
              return (
                <div
                  key={currentId}
                  className="grid-card"
                  style={{
                    width: '310px',
                    background: '#FFFFFFdd',
                    border: '2px solid #E5E7EB80',
                    borderRadius: '16px',
                    overflow: 'hidden', position: 'relative', cursor: 'pointer',
                    boxShadow: '0 4px 18px #3B82F60a',
                    animationDelay: `${i * 0.08}s`, opacity: 0,
                  }}
                >
                  <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <div className="grid-header-bg" style={{
                      height: '80px', background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)', position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.06) 0%, transparent 40%)',
                      }} />
                      <div className="grid-shine" style={{
                        position: 'absolute', top: 0, left: '-100px',
                        width: '60px', height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        transform: 'translateX(-100px) skewX(-15deg)',
                        opacity: 0, pointerEvents: 'none',
                      }} />
                      <div style={{
                        position: 'absolute', top: '10px', right: '12px',
                        background: 'rgba(255,255,255,0.22)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '9999px', padding: '4px 14px',
                        fontSize: '11px', fontWeight: '700',
                        color: 'rgba(255,255,255,0.95)',
                      }}>
                        #{String(i + 1).padStart(2, '0')}
                      </div>
                      <div className="grid-badge" style={{
                        position: 'absolute', top: '10px', left: '12px',
                        background: 'rgba(255,255,255,0.22)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '9999px', padding: '4px 12px',
                        fontSize: '10px', fontWeight: '600',
                        color: 'rgba(255,255,255,0.95)',
                        display: 'flex', alignItems: 'center', gap: '4px',
                      }}>
                        <svg style={{ width: '11px', height: '11px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {catName}
                      </div>
                    </div>

                    <div className="grid-avatar" style={{
                      position: 'absolute', bottom: '-24px', left: '20px',
                      width: '48px', height: '48px',
                      background: '#FFFFFF', borderRadius: '14px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '3px solid #FFFFFF',
                      boxShadow: '0 5px 18px #3B82F640', zIndex: 5,
                      overflow: 'visible',
                    }}>
                      <div className="grid-avatar-inner" style={{
                        width: '100%', height: '100%',
                        background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)', borderRadius: '11px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px', fontWeight: '800', color: '#FFFFFF',
                        lineHeight: 1,
                      }}>
                        {initial}
                      </div>
                    </div>
                  </div>

                  <NavLink to={`/pr/${currentId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ padding: '32px 20px 14px 20px' }}>
                      <h3 className="grid-title" style={{
                        fontSize: '16px', fontWeight: '800',
                        color: '#111827', margin: '0 0 4px 0',
                      }}>
                        {v.productName}
                      </h3>
                      <div style={{
                        fontSize: '11px', color: '#9CA3AF', fontWeight: '500',
                        display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px',
                      }}>
                        <svg style={{ width: '11px', height: '11px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        SKU: {v.sku}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                        <div className="grid-stat" style={{
                          background: '#3B82F60a', border: '1.5px solid #3B82F615',
                          borderRadius: '8px', padding: '8px', textAlign: 'center',
                          backdropFilter: 'blur(6px)',
                        }}>
                          <div style={{ fontSize: '18px', fontWeight: '800', color: '#3B82F6', lineHeight: 1 }}>
                            {variantCount}
                          </div>
                          <div style={{ fontSize: '9px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                            Variants
                          </div>
                        </div>
                        <div className="grid-stat" style={{
                          background: '#F59E0B0a', border: '1.5px solid #F59E0B15',
                          borderRadius: '8px', padding: '8px', textAlign: 'center',
                          backdropFilter: 'blur(6px)',
                        }}>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#F59E0B', lineHeight: '1.2', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {catName}
                          </div>
                          <div style={{ fontSize: '9px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                            Category
                          </div>
                        </div>
                      </div>

                      <div className="grid-desc" style={{
                        background: '#3B82F605', border: '1.5px solid #3B82F612',
                        borderRadius: '8px', padding: '10px 12px',
                      }}>
                        <div style={{ fontSize: '9px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                          Description
                        </div>
                        <p style={{
                          fontSize: '12px', fontWeight: '500', color: '#374151',
                          margin: 0, lineHeight: '1.4',
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {v.description || 'No description available'}
                        </p>
                      </div>
                    </div>
                  </NavLink>

                  <div style={{ padding: '0 20px 16px 20px', display: 'flex', gap: '8px', position: 'relative', zIndex: 3 }}>
                    <button className="grid-edit" onClick={() => edit(v)} style={{
                      flex: 1, background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)', color: '#FFFFFF',
                      border: 'none', borderRadius: '8px',
                      padding: '10px 0', fontWeight: '600', fontSize: '12px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      boxShadow: '0 3px 12px #3B82F635',
                    }}>
                      <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button className="grid-delete" onClick={() => del(v)} style={{
                      flex: 1, background: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)', color: '#FFFFFF',
                      border: 'none', borderRadius: '8px',
                      padding: '10px 0', fontWeight: '600', fontSize: '12px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      boxShadow: '0 3px 12px #EF444435',
                    }}>
                      <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>

                  <div className="grid-bottom-line" style={{
                    height: '3px', width: '0%', background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                    margin: '0 auto', borderRadius: '3px 3px 0 0', opacity: 0,
                  }} />
                </div>
              );
            }
          })
        ) : (
          <div style={{
            width: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: '80px 20px',
          }}>
            <div style={{
              width: '100px', height: '100px',
              background: '#3B82F612', borderRadius: '28px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '24px', animation: 'float 3s ease-in-out infinite',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 30px #3B82F610',
            }}>
              <svg style={{ width: '48px', height: '48px', color: '#3B82F6', opacity: 0.6 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 style={{ color: '#111827', fontSize: '22px', fontWeight: '800', margin: '0 0 8px 0' }}>
              No Products Yet
            </h3>
            <p style={{ color: '#9CA3AF', fontSize: '14px', margin: '0 0 24px 0' }}>
              Add your first product to get started
            </p>
            <NavLink to={'Additems'} onClick={() => { setUpdateActive(false) }} style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)', color: '#FFFFFF',
              borderRadius: '9999px', padding: '14px 32px',
              fontWeight: '700', fontSize: '14px', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 6px 24px #3B82F645',
            }}>
              <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Product
            </NavLink>
          </div>
        )}
      </div>

      {/* FAB */}
      {sortproduct.length > 0 && (
        <NavLink to={'Additems'} className="add-fab" style={{
          background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)', color: '#FFFFFF',
          border: 'none', borderRadius: '9999px',
          padding: '16px 28px', fontWeight: '700', fontSize: '14px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
          textDecoration: 'none', position: 'fixed', bottom: '28px', right: '28px', zIndex: 100,
          boxShadow: '0 8px 35px #3B82F655',
          backdropFilter: 'blur(10px)',
        }} onClick={() => { setUpdateActive(false) }}>
          <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Product
        </NavLink>
      )}
    </div>
  );
};

export default Main;  