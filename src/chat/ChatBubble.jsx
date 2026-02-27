import React from 'react';
import { ChevronRight, PlayCircle, HelpCircle } from 'lucide-react';
import styles from './Chat.module.css';

const ChatBubble = ({ message, isUser, onOptionClick, isTyping }) => {
    if (isTyping) {
        return (
            <div className={`flex flex-col mb-4 ${styles.fadeIn}`}>
                <span className={styles.kiaraLabel}>가이드 키아라</span>
                <div className={`${styles.bubbleBase} ${styles.bubbleGuide} animate-pulse`}>
                    <div className="flex gap-1.5 py-1">
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
        <div className={`flex flex-col mb-4 w-full ${isUser ? 'items-end' : 'items-start'} ${styles.fadeIn}`}>
            {isGuide && <span className={styles.kiaraLabel}>가이드 키아라</span>}

            {type === 'media' && mediaUrl && (
                <div className={styles.mediaCard}>
                    <div className={styles.mediaOverlay}>
                        Media Guide
                    </div>
                    {mediaUrl.endsWith('.mp4') ? (
                        <video src={mediaUrl} controls playsInline />
                    ) : (
                        <img src={mediaUrl} alt="" />
                    )}
                    {value && <div className={styles.mediaCaption}>{value}</div>}
                </div>
            )}

            {type === 'text' && value && (
                <div className={`${styles.bubbleBase} ${isUser ? styles.bubbleUser : styles.bubbleGuide}`}>
                    {value}
                </div>
            )}

            {options && options.length > 0 && (
                <div className={styles.optionsContainer}>
                    {options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => onOptionClick(opt)}
                            className={styles.optionPill}
                            style={{ animationDelay: `${idx * 0.1}s` }}
                        >
                            <span className="flex items-center gap-3">
                                <HelpCircle size={18} />
                                {opt.label}
                            </span>
                            <ChevronRight size={18} className="opacity-30" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChatBubble;
