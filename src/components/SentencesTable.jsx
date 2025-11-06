import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Table, Button, Form, Alert } from "react-bootstrap";
import { emit, subscribe } from "../eventBus";

const SentencesTable = () => {
  const [isOpen,setIsOpen]=useState(false)
  const [sentences, setSentences] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchSubcategoryId, setSearchSubcategoryId] = useState("");
  const [tableLocked,setTableLocked]=useState(false);

  // فرم
  const [text, setText] = useState("");
  const [translate, setTranslate] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [voiceFile, setVoiceFile] = useState(null);
  const [currentVoiceTranslate, setCurrentVoiceTranslate] = useState("");
  const [editingId, setEditingId] = useState(null);

  // 📌 دریافت همه جملات
  const fetchSentences = async () => {
    try {
      // const response = await api.get("sentence");
      const response = await api.get("sentence", {
  params: {
    text: searchText,
    advancecategoryId: searchSubcategoryId ? +searchSubcategoryId : 0
  }
});
      setSentences(response.data || []);
    } catch (err) {
      console.error(err);
      setError("خطا در دریافت جملات");
    }
  };

  // 📌 دریافت دسته‌بندی‌ها
  const fetchSubcategories = async () => {
    try {
      const response = await api.get("advancecategory/all");
      setSubcategories(response.data || []);
    } catch (err) {
      console.error(err);
    }
  };

useEffect(() => {
      fetchSubcategories(); // dropdown داخل جملات آپدیت
    fetchSentences();     // جدول جملات آپدیت

  const unsubscribe = subscribe("categoryCreated", () => {
    fetchSubcategories(); // dropdown داخل جملات آپدیت
    fetchSentences();     // جدول جملات آپدیت
  });

  return () => unsubscribe(); // cleanup هنگام unmount
}, []);

  // 📌 پاکسازی فرم
  const clearForm = () => {
    setText("");
    setTranslate("");
    setSubcategoryId("");
    setVoiceFile(null);
    setCurrentVoiceTranslate("");
    setEditingId(null);
    document.getElementById("voiceInput").value = "";
    setTableLocked(false);
  };

  // 📌 ایجاد یا ویرایش جمله
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!text.trim()) return setError("متن انگلیسی الزامی است.");
    if (!translate.trim()) return setError("ترجمه فارسی الزامی است.");
    if (!subcategoryId) return setError("لطفاً دسته‌بندی را انتخاب کنید.");

    const formData = new FormData();
    formData.append("Text", text);
    formData.append("Translate", translate);
    formData.append("AdvanceCategoryId", subcategoryId);

    if (editingId) {
      formData.append("Id", editingId);
      formData.append("CurrenVoiceTranslate", currentVoiceTranslate);
      if (voiceFile) formData.append("NewVoiceTranslate", voiceFile);
    } else {
      if (!voiceFile) return setError("فایل صدای ترجمه الزامی است.");
      formData.append("VoiceTranslate", voiceFile);
      formData.append("IsDeleted", false); // پیش‌فرض فعال
    }
