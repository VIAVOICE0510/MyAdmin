import React, { useEffect, useRef, useState } from "react";
import { DataSet } from "vis-data";
import { Timeline } from "vis-timeline/standalone";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import api from "./api/axios";

export default function VerticalTimeline() {
  const timelineRef = useRef(null);
  const timeline = useRef(null);
  const [trendSentences, setTrendSentences] = useState([]);
  const [trendGuides, setTrendGuides] = useState([]);
  const [currentSentence, setCurrentSentence] = useState("");
  const items = useRef(new DataSet());

  useEffect(() => {
    // 🟦 گرفتن روند از API
    api
      .get("trends/19")
      .then((res) => {
        if (res.data) {
          setTrendSentences(res.data.sentences || []);
          setTrendGuides(res.data.guides || []);
        }
      })
      .catch((err) => console.error(err));

    // 🟦 ایجاد تایم‌لاین
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
      multiselect: false,
    };

    timeline.current = new Timeline(timelineRef.current, items.current, options);

    // ✳️ استایل‌ها
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

  // 🟦 تابع خواندن جمله
  const speakSentence = (sentence, callback) => {
    if (!sentence) {
      callback && callback();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.onend = () => {
      callback && callback();
    };

    window.speechSynthesis.speak(utterance);
  };

  // 🟦 شروع پخش روند
  const startTrend = () => {
    let index = 0;

    const playNext = () => {
      if (index >= trendSentences.length) return; // پایان روند

      const voiceUrl = trendGuides[index];

      // 1️⃣ پخش ویس
      if (voiceUrl) {
        const audio = new Audio(`https://totivar.com/${voiceUrl}`);
        audio.play();
        audio.onended = () => showSentence();
      } else {
        showSentence();
      }

      // 2️⃣ نمایش و خواندن جمله
      function showSentence() {
        const sentence = trendSentences[index];
        setCurrentSentence(sentence);

        speakSentence(sentence, () => {
          items.current.add({
            id: Date.now(),
            content: sentence,
            start: new Date(),
          });
          timeline.current.moveTo(new Date());

          index++;
          setTimeout(playNext, 5000); // فاصله ۵ ثانیه بین جملات
        });
      }
    };

    playNext();
  };

  return (
    <div>
      {/* تایم لاین */}
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

      {/* جمله فعلی */}
      <div style={{ marginLeft: "370px", marginTop: "20px", fontSize: "20px" }}>
        {currentSentence}
      </div>

      {/* دکمه شروع روند */}
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
