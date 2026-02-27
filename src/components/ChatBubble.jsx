import React from 'react';
import { ChevronRight, PlayCircle, HelpCircle } from 'lucide-react';

const ChatBubble = ({ message, isUser, onOptionClick, isTyping }) => {
    if (isTyping) {
        return (
            <div className="flex flex-col mb-4">
                <span className="kiara-label">가이드 키아라</span>
                <div className="bubble-base bubble-guide animate-pulse">
                    <div className="flex gap-1" style={{ padding: '4px 0' }}>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    const { sender, type, value, options, mediaUrl } = message;
    const isGuide = sender === 'kiara';

    return (
        <div className={`flex flex-col mb-4 w-full ${isUser ? 'items-end' : 'items-start'}`}>
            {isGuide && <span className="kiara-label">가이드 키아라</span>}

            {type === 'media' && mediaUrl && (
                <div className="media-card animate-ios-entry">
                    <div className="media-overlay">
                        <PlayCircle size={14} /> MEDIA GUIDE
                    </div>
                    {mediaUrl.endsWith('.mp4') ? (
                        <video src={mediaUrl} controls playsInline />
                    ) : (
                        <img src={mediaUrl} alt="Tour Media" />
                    )}
                    {value && <div className="media-caption">{value}</div>}
                </div>
            )}

            {type === 'text' && value && (
                <div className={`bubble-base ${isUser ? 'bubble-user' : 'bubble-guide'} animate-ios-entry`}>
                    {value}
                </div>
            )}

            {options && options.length > 0 && (
                <div className="options-container w-[80%]">
                    {options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => onOptionClick(opt)}
                            className="option-pill animate-ios-entry"
                            style={{ animationDelay: `${idx * 0.1}s` }}
                        >
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <HelpCircle size={16} className="text-blue-400" />
                                    {opt.label}
                                </span>
                                <ChevronRight size={18} className="opacity-30" />
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChatBubble;
