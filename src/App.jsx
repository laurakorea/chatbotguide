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

  const progressPercent = ((tourData.flow.findIndex(n => n.id === currentNodeId) + 1) / tourData.flow.length) * 100;

  return (
    <div className="layout-wrapper">
      {/* Map Pane - Left or Top */}
      <div className="map-pane">
        <ChatMap coords={currentNode?.coords} />
      </div>

      {/* Chat Pane - Right or Bottom */}
      <div className="chat-pane">
        <div className="main-container">
          <ChatHeader
            spotName={currentNode?.spotName}
            quizScore={quizScore}
            progress={progressPercent}
          />

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
    </div>
  );
};

export default App;
