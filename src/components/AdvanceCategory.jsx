import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import api from "../api/axios";
import MyPositionColumn from "./MyPositionColumn";
import CountryColumn from "./CountryColumn";
import LanguageColumn from "./LanguageColumn";
import ActivityColumn from "./ActivityColumn";
import NeedColumn from "./NeedColumn";
import { emit } from "../eventBus";

export default function AdvanceCategoryDropdown() {
  const [isOpen, setIsOpen] = useState(false); // وضعیت باز/بسته بودن
  const [selectedItems, setSelectedItems] = useState({
    MyPosition: [],
    Country: [],
    Language: [],
    Activity: [],
    Need: [],
  });

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("AdvanceCategory/all");
      setCategories(data);
    } catch (error) {
      console.error("❌ Error fetching categories:", error.response?.data || error);
    }
  };

  const handleSelect = (column, items) => {
    setSelectedItems((prev) => ({
      ...prev,
      [column]: items,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const mainCategoryId = selectedItems.MyPosition[0]?.id ?? null;
      const countryId = selectedItems.Country[0]?.id ?? null;
      const languageId = selectedItems.Language[0]?.id ?? null;
      const packageId = selectedItems.Activity[0]?.id ?? null;
      const packageTypeId = selectedItems.Need[0]?.id ?? null;

      if (!mainCategoryId || !countryId || !languageId || !packageId || !packageTypeId) {
        alert("لطفاً تمام ستون‌ها را انتخاب کنید.");
        return;
      }

      const payload = {
        mainCategoryId,
        countryId,
        languageId,
        packageId,
        packageTypeId,
        firstUnderPackageTypeId: null,
        secondUnderPackageTypeId: null,
        thirdUnderPackageTypeId: null,
        title: [
          selectedItems.MyPosition[0].title,
          selectedItems.Country[0].title,
          selectedItems.Language[0].title,
          selectedItems.Activity[0].title,
          selectedItems.Need[0].title,
        ].join(" - "),
      };
      if (editingId) {
        await api.post("AdvanceCategory/edit", { ...payload, id: editingId });
        setEditingId(null);
      } else {
        const exists = categories.some((cat) => cat.title === payload.title);
        if (exists) {
          alert("❌ این دسته‌بندی قبلاً ایجاد شده است!");
          return;
        }
        await api.post("AdvanceCategory/create", payload);
        emit("categoryCreated");
      }

      fetchCategories();

      setSelectedItems({
        MyPosition: [],
        Country: [],
        Language: [],
        Activity: [],
        Need: [],
      });
    } catch (error) {
      console.error("❌ Error saving category:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateToggle = async (cat) => {
    try {
      if (cat.isDeleted) {
        await api.post(`AdvanceCategory/activate/${cat.id}`);
      } else {
        await api.post(`AdvanceCategory/unactivate/${cat.id}`);
      }
      fetchCategories();
    } catch (error) {
      console.error("❌ Error toggling activate:", error.response?.data || error);
    }
  };

  const handleEdit = (cat) => {
    setSelectedItems({
      MyPosition: [{ id: cat.mainCategoryId, title: cat.mainCategoryTitle }],
      Country: [{ id: cat.countryId, title: cat.countryTitle }],
      Language: [{ id: cat.languageId, title: cat.languageTitle }],
      Activity: [{ id: cat.packageId, title: cat.packageTitle }],
      Need: [{ id: cat.packageTypeId, title: cat.packageTypeTitle }],
    });
    setEditingId(cat.id);
    setIsOpen(true); // وقتی ادیت شد، حتما باز شود
  };

  const handleCancelEdit = () => {
    setSelectedItems({
      MyPosition: [],
      Country: [],
      Language: [],
      Activity: [],
      Need: [],
    });
    setEditingId(null);
  };

  const generatedTitle = [
    selectedItems.MyPosition[0]?.title,
    selectedItems.Country[0]?.title,
    selectedItems.Language[0]?.title,
    selectedItems.Activity[0]?.title,
    selectedItems.Need[0]?.title,
  ]
    .filter(Boolean)
    .join(" - ");

  return (
    <div className="container mt-2">
      {/* دکمه باز/بسته */}
      <button
        className="btn btn-dark w-100 text-end"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {/* {isOpen ? "بستن Advance Category" : "باز کردن Advance Category"} */}
        دسته‌بندی جملات
      </button>

      {/* محتوای Collapse */}
      {isOpen && (
        <div className="card p-3 border border-secondary bg-light mt-2">
          {/* جدول ستون‌ها */}
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>موقعیت من</th>
                <th>کشور</th>
                <th>زبان</th>
                <th>فعالیت من</th>
                <th>نیاز من</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <MyPositionColumn
                  selected={selectedItems.MyPosition}
                  onSelect={(items) => handleSelect("MyPosition", items)}
                  disabled={editingId !== null}
                />
                <CountryColumn
                  selected={selectedItems.Country}
                  onSelect={(items) => handleSelect("Country", items)}
                  disabled={editingId !== null}
                />
                <LanguageColumn
                  selected={selectedItems.Language}
                  onSelect={(items) => handleSelect("Language", items)}
                  disabled={editingId !== null}
                />
                <ActivityColumn
                  selected={selectedItems.Activity}
                  onSelect={(items) => handleSelect("Activity", items)}
                  disabled={editingId !== null}
                />
                <NeedColumn
                  selected={selectedItems.Need}
                  onSelect={(items) => handleSelect("Need", items)}
                  disabled={editingId !== null}
                />
              </tr>
            </tbody>
          </table>

          {/* عنوان ترکیبی */}
          <div className="mt-3">
            <label className="form-label">عنوان انتخاب‌شده:</label>
            <input
              type="text"
              className="form-control"
              value={generatedTitle}
              readOnly
              placeholder="عنوان انتخاب‌شده‌ها اینجا نمایش داده می‌شود..."
            />
          </div>

          {/* دکمه‌ها */}
          <div className="mt-3 text-center">
            <button
              className="btn btn-primary px-4 me-2"
              onClick={handleSave}
              disabled={loading}
            >
              {loading
                ? "در حال ذخیره..."
                : editingId
                ? "ویرایش دسته‌بندی"
                : "ایجاد دسته‌بندی"}
            </button>
            {editingId && (
              <button className="btn btn-secondary px-4" onClick={handleCancelEdit}>
                لغو
              </button>
            )}
          </div>

          {/* جدول دسته‌بندی‌ها */}
          {categories.length > 0 && (
            <div className="mt-4">
              <h5>دسته‌بندی‌های ایجاد شده</h5>
              <table className="table table-striped table-bordered">
                <thead>
                  <tr>
                    <th>ردیف</th>
                    <th>عنوان</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, index) => (
                    <tr key={cat.id}>
                      <td>{index + 1}</td>
                      <td>{cat.title}</td>
                      <td>
                        <button
                          className={`btn btn-sm me-2 ${
                            cat.isDeleted ? "btn-success" : "btn-secondary"
                          }`}
                          onClick={() => handleActivateToggle(cat)}
                          disabled={editingId !== null}
                        >
                          {cat.isDeleted ? "فعال" : "غیرفعال"}
                        </button>
                        {/* <button
                          className="btn btn-sm btn-warning"
                          onClick={() => handleEdit(cat)}
                          disabled={editingId !== null}
                        >
                          ✏️
                        </button> */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
