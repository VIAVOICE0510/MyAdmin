import React, { useEffect, useRef, useState } from "react";
import { DataSet } from "vis-data";
import { Timeline } from "vis-timeline/standalone";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import api from "./api/axios";

export default function VerticalTimeline() {
  const timelineRef = useRef(null);
  const timeline = useRef(null);
  const items = useRef(new DataSet());

  const [trendGroups, setTrendGroups] = useState({
    guides: [],      // آرایه ویس‌ها
    sentences: []    // آرایه جملات
  });
  const [currentSentence, setCurrentSentence] = useState("");

  useEffect(() => {
    api.get("trends/26")
      .then((res) => {
        if (res.data) {
          // console.log(res.data);
          setTrendGroups({
            guides: res.data.guides || [],
            sentences: res.data.sentences || []
          });
        }
      })
      .catch((err) => console.error(err));

    const options = {
      orientation: { axis: "vertical", item: "center" },
      zoomable: true,
      moveable: true,
      showCurrentTime: true,
      verticalScroll: true,
      minHeight: "100%",
      maxHeight: "100%",
      margin: { item: 20, axis: 40 },
      editable: false,
      multiselect: false
    };

    timeline.current = new Timeline(timelineRef.current, items.current, options);

    const style = document.createElement("style");
    style.innerHTML = `
      .vis-time-axis .vis-grid { display: none !important; }
      .vis-panel.vis-center { border-left: 3px solid #007bff !important; background: #fff !important; }
      .vis-item { background-color: #dbeafe !important; border: 2px solid #3b82f6 !important; color: #1e3a8a !important; }
      .vis-item.vis-dot { background-color: #2563eb !important; border: 3px solid white !important; box-shadow: 0 0 0 3px #93c5fd !important; }
      .vis-current-time { background-color: #f97316 !important; width: 3px !important; }
    `;
    document.head.appendChild(style);

    return () => timeline.current?.destroy();
  }, []);

  const speakSentence = (sentence, callback) => {
    if (!sentence) { callback && callback(); return; }
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.onend = () => callback && callback();
    window.speechSynthesis.speak(utterance);
  };

  const playVoice = (url, callback) => {
    if (!url) { callback && callback(); return; }
    const audio = new Audio(`https://totivar.com/${url}`);
    audio.play();
    audio.onended = callback;
  };

const startTrend = () => {
  const { guides, sentences } = trendGroups;
  if (!guides.length && !sentences.length) return;

  // روند فقط به اندازه جملات ادامه دارد
  const totalSteps = sentences.length;

  let step = 0;

  const playNext = () => {
    if (step >= totalSteps)
    {
      alert("پایان روند");
      return; // ✅ وقتی همه جملات تموم شدن، روند متوقف میشه
    }

    const currentVoice = guides[step % guides.length];      
    const currentSentenceObj = sentences[step]; // ✅ هر بار جمله به ترتیب خودش

    // 1️⃣ پخش ویس
    playVoice(currentVoice?.guideAddress, () => {
      // 2️⃣ نمایش و خواندن جمله
      setCurrentSentence(currentSentenceObj?.sentenceText || "");
      
      speakSentence(currentSentenceObj?.sentenceText || "", () => {
        items.current.add({
          id: Date.now(),
          content: currentSentenceObj?.sentenceText || "",
          start: new Date(),
        });
        timeline.current.moveTo(new Date());

        step++;
        setTimeout(playNext, 300); // فاصله بین مراحل
      });
    });
  };

  playNext();
};


  return (
    <div className="mt-4">
      <div
        ref={timelineRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          borderRight: "2px solid #ddd",
          background: "#fff",
          boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
          overflowY: "auto",
          zIndex: 10,
        }}
      />
      <div style={{ marginLeft: "370px", marginTop: "20px", fontSize: "20px" }}>
        {currentSentence}
      </div>
      <button
        className="btn btn-primary mt-3"
        onClick={startTrend}
        style={{ marginLeft: "370px" }}
      >
        Start Trend
      </button>
    </div>
  );
}
