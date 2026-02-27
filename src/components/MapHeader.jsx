import React from 'react';

const ChatHeader = ({ spotName, quizScore, progress }) => {
    return (
        <div className="chat-header">
            <h1 className="text-[17px] font-bold text-[#191919]">{spotName || "투어 시작"}</h1>

            {/* Progress Bar */}
            <div className="progress-container">
                <div className="progress-bar" style={{ width: `${progress}%` }} />
            </div>

            {/* Score Pill */}
            <div className="score-pill">
                QUIZ SCORE <span className="score-number">{quizScore || 0}</span> <span className="score-total">/ 3</span>
            </div>
        </div>
    );
};

export default ChatHeader;
