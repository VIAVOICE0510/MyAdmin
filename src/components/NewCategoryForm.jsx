import React, { useState, useEffect } from "react";
import { Form, Button, Table } from "react-bootstrap";
import api from "../api/axios";

export default function CategoryManager() {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null);

  // بارگذاری دسته‌بندی‌ها
  const loadCategories = async () => {
    try {
      const res = await api.get("category");
      setCategories(res.data);
    } catch (err) {
      console.error("خطا در دریافت دسته‌بندی‌ها:", err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // ایجاد یا ویرایش دسته‌بندی
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (editId === null) {
        // ایجاد دسته‌بندی جدید
        await api.post("category", {
          command: {
            Title: name,          // PascalCase
            CategoryImage: null,  // اختیاری
          },
        });
      } else {
        // ویرایش دسته‌بندی
        await api.post("category/edit", {
          command: {
            Id: editId,           // PascalCase
            Title: name,          // PascalCase
            NewImage: null,       // اختیاری
          },
        });
        setEditId(null);
      }

      setName("");
      loadCategories(); // رفرش جدول
    } catch (err) {
      console.error(err);
      setError("خطا در ارسال اطلاعات.");
    } finally {
      setLoading(false);
    }
  };

  // پر کردن فرم برای ویرایش
  const handleEdit = (cat) => {
    setEditId(cat.Id);  // PascalCase
    setName(cat.Title); // PascalCase
  };

  return (
    <>
      <div className="row justify-content-center mb-4">
        <div className="col-6 p-3 rounded shadow-lg">
          <h4>{editId === null ? "ایجاد دسته‌بندی جدید" : "ویرایش دسته‌بندی"}</h4>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>نام دسته‌بندی</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="نام دسته‌بندی را وارد کنید"
                required
              />
            </Form.Group>

            {error && <div className="text-danger mb-2">{error}</div>}

            <div className="d-flex justify-content-center">
              <Button type="submit" variant="danger" className="me-3" disabled={loading}>
                {loading ? "در حال ارسال..." : editId === null ? "ذخیره" : "ویرایش"}
              </Button>
              <Button
                variant="dark"
                onClick={() => {
                  setName("");
                  setEditId(null);
                }}
              >
                انصراف
              </Button>
            </div>
          </Form>
        </div>
      </div>

      {/* جدول دسته‌بندی‌ها */}
      <div className="row">
        <div className="col rounded shadow-lg border p-3 mx-3">
          <h4>دسته‌بندی‌ها</h4>
          <Table striped bordered hover>
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
              {categories.map((cat, index) => (
                <tr key={cat.Id}>
                  <td>{index + 1}</td>
                  <td>{cat.Title}</td>
                  <td>{cat.CreationDate}</td>
                  <td>{cat.IsDeleted ? "غیرفعال" : "فعال"}</td>
                  <td>
                    <Button
                      variant="warning"
                      className="me-2"
                      onClick={() => handleEdit(cat)}
                    >
                      ویرایش
                    </Button>
                    {cat.IsDeleted ? (
                      <Button variant="success">فعال کردن</Button>
                    ) : (
                      <Button variant="danger">غیرفعال کردن</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </>
  );
}
