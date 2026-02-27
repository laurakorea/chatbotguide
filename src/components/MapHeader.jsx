import { Map as MapIcon } from 'lucide-react';

const ChatHeader = ({ spotName, quizScore, progress, onOpenMap }) => {
    return (
        <div className="chat-header">
            <div className="flex items-center justify-between w-full px-4">
                <div className="w-8"></div> {/* Spacer for symmetry if needed, or back button */}
                <h1 className="text-[17px] font-bold text-[#191919] flex-1 text-center">{spotName || "투어 시작"}</h1>
                <button
                    onClick={onOpenMap}
                    className="w-8 h-8 flex items-center justify-center text-[#555] hover:bg-gray-100 rounded-full transition-colors"
                >
                    <MapIcon size={22} />
                </button>
            </div>

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
