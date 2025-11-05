import React, { useEffect, useRef, useState } from "react";
import { Table, Button, Form, InputGroup, FormControl, Spinner } from "react-bootstrap";
import api from "../api/axios";

export default function RewardsTable() {
  const [rewards, setRewards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchRewards();
    fetchCategories();
  }, []);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const res = await api.get("reward");
      setRewards(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("rewardcategory");
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedCategory) return setError("لطفاً دسته‌بندی را انتخاب کنید.");
    if (!file) return setError("لطفاً فایل پاداش را انتخاب کنید.");

    const formData = new FormData();
    formData.append("RewardCategoryId", selectedCategory);
    formData.append("RewardAddress", file);

    setCreateLoading(true);
    try {
      await api.post("reward", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setSelectedCategory("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = ""; // این خط فرم رو خالی می‌کنه
      fetchRewards();
    } catch (err) {
      console.error(err);
      setError("خطا در ایجاد فایل پاداش.");
    } finally {
      setCreateLoading(false);
    }
  };

  const toggleStatus = async (r) => {
    try {
      if (r.isDeleted) {
        await api.post(`reward/activate/${r.id}`);
      } else {
        await api.post(`reward/unactivate/${r.id}`);
      }
      fetchRewards();
    } catch (err) {
      console.error(err);
      alert("خطا در تغییر وضعیت");
    }
  };

  const visible = rewards.filter(r =>
    (r.rewardCategoryName || "").toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div>
      <h4 className="mb-3">ایجاد فایل پاداش</h4>
      <Form onSubmit={handleCreate}>
        <InputGroup className="mb-2" style={{ maxWidth: 500 }}>
          <Form.Select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="">انتخاب دسته‌بندی</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Form.Select>
        </InputGroup>

        <InputGroup className="mb-2" style={{ maxWidth: 500 }}>
          <FormControl type="file" accept="audio/*" onChange={e => setFile(e.target.files[0])} ref={fileInputRef} />
        </InputGroup>

        {error && <div className="text-danger mb-2">{error}</div>}

        <Button variant="success" type="submit" disabled={createLoading}>
          {createLoading ? <Spinner animation="border" size="sm" /> : "ثبت"}
        </Button>
      </Form>

      <hr />

      <div className="d-flex justify-content-between align-items-center mb-2">
        <h4>فایل‌های پاداش</h4>
        <Form.Control
          type="search"
          placeholder="جستجو..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 300 }}
        />
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ردیف</th>
            <th>عنوان فایل</th>
            <th>دسته‌بندی</th>
            <th>تاریخ ایجاد</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {visible.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">موردی یافت نشد</td>
            </tr>
          ) : (
            visible.map((r, i) => (
              <tr key={r.id}>
                <td>{i + 1}</td>
                <td>
                  {r.rewardAddress ? (
                    <audio controls style={{ width: 200 }}>
                      <source src={`https://totivar.com/${r.rewardAddress}`} type="audio/mpeg" />
                      {/* <source src={`https://localhost:7291/${r.rewardAddress}`} type="audio/mpeg" /> */}
                      مرورگر شما از پخش فایل پشتیبانی نمی‌کند.
                    </audio>
                  ) : "-"}
                </td>
                <td>{r.rewardCategoryName}</td>
                <td>{r.creationDate}</td>
                <td>{r.isDeleted ? "غیرفعال" : "فعال"}</td>
                <td>
                  <Button
                    size="sm"
                    variant={r.isDeleted ? "success" : "danger"}
                    onClick={() => toggleStatus(r)}
                  >
                    {r.isDeleted ? "فعال کردن" : "غیرفعال کردن"}
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}
