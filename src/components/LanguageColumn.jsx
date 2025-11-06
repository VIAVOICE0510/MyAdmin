import React, { useState, useEffect } from "react";
import api from "../api/axios";

export default function LanguageColumn({ onSelect, editSelected }) {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  // همگام‌سازی انتخاب در حالت ویرایش
  useEffect(() => {
    if (editSelected) {
      setSelectedItem(editSelected);
      setDisabled(true);
      if (onSelect) onSelect(editSelected);
    } else {
      setSelectedItem(null);
      setDisabled(false);
    }
  }, [editSelected]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("Language/all");
      setItems(data);
    } catch (error) {
      console.error("❌ Fetch Error:", error.response?.data || error);
      alert("خطا در دریافت زبان‌ها");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const val = inputValue.trim();
    if (!val) return alert("عنوان زبان نمی‌تواند خالی باشد!");

    try {
      await api.post("Language", { title: val });
      setInputValue("");
      fetchItems();
    } catch (error) {
      console.error("❌ Add Error:", error.response?.data || error);
      alert("خطا در افزودن زبان");
    }
  };

  const handleEdit = async (id, newTitle) => {
    if (!newTitle.trim()) return;
    try {
      await api.post("Language/edit", { id, title: newTitle });
      setItems(prev =>
        prev.map(item => (item.id === id ? { ...item, title: newTitle } : item))
      );
    } catch (error) {
      console.error("❌ Edit Error:", error.response?.data || error);
      alert("خطا در ویرایش زبان");
    }
  };

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
        {/* افزودن */}
        <div className="d-flex mb-2">
          <input
            type="text"
            className="form-control me-2"
            placeholder="افزودن زبان جدید"
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
          placeholder="جستجو در زبان‌ها..."
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          disabled={disabled}
        />

        {/* لیست */}
        {loading ? (
          <p>در حال بارگذاری...</p>
        ) : filteredItems.length === 0 ? (
          <p>هیچ زبانی یافت نشد.</p>
        ) : (
          <ul className="list-group">
            {filteredItems.map(item => (
              <li
                key={item.id}
                className="list-group-item d-flex align-items-center justify-content-between"
              >
                {/* رادیوباتن */}
                <div className="d-flex align-items-center">
                  <input
                    type="radio"
                    name="language"
                    className="form-check-input me-2"
                    checked={selectedItem?.id === item.id}
                    onChange={() => handleSelect(item)}
                    disabled={disabled}
                  />
                  <span>{item.title}</span>
                </div>

                {/* ویرایش */}
                <button
                  className="btn btn-sm btn-warning"
                  onClick={() => {
                    const newTitle = prompt("عنوان جدید را وارد کنید:", item.title);
                    if (!newTitle || newTitle.trim() === "") return;
                    handleEdit(item.id, newTitle);
                  }}
                  disabled={disabled}
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
