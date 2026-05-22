import { Link, NavLink, useLocation } from "react-router-dom";
import { AppContext } from "./Contextapi";
import { useContext, useState, useEffect, useRef } from "react";

let Navbar = ({ searchQuery, setSearchQuery, sortdata, setismenu, ismenu }) => {
  const contextdata = useContext(AppContext)
  const [token, settoken, count, setcount, user, setuser] = contextdata
  const [searchFocused, setSearchFocused] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef(null)
  const location = useLocation()

  // Detect which page user is on
  const isInventoryPage = location.pathname.toLowerCase().includes('inventory')
  const isVariantPage = location.pathname.toLowerCase().includes('variant')
  const isCustomerPage = location.pathname.toLowerCase().includes('customer')
  const isOrderPage = location.pathname.toLowerCase().includes('order')
  const isCategoryPage = location.pathname.toLowerCase().includes('category')
  const isDiscountPage = location.pathname.toLowerCase().includes('discount')

  // Dynamic placeholder based on current page
  const getSearchPlaceholder = () => {
    if (isInventoryPage) return "Search by name or quantity..."
    if (isVariantPage) return "Search variants..."
    if (isCustomerPage) return "Search customers..."
    if (isOrderPage) return "Search orders..."
    if (isCategoryPage) return "Search categories..."
    if (isDiscountPage) return "Search discounts..."
    return "Search by name..."
  }

  // Dynamic page title for top bar
  const getPageTitle = () => {
    if (isInventoryPage) return "Inventory"
    if (isVariantPage) return "Variants"
    if (isCustomerPage) return "Customers"
    if (isOrderPage) return "Orders"
    if (isCategoryPage) return "Categories"
    if (isDiscountPage) return "Discounts"
    return "Products"
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setismenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function logout() {
    localStorage.removeItem("token")
    localStorage.setItem("user", JSON.stringify("undefined"))
    setcount(count + 1)
  }

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
    borderLight: '#F3F4F6',
    
    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
    gradientDanger: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
    
    // Radius
    radiusMd: '8px',
    radiusLg: '12px',
    radiusFull: '9999px',
  }

  const menuItems = [
    { to: '/dashboard', label: 'Products', icon: (
      <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )},
    { to: '/inventory', label: 'Inventory', icon: (
      <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    )},
    { to: '/variant', label: 'Variants', icon: (
      <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    )},
    { to: '/customer', label: 'Customers', icon: (
      <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )},
    { to: '/discount', label: 'Discounts', icon: (
      <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    )},
    { to: '/category', label: 'Categories', icon: (
      <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )},
    { to: '/order', label: 'Orders', icon: (
      <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    )},
  ]

  const getUserInitial = () => {
    if (user && user !== "undefined" && user !== null && user.length > 1) {
      return user[1].toUpperCase()
    }
    return null
  }

  const userInitial = getUserInitial()

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes menuItemIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes searchGlow {
          0%, 100% { box-shadow: 0 0 0 0 #3B82F600; }
          50% { box-shadow: 0 0 20px 2px #3B82F615; }
        }
        .nav-menu-item {
          animation: menuItemIn 0.3s ease forwards;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-menu-item:hover {
          background: #3B82F615 !important;
          transform: translateX(4px);
        }
        .nav-menu-item:hover .nav-menu-icon {
          color: #3B82F6 !important;
          transform: scale(1.15);
        }
        .nav-menu-item:hover .nav-menu-label {
          color: #3B82F6 !important;
        }
        .nav-menu-icon { transition: all 0.25s ease; }
        .nav-menu-label { transition: color 0.25s ease; }
        .nav-active-link .nav-menu-icon {
          background: #3B82F620 !important;
          color: #3B82F6 !important;
        }
        .nav-active-link .nav-menu-label {
          color: #3B82F6 !important;
          font-weight: 700 !important;
        }
        .search-input:focus {
          animation: searchGlow 2s ease-in-out infinite;
        }
        .user-avatar {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .user-avatar:hover {
          transform: scale(1.12) rotate(-5deg);
          box-shadow: 0 4px 16px #3B82F640;
        }
        .cart-btn {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .cart-btn:hover {
          transform: translateY(-2px) scale(1.08);
          box-shadow: 0 6px 20px #3B82F635;
        }
        .menu-toggle {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .menu-toggle:hover {
          transform: scale(1.1);
          background: #3B82F615;
        }
        .logo-text { transition: all 0.3s ease; }
        .logo-text:hover { transform: scale(1.03); }
        .sort-select { transition: all 0.3s ease; }
        .sort-select:hover { border-color: #3B82F660; }
        .sort-select:focus { border-color: #3B82F6; box-shadow: 0 0 0 3px #3B82F620; }
        .page-indicator { transition: all 0.3s ease; }
      `}</style>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: '68px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        background: scrolled ? '#FFFFFFee' : '#FFFFFF',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: `1.5px solid ${scrolled ? '#E5E7EB60' : '#E5E7EB'}`,
        boxShadow: scrolled
          ? '0 4px 20px rgba(59, 130, 246, 0.12), 0 1px 3px rgba(59, 130, 246, 0.08)'
          : '0 1px 3px rgba(59, 130, 246, 0.08)',
        transition: 'all 0.4s ease',
      }}>

        {/* LEFT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div className="logo-text" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <div style={{
                width: '38px', height: '38px',
                background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 3px 12px rgba(59, 130, 246, 0.35)',
              }}>
                <svg style={{ width: '20px', height: '20px', color: '#FFFFFF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <span style={{ fontSize: '20px', fontWeight: '900', color: '#1E40AF', letterSpacing: '-0.5px' }}>
                  Testing
                </span>
                <span style={{ fontSize: '9px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '2px' }}>
                  Dashboard
                </span>
              </div>
            </div>
          </Link>

          {/* Page Indicator */}
          <div className="page-indicator" style={{
            background: '#3B82F612',
            border: '1.5px solid #3B82F620',
            borderRadius: '9999px',
            padding: '4px 14px',
            fontSize: '11px', fontWeight: '700',
            color: '#3B82F6',
            display: 'flex', alignItems: 'center', gap: '5px',
          }}>
            <div style={{
              width: '6px', height: '6px',
              background: '#3B82F6',
              borderRadius: '50%',
            }} />
            {getPageTitle()}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
            <div style={{
              position: 'absolute', top: '50%', left: '14px',
              transform: 'translateY(-50%)', pointerEvents: 'none',
              color: searchFocused ? '#3B82F6' : '#9CA3AF',
              transition: 'all 0.3s ease',
            }}>
              <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              className="search-input"
              type="search"
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder={getSearchPlaceholder()}
              style={{
                width: '100%', height: '42px',
                background: searchFocused ? '#EFF6FF' : '#F9FAFB',
                border: `2px solid ${searchFocused ? '#3B82F6' : '#E5E7EB'}`,
                borderRadius: '9999px',
                padding: '0 16px 0 44px',
                fontSize: '13px', fontWeight: '600',
                color: '#111827', outline: 'none',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxSizing: 'border-box',
              }}
            />
            {!searchQuery && !searchFocused && (
              <div style={{
                position: 'absolute', top: '50%', right: '14px',
                transform: 'translateY(-50%)',
                background: 'rgba(229, 231, 235, 0.5)', borderRadius: '6px',
                padding: '2px 8px', fontSize: '11px', fontWeight: '600',
                color: '#9CA3AF', pointerEvents: 'none',
              }}>
                ⌘K
              </div>
            )}
          </div>

          {/* Sort - only on product page */}
          {!isInventoryPage && !isVariantPage && !isCustomerPage && !isOrderPage && !isCategoryPage && !isDiscountPage && sortdata && (
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                position: 'absolute', top: '50%', left: '12px',
                transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9CA3AF',
              }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              </div>
              <select
                className="sort-select"
                onChange={(e) => sortdata(e.target.value)}
                style={{
                  height: '42px', background: '#F9FAFB',
                  border: '2px solid #E5E7EB',
                  borderRadius: '9999px',
                  padding: '0 36px 0 36px',
                  fontSize: '13px', fontWeight: '600',
                  color: '#111827', outline: 'none',
                  cursor: 'pointer', appearance: 'none',
                  minWidth: '160px', boxSizing: 'border-box',
                }}
              >
                <option value="">Sort by</option>
                <option value="min-max">Price: Low → High</option>
                <option value="max-min">Price: High → Low</option>
              </select>
              <div style={{
                position: 'absolute', top: '50%', right: '14px',
                transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9CA3AF',
              }}>
                <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <div className="user-avatar" style={{
              width: '40px', height: '40px', borderRadius: '9999px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              ...(userInitial ? {
                background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)', color: '#FFFFFF',
                fontSize: '16px', fontWeight: '800',
                boxShadow: '0 3px 12px rgba(59, 130, 246, 0.3)',
                border: '2px solid #F3F4F6',
              } : {
                background: '#3B82F612', color: '#9CA3AF',
                border: '2px solid #E5E7EB',
              }),
            }}>
              {userInitial ? userInitial : (
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
          </Link>

          <Link to="/addcart" style={{ textDecoration: 'none' }}>
            <div className="cart-btn" style={{
              width: '42px', height: '42px', background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 3px 12px rgba(59, 130, 246, 0.3)',
            }}>
              <svg style={{ width: '22px', height: '22px', color: '#FFFFFF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>
          </Link>

          <div style={{ width: '1.5px', height: '28px', background: 'linear-gradient(180deg, transparent, #E5E7EB, transparent)', margin: '0 4px' }} />

          <div ref={menuRef} style={{ position: 'relative' }}>
            <button className="menu-toggle" onClick={() => setismenu(!ismenu)} style={{
              width: '42px', height: '42px',
              background: ismenu ? '#3B82F615' : 'transparent',
              border: `2px solid ${ismenu ? '#3B82F640' : '#E5E7EB'}`,
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: ismenu ? '#3B82F6' : '#374151',
            }}>
              {ismenu ? (
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            {ismenu && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                width: '230px', background: '#FFFFFF',
                border: '1.5px solid #E5E7EB',
                borderRadius: '12px',
                boxShadow: '0 12px 40px rgba(59, 130, 246, 0.15), 0 4px 12px rgba(0,0,0,0.08)',
                overflow: 'hidden',
                animation: 'slideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                zIndex: 100,
              }}>
                <div style={{ padding: '14px 16px 10px 16px', borderBottom: '#E5E7EB50' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                    Navigation
                  </div>
                </div>

                <div style={{ padding: '6px' }}>
                  {menuItems.map((item, idx) => {
                    const isActive = location.pathname === item.to
                    return (
                      <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }} onClick={() => setismenu(false)}>
                        <div
                          className={`nav-menu-item ${isActive ? 'nav-active-link' : ''}`}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '10px 12px', borderRadius: '8px',
                            cursor: 'pointer',
                            animationDelay: `${idx * 0.05}s`, opacity: 0,
                            background: isActive ? '#3B82F610' : 'transparent',
                          }}
                        >
                          <div className="nav-menu-icon" style={{
                            width: '32px', height: '32px',
                            background: isActive ? '#3B82F620' : '#3B82F610',
                            borderRadius: '10px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: isActive ? '#3B82F6' : '#9CA3AF', flexShrink: 0,
                          }}>
                            {item.icon}
                          </div>
                          <span className="nav-menu-label" style={{
                            fontSize: '14px',
                            fontWeight: isActive ? '700' : '600',
                            color: isActive ? '#3B82F6' : '#111827',
                          }}>
                            {item.label}
                          </span>
                          {isActive && (
                            <div style={{
                              width: '6px', height: '6px',
                              background: '#3B82F6',
                              borderRadius: '50%', marginLeft: 'auto',
                            }} />
                          )}
                          {!isActive && (
                            <svg style={{ width: '14px', height: '14px', color: '#9CA3AF', marginLeft: 'auto', opacity: 0.5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>

                <div style={{ borderTop: '#E5E7EB50', padding: '6px' }}>
                  <button onClick={logout} className="nav-menu-item" style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 12px', borderRadius: '8px',
                    cursor: 'pointer', border: 'none', background: 'transparent',
                    animationDelay: `${menuItems.length * 0.05}s`, opacity: 0,
                  }}>
                    <div className="nav-menu-icon" style={{
                      width: '32px', height: '32px', background: '#EF444412',
                      borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#EF4444', flexShrink: 0,
                    }}>
                      <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    <span className="nav-menu-label" style={{ fontSize: '14px', fontWeight: '600', color: '#EF4444' }}>
                      Logout
                    </span>
                  </button>
                </div>

                <div style={{ height: '3px', background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)' }} />
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;