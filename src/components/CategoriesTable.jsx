// import React, { useEffect, useState } from "react";
// import { Button, Form, Spinner, InputGroup, FormControl, Card } from "react-bootstrap";
// import api from "../api/axios";

// export default function TreeCategoryManager() {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // فرم ایجاد
//   const [childName, setChildName] = useState(""); // فقط نام فرزند واقعی
//   const [parentId, setParentId] = useState(""); // آی‌دی والد انتخاب شده
//   const [parentName, setParentName] = useState(""); // نام والد برای نمایش
//   const [createLoading, setCreateLoading] = useState(false);
//   const [createError, setCreateError] = useState("");

//   // وضعیت باز و بسته شدن نودها
//   const [expandedIds, setExpandedIds] = useState(new Set());

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const fetchCategories = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await api.get("treecategory");
//       // فرض: API لیست را به شکل flat برمی‌گرداند
//       const tree = buildTree(res.data || []);
//       setCategories(tree);
//     } catch (err) {
//       console.error(err);
//       setError("خطا در دریافت لیست دسته‌ها");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // تبدیل لیست flat به درخت
//   const buildTree = (list) => {
//     const map = {};
//     const roots = [];

//     list.forEach(item => {
//       map[item.id] = { ...item, children: [] };
//     });

//     list.forEach(item => {
//       if (item.parentId) {
//         if (map[item.parentId]) {
//           map[item.parentId].children.push(map[item.id]);
//         }
//       } else {
//         roots.push(map[item.id]);
//       }
//     });

//     return roots;
//   };

//   // وقتی والد تغییر کرد
//   const handleParentChange = (e) => {
//     const value = e.target.value;
//     setParentId(value);

//     const selected = categories.find(c => c.id === Number(value));
//     setParentName(selected ? selected.name : "");
//   };

//   // ارسال فرم
// const handleCreate = async (e) => {
//   e.preventDefault();
//   if (!childName.trim()) return;

//   setCreateLoading(true);
//   try {
//     let finalName = childName.trim();

//     if (parentId) {
//       const parent = categories.find((x) => x.id === parentId);

//       if (parent) {
//         // parent.name ممکنه خودش "مهاجرت - مهاجرت - ..." باشه
//         // پس باید فقط بخش اولش (واقعی‌ترین اسم والد اصلی) گرفته بشه
//         const cleanParentName = parent.name.split(" - ")[0];
//         finalName = `${cleanParentName} - ${childName.trim()}`;
//       }
//     }

//     await api.post("treecategory", {
//       name: finalName,
//       parentId: parentId || null,
//     });

//     setChildName("");
//     setParentId("");
//     await fetchCategories();
//   } finally {
//     setCreateLoading(false);
//   }
// };

//   // کمک: تبدیل درخت به لیست flat برای پیدا کردن والد
//   const flatten = (nodes) => {
//     let result = [];
//     nodes.forEach(n => {
//       result.push({ id: n.id, name: n.name });
//       if (n.children?.length) result = result.concat(flatten(n.children));
//     });
//     return result;
//   };

//   const toggleActive = async (id, isDeleted) => {
//     try {
//       if (isDeleted) await api.post(`treecategory/activate/${id}`);
//       else await api.post(`treecategory/unactivate/${id}`);
//       await fetchCategories();
//     } catch {
//       alert("خطا در تغییر وضعیت");
//     }
//   };

//   const toggleExpand = (id) => {
//     const newSet = new Set(expandedIds);
//     if (expandedIds.has(id)) newSet.delete(id);
//     else newSet.add(id);
//     setExpandedIds(newSet);
//   };

