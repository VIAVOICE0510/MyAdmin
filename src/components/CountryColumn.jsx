import React, { useState, useEffect } from "react";
import api from "../api/axios";

export default function CountryColumn({ onSelect, editSelected }) {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  // همگام‌سازی تیک‌ها هنگام ادیت
  useEffect(() => {
    if (editSelected && editSelected.length > 0) {
      setSelectedItems(editSelected);
      setDisabled(true); // غیر فعال کردن input و چک‌باکس‌ها
      if (onSelect) onSelect(editSelected);
    } else {
      setSelectedItems([]);
      setDisabled(false);
    }
  }, [editSelected]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("Country/all");
      setItems(data);
    } catch (error) {
      console.error("❌ Fetch Error:", error.response?.data || error);
      alert("خطا در دریافت کشورها");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const val = inputValue.trim();
    if (!val) return alert("عنوان کشور نمی‌تواند خالی باشد!");

    try {
      await api.post("Country", { title: val });
      setInputValue("");
      fetchItems();
    } catch (error) {
      console.error("❌ Add Error:", error.response?.data || error);
      alert("خطا در افزودن کشور");
    }
  };

  const toggleSelect = (item, checked) => {
    let updated;
    if (checked) {
      updated = [...selectedItems, item];
    } else {
      updated = selectedItems.filter(i => i.id !== item.id);
    }
    setSelectedItems(updated);
    if (onSelect) onSelect(updated);
  };

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <td>
      {/* افزودن کشور جدید */}
      <div className="d-flex mb-2">
        <input
          type="text"
          className="form-control me-2"
          placeholder="افزودن کشور"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
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
        placeholder="جستجو در کشورها..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        disabled={disabled}
      />

      {/* لیست کشورها */}
      {loading ? (
        <p>در حال بارگذاری...</p>
      ) : filteredItems.length === 0 ? (
        <p>هیچ کشوری یافت نشد.</p>
      ) : (
        <ul className="list-group mb-2">
          {filteredItems.map((item) => (
            <li
              key={item.id}
              className="list-group-item d-flex align-items-center justify-content-between"
            >
              <div className="d-flex align-items-center">
                <input
                  type="checkbox"
                  className="form-check-input me-2"
                  checked={selectedItems.some(i => i.id === item.id)}
                  onChange={e => toggleSelect(item, e.target.checked)}
                  disabled={disabled}
                />
                <span>{item.title}</span>
              </div>

              {/* دکمه ویرایش */}
              <button
                className="btn btn-sm btn-warning"
                onClick={async () => {
                  const newTitle = prompt("عنوان جدید را وارد کنید:", item.title);
                  if (!newTitle || newTitle.trim() === "") return;

                  try {
                    await api.post("Country/edit", { id: item.id, title: newTitle });
                    fetchItems();
                  } catch (error) {
                    console.error("❌ Edit Error:", error.response?.data || error);
                    alert("خطا در ویرایش کشور");
                  }
                }}
              >
                ✏️
              </button>
            </li>
          ))}
        </ul>
      )}
    </td>
  );
}
