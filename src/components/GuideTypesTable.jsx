// GuideTypesTable.jsx
import React, { useEffect, useState } from "react";
import { Table, Button, Form, InputGroup, FormControl, Spinner } from "react-bootstrap";
import api from "../api/axios"; // فرض بر اینه که baseURL درست تنظیم شده

export default function GuideTypesTable() {
  const [guideTypes, setGuideTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  // create form
  const [newName, setNewName] = useState("");
  const [createError, setCreateError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // search filter
  const [search, setSearch] = useState("");

  // inline edit
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    fetchGuideTypes();
  }, []);

  const fetchGuideTypes = async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await api.get("guideCategory");
      setGuideTypes(res.data || []);
    } catch (err) {
      console.error(err);
      setFetchError("خطا در دریافت نوع راهنماها.");
    } finally {
      setLoading(false);
    }
  };

  // helper: normalize name
  const norm = (t) => (t || "").trim().toLowerCase();

  // create
  const handleCreate = async (e) => {
    e?.preventDefault();
    setCreateError("");
    const name = newName.trim();
    if (!name) {
      setCreateError("نام نوع راهنما نباید خالی باشد.");
      return;
    }

    if (guideTypes.some(g => norm(g.name) === norm(name))) {
      setCreateError("این نام قبلا وجود دارد.");
      return;
    }

    setCreateLoading(true);
    try {
      await api.post("guideCategory", { name: name });
      await fetchGuideTypes();
      setNewName("");
    } catch (err) {
      console.error(err);
      setCreateError("خطا در ایجاد نوع راهنما.");
    } finally {
      setCreateLoading(false);
    }
  };

  // open inline edit
  const openEdit = (g) => {
    setEditId(g.id);
    setEditName(g.name);
    setEditError("");
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName("");
    setEditError("");
  };

  const handleEditSubmit = async (id) => {
    setEditError("");
    const name = editName.trim();
    if (!name) {
      setEditError("نام نوع راهنما نباید خالی باشد.");
      return;
    }

    if (guideTypes.some(g => g.id !== id && norm(g.name) === norm(name))) {
      setEditError("این نام قبلا برای نوع دیگری استفاده شده.");
      return;
    }

    setEditLoading(true);
    try {
      await api.post("guideCategory/edit", { id, name: name });
      await fetchGuideTypes();
      cancelEdit();
    } catch (err) {
      console.error(err);
      setEditError("خطا در ویرایش نوع راهنما.");
    } finally {
      setEditLoading(false);
    }
  };

  // toggle activate / unactivate
  const toggleStatus = async (g) => {
    const id = g.id;
    try {
      if (g.isDeleted) {
        await api.post(`guideCategory/activate/${id}`);
      } else {
        await api.post(`guideCategory/unactivate/${id}`);
      }
      await fetchGuideTypes();
    } catch (err) {
      console.error(err);
      alert("خطا در تغییر وضعیت، دوباره امتحان کنید.");
    }
  };

  // filtered list by search
  const visible = guideTypes.filter(g =>
    (g.name || "").toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="container mt-3">
      <h4 className="mb-3">ایجاد نوع راهنمای جدید</h4>
      <Form onSubmit={handleCreate}>
        <InputGroup className="mb-3" style={{ maxWidth: 400 }}>
          <FormControl
            placeholder="مثلاً: آموزشی"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button variant="success" type="submit" disabled={createLoading}>
            {createLoading ? <Spinner animation="border" size="sm" /> : "ثبت"}
          </Button>
        </InputGroup>
        {createError && <div className="text-danger mb-2">{createError}</div>}
      </Form>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <h4>نوع راهنماها</h4>
        <Form.Control
          type="search"
          placeholder="جستجو..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 300 }}
        />
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
              <th>نام نوع راهنما</th>
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
              visible.map((g, i) => (
                <tr key={g.id}>
                  <td>{i + 1}</td>
                  <td>
                    {editId === g.id ? (
                      <FormControl
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        autoFocus
                      />
                    ) : (
                      g.name
                    )}
                    {editId === g.id && editError && <div className="text-danger mt-1">{editError}</div>}
                  </td>
                  <td>{g.creationDate}</td>
                  <td>{g.isDeleted ? "غیرفعال" : "فعال"}</td>
                  <td>
                    {editId === g.id ? (
                      <>
                        <Button
                          size="sm"
                          variant="primary"
                          className="me-2"
                          onClick={() => handleEditSubmit(g.id)}
                          disabled={editLoading}
                        >
                          {editLoading ? <Spinner animation="border" size="sm" /> : "ذخیره"}
                        </Button>
                        <Button size="sm" variant="secondary" onClick={cancelEdit}>انصراف</Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="info" className="me-2" onClick={() => openEdit(g)}>ویرایش</Button>
                        <Button
                          size="sm"
                          variant={g.isDeleted ? "success" : "danger"}
                          onClick={() => toggleStatus(g)}
                        >
                          {g.isDeleted ? "فعال کردن" : "غیرفعال کردن"}
                        </Button>
                      </>
                    )}
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
