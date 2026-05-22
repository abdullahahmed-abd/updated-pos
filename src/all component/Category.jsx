// Filename: Category.jsx (CORRECTED - ensures sub-categories appear in Parent dropdown)
//
// Why your dropdown was still missing sub-categories?
// In many backends, READ_ALL returns only ROOT categories and nests children under a key
// that may be "categories" OR something else (children/subCategories/etc).
// Also sometimes children don't have parentId set (because nesting is used).
//
// This file fixes it by:
// ✅ Collecting ALL nodes recursively from the response (whatever nesting)
// ✅ Setting an internal _pid (parent id) while collecting (even if backend doesn't send parentId for children)
// ✅ Building a proper tree from the collected list, then flattening with levels for dropdown indentation
// ✅ react-select searchable dropdown
// ✅ Prevent self/descendant selection on edit

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import Select from "react-select";

const Category = () => {
  const [data, setData] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState(""); // "" | number as string

  const [updateID, setUpdateID] = useState(null);
  const [updateActive, setUpdateActive] = useState(false);

  const [ismenu, setismenu] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const Baseurl = "https://rihanna-kindliest-pseudoreligiously.ngrok-free.dev";

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

    radiusSm: "6px",
    radiusMd: "8px",
    radiusLg: "12px",
    radiusXl: "16px",
    radiusFull: "9999px",
  };

  const api = useMemo(() => {
    return axios.create({
      baseURL: Baseurl,
      headers: { "ngrok-skip-browser-warning": "true" },
    });
  }, [Baseurl]);

  const categoryRequest = (payload) => api.post("/category", payload);

  // Try to find categories array from different possible shapes
  const normalizeCategories = (resData) => {
    if (Array.isArray(resData)) return resData;

    if (Array.isArray(resData?.categories)) return resData.categories;
    if (Array.isArray(resData?.data?.categories)) return resData.data.categories;

    if (Array.isArray(resData?.data)) return resData.data; // sometimes backend returns { data: [...] }
    if (Array.isArray(resData?.categoryList)) return resData.categoryList;
    if (Array.isArray(resData?.categoriesList)) return resData.categoriesList;

    return [];
  };

  const getCatId = (c) => c?.categoryId ?? c?.id ?? null;

  // Children key can vary depending on backend
  const getChildren = (c) => {
    const keys = ["categories", "children", "subCategories", "subcategories", "childCategories", "childs"];
    for (const k of keys) {
      if (Array.isArray(c?.[k]) && c[k].length) return c[k];
    }
    return [];
  };

  // parentId from backend might be object OR number OR null
  // also we store internal _pid when collecting from nested tree
  const getParentIdValue = (c) => {
    if (c?._pid != null && c._pid !== "") return c._pid;

    const p = c?.parentId;
    if (p == null) return "";

    if (typeof p === "object") return p?.categoryId ?? p?.id ?? "";
    if (typeof p === "number") return p;
    if (typeof p === "string" && p.trim() !== "" && !Number.isNaN(Number(p))) return Number(p);

    return "";
  };

  // Collect all nodes from nested response (IMPORTANT)
  const collectAllFromResponse = (nodes) => {
    const out = [];
    const seen = new Set();

    const walk = (arr, pid = null) => {
      (arr || []).forEach((node) => {
        const id = getCatId(node);
        if (!id || seen.has(id)) return;
        seen.add(id);

        // store internal parent link even if backend doesn't send it
        const item = { ...node, _pid: pid };
        out.push(item);

        const kids = getChildren(node);
        if (kids?.length) walk(kids, id);
      });
    };

    walk(nodes, null);
    return out;
  };

  // Build tree from flat list using parent links (backend parentId OR internal _pid)
  const buildTree = (flat) => {
    const map = new Map();
    flat.forEach((c) => {
      const id = getCatId(c);
      if (!id) return;
      map.set(Number(id), { ...c, __kids: [] });
    });

    const roots = [];

    map.forEach((node, id) => {
      const pid = getParentIdValue(node);
      const parent = pid !== "" && pid != null ? map.get(Number(pid)) : null;

      if (parent && Number(pid) !== id) {
        parent.__kids.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const flattenTree = (roots) => {
    const out = [];
    const walk = (arr, level = 0) => {
      (arr || []).forEach((n) => {
        out.push({ ...n, _level: level });
        if (n.__kids?.length) walk(n.__kids, level + 1);
      });
    };
    walk(roots, 0);
    return out;
  };

  const getDescendantIds = (all, rootId) => {
    const byParent = new Map();

    all.forEach((c) => {
      const pid = getParentIdValue(c);
      const id = getCatId(c);
      if (!id) return;
      if (pid === "" || pid == null) return;

      const parentNum = Number(pid);
      if (!byParent.has(parentNum)) byParent.set(parentNum, []);
      byParent.get(parentNum).push(Number(id));
    });

    const blocked = new Set();
    const stack = [Number(rootId)];

    while (stack.length) {
      const cur = stack.pop();
      const kids = byParent.get(cur) || [];
      for (const kid of kids) {
        if (!blocked.has(kid)) {
          blocked.add(kid);
          stack.push(kid);
        }
      }
    }
    return blocked;
  };

  const getParentName = (c) => {
    const p = c?.parentId;
    if (p && typeof p === "object") return p?.name || p?.categoryName || "None";

    const pid = getParentIdValue(c);
    if (pid === "" || pid == null) return "None";

    const found = data.find((x) => Number(getCatId(x)) === Number(pid));
    return found?.name || "None";
  };

  const getData = () => {
    categoryRequest({ requestType: "READ_ALL" })
      .then((res) => {
        const raw = normalizeCategories(res.data);

        // 1) collect all categories from nested response
        const all = collectAllFromResponse(raw);

        // If backend returns ONLY roots and does NOT include children in response,
        // then frontend cannot magically show subcategories.
        // But in your case children exist nested; this collector ensures they come.

        // 2) build a tree (for correct order) and flatten with levels
        const roots = buildTree(all);
        const orderedFlat = flattenTree(roots);

        setData(orderedFlat);
      })
      .catch((err) => {
        console.error("Category READ_ALL error:", err);
        setData([]);
      });
  };

  useEffect(() => {
    getData();
    // eslint-disable-next-line
  }, []);

  const del = (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    categoryRequest({ requestType: "DELETE", categoryId: Number(id) })
      .then(() => getData())
      .catch((err) => {
        console.error("Category DELETE error:", err.response?.data || err.message);
        window.alert("Delete failed (check console).");
      });
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setParentId("");
    setUpdateActive(false);
    setUpdateID(null);
    setShowForm(false);
  };

  const sub = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = updateActive
      ? {
          requestType: "UPDATE",
          categoryId: Number(updateID),
          name: name.trim(),
          description: description.trim(),
          parentId: parentId !== "" ? Number(parentId) : null,
        }
      : {
          requestType: "CREATE",
          name: name.trim(),
          description: description.trim(),
          parentId: parentId !== "" ? Number(parentId) : null,
        };

    categoryRequest(payload)
      .then(() => {
        getData();
        resetForm();
      })
      .catch((err) => {
        console.error(updateActive ? "Category UPDATE error:" : "Category CREATE error:", err.response?.data || err.message);
        window.alert("Save failed (check console).");
      });
  };

  const edt = (v) => {
    setName(v.name || "");
    setDescription(v.description || "");
    const id = getCatId(v);
    setUpdateID(id);
    setUpdateActive(true);

    const pid = getParentIdValue(v);
    setParentId(pid ? String(pid) : "");

    setShowForm(true);
  };

  // ====== Parent dropdown (react-select) logic ======
  const blockedParentIds = useMemo(() => {
    if (!updateActive || !updateID) return new Set();
    const desc = getDescendantIds(data, updateID);
    desc.add(Number(updateID)); // block self also
    return desc;
  }, [data, updateActive, updateID]);

  const parentOptions = useMemo(() => {
    return data
      .filter((c) => {
        const id = Number(getCatId(c));
        if (!id) return false;
        return !blockedParentIds.has(id);
      })
      .map((c) => ({
        value: String(getCatId(c)),
        label: `${"— ".repeat(c._level || 0)}${c.name}`,
      }));
  }, [data, blockedParentIds]);

  const selectedParentOption = useMemo(() => {
    if (!parentId) return null;
    return parentOptions.find((o) => o.value === String(parentId)) || null;
  }, [parentId, parentOptions]);

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "44px",
      background: theme.inputBg,
      border: `2px solid ${state.isFocused ? theme.primary : theme.inputBorder}`,
      borderRadius: theme.radiusMd,
      boxShadow: state.isFocused ? "0 0 0 3px rgba(59, 130, 246, 0.2)" : "none",
      fontSize: "13px",
      fontWeight: 800,
      cursor: "pointer",
    }),
    valueContainer: (base) => ({ ...base, padding: "0 10px" }),
    placeholder: (base) => ({ ...base, color: theme.textMuted, fontWeight: 800 }),
    singleValue: (base) => ({ ...base, color: theme.textPrimary, fontWeight: 900 }),
    indicatorSeparator: (base) => ({ ...base, display: "none" }),
    dropdownIndicator: (base) => ({ ...base, color: theme.textMuted }),
    clearIndicator: (base) => ({ ...base, color: theme.textMuted }),
    menu: (base) => ({ ...base, borderRadius: theme.radiusMd, overflow: "hidden" }),
    option: (base, state) => ({
      ...base,
      fontWeight: 800,
      background: state.isSelected
        ? "rgba(59,130,246,0.18)"
        : state.isFocused
        ? "rgba(59,130,246,0.10)"
        : "white",
      color: theme.textPrimary,
      cursor: "pointer",
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
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

        .cat-card {
          animation: slideInRow 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transition: all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
          opacity: 0;
        }
        .cat-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 20px 50px rgba(59, 130, 246, 0.18), 0 0 0 2px rgba(96, 165, 250, 0.5);
          border-color: rgba(96, 165, 250, 0.7);
        }

        .form-panel { animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }

        .cat-input:focus {
          border-color: #3B82F6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          background: #EFF6FF;
        }

        .add-fab {
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          animation: float 3s ease-in-out infinite;
        }
        .add-fab:hover {
          transform: translateY(-6px) scale(1.12) !important;
          box-shadow: 0 14px 40px rgba(59, 130, 246, 0.5) !important;
          animation-play-state: paused;
        }
      `}</style>

      <Navbar ismenu={ismenu} setismenu={setismenu} />

      <div
        onClick={() => setismenu(false)}
        style={{
          minHeight: "100vh",
          background: theme.pageBg,
          padding: "90px 28px 110px 28px",
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
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 18,
            }}
          >
            <div>
              <div style={{ fontSize: "26px", fontWeight: 900, color: theme.primaryDark }}>Categories</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: theme.textMuted, marginTop: 6 }}>
                Create, update and manage parent-child categories
              </div>
            </div>

            <div
              style={{
                background: "rgba(59, 130, 246, 0.10)",
                border: "1.5px solid rgba(59, 130, 246, 0.20)",
                padding: "10px 16px",
                borderRadius: theme.radiusFull,
                fontSize: 12,
                fontWeight: 900,
                color: theme.primaryDark,
              }}
            >
              Total: {data.length}
            </div>
          </div>

          {/* Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {data.map((v, i) => (
              <div
                key={getCatId(v) ?? i}
                className="cat-card"
                style={{
                  background: theme.cardBg,
                  border: `1.5px solid ${theme.border}`,
                  borderRadius: theme.radiusXl,
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(59, 130, 246, 0.06)",
                  animationDelay: `${i * 0.05}s`,
                }}
              >
                <div style={{ background: theme.gradientPrimary, padding: "14px", color: "white" }}>
                  <div style={{ fontSize: 14, fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {v.name}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.9, marginTop: 4 }}>ID: {getCatId(v)}</div>
                </div>

                <div style={{ padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                    <div
                      style={{
                        background: "rgba(139,92,246,0.10)",
                        border: "1.5px solid rgba(139,92,246,0.20)",
                        padding: "6px 10px",
                        borderRadius: theme.radiusFull,
                        fontSize: 11,
                        fontWeight: 900,
                        color: theme.secondary,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Parent: {getParentName(v)}
                    </div>
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 900, color: theme.textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>
                    Description
                  </div>
                  <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: theme.textSecondary, lineHeight: 1.5 }}>
                    {v.description || "—"}
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button
                      onClick={() => edt(v)}
                      type="button"
                      style={{
                        flex: 1,
                        height: 36,
                        border: "none",
                        borderRadius: theme.radiusMd,
                        background: theme.gradientPrimary,
                        color: "white",
                        fontWeight: 900,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <CiEdit /> Edit
                    </button>

                    <button
                      onClick={() => del(getCatId(v))}
                      type="button"
                      style={{
                        flex: 1,
                        height: 36,
                        border: "none",
                        borderRadius: theme.radiusMd,
                        background: theme.gradientDanger,
                        color: "white",
                        fontWeight: 900,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <MdDelete /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
              padding: 20,
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) resetForm();
            }}
          >
            <div
              className="form-panel"
              style={{
                width: "100%",
                maxWidth: 520,
                background: theme.cardBg,
                border: `2px solid ${theme.border}`,
                borderRadius: theme.radiusXl,
                padding: 24,
                boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: theme.textPrimary }}>
                    {updateActive ? "Update Category" : "Add Category"}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: theme.textMuted, marginTop: 4 }}>
                    Fill name, description and parent (optional)
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: theme.radiusMd,
                    border: "none",
                    background: "rgba(239, 68, 68, 0.12)",
                    color: theme.danger,
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  X
                </button>
              </div>

              <form onSubmit={sub} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: theme.textSecondary, marginBottom: 6 }}>Name</div>
                  <input
                    className="cat-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Category name"
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: theme.textSecondary, marginBottom: 6 }}>Description</div>
                  <textarea
                    className="cat-input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Category description"
                    rows={4}
                    style={{
                      ...inputStyle,
                      height: "auto",
                      paddingTop: 10,
                      paddingBottom: 10,
                      resize: "none",
                    }}
                  />
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: theme.textSecondary, marginBottom: 6 }}>
                    Parent Category (optional)
                  </div>

                  <Select
                    value={selectedParentOption}
                    onChange={(opt) => setParentId(opt?.value ?? "")}
                    options={parentOptions}
                    isClearable
                    placeholder="None (Root)"
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    height: 46,
                    border: "none",
                    borderRadius: theme.radiusMd,
                    background: updateActive ? theme.gradientWarning : theme.gradientPrimary,
                    color: "white",
                    fontWeight: 900,
                    cursor: "pointer",
                    boxShadow: updateActive
                      ? "0 10px 24px rgba(245, 158, 11, 0.22)"
                      : "0 10px 24px rgba(59, 130, 246, 0.22)",
                  }}
                >
                  {updateActive ? "Update" : "Create"}
                </button>

                {updateActive && (
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
                    Cancel
                  </button>
                )}
              </form>
            </div>
          </div>
        )}

        {/* FAB */}
        <button
          className="add-fab"
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          style={{
            position: "fixed",
            bottom: 28,
            right: 28,
            zIndex: 100,
            height: 52,
            padding: "0 22px",
            border: "none",
            borderRadius: theme.radiusFull,
            background: theme.gradientPrimary,
            color: "white",
            fontWeight: 900,
            cursor: "pointer",
            boxShadow: "0 14px 40px rgba(59, 130, 246, 0.45)",
          }}
        >
          + Add Category
        </button>
      </div>
    </>
  );
};

export default Category;