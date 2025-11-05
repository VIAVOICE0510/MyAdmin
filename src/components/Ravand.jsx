import React, { useState, useEffect } from "react";
import api from "../api/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { subscribe } from "../eventBus";

const ItemList = ({ title, items, onDragItem }) => {
  const groupedItems = items.reduce((acc, item) => {
    const groupName =
      item.guideCategoryName || item.advanceCategoryTitle || "بدون دسته";
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(item);
    return acc;
  }, {});

  return (
    <div className="mb-3">
      <h5>{title}</h5>
      {Object.keys(groupedItems).map((group) => (
        <div key={group} className="mb-2 border rounded p-1 bg-light">
          <div
            style={{ cursor: "pointer" }}
            draggable
            onDragStart={(e) => onDragItem(groupedItems[group], title, e)}
          >
            <strong>{group}</strong>{" "}
            <span className="badge bg-secondary ms-2">
              {groupedItems[group].length}
            </span>
          </div>

          <ul className="list-group mt-1">
            {groupedItems[group].map((item) => (
              <li
                key={item.id}
                className="list-group-item d-flex justify-content-between align-items-center"
                draggable
                onDragStart={(e) => onDragItem([item], title, e)}
              >
                <span>
                  {item.text ||
                    item.guideCategoryName ||
                    item.rewardCategoryName ||
                    "بدون عنوان"}
                </span>
                {(item.address || item.voiceAddress) && (
                  <audio controls style={{ height: "30px", width: "160px" }}>
                    <source
                      src={`https://totivar.com/${
                        item.address || item.voiceAddress
                      }`}
                      type="audio/mpeg"
                    />
                  </audio>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default function Ravand() {
  const [isOpen, setIsOpen] = useState(false);
  const [voices, setVoices] = useState([]);
  const [sentences, setSentences] = useState([]);
  const [canvasItems, setCanvasItems] = useState([]); // ✅ فقط یک لیست
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

  // ===== Drag از سمت چپ =====
  const handleDragItem = (items, type, e) => {
    const withUid = items.map((i) => ({
      ...i,
      uid: Date.now() + Math.random(),
      itemType: type === "Voices" ? "Guide" : "Sentence",
    }));
    e.dataTransfer.setData("items", JSON.stringify(withUid));
  };

  // ===== Drop روی کانواس =====
  const handleDrop = (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("items");
    if (!data) return;
    const items = JSON.parse(data);
    setCanvasItems((prev) => [...prev, ...items]);
  };

  // ===== حذف آیتم =====
  const removeItem = (uid) => {
    setCanvasItems((prev) => prev.filter((i) => i.uid !== uid));
  };

  // ===== Drag & Drop داخلی =====
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("dragIndex", index);
  };

  const handleDropReorder = (e, index) => {
    e.preventDefault();
    const dragIndex = e.dataTransfer.getData("dragIndex");
    if (dragIndex === null) return;
    const updated = [...canvasItems];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);
    setCanvasItems(updated);
  };

  // ===== ذخیره روند =====
  const saveTrend = async () => {
    if (!trendName.trim()) {
      alert("لطفاً نام روند را وارد کنید!");
      return;
    }

    // 🔹 جدا کردن آیتم‌ها بر اساس نوع‌شان
    const guides = canvasItems
      .filter((i) => i.itemType === "Guide")
      .map((v, index) => ({
        GuideId: v.id,
        Order: index + 1,
      }));

    const sentencesList = canvasItems
      .filter((i) => i.itemType === "Sentence")
      .map((s, index) => ({
        SentenceId: s.id,
        Order: index + 1,
      }));

    const firstSentence = sentencesList.length
      ? canvasItems.find((i) => i.itemType === "Sentence")
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
      await api.post("trends", payload);
      alert("روند با موفقیت ذخیره شد!");
      setCanvasItems([]);
      setTrendName("");
    } catch (err) {
  console.error("خطای ذخیره روند:", err.response?.data || err.message);
  alert("خطا در ذخیره روند!");
    }
  };

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
          {/* لیست آیتم‌های سمت چپ */}
          <div className="col-md-4">
            <ItemList
              title="Voices"
              items={voices}
              onDragItem={(items, group, e) =>
                handleDragItem(items, "Voices", e)
              }
            />
            <ItemList
              title="Sentences"
              items={sentences}
              onDragItem={(items, group, e) =>
                handleDragItem(items, "Sentences", e)
              }
            />
          </div>

          {/* Canvas */}
          <div
            className="col-md-8 border p-3"
            style={{ minHeight: "500px" }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <h5>Canvas (لیست خطی)</h5>

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
                <option value={0}>لطفا نوع روند را انتخاب کنید</option>
                <option value={1}>مرور</option>
                <option value={2}>آزمون</option>
              </select>
              <button className="btn btn-success mt-2" onClick={saveTrend}>
                ذخیره روند
              </button>
            </div>

            {canvasItems.length === 0 ? (
              <div className="text-muted">آیتمی اضافه نشده است</div>
            ) : (
              <ul className="list-group">
                {canvasItems.map((item, index) => (
                  <li
                    key={item.uid}
                    className="list-group-item d-flex justify-content-between align-items-center"
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDrop={(e) => handleDropReorder(e, index)}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <span>
                      {item.text ||
                        item.guideCategoryName ||
                        item.rewardCategoryName ||
                        "بدون عنوان"}{" "}
                      <small className="text-muted">
                        ({item.itemType === "Guide" ? "راهنما" : "جمله"})
                      </small>
                    </span>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => removeItem(item.uid)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
