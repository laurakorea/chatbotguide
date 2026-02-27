import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { MapPin, HelpCircle } from 'lucide-react';
import styles from './VisualEditor.module.css';

export const SpotNode = memo(({ data, selected }) => {
    return (
        <div className={`${styles.customNode} ${selected ? styles.selectedNode : ''}`}>
            <Handle type="target" position={Position.Left} className={styles.nodeHandle} />

            <div className={`${styles.nodeHeader} ${styles.spotHeader}`}>
                <MapPin size={12} /> SPOT
            </div>
            <div className={styles.nodeTitle}>{data.label || 'New Spot'}</div>

            <div className="mt-2 text-[10px] text-gray-400 flex justify-between">
                <span>{data.contents?.length || 0} Contents</span>
                <span>{data.options?.length || 0} Exits</span>
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
                <HelpCircle size={12} /> QUIZ
            </div>
            <div className={styles.nodeTitle}>{data.label || 'New Quiz'}</div>

            <div className="mt-2 text-[10px] text-gray-400">
                {data.options?.filter(o => o.isCorrect).length > 0 ? '✅ Answers Set' : '❌ No Ans'}
            </div>

            <Handle type="source" position={Position.Right} className={styles.nodeHandle} />
        </div>
    );
});
