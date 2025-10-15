// SubCategories.jsx
import React, { useState, useEffect } from "react";
import { Table, Button, Form } from "react-bootstrap";
import api from "../api/axios";

export default function SubCategories() {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editParentId, setEditParentId] = useState("");

  const [searchTerm, setSearchTerm] = useState(""); // اضافه شد

  // بارگذاری دسته‌ها و زیردسته‌ها
  useEffect(() => {
    api.get("category").then(res => setCategories(res.data));
    api.get("subcategory").then(res => setSubCategories(res.data));
  }, []);

  // ایجاد زیردسته جدید
  const handleCreate = async () => {
    if (!name || !parentId) return alert("نام و دسته والد الزامی است");

    const payload = { title: name, categoryId: parseInt(parentId) };
    try {
      const res = await api.post("subcategory", payload);
      if (res.status === 200) {
        setSubCategories(prev => [
          ...prev,
          {
            ...payload,
            id: res.data.id,
            categoryTitle: categories.find(c => c.id === parseInt(parentId))?.title,
            isDeleted: false
          }
        ]);
        setName("");
        setParentId("");
      }
    } catch (err) {
      alert(err.response?.data?.message || "خطا در ثبت زیردسته");
    }
  };

  // ویرایش زیردسته
  const handleEdit = async (id) => {
    if (!editName || !editParentId) return alert("نام و دسته والد الزامی است");
    const payload = { id, title: editName, categoryId: parseInt(editParentId) };
    try {
      const res = await api.post("subcategory/edit", payload);
      if (res.status === 200) {
        setSubCategories(prev =>
          prev.map(s => s.id === id ? { ...s, title: editName, categoryId: parseInt(editParentId), categoryTitle: categories.find(c => c.id === parseInt(editParentId))?.title } : s)
        );
        setEditingId(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || "خطا در ویرایش زیردسته");
    }
  };

  // فعال/غیرفعال کردن
  const handleChangeStatus = async (id, activate) => {
    try {
      const res = await api.post(`subcategory/${activate ? "activate" : "unactivate"}/${id}`);
      if (res.status === 200) {
        setSubCategories(prev =>
          prev.map(s => s.id === id ? { ...s, isDeleted: !activate } : s)
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || "خطا در تغییر وضعیت");
    }
  };

  // فیلتر زیردسته‌ها بر اساس جستجو
  const filteredSubCategories = subCategories.filter(sub =>
    sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.categoryTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h4 className="mb-3">زیردسته‌ها</h4>

      {/* فرم ایجاد */}
      <div className="row mb-3">
        <div className="col-md-6">
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>نام زیردسته</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="مثال: کاری"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>دسته والد</Form.Label>
              <Form.Select
                value={parentId}
                onChange={e => setParentId(e.target.value)}
              >
                <option value="">انتخاب دسته‌بندی</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Button onClick={handleCreate}>ثبت زیردسته جدید</Button>
          </Form>
        </div>
      </div>

      {/* فرم جستجو */}
      <Form className="mb-3">
        <Form.Control
          type="text"
          placeholder="جستجو بر اساس نام زیردسته یا دسته والد..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </Form>

      {/* جدول زیردسته‌ها */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ردیف</th>
            <th>نام زیردسته</th>
            <th>دسته والد</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {filteredSubCategories.map((sub, index) => (
            <tr key={sub.id}>
              <td>{index + 1}</td>
              <td>
                {editingId === sub.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                  />
                ) : (
                  sub.title
                )}
              </td>
              <td>
                {editingId === sub.id ? (
                  <select
                    value={editParentId}
                    onChange={e => setEditParentId(e.target.value)}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                ) : (
                  sub.categoryTitle
                )}
              </td>
              <td>{sub.isDeleted ? "غیرفعال" : "فعال"}</td>
              <td>
                {editingId === sub.id ? (
                  <>
                    <Button size="sm" variant="success" className="me-2" onClick={() => handleEdit(sub.id)}>ذخیره</Button>
                    <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>لغو</Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="primary" className="me-2" onClick={() => {
                      setEditingId(sub.id);
                      setEditName(sub.title);
                      setEditParentId(sub.categoryId);
                    }}>ویرایش</Button>
                    <Button
                      size="sm"
                      variant={sub.isDeleted ? "success" : "danger"}
                      onClick={() => handleChangeStatus(sub.id, sub.isDeleted)}
                    >
                      {sub.isDeleted ? "فعال کردن" : "غیرفعال کردن"}
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
