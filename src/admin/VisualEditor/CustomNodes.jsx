import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { MessageCircle } from 'lucide-react';
import styles from './VisualEditor.module.css';

export const ChatNode = memo(({ data, selected }) => {
    return (
        <div className={`${styles.customNode} ${selected ? styles.selectedNode : ''}`}>
            <Handle type="target" position={Position.Left} className={styles.nodeHandle} />

            <div className={`${styles.nodeHeader} ${styles.chatHeader}`}>
                <MessageCircle size={14} /> CHAT
            </div>
            <div className={styles.nodeTitle}>{data.label || 'New Message'}</div>

            <div className="mt-3 text-[11px] text-gray-400 flex justify-between font-medium">
                <span>{data.contents?.length || 0} Blocks</span>
                <span>{data.options?.length || 0} Buttons</span>
            </div>

            <Handle type="source" position={Position.Right} className={styles.nodeHandle} />
        </div>
    );
});

export const QuizNode = memo(({ data, selected }) => {
    return (
        <div className={`${styles.customNode} ${selected ? styles.selectedNode : ''}`}>
            <Handle type="target" position={Position.Left} className={styles.nodeHandle} />

            <div className={`${styles.nodeHeader} ${styles.quizHeader}`}>
                <div className="w-4 h-4 rounded-full bg-[#5856D6] text-white flex items-center justify-center text-[10px] font-black">Q</div>
                QUIZ
            </div>
            <div className={styles.nodeTitle}>{data.label || 'New Quiz Question'}</div>

            <div className="mt-3 text-[11px] text-gray-400 font-medium">
                {data.options?.some(o => o.isCorrect) ? '✅ Answer Configured' : '⚠️ No Correct Answer'}
            </div>

            <Handle type="source" position={Position.Right} className={styles.nodeHandle} />
        </div>
    );
});
export const SpotNode = ChatNode;
