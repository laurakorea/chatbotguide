import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { CornerDownRight } from 'lucide-react';
import tourData from './data/tourData.json';
import ChatHeader from './components/MapHeader'; // Will rename component later
import ChatBubble from './components/ChatBubble';

import ChatMap from './components/ChatMap';

const App = () => {
  const [currentNodeId, setCurrentNodeId] = useState("intro");
  const [messageHistory, setMessageHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [quizScore, setQuizScore] = useState(0);

  const scrollRef = useRef(null);

  const currentNode = tourData.flow.find(n => n.id === currentNodeId);

  // Sequence Logic
  useEffect(() => {
    let isMounted = true;
    const node = currentNode;
    if (!node) return;

    const addItems = async () => {
      const contents = node.contents || [];
      const options = node.options || [];

      for (let i = 0; i < contents.length; i++) {
        if (!isMounted) return;
        const isLast = i === contents.length - 1;

        if (contents[i].type === 'text') {
          setIsTyping(true);
          await new Promise(r => setTimeout(r, 600));
          setIsTyping(false);
        } else {
          await new Promise(r => setTimeout(r, 400));
        }

        if (!isMounted) return;
        setMessageHistory(prev => [...prev, {
          ...contents[i],
          sender: 'kiara',
          options: isLast ? options : null
        }]);
        await new Promise(r => setTimeout(r, 200));
      }
    };

    addItems();
    return () => { isMounted = false; };
  }, [currentNodeId]);

  const handleOptionClick = async (option, index) => {
    const { label, target, isCorrect } = option;

    setMessageHistory(prev => {
      const next = [...prev];
      if (next[index]) next[index] = { ...next[index], options: null };
      return next;
    });

    setMessageHistory(prev => [...prev, { value: label, sender: 'user', type: 'text' }]);
    await new Promise(r => setTimeout(r, 400));

    if (isCorrect) {
      setQuizScore(s => s + 1);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    if (target) setCurrentNodeId(target);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messageHistory, isTyping]);

  const [isMapOpen, setIsMapOpen] = useState(false);

  const progressPercent = ((tourData.flow.findIndex(n => n.id === currentNodeId) + 1) / tourData.flow.length) * 100;

  const allSpots = tourData.flow.filter(node => node.coords && node.spotName);

  const startTourAt = async (spotId) => {
    const node = tourData.flow.find(n => n.id === spotId);
    if (!node) return;

    // Close the map modal when starting a tour
    setIsMapOpen(false);

    // Add a greeting from Kiara when jumping from map
    setMessageHistory(prev => [...prev, {
      value: `좋아요! 여기는 ${node.spotName}입니다. 설명을 시작할까요?`,
      sender: 'kiara',
      type: 'text'
    }]);

    setCurrentNodeId(spotId);
  };

  return (
    <div className="layout-wrapper">
      {/* 1. Header: Fixed/Sticky at the top */}
      <ChatHeader
        spotName={currentNode?.spotName}
        quizScore={quizScore}
        progress={progressPercent}
        onOpenMap={() => setIsMapOpen(true)}
      />

      {/* 2. Main Chat Area - Occupies full space when map is hidden */}
      <div className="chat-pane">
        <div className="main-container">
          <div className="scrollable-chat">
            {messageHistory.map((m, i) => (
              <ChatBubble
                key={i}
                message={m}
                isUser={m.sender === 'user'}
                onOptionClick={(opt) => handleOptionClick(opt, i)}
              />
            ))}
            {isTyping && <ChatBubble isTyping={true} />}
            <div ref={scrollRef} className="h-1" />
          </div>

          <div className="bottom-bar">
            <div className="bottom-bar-content">
              <div className="input-container">
                <input
                  className="chat-input"
                  placeholder="AI 키아라에게 질문하세요!"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                />
              </div>
              <button className="send-button-circle">
                <CornerDownRight size={20} />
              </button>
            </div>
            <p className="bottom-disclaimer">지식 가이드 키아라가 실시간으로 답변해 드립니다.</p>
          </div>
        </div>
      </div>

      {/* 3. Map Modal - Overlays the screen */}
      {isMapOpen && (
        <div className="map-modal-overlay" onClick={() => setIsMapOpen(false)}>
          <div className="map-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="map-modal-header">
              <h2 className="text-[16px] font-bold">투어 지도</h2>
              <button
                onClick={() => setIsMapOpen(false)}
                className="close-modal-btn"
              >
                닫기
              </button>
            </div>
            <div className="map-modal-body">
              <ChatMap
                coords={currentNode?.coords}
                currentNodeId={currentNodeId}
                allSpots={allSpots}
                onStartTour={startTourAt}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
