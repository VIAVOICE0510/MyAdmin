import React, { useEffect, useRef, useState } from "react";
import { Table, Button, Form, InputGroup, FormControl, Spinner, Collapse } from "react-bootstrap";
import api from "../api/axios"; // فرض بر اینه baseURL درست تنظیم شده
import { emit, subscribe } from "../eventBus";

export default function GuideManager() {
  const[isOpen,setIsOpen]=useState()
  const [guides, setGuides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  // فرم ایجاد
  const [selectedCategory, setSelectedCategory] = useState("");
  const [files, setFiles] = useState([]); // تغییر به آرایه برای چند فایل
  const [createError, setCreateError] = useState("");
  const fileInputRef = useRef(null);

  // جستجو
  const [search, setSearch] = useState("");

  // کنترل باز/بسته بودن گروه‌ها
  const [openCategories, setOpenCategories] = useState({});

useEffect(() => {
      fetchCategories(); // جدول دسته‌بندی‌ها آپدیت بشه
    fetchGuides();     // جدول راهنماها هم آپدیت بشه

  const unsubscribe = subscribe("guideTypeCreated", () => {
    fetchCategories(); // جدول دسته‌بندی‌ها آپدیت بشه
    fetchGuides();     // جدول راهنماها هم آپدیت بشه
  });

  return () => unsubscribe(); // پاکسازی هنگام unmount
}, []);

  const fetchGuides = async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await api.get("guide");
      setGuides(res.data || []);
    } catch (err) {
      console.error(err);
      setFetchError("خطا در دریافت فایل‌ها.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("guide/categories");
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ایجاد فایل‌های جدید
  const handleCreate = async (e) => {
  e.preventDefault();
  setCreateError("");

  if (!selectedCategory) {
    setCreateError("لطفاً دسته‌بندی را انتخاب کنید.");
    return;
  }
  if (files.length === 0) {
    setCreateError("لطفاً حداقل یک فایل صوتی را انتخاب کنید.");
    return;
  }

  const formData = new FormData();
  formData.append("GuideCategoryId", selectedCategory);
  files.forEach(file => formData.append("Addresses", file)); // اضافه کردن همه فایل‌ها

  try {
    await api.post("guide", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    setSelectedCategory("");
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    await fetchGuides();
    emit("fileUpdated");
  } catch (err) {
    console.error(err);
    setCreateError("خطا در ایجاد فایل‌ها.");
  } finally {
  }
};


  // فعال/غیرفعال کردن
  const toggleStatus = async (g) => {
    const id = g.id;
    try {
      if (g.isDeleted) {
        await api.post(`guide/activate/${id}`);
      } else {
        await api.post(`guide/unactivate/${id}`);
      }
      await fetchGuides();
    } catch (err) {
      console.error(err);
      alert("خطا در تغییر وضعیت، دوباره امتحان کنید.");
    }
  };

  // فیلتر با جستجو
  const visible = guides.filter(g =>
    (g.guideCategoryName || "").toLowerCase().includes(search.trim().toLowerCase())
  );

  // گروه‌بندی داده‌ها بر اساس دسته‌بندی
  const groupedData = visible.reduce((acc, item) => {
    const key = item.guideCategoryName || "بدون دسته‌بندی";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  // باز/بسته کردن گروه‌ها
  const handleToggle = (category) => {
    setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <div className="container mt-2">
      <button className="btn btn-dark text-end w-100" onClick={()=>{isOpen ? setIsOpen(false) : setIsOpen(true)}}>مدیریت فایل‌ها</button>
      {isOpen ?
          <div className="mt-2 border rounded border-secondary bg-light p-2">
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
          <FormControl
            type="file"
            accept="audio/*"
            ref={fileInputRef}
            onChange={e => setFiles(Array.from(e.target.files))} // انتخاب چند فایل
            multiple
          />
        </InputGroup>
        {createError && <div className="text-danger mb-2">{createError}</div>}
        <Button variant="success" type="submit" >ثبت</Button>
      </Form>

      <hr />

      <div className="d-flex justify-content-between align-items-center mb-2">
        <h4>فایل‌های راهنما</h4>
        <Form.Control
          type="search"
          placeholder="جستجو..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 300 }}
        />
      </div>

      {fetchError ? (
        <div className="alert alert-danger">{fetchError}</div>
      ) : (
        Object.keys(groupedData).length === 0 ? (
          <div className="text-center">موردی یافت نشد</div>
        ) : (
          Object.keys(groupedData).map(category => (
            <div key={category} className="mb-3 border rounded">
              <Button
                variant="secondary"
                onClick={() => handleToggle(category)}
                className="w-100 text-end p-2"
              >
                {category} ({groupedData[category].filter(x=>!x.isDeleted).length}) {openCategories[category] ? "▲" : "▼"}
              </Button>

              <Collapse in={openCategories[category]}>
                <div>
                  <Table striped bordered hover responsive className="mb-0">
                    <thead>
                      <tr>
                        <th>ردیف</th>
                        <th>عنوان فایل</th>
                        <th>تاریخ ایجاد</th>
                        <th>وضعیت</th>
                        <th>عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedData[category].filter(s=>!s.isDeleted).map((g, i) => (
                        <tr key={g.id}>
                          <td>{i + 1}</td>
                          <td>
                            {g.address ? (
                              <audio controls style={{ width: 200 }}>
                                <source src={`https://totivar.com/${g.address}`} type="audio/mpeg" />
                                {/* <source src={`https://localhost:7291/${g.address}`} type="audio/mpeg" /> */}
                                مرورگر شما از پخش فایل صوتی پشتیبانی نمی‌کند.
                              </audio>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>{g.creationDate}</td>
                          <td>{g.isDeleted ? "غیرفعال" : "فعال"}</td>
                          <td>
                            <Button
                              size="sm"
                              variant={g.isDeleted ? "success" : "danger"}
                              onClick={() => toggleStatus(g)}
                            >
                              {g.isDeleted ? "فعال کردن" : "غیرفعال کردن"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Collapse>
            </div>
          ))
        )
      )}
      </div>
      :""  
    }


    </div>
  );
}
