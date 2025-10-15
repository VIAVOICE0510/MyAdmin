import React, { useState, useEffect } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "bootstrap/dist/css/bootstrap.min.css";

// ===== ItemList =====
const ItemList = ({ title, items, selectedItems, setSelectedItems, onDragItem }) => {
  const [expandedGroups, setExpandedGroups] = useState({});

  const groupedItems = items.reduce((acc, item) => {
    const groupName = item.guideCategoryName || item.rewardCategoryName || item.categoryName || "بدون دسته";
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(item);
    return acc;
  }, {});

  const toggleGroup = (group) => setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));

  const toggleSelectItem = (id) => setSelectedItems(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const selectAll = () => setSelectedItems(items.map(i => i.id));
  const deselectAll = () => setSelectedItems([]);

  return (
    <div className="mb-3">
      <h5>
        {title}{" "}
        {selectedItems.length > 0 && <small className="text-muted">({selectedItems.length} انتخاب شده)</small>}
      </h5>

      <div className="mb-1">
        <button className="btn btn-sm btn-outline-primary me-1" onClick={selectAll}>انتخاب همه</button>
        <button className="btn btn-sm btn-outline-secondary" onClick={deselectAll}>لغو انتخاب</button>
      </div>

      {Object.keys(groupedItems).map(group => {
        const isExpanded = expandedGroups[group] !== false;
        return (
          <div key={group} className="mb-2 border rounded p-1 bg-light">
            <div
              style={{ cursor: "pointer" }}
              className="d-flex justify-content-between align-items-center"
              onClick={() => toggleGroup(group)}
              draggable
              onDragStart={e => onDragItem(groupedItems[group], group, e)}
            >
              <strong>{isExpanded ? "▼" : "▶"} {group}</strong>
              <span className="badge bg-secondary ms-2">{groupedItems[group].length}</span>
            </div>

            {isExpanded && (
              <ul className="list-group mt-1">
                {groupedItems[group].map(item => (
                  <li
                    key={item.id}
                    className="list-group-item d-flex align-items-center justify-content-between"
                    draggable
                    onDragStart={e => onDragItem([item], group, e)}
                  >
                    <div className="d-flex align-items-center">
                      <input
                        type="checkbox"
                        className="me-2"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleSelectItem(item.id)}
                      />
                      <span>{item.text || item.guideCategoryName || item.rewardCategoryName || "بدون عنوان"}</span>
                    </div>
                    {(item.address || item.voiceAddress || item.rewardAddress) && (
                      <audio controls style={{ height: "30px", width: "160px" }}>
                        <source
                          src={`https://localhost:7291/${item.address || item.voiceAddress || item.rewardAddress}`}
                          type="audio/mpeg"
                        />
                      </audio>
                    )}
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

// ===== Ravand =====
export default function Ravand() {
  const [voices, setVoices] = useState([]);
  const [sentences, setSentences] = useState([]);

  const [selectedVoices, setSelectedVoices] = useState([]);
  const [selectedSentences, setSelectedSentences] = useState([]);

  const [canvasGroups, setCanvasGroups] = useState({
    Voices: [],
    Sentences: []
  });

  const [expanded, setExpanded] = useState({
    Voices: true,
    Sentences: true
  });

  const [trendName, setTrendName] = useState("");

  // بارگذاری داده‌ها
  useEffect(() => {
    axios.get("https://localhost:7291/api/guide")
      .then(res => setVoices(res.data.filter(i => !i.isDeleted)))
      .catch(() => {});
    axios.get("https://localhost:7291/api/sentence")
      .then(res => setSentences(res.data.filter(i => !i.isDeleted)))
      .catch(() => {});
  }, []);

  // Drag از سمت چپ
  const handleDragItem = (items, group, e) => {
    const itemsWithUid = items.map(i => ({
      ...i,
      uid: Date.now() + Math.random(),
      sourceGroup: group
    }));
    e.dataTransfer.setData("items", JSON.stringify(itemsWithUid));
  };

  // Drop روی کانواس
  const handleDrop = e => {
    e.preventDefault();
    const data = e.dataTransfer.getData("items");
    if (!data) return;
    const items = JSON.parse(data);

    setCanvasGroups(prev => {
      const next = { ...prev };
      items.forEach(it => {
        if (!next[it.sourceGroup]) next[it.sourceGroup] = [];
        const exists = next[it.sourceGroup].find(x => x.id === it.id);
        if (!exists) next[it.sourceGroup] = [...next[it.sourceGroup], it];
      });
      return next;
    });

    const ids = items.map(i => i.id);
    setVoices(prev => prev.filter(i => !ids.includes(i.id)));
    setSentences(prev => prev.filter(i => !ids.includes(i.id)));
  };

  // برگشت یک آیتم به سمت چپ
const moveToLeft = (item) => {
  const newItem = { ...item };
  delete newItem.uid;
  delete newItem.sourceGroup;

  switch(item.sourceGroup) {
    case "Voices":
      setVoices(prev => {
        if (prev.find(x => x.id === newItem.id)) return prev;
        return [...prev, newItem];
      });
      break;
    case "Sentences":
      setSentences(prev => {
        if (prev.find(x => x.id === newItem.id)) return prev;
        return [...prev, newItem];
      });
      break;
    default: break;
  }
};

  // حذف یک آیتم
const removeItem = (group, uid) => {
  setCanvasGroups(prev => {
    const items = prev[group];
    const itemToRemove = items.find(i => i.uid === uid);
    if (!itemToRemove) return prev;

    moveToLeft(itemToRemove); // برگشت به سمت چپ

    return {
      ...prev,
      [group]: items.filter(i => i.uid !== uid)
    };
  });
};

  // حذف همه در یک گروه
const removeAllInGroup = (group) => {
  setCanvasGroups(prev => {
    const items = prev[group];
    items.forEach(item => moveToLeft(item)); // برگشت همه به چپ
    return { ...prev, [group]: [] };
  });
};
  const toggleExpand = (group) => setExpanded(prev => ({ ...prev, [group]: !prev[group] }));

  // Drag داخل کانواس
  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    if (result.type === "group") {
      const groups = Object.keys(canvasGroups);
      const [moved] = groups.splice(result.source.index, 1);
      groups.splice(result.destination.index, 0, moved);

      const newGroups = {};
      groups.forEach(g => newGroups[g] = canvasGroups[g]);
      setCanvasGroups(newGroups);
    }

    if (result.type === "item") {
      const srcGroup = result.source.droppableId.replace("group-", "");
      const destGroup = result.destination.droppableId.replace("group-", "");

      if (srcGroup === destGroup) {
        const items = Array.from(canvasGroups[srcGroup]);
        const [moved] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, moved);
        setCanvasGroups(prev => ({ ...prev, [srcGroup]: items }));
      }
    }
  };

  // ذخیره روند
  const saveTrend = async () => {
    if (!trendName.trim()) { alert("لطفاً نام روند را وارد کنید!"); return; }

    const payload = {
      Name: trendName,
      SubCategoryId: 1,
      TrendType: 2,
      Sentences: canvasGroups.Sentences.map((s, index) => ({ SentenceId: s.id, Order: index + 1 })),
      Guides: canvasGroups.Voices.map((v, index) => ({ GuideId: v.id, Order: index + 1 })),
    };

    try {
      await axios.post("https://localhost:7291/api/trends", payload);
      alert("روند با موفقیت ذخیره شد!");
      setCanvasGroups({ Voices: [], Rewards: [], Sentences: [] });
      setTrendName("");
    } catch (err) {
      console.error(err);
      alert("خطا در ذخیره روند!");
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        {/* سمت چپ */}
        <div className="col-md-4">
          <ItemList title="Voices" items={voices} selectedItems={selectedVoices} setSelectedItems={setSelectedVoices} onDragItem={handleDragItem} />
          <ItemList title="Sentences" items={sentences} selectedItems={selectedSentences} setSelectedItems={setSelectedSentences} onDragItem={handleDragItem} />
        </div>

        {/* سمت راست (کانواس) */}
        <div className="col-md-8 border p-3" style={{ minHeight: "500px" }}
             onDragOver={e => e.preventDefault()}
             onDrop={handleDrop}>

          <h5>Canvas (گروه‌بندی شده)</h5>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="نام روند را وارد کنید..."
              value={trendName}
              onChange={e => setTrendName(e.target.value)}
            />
            <button className="btn btn-success mt-2" onClick={saveTrend}>ذخیره روند</button>
          </div>

          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="canvas-groups" type="group">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {Object.keys(canvasGroups).map((group, groupIndex) => {
                    const items = canvasGroups[group];
                    const isExpanded = expanded[group] !== false;

                    if (!items || items.length === 0) return null;

                    return (
                      <Draggable key={group} draggableId={group} index={groupIndex}>
                        {(prov) => (
                          <div ref={prov.innerRef} {...prov.draggableProps} className="mb-2 border rounded p-2 bg-light">
                            <div className="d-flex justify-content-between align-items-center"
                                 style={{ cursor: "pointer" }}
                                 {...prov.dragHandleProps}
                                 onClick={() => toggleExpand(group)}>
                              <strong>{isExpanded ? "▼" : "▶"} {group}</strong>
                              <span className="badge bg-secondary ms-2">{items.length}</span>
                              <button className="btn btn-sm btn-danger ms-2" onClick={() => removeAllInGroup(group)}>حذف همه</button>
                            </div>

                            {isExpanded && (
                              <Droppable droppableId={`group-${group}`} type="item">
                                {(providedItem) => (
                                  <ul className="list-group mt-1" ref={providedItem.innerRef} {...providedItem.droppableProps}>
                                    {items.map((item, index) => (
                                      <Draggable key={item.uid} draggableId={String(item.uid)} index={index}>
                                        {(provItem) => (
                                          <li className="list-group-item d-flex justify-content-between align-items-center"
                                              ref={provItem.innerRef} {...provItem.draggableProps} {...provItem.dragHandleProps}>
                                            <span>{item.text || item.guideCategoryName || item.rewardCategoryName || item.categoryName}</span>
                                            <button className="btn btn-sm btn-danger" onClick={() => removeItem(group, item.uid)}>×</button>
                                          </li>
                                        )}
                                      </Draggable>
                                    ))}
                                    {providedItem.placeholder}
                                  </ul>
                                )}
                              </Droppable>
                            )}
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

        </div>
      </div>
    </div>
  );
}
