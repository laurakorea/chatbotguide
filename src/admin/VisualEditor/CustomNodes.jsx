import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { MessageCircle } from 'lucide-react';
import styles from './VisualEditor.module.css';

export const ChatNode = memo(({ data, selected }) => {
    return (
        <div className={`${styles.customNode} ${selected ? styles.selectedNode : ''}`}>
            <Handle type="target" position={Position.Top} className={styles.nodeHandle} />

            <div className={`${styles.nodeHeader} ${styles.chatHeader}`}>
                <MessageCircle size={14} /> CHAT
            </div>
            <div className={styles.nodeTitle}>{data.label || 'New Message'}</div>

            <div className={styles.nodeFooter}>
                <div className={styles.nodeStats}>
                    <span>{data.contents?.length || 0} Blocks</span>
                    <span className={styles.exitBadge}>{data.options?.length || 0} Exits</span>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className={styles.nodeHandle} />
        </div>
    );
});

export const QuizNode = memo(({ data, selected }) => {
    const correctCount = data.options?.filter(o => o.isCorrect).length || 0;
    const wrongCount = (data.options?.length || 0) - correctCount;

    return (
        <div className={`${styles.customNode} ${selected ? styles.selectedNode : ''}`}>
            <Handle type="target" position={Position.Top} className={styles.nodeHandle} />

            <div className={`${styles.nodeHeader} ${styles.quizHeader}`}>
                <div className="w-4 h-4 rounded-full bg-[#5856D6] text-white flex items-center justify-center text-[10px] font-black">Q</div>
                QUIZ
            </div>
            <div className={styles.nodeTitle}>{data.label || 'New Quiz Question'}</div>

            <div className={styles.nodeFooter}>
                <div className={styles.nodeStats}>
                    <div className="flex gap-2 text-[10px]">
                        <span className="flex items-center gap-0.5 text-green-600 font-bold">
                            ✅ {correctCount}
                        </span>
                        <span className="flex items-center gap-0.5 text-gray-400">
                            ❌ {wrongCount}
                        </span>
                    </div>
                    <span className={styles.exitBadge}>{data.options?.length || 0} Exits</span>
                </div>
                {data.options?.some(o => o.feedback) && (
                    <div className="mt-2 pt-2 border-t border-gray-50 text-[10px] text-blue-500 italic truncate">
                        Feedback configured
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} className={styles.nodeHandle} />
        </div>
    );
});
export const SpotNode = ChatNode;
