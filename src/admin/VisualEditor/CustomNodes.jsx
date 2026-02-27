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
                    <span className={data.options?.some(o => o.isCorrect) ? 'text-green-600 font-bold' : 'text-orange-500'}>
                        {data.options?.some(o => o.isCorrect) ? '✅ Answered' : '⚠️ No Answer'}
                    </span>
                    <span className={styles.exitBadge}>{data.options?.length || 0} Exits</span>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className={styles.nodeHandle} />
        </div>
    );
});
export const SpotNode = ChatNode;