try {
  if (editingId) {
    await api.post(`sentence/edit/${editingId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
      emit("ravandUpdate");
    // 🎯 اگر ویس جدید انتخاب شده بود، بلافاصله جدول را آپدیت کن
    if (voiceFile) {
      setSentences(prev =>
        prev.map(s =>
          s.id === editingId
            ? {
                ...s,
                voiceTranslate: `${URL.createObjectURL(voiceFile)}?t=${Date.now()}`, // صدای جدید محلی بدون نیاز به رفرش
              }
            : s
        )
      );
    }    
  } else {
    await api.post("sentence", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
      emit("ravandUpdate");
  }

  await fetchSentences();
  clearForm();
  setTableLocked(false);
  
  setIsOpen(false);
setTimeout(() => setIsOpen(true), 1);
} catch (err) {
  console.error(err);
  setError("خطا در ذخیره جمله.");
}
  };

  // 📌 فعال/غیرفعال کردن جمله
  const toggleActivate = async (id, isDeleted) => {
    try {
      await api.post(`sentence/${id}/${isDeleted ? "activate" : "unactivate"}`);
      await fetchSentences();
    } catch (err) {
      console.error(err);
    }
  };

  // 📌 پر کردن فرم برای ویرایش
  const handleEdit = (sentence) => {
    setEditingId(sentence.id);
    setText(sentence.text);
    setTranslate(sentence.translate);
    setSubcategoryId(sentence.advanceCategoryId.toString());
    setCurrentVoiceTranslate(sentence.voiceTranslate || "");
    setVoiceFile(null);
    document.getElementById("voiceInput").value = "";
    setTableLocked(true);
  };

  // 📌 جستجو
  const filteredSentences = sentences.filter(
    (s) =>
      s.text.toLowerCase().includes(searchText.toLowerCase()) &&
      (searchSubcategoryId ? s.advanceCategoryId === +searchSubcategoryId : true)
  );

  return (
    <div className="container mt-2">
      <button className="btn btn-dark w-100 text-end" onClick={()=>{ isOpen==true ? setIsOpen(false) : setIsOpen(true)}}>مدیریت جملات</button>
      {isOpen==true ?
      
      <div id="collaps" className="mt-2 bg-light p-2 border rounded border-secondary">
    {/* <h5 className="mb-3">{editingId ? "ویرایش جمله" : "ایجاد جمله جدید"}</h5> */}

      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit} >
                <Form.Group className="mb-3">
          <Form.Label>دسته‌بندی</Form.Label>
          <Form.Select
            value={subcategoryId}
            onChange={(e) => setSubcategoryId(e.target.value)}
          >
            <option value="">انتخاب کنید...</option>
            {subcategories.filter(s => !s.isDeleted).map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* <Form.Group className="mb-3">
          <Form.Label>متن انگلیسی جمله</Form.Label>
          <Form.Control
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="English sentence..."
            dir="ltr"
          />
        </Form.Group> */}
<Form.Group className="mb-3">
  <Form.Label>متن انگلیسی جمله</Form.Label>
  <Form.Control
    type="text"
    value={text}
    onChange={(e) => {
      // فقط حروف انگلیسی، اعداد و فاصله
      const englishOnly = e.target.value.replace(/[^A-Za-z0-9 .,!?'"-]/g, '');
      setText(englishOnly);
    }}
    placeholder="فقط انگلیسی امکان تایپ دارید..."
    dir="ltr"
  />
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label>ترجمه فارسی</Form.Label>
  <Form.Control
    type="text"
    value={translate}
    onChange={(e) => {
      // فقط حروف فارسی، اعداد فارسی/انگلیسی، فاصله و علائم رایج
      const persianOnly = e.target.value.replace(/[^آ-ی0-9٠-٩.,!?،؛؟\s-]/g, '');
      setTranslate(persianOnly);
    }}
    placeholder="فقط فارسی امکان تایپ کردن دارید..."
    dir="rtl"
  />
</Form.Group>


        <Form.Group className="mb-3">
                    {/* hidden field برای ویس قبلی */}
          {editingId && (
            <>
            <label className="d-block mt-3 mb-2">صدای قبلی</label>
            <audio controls>
                    <source
                      src={`https://totivar.com/${currentVoiceTranslate}`}
                      // src={`https://localhost:7291/${s.currentVoiceTranslate}`}
                      type="audio/mpeg"
                    />
                  </audio>

            <Form.Control
              type="hidden"
              value={currentVoiceTranslate}
              name="CurrenVoiceTranslate"
            />
            </>            
          )}

          <Form.Label className="mt-2 d-block">
            {editingId !=null ? "صدای ترجمه جدید": "صدای ترجمه" }</Form.Label>
          <Form.Control
            type="file"
            id="voiceInput"
            accept="audio/*"
            onChange={(e) => setVoiceFile(e.target.files[0])}
          />
        </Form.Group>

        <div className="d-flex gap-2">
          <Button type="submit" variant={editingId ? "warning" : "primary"}>
            {editingId ? "ویرایش جمله" : "ایجاد جمله"}
          </Button>
          {editingId && (
            <Button variant="secondary" onClick={clearForm}>
              انصراف
            </Button>
          )}
        </div>
      </Form>

      {/* جستجو */}
      <h5 className="mb-3">جستجو</h5>
      <div className="d-flex gap-2 mb-3">
        <Form.Control
          type="text"
          placeholder="جستجو بر اساس متن"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Form.Select
          value={searchSubcategoryId}
          onChange={(e) => setSearchSubcategoryId(e.target.value)}
        >
          <option value="">همه دسته‌بندی‌ها</option>
          {subcategories.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </Form.Select>
      </div>

      {/* جدول */}
      <h5 className="mb-3">لیست جملات</h5>
      <Table striped bordered hover responsive className={tableLocked ? "opacity-50 pointer-events-none" : ""}>
        <thead>
          <tr>
            <th>#</th>
            <th>متن انگلیسی</th>
            <th>ترجمه فارسی</th>
            <th>دسته‌بندی</th>
            <th>وضعیت</th>
            <th>صوت ترجمه</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {filteredSentences.map((s, index) => (
            <tr key={s.id}>
              <td>{index + 1}</td>
              <td dir="ltr">{s.text}</td>
              <td dir="rtl">{s.translate}</td>
              <td>{s.advanceCategoryTitle}</td>
              <td>{s.isDeleted ? "غیرفعال" : "فعال"}</td>
              <td>
                {s.voiceTranslate && (
                  <audio controls>
                    <source
                      src={`https://totivar.com/${s.voiceTranslate}`}
                      // src={`https://localhost:7291/${s.voiceTranslate}`}
                      type="audio/mpeg"
                    />
                  </audio>
                )}
              </td>
              <td className="d-flex gap-2">
                <Button
                  variant={s.isDeleted ? "success" : "warning"}
                  size="sm"
                  onClick={() => toggleActivate(s.id, s.isDeleted)}
                >
                  {s.isDeleted ? "فعال" : "غیرفعال"}
                </Button>
                <Button
                  variant="info"
                  size="sm"
                  onClick={() => handleEdit(s)}
                >
                  ویرایش
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>    
      </div>
      :
      ""
    }
    </div>
  );
};

export default SentencesTable;
