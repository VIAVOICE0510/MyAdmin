import React, { useState, useEffect } from "react";
import api from "../api/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css"; // ✅ برای آیکون‌های زیبا
import { subscribe } from "../eventBus";

// ---------------------------
// ✅ کامپوننت سمت چپ (لیست گروه‌ها)
// ---------------------------
const ItemList = ({ title, items, onDragGroup }) => {
  const [openGroups, setOpenGroups] = useState({}); // وضعیت باز/بسته بودن گروه‌ها

  const groupedItems = items.reduce((acc, item) => {
    const groupName =
      item.guideCategoryName || item.advanceCategoryTitle || "بدون دسته";
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(item);
    return acc;
  }, {});

  const toggleGroup = (groupName) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  return (
    <div className="mb-3">
      <h5 className="fw-bold">{title}</h5>
      {Object.keys(groupedItems).map((group) => {
        const isOpen = openGroups[group] || false;
        return (
          <div
            key={group}
            className="mb-2 border rounded p-2 bg-light"
            draggable
            onDragStart={(e) => onDragGroup(group, groupedItems[group], title, e)}
            style={{ cursor: "grab" }}
          >
            {/* سربرگ گروه */}
            <div
              className="d-flex justify-content-between align-items-center"
              onClick={(e) => {
                e.stopPropagation();
                toggleGroup(group);
              }}
              style={{ cursor: "pointer" }}
            >
              <strong>
                <i
                  className={`bi ${
                    isOpen ? "bi-chevron-down" : "bi-chevron-right"
                  } me-1`}
                ></i>
                {group}
              </strong>
              <span className="badge bg-secondary">
                {groupedItems[group].length}
              </span>
            </div>

            {/* آیتم‌های داخل گروه */}
            {isOpen && (
              <ul className="list-group mt-2">
                {groupedItems[group].map((item) => (
                  <li key={item.id} className="list-group-item py-1">
                    {item.text ||
                      item.guideCategoryName ||
                      item.rewardCategoryName ||
                      "بدون عنوان"}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------
// ✅ کامپوننت اصلی روند
// ---------------------------
export default function Ravand() {
  const [isOpen, setIsOpen] = useState(false);
  const [voices, setVoices] = useState([]);
  const [sentences, setSentences] = useState([]);
  const [canvasGroups, setCanvasGroups] = useState([]); // گروه‌ها در Canvas
  const [trendName, setTrendName] = useState("");
  const [trendType, setTrendType] = useState(0);

  // ===== بارگذاری داده‌ها =====
  useEffect(() => {
    const fetchData = () => {
      api
        .get("guide")
        .then((res) => setVoices(res.data.filter((i) => !i.isDeleted)))
        .catch(() => {});
      api
        .get("sentence")
        .then((res) => setSentences(res.data.filter((i) => !i.isDeleted)))
        .catch(() => {});
    };
    fetchData();

    const unsubscribe1 = subscribe("ravandUpdate", fetchData);
    const unsubscribe2 = subscribe("fileUpdated", fetchData);
    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, []);

  // ===== Drag گروه از سمت چپ =====
const handleDragGroup = (groupName, groupItems, sourceTitle, e) => {
  const itemType =
    sourceTitle === "Sentences"
      ? "Sentence"
      : sourceTitle === "Voices"
      ? "Guide"
      : "Unknown";

  const advanceCategoryId =
    itemType === "Sentence" && groupItems.length > 0
      ? groupItems[0].advanceCategoryId
      : null;

  const group = {
    id: Date.now() + Math.random(),
    name: groupName,
    type: itemType,
    items: groupItems.map((i) => ({
      ...i,
      uid: Date.now() + Math.random(),
      itemType,
      advanceCategoryId,
    })),
    isOpen: true,
  };

  e.dataTransfer.setData("group", JSON.stringify(group)); // 👈 مثل قبل
};

  // ===== Drop روی Canvas =====
  const handleDrop = (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("group");
    if (!data) return;
    const group = JSON.parse(data);
    setCanvasGroups((prev) => [...prev, group]);
  };

  // ===== Drag بین گروه‌ها =====
  const handleGroupDragStart = (e, index) => {
    e.dataTransfer.setData("dragGroupIndex", index);
  };

  const handleGroupDrop = (e, index) => {
    e.preventDefault();
    const dragIndex = e.dataTransfer.getData("dragGroupIndex");
    if (dragIndex === null) return;

    const updated = [...canvasGroups];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);
    setCanvasGroups(updated);
  };

  // ===== حذف گروه از Canvas =====
  const removeGroup = (id) => {
    setCanvasGroups((prev) => prev.filter((g) => g.id !== id));
  };

  // ===== باز و بسته کردن گروه در Canvas =====
  const toggleGroupOpen = (id) => {
    setCanvasGroups((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, isOpen: !g.isOpen } : g
      )
    );
  };

  // ===== ذخیره روند =====
  const saveTrend = async () => {
    if (!trendName.trim()) {
      alert("لطفاً نام روند را وارد کنید!");
      return;
    }

    const allItems = canvasGroups.flatMap((g) => g.items);
    console.log(allItems);    
const guides = allItems
  .filter((i) => i.itemType === "Guide")
  .map((v, index) => ({
    GuideId: v.id,
    Order: index + 1,
    GuideCategoryId: v.guideCategoryId, // 🔹 اضافه شد
  }));
    const sentencesList = allItems
      .filter((i) => i.itemType === "Sentence")
      .map((s, index) => ({
        SentenceId: s.id,
        Order: index + 1,
        AdvanceCategoryId: s.advanceCategoryId, // 🔹 اضافه شد
      }));

    const firstSentence = sentencesList.length
      ? allItems.find((i) => i.itemType === "Sentence")
      : null;
    const advanceCategoryId = firstSentence
      ? firstSentence.advanceCategoryId
      : null;

    if (!advanceCategoryId) {
      alert("هیچ جمله‌ای برای تعیین دسته‌بندی روند وجود ندارد!");
      return;
    }

    const payload = {
      Name: trendName,
      advanceCategoryId,
      TrendType: trendType,
      Guides: guides,
      Sentences: sentencesList,
    };

    try {
      console.log(payload);
      
      await api.post("trends", payload);
      alert("روند با موفقیت ذخیره شد!");
      setCanvasGroups([]);
      setTrendName("");
    } catch (err) {
      console.error("خطای ذخیره روند:", err.response?.data || err.message);
      alert("خطا در ذخیره روند!");
    }
  };

  // ---------------------------
  // 🔹 رندر
  // ---------------------------
  return (
    <div className="container mt-2">
      <button
        className="btn btn-dark w-100 text-end"
        onClick={() => setIsOpen(!isOpen)}
      >
        مدیریت روند
      </button>

      {isOpen && (
        <div className="row bg-light border border-secondary p-3 rounded mt-2 mx-0">
          {/* سمت چپ: لیست گروه‌ها */}
          <div className="col-md-4">
            <ItemList
              title="Voices"
              items={voices}
              onDragGroup={handleDragGroup}
            />
            <ItemList
              title="Sentences"
              items={sentences}
              onDragGroup={handleDragGroup}
            />
          </div>

          {/* سمت راست: Canvas */}
          <div
            className="col-md-8 border p-3"
            style={{ minHeight: "500px" }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <h5>Canvas (گروه‌ها)</h5>

            {/* فرم ذخیره روند */}
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="نام روند را وارد کنید..."
                value={trendName}
                onChange={(e) => setTrendName(e.target.value)}
              />
              <select
                className="form-control mt-2"
                onChange={(e) => setTrendType(e.target.value)}
              >
                <option value={0}>نوع روند را انتخاب کنید</option>
                <option value={1}>مرور</option>
                <option value={2}>آزمون</option>
              </select>
              <button className="btn btn-success mt-2" onClick={saveTrend}>
                ذخیره روند
              </button>
            </div>

            {/* گروه‌های Canvas */}
            {canvasGroups.length === 0 ? (
              <div className="text-muted">هیچ گروهی اضافه نشده است</div>
            ) : (
              canvasGroups.map((group, index) => (
                <div
                  key={group.id}
                  className="border rounded p-2 mb-3 bg-white"
                  draggable
                  onDragStart={(e) => handleGroupDragStart(e, index)}
                  onDrop={(e) => handleGroupDrop(e, index)}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <div
                    className="d-flex justify-content-between align-items-center"
                    style={{ cursor: "pointer" }}
                    onClick={() => toggleGroupOpen(group.id)}
                  >
                    <h6 className="mb-0">
                      <i
                        className={`bi ${
                          group.isOpen
                            ? "bi-chevron-down"
                            : "bi-chevron-right"
                        } me-1`}
                      ></i>
                      {group.name}{" "}
                      <small className="text-muted">
                        ({group.type === "Guide" ? "راهنما" : "جمله"})
                      </small>
                    </h6>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeGroup(group.id);
                      }}
                    >
                      ×
                    </button>
                  </div>

                  {group.isOpen && (
                    <ul className="list-group mt-2">
                      {group.items.map((item) => (
                        <li key={item.uid} className="list-group-item py-1">
                          {item.text ||
                            item.guideCategoryName ||
                            item.rewardCategoryName ||
                            "بدون عنوان"}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
