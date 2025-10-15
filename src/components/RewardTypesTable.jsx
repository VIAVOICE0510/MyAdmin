// RewardCategoryManagerInline.js
import React, { useEffect, useState } from "react";
import { Table, Button, Form, InputGroup, FormControl, Spinner } from "react-bootstrap";
import api from "../api/axios";

export default function RewardCategoryManagerInline() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  // فرم ایجاد
  const [newTitle, setNewTitle] = useState("");
  const [createError, setCreateError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // ویرایش inline
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // جستجو
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await api.get("rewardcategory");
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
      setFetchError("خطا در دریافت دسته‌بندی‌ها.");
    } finally {
      setLoading(false);
    }
  };

  // ایجاد دسته‌بندی جدید
  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError("");
    const title = newTitle.trim();
    if (!title) {
      setCreateError("نام دسته‌بندی نباید خالی باشد.");
      return;
    }
    if (categories.some(c => c.name.toLowerCase() === title.toLowerCase())) {
      setCreateError("این نام قبلا وجود دارد.");
      return;
    }

    setCreateLoading(true);
    try {
      await api.post("rewardcategory/create", { name: title });
      setNewTitle(""); // فرم خالی شود
      fetchCategories();
    } catch (err) {
      console.error(err);
      setCreateError("خطا در ایجاد دسته‌بندی.");
    } finally {
      setCreateLoading(false);
    }
  };

  // باز کردن حالت ویرایش
  const openEdit = (cat) => {
    setEditId(cat.id);
    setEditTitle(cat.name);
    setEditError("");
  };

  // ذخیره ویرایش
  const handleEditSubmit = async (cat) => {
    const title = editTitle.trim();
    if (!title) {
      setEditError("نام دسته‌بندی نباید خالی باشد.");
      return;
    }
    if (categories.some(c => c.id !== cat.id && c.name.toLowerCase() === title.toLowerCase())) {
      setEditError("این نام قبلا برای دسته دیگری استفاده شده.");
      return;
    }

    setEditLoading(true);
    try {
      await api.post("rewardcategory/edit", { id: cat.id, name: title });
      setEditId(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      setEditError("خطا در ویرایش دسته‌بندی.");
    } finally {
      setEditLoading(false);
    }
  };

  // فعال/غیرفعال کردن
  const toggleStatus = async (cat) => {
    try {
      if (cat.isDeleted) {
        await api.post(`rewardcategory/activate/${cat.id}`);
      } else {
        await api.post(`rewardcategory/unactivate/${cat.id}`);
      }
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert("خطا در تغییر وضعیت، دوباره امتحان کنید.");
    }
  };

  // فیلتر با جستجو
  const visible = categories.filter(c =>
    (c.name || "").toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="container mt-3">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h4 className="mb-3">ایجاد دسته‌بندی جدید</h4>
          <Form onSubmit={handleCreate}>
            <InputGroup>
              <FormControl
                placeholder="نام دسته‌بندی"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
              <Button variant="success" type="submit" disabled={createLoading}>
                {createLoading ? <Spinner animation="border" size="sm" /> : "ثبت"}
              </Button>
            </InputGroup>
            {createError && <div className="text-danger mt-1">{createError}</div>}
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
        <div className="text-center my-4">در حال دریافت اطلاعات...</div>
      ) : fetchError ? (
        <div className="alert alert-danger">{fetchError}</div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ردیف</th>
              <th>نام دسته‌بندی</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">موردی یافت نشد</td>
              </tr>
            ) : (
              visible.map((cat, i) => (
                <tr key={cat.id}>
                  <td>{i + 1}</td>
                  <td>
                    {editId === cat.id ? (
                      <FormControl
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        autoFocus
                      />
                    ) : (
                      cat.name
                    )}
                    {editError && editId === cat.id && (
                      <div className="text-danger mt-1">{editError}</div>
                    )}
                  </td>
                  <td>{cat.isDeleted ? "غیرفعال" : "فعال"}</td>
                  <td>
                    {editId === cat.id ? (
                      <Button
                        size="sm"
                        variant="primary"
                        className="me-2"
                        onClick={() => handleEditSubmit(cat)}
                        disabled={editLoading}
                      >
                        {editLoading ? <Spinner animation="border" size="sm" /> : "ذخیره"}
                      </Button>
                    ) : (
                      <Button size="sm" variant="info" className="me-2" onClick={() => openEdit(cat)}>ویرایش</Button>
                    )}
                    <Button size="sm" variant={cat.isDeleted ? "success" : "danger"} onClick={() => toggleStatus(cat)}>
                      {cat.isDeleted ? "فعال کردن" : "غیرفعال کردن"}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
}
