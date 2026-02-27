import React, { memo } from 'react';
import { Handle, Position, getSmoothStepPath, EdgeLabelRenderer, useReactFlow } from 'reactflow';
import { MessageCircle, X } from 'lucide-react';
import styles from './VisualEditor.module.css';

export const LogicEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    label,
    selected
}) => {
    const { setEdges } = useReactFlow();
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetPosition,
        targetX,
        targetY,
        borderRadius: 12
    });

    const onEdgeClick = (evt) => {
        evt.stopPropagation();
        setEdges((edges) => edges.filter((edge) => edge.id !== id));
    };

    return (
        <>
            <path
                id={id}
                style={style}
                className={`react-flow__edge-path ${selected ? styles.selectedEdge : ''}`}
                d={edgePath}
                markerEnd={markerEnd}
            />
            {(selected || style.opacity === 1) && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            fontSize: 10,
                            pointerEvents: 'all',
                        }}
                        className="nodrag nopan"
                    >
                        <div className={styles.edgeLabelContainer}>
                            {label && <span className={styles.edgeLabelText}>{label}</span>}
                            <button className={styles.edgeDeleteBtn} onClick={onEdgeClick}>
                                <X size={10} />
                            </button>
                        </div>
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
};

export const ChatNode = memo(({ data, selected }) => {
    return (
        <div className={`${styles.customNode} ${selected ? styles.selectedNode : ''}`}>
            {/* Multi-directional Handles - Vertical Optimized */}
            <Handle type="target" position={Position.Bottom} id="target-bottom" className={`${styles.nodeHandle} ${styles.primaryHandle}`} />
            <Handle type="target" position={Position.Top} id="target-top" className={styles.nodeHandle} />
            <Handle type="target" position={Position.Left} id="target-left" className={styles.nodeHandle} />
            <Handle type="target" position={Position.Right} id="target-right" className={styles.nodeHandle} />

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

            <Handle type="source" position={Position.Top} id="source-top" className={`${styles.nodeHandle} ${styles.primaryHandle}`} />
            <Handle type="source" position={Position.Bottom} id="source-bottom" className={styles.nodeHandle} />
            <Handle type="source" position={Position.Left} id="source-left" className={styles.nodeHandle} />
            <Handle type="source" position={Position.Right} id="source-right" className={styles.nodeHandle} />
        </div>
    );
});

export const QuizNode = memo(({ data, selected }) => {
    const correctCount = data.options?.filter(o => o.isCorrect).length || 0;
    const wrongCount = (data.options?.length || 0) - correctCount;

    return (
        <div className={`${styles.customNode} ${selected ? styles.selectedNode : ''}`}>
            <Handle type="target" position={Position.Bottom} id="target-bottom" className={`${styles.nodeHandle} ${styles.primaryHandle}`} />
            <Handle type="target" position={Position.Top} id="target-top" className={styles.nodeHandle} />
            <Handle type="target" position={Position.Left} id="target-left" className={styles.nodeHandle} />
            <Handle type="target" position={Position.Right} id="target-right" className={styles.nodeHandle} />

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

            <Handle type="source" position={Position.Top} id="source-top" className={`${styles.nodeHandle} ${styles.primaryHandle}`} />
            <Handle type="source" position={Position.Bottom} id="source-bottom" className={styles.nodeHandle} />
            <Handle type="source" position={Position.Left} id="source-left" className={styles.nodeHandle} />
            <Handle type="source" position={Position.Right} id="source-right" className={styles.nodeHandle} />
        </div>
    );
});
export const SpotNode = ChatNode;
