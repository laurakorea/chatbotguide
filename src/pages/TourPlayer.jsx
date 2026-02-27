import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CornerDownRight, ArrowLeft } from 'lucide-react';
import ChatHeader from '../components/MapHeader';
import ChatBubble from '../components/ChatBubble';
import ChatMap from '../components/ChatMap';

const TourPlayer = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [tourData, setTourData] = useState(null);
    const [currentNodeId, setCurrentNodeId] = useState("intro");
    const [messageHistory, setMessageHistory] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [aiInput, setAiInput] = useState("");
    const [quizScore, setQuizScore] = useState(0);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const scrollRef = useRef(null);

    // Load Tour Data
    useEffect(() => {
        const savedTours = JSON.parse(localStorage.getItem('tours') || '[]');
        const tour = savedTours.find(t => t.slug === slug);

        if (tour) {
            try {
                const parsedData = typeof tour.jsonData === 'string' ? JSON.parse(tour.jsonData) : tour.jsonData;
                setTourData(parsedData);
            } catch (e) {
                console.error("JSON Parsing Error", e);
            }
        }
    }, [slug]);

    const currentNode = tourData?.flow?.find(n => n.id === currentNodeId);

    // Sequence Logic
    useEffect(() => {
        if (!tourData || !currentNode) return;

        let isMounted = true;
        const node = currentNode;

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
    }, [currentNodeId, tourData]);

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

    if (!tourData) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#BACEE0] p-10 text-center">
                <h2 className="text-xl font-bold mb-4">투어를 찾을 수 없습니다.</h2>
                <button
                    onClick={() => navigate('/')}
                    className="bg-white px-6 py-2 rounded-full font-bold shadow-sm"
                >
                    홈으로 이동
                </button>
            </div>
        );
    }

    const progressPercent = ((tourData.flow.findIndex(n => n.id === currentNodeId) + 1) / tourData.flow.length) * 100;
    const allSpots = tourData.flow.filter(node => node.coords && node.spotName);

    const startTourAt = async (spotId) => {
        const node = tourData.flow.find(n => n.id === spotId);
        if (!node) return;
        setIsMapOpen(false);
        setMessageHistory(prev => [...prev, {
            value: `좋아요! 여기는 ${node.spotName}입니다. 설명을 시작할까요?`,
            sender: 'kiara',
            type: 'text'
        }]);
        setCurrentNodeId(spotId);
    };

    return (
        <div className="layout-wrapper">
            <ChatHeader
                spotName={currentNode?.spotName}
                quizScore={quizScore}
                progress={progressPercent}
                onOpenMap={() => setIsMapOpen(true)}
            />

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

            {isMapOpen && (
                <div className="map-modal-overlay" onClick={() => setIsMapOpen(false)}>
                    <div className="map-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="map-modal-header">
                            <h2 className="text-[16px] font-bold">투어 지도</h2>
                            <button onClick={() => setIsMapOpen(false)} className="close-modal-btn">닫기</button>
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

export default TourPlayer;
