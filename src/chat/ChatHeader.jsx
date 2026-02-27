import React from 'react';
import { Map as MapIcon } from 'lucide-react';
import styles from './Chat.module.css';

const ChatHeader = ({ spotName, quizScore, progress, onOpenMap }) => {
    return (
        <div className={styles.chatHeader}>
            <div className="flex items-center justify-between w-full">
                <div className="w-8"></div> {/* Spacer */}
                <h1 className="text-[17px] font-bold text-center flex-1">{spotName || "투어 시작"}</h1>
                <button
                    onClick={onOpenMap}
                    className="w-10 h-10 flex items-center justify-center text-[#007AFF] hover:bg-gray-100 rounded-full transition-colors"
                >
                    <MapIcon size={22} />
                </button>
            </div>

            <div className={styles.progressBarContainer}>
                <div className={styles.progressBar} style={{ width: `${progress}%` }} />
            </div>

            <div className={styles.scorePill}>
                Quiz Score <span className={styles.scoreNumber}>{quizScore || 0}</span> / 3
            </div>
        </div>
    );
};

export default ChatHeader;
