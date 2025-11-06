import React, { useState, useEffect } from "react";
import api from "../api/axios";

export default function MyPositionColumn({ onSelect, editSelected }) {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null); // ✅ فقط یکی انتخاب میشه
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (editSelected && editSelected.length > 0) {
      setSelectedItem(editSelected[0]); // ✅ چون فقط یکی باید انتخاب شه
      setDisabled(true);
      if (onSelect) onSelect(editSelected[0]);
    } else {
      setSelectedItem(null);
      setDisabled(false);
    }
  }, [editSelected]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("MainCategory/all");
      setItems(data);
    } catch (error) {
      console.error("❌ Fetch Error:", error.response?.data || error);
      alert("خطا در دریافت دسته‌بندی‌ها");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const val = inputValue.trim();
    if (!val) return alert("عنوان نمی‌تواند خالی باشد!");
    try {
      await api.post("MainCategory", { title: val });
      setInputValue("");
      fetchItems();
    } catch (error) {
      console.error("❌ Add Error:", error.response?.data || error);
      alert("خطا در افزودن دسته‌بندی");
    }
  };

  // ✅ فقط یکی قابل انتخاب است
  const handleSelect = (item) => {
    setSelectedItem(item);
    if (onSelect) onSelect(item);
  };

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <td>
      <div className="mb-3">
        {/* افزودن آیتم جدید */}
        <div className="d-flex mb-2">
          <input
            type="text"
            className="form-control me-2"
            placeholder="افزودن آیتم جدید"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            disabled={disabled}
          />
          <button className="btn btn-success" onClick={handleAdd} disabled={disabled}>
            +
          </button>
        </div>

        {/* جستجو */}
        <input
          type="text"
          className="form-control mb-2"
          placeholder="جستجو در دسته‌بندی‌ها..."
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          disabled={disabled}
        />

        {/* لیست */}
        {loading ? (
          <p>در حال بارگذاری...</p>
        ) : filteredItems.length === 0 ? (
          <p>هیچ دسته‌بندی یافت نشد.</p>
        ) : (
          <ul className="list-group">
            {filteredItems.map(item => (
              <li
                key={item.id}
                className="list-group-item d-flex align-items-center justify-content-between"
              >
                <div className="d-flex align-items-center">
                  <input
                    type="radio"
                    name="mainCategory" // ✅ لازم برای رفتار تک‌انتخابی
                    className="me-2"
                    checked={selectedItem?.id === item.id}
                    onChange={() => handleSelect(item)}
                    disabled={disabled}
                  />
                  <span>{item.title}</span>
                </div>
                <button
                  className="btn btn-sm btn-warning"
                  onClick={async () => {
                    const newTitle = prompt("عنوان جدید را وارد کنید:", item.title);
                    if (!newTitle || newTitle.trim() === "") return;
                    try {
                      await api.post("MainCategory/edit", { id: item.id, title: newTitle });
                      fetchItems();
                    } catch (error) {
                      alert("خطا در ویرایش دسته‌بندی");
                    }
                  }}
                >
                  ✏️
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </td>
  );
}