//   // نمایش درختی
//   const renderTree = (nodes, level = 0) => {
//     if (!nodes || nodes.length === 0) return null;
//     return (
//       <ul style={{ listStyleType: "none", paddingLeft: level * 20 }}>
//         {nodes.map((n) => (
//           <li key={n.id} style={{ marginBottom: "8px" }}>
//             <div className="d-flex align-items-center">
//               {n.children.length > 0 && (
//                 <Button
//                   size="sm"
//                   variant="secondary"
//                   className="me-2"
//                   onClick={() => toggleExpand(n.id)}
//                 >
//                   {expandedIds.has(n.id) ? "-" : "+"}
//                 </Button>
//               )}
//               <span style={{ fontWeight: level === 0 ? "bold" : "normal" }}>
//                 {n.name}
//               </span>
//               <Button
//                 size="sm"
//                 className="ms-2"
//                 variant={n.isDeleted ? "success" : "danger"}
//                 onClick={() => toggleActive(n.id, n.isDeleted)}
//               >
//                 {n.isDeleted ? "فعال کردن" : "غیرفعال کردن"}
//               </Button>
//             </div>
//             {n.children.length > 0 && expandedIds.has(n.id) && renderTree(n.children, level + 1)}
//           </li>
//         ))}
//       </ul>
//     );
//   };

//   // مقدار Input برای نمایش
//   const displayName = parentName ? `${parentName} - ${childName}` : childName;

//   return (
//     <div className="container mt-4">
//       <Card className="p-3 shadow-sm">
//         <h5>ایجاد دسته جدید</h5>
//         <Form onSubmit={handleCreate}>
//           <InputGroup className="mb-2">
//             <FormControl
//               placeholder="نام دسته"
//               value={displayName}
//               onChange={(e) => setChildName(e.target.value)}
//             />
//             <Form.Select
//               value={parentId}
//               onChange={handleParentChange}
//               style={{ maxWidth: "200px" }}
//             >
//               <option value="">دسته ریشه</option>
//               {flatten(categories).map((c) => (
//                 <option key={c.id} value={c.id}>{c.name}</option>
//               ))}
//             </Form.Select>
//             <Button type="submit" disabled={createLoading}>
//               {createLoading ? <Spinner animation="border" size="sm" /> : "ایجاد"}
//             </Button>
//           </InputGroup>
//           {createError && <div className="text-danger">{createError}</div>}
//         </Form>
//       </Card>

//       <hr />

//       <h5 className="mt-4">درختواره دسته‌ها</h5>

//       {loading ? (
//         <div className="text-center mt-3">
//           <Spinner animation="border" />
//         </div>
//       ) : error ? (
//         <div className="alert alert-danger mt-3">{error}</div>
//       ) : (
//         <div className="mt-2">{renderTree(categories)}</div>
//       )}
//     </div>
//   );
// }



import React, { useEffect, useState } from "react";
import { Table, Button, Form, Modal, Spinner, InputGroup, FormControl } from "react-bootstrap";
import api from "../api/axios"; // فرض بر اینه که این فایل وجود داره و baseURL تنظیمه

