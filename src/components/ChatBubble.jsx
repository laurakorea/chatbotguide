import React from 'react';
import { ChevronRight, Play } from 'lucide-react';

const ChatBubble = ({ message, onOptionClick, isUser, isTyping }) => {
    const kiaraProfile = "https://static.tourlive.co.kr/static/tour/2020/05/13/guide_thumb/a052ba389fb111ea8adb02420a000099/image/guide_yoonjung.jpg";

    if (isTyping) {
        return (
            <div className="flex items-start gap-1.5 mb-2">
                <img src={kiaraProfile} alt="K" className="profile-img" />
                <div className="flex flex-col">
                    <span className="text-[12px] text-[#424242] mb-[3px] ml-1 font-medium">가이드 키아라</span>
                    <div className="bubble-base bubble-guide flex gap-1 items-center">
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                </div>
            </div>
        );
    }

    if (isUser) {
        return (
            <div className="flex justify-end mb-2">
                <div className="bubble-base bubble-user">
                    {message.value}
                </div>
            </div>
        );
    }

    const { type, value, caption, options } = message;
    const isActionOption = options && options.some(opt => opt.label.includes('도착') || opt.label.includes('확인'));

    return (
        <div className="flex flex-col gap-1.5 mb-3">
            <div className="flex items-start gap-1.5">
                {type === 'text' && (
                    <img src={kiaraProfile} alt="K" className="profile-img" />
                )}

                <div className={`flex flex-col ${type !== 'text' ? 'w-full' : 'max-w-[85%]'}`}>
                    {type === 'text' && <span className="text-[12px] text-[#424242] mb-[3px] ml-1 font-medium">가이드 키아라</span>}

                    {type === 'image' && (
                        <div className="media-card">
                            <div className="media-overlay">
                                <Play size={10} fill="white" /> MOVEMENT GUIDE
                            </div>
                            <img src={value} alt={caption} />
                            {caption && <div className="media-caption">{caption}</div>}
                        </div>
                    )}

                    {type === 'video' && (
                        <div className="media-card">
                            <video src={value} controls playsInline />
                            {caption && <div className="media-caption">{caption}</div>}
                        </div>
                    )}

                    {type === 'text' && (
                        <div className="bubble-base bubble-guide">
                            {value}
                        </div>
                    )}
                </div>
            </div>

            {/* Always force ALL options to the right side of the screen */}
            {options && (
                <div className="flex flex-col items-end gap-2 mt-1 w-full pl-10">
                    {options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => onOptionClick && onOptionClick(opt)}
                            className="bubble-base bubble-option-yellow"
                        >
                            <span className="flex-1 text-left">{opt.label}</span>
                            {isActionOption && <ChevronRight size={14} className="chevron-icon ml-2 flex-shrink-0" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChatBubble;
