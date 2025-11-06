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
  MyPosition: null,
  Country: null,
  Language: null,
  Activity: null,
  Need: null,
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

const handleSelect = (column, item) => {
  setSelectedItems((prev) => ({
    ...prev,
    [column]: item,
  }));
};


  const handleSave = async () => {
    try {
      setLoading(true);

const mainCategoryId = selectedItems.MyPosition?.id ?? null;
const countryId = selectedItems.Country?.id ?? null;
const languageId = selectedItems.Language?.id ?? null;
const packageId = selectedItems.Activity?.id ?? null;
const packageTypeId = selectedItems.Need?.id ?? null;

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
          selectedItems.MyPosition.title,
          selectedItems.Country.title,
          selectedItems.Language.title,
          selectedItems.Activity.title,
          selectedItems.Need.title,
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
        emit("categoryCreated");
      } else {
        await api.post(`AdvanceCategory/unactivate/${cat.id}`);
        emit("categoryCreated");
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
    selectedItems.MyPosition?.title,
    selectedItems.Country?.title,
    selectedItems.Language?.title,
    selectedItems.Activity?.title,
    selectedItems.Need?.title,
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
                  onSelect={(item) => handleSelect("MyPosition", item)}
                  disabled={editingId !== null}
                />
                <CountryColumn
                  selected={selectedItems.Country}
                  onSelect={(item) => handleSelect("Country", item)}
                  disabled={editingId !== null}
                />
                <LanguageColumn
                  selected={selectedItems.Language}
                  onSelect={(item) => handleSelect("Language", item)}
                  disabled={editingId !== null}
                />
                <ActivityColumn
                  selected={selectedItems.Activity}
                  onSelect={(item) => handleSelect("Activity", item)}
                  disabled={editingId !== null}
                />
                <NeedColumn
                  selected={selectedItems.Need}
                  onSelect={(item) => handleSelect("Need", item)}
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