export default function CategoriesManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  // create form
  const [newTitle, setNewTitle] = useState("");
  const [createError, setCreateError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // search filter
  const [search, setSearch] = useState("");

  // edit modal
  const [showEdit, setShowEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await api.get("category");
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
      setFetchError("خطا در دریافت دسته‌بندی‌ها.");
    } finally {
      setLoading(false);
    }
  };

  // helper: normalize title for duplicate check
  const norm = (t) => (t || "").trim().toLowerCase();

  // create
  const handleCreate = async (e) => {
    e?.preventDefault();
    setCreateError("");
    const title = newTitle.trim();
    if (!title) {
      setCreateError("نام دسته‌بندی نباید خالی باشد.");
      return;
    }

    // جلوگیری از تکراری بودن
    if (categories.some(c => norm(c.title) === norm(title))) {
      setCreateError("این نام قبلا وجود دارد.");
      return;
    }

    setCreateLoading(true);
    try {
      const res = await api.post("category", { title });
      // فرض: اگر موفق شد، دوباره لیست را بگیریم
      await fetchCategories();
      setNewTitle("");
    } catch (err) {
      console.error(err);
      setCreateError("خطا در ایجاد دسته‌بندی.");
    } finally {
      setCreateLoading(false);
    }
  };

  // open edit modal
  const openEdit = (cat) => {
    setEditId(cat.id);
    setEditTitle(cat.title || "");
    setEditError("");
    setShowEdit(true);
  };

  const closeEdit = () => {
    setShowEdit(false);
    setEditId(null);
    setEditTitle("");
    setEditError("");
  };

  // submit edit
  const handleEditSubmit = async (e) => {
    e?.preventDefault();
    setEditError("");
    const title = editTitle.trim();
    if (!title) {
      setEditError("نام دسته‌بندی نباید خالی باشد.");
      return;
    }

    // جلوگیری از تکراری بودن در بقیه آیتم‌ها (خود آیتم مجاز است)
    if (categories.some(c => c.id !== editId && norm(c.title) === norm(title))) {
      setEditError("این نام قبلا برای دسته دیگری استفاده شده.");
      return;
    }

    setEditLoading(true);
    try {
      // EditCategory باید حداقل فیلد Id و Title داشته باشه (مطابق Backend شما)
      const payload = { id: editId, title };
      const res = await api.post("category/edit", payload);
      // اگر موفقیت بود، لیست را رفرش کن و مودال را ببند
      await fetchCategories();
      closeEdit();
    } catch (err) {
      console.error(err);
      setEditError("خطا در ویرایش دسته‌بندی.");
    } finally {
      setEditLoading(false);
    }
  };

  // toggle activate / unactivate
  const toggleStatus = async (cat) => {
    // cat.isDeleted : اگر true => غیرفعال، پس فراخوانی activate باید بشه
    const isCurrentlyDeleted = !!cat.isDeleted;
    const id = cat.id;
    try {
      // انتخاب مسیر بر اساس وضعیت فعلی
      if (isCurrentlyDeleted) {
        await api.post(`category/activate/${id}`);
      } else {
        await api.post(`category/unactivate/${id}`);
      }
      // رفرش لیست
      await fetchCategories();
    } catch (err) {
      console.error(err);
      alert("خطا در تغییر وضعیت، دوباره امتحان کنید.");
    }
  };

  // filtered list by search
  const visible = categories.filter(c =>
    (c.title || "").toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="container mt-3">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h4 className="mb-3">ایجاد دسته‌بندی جدید</h4>
          <Form onSubmit={handleCreate}>
            <Form.Group>
              <Form.Label>نام دسته‌بندی</Form.Label>
              <InputGroup>
                <FormControl
                  placeholder="مثلاً: آموزشی"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <Button variant="success" type="submit" disabled={createLoading}>
                  {createLoading ? <Spinner animation="border" size="sm" /> : "ثبت"}
                </Button>
              </InputGroup>
              {createError && <div className="text-danger mt-1">{createError}</div>}
            </Form.Group>
          </Form>
        </div>
      </div>

      <hr />

      <div className="row mb-2">
        <div className="col-md-6">
          <h4>دسته‌بندی‌ها</h4>
        </div>
        <div className="col-md-6 d-flex justify-content-end align-items-center">
          <Form.Control
            type="search"
            placeholder="جستجو..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 300 }}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center my-4">
          <Spinner animation="border" />
        </div>
      ) : fetchError ? (
        <div className="alert alert-danger">{fetchError}</div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ردیف</th>
              <th>نام دسته‌بندی</th>
              <th>تاریخ ایجاد</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">موردی یافت نشد</td>
              </tr>
            ) : (
              visible.map((cat, i) => (
                <tr key={cat.id}>
                  <td style={{ width: 80 }}>{i + 1}</td>
                  <td>{cat.title}</td>
                  <td>{cat.creationDate}</td>
                  <td>{cat.isDeleted ? "غیرفعال" : "فعال"}</td>
                  <td style={{ width: 220 }}>
                    <Button size="sm" variant="primary" className="me-2" onClick={() => openEdit(cat)}>
                      ویرایش
                    </Button>
                    <Button
                      size="sm"
                      variant={cat.isDeleted ? "success" : "danger"}
                      onClick={() => toggleStatus(cat)}
                    >
                      {cat.isDeleted ? "فعال کردن" : "غیرفعال کردن"}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      {/* Edit Modal */}
      <Modal show={showEdit} onHide={closeEdit} centered>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>ویرایش دسته‌بندی</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>نام</Form.Label>
              <Form.Control
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="نام دسته‌بندی"
                autoFocus
              />
              {editError && <div className="text-danger mt-1">{editError}</div>}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeEdit}>بستن</Button>
            <Button variant="primary" type="submit" disabled={editLoading}>
              {editLoading ? <Spinner animation="border" size="sm" /> : "ذخیره تغییرات"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
