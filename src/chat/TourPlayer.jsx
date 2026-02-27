import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Send } from 'lucide-react';
import ChatHeader from './ChatHeader';
import ChatBubble from './ChatBubble';
import ChatMap from './ChatMap';
import styles from './Chat.module.css';

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
            <div className={styles.appleChatTheme}>
                <div className="flex flex-col items-center justify-center h-screen p-10 text-center">
                    <h2 className="text-2xl font-bold mb-4 tracking-tight">투어를 찾을 수 없습니다.</h2>
                    <p className="text-gray-500 mb-8">목록에서 다시 시도해 주세요.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-[#F2F2F7] text-[#007AFF] px-8 py-3 rounded-xl font-bold"
                    >
                        관리자 목록으로 이동
                    </button>
                </div>
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
        <div className={styles.appleChatTheme}>
            <div className={styles.layoutWrapper}>
                <ChatHeader
                    spotName={currentNode?.spotName}
                    quizScore={quizScore}
                    progress={progressPercent}
                    onOpenMap={() => setIsMapOpen(true)}
                />

                <div className={styles.scrollableChat}>
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

                <div className={styles.bottomBar}>
                    <div className={styles.inputContainer}>
                        <input
                            className={styles.chatInput}
                            placeholder="질문을 입력하세요..."
                            value={aiInput}
                            onChange={(e) => setAiInput(e.target.value)}
                        />
                        <button className={styles.sendButton}>
                            <Send size={18} />
                        </button>
                    </div>
                    <p className={styles.disclaimer}>가이드 키아라가 실시간으로 답변합니다.</p>
                </div>

                {isMapOpen && (
                    <div className={styles.modalOverlay} onClick={() => setIsMapOpen(false)}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2 className="text-[17px] font-bold">투어 지도</h2>
                                <button onClick={() => setIsMapOpen(false)} className="text-[#007AFF] font-bold">닫기</button>
                            </div>
                            <div className="flex-1">
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
        </div>
    );
};

export default TourPlayer;
