import React from 'react';
import { Trash2, Plus, Type, Image as ImageIcon, Video } from 'lucide-react';
import styles from './VisualEditor.module.css';

const Inspector = ({ selectedNode, onUpdateNode }) => {
    if (!selectedNode) {
        return (
            <div className={styles.inspector}>
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                    <Type size={32} className="mb-4 opacity-20" />
                    <p className="text-sm">노드를 선택하여<br />편집을 시작하세요.</p>
                </div>
            </div>
        );
    }

    const { data } = selectedNode;

    const updateData = (updates) => {
        onUpdateNode(selectedNode.id, { ...data, ...updates });
    };

    const addContent = () => {
        const newContents = [...(data.contents || []), { type: 'text', value: '' }];
        updateData({ contents: newContents });
    };

    const removeContent = (index) => {
        const newContents = data.contents.filter((_, i) => i !== index);
        updateData({ contents: newContents });
    };

    const updateContent = (index, value) => {
        const newContents = [...data.contents];
        newContents[index] = { ...newContents[index], value };
        updateData({ contents: newContents });
    };

    const addOption = () => {
        const newOptions = [...(data.options || []), { label: '', target: '' }];
        updateData({ options: newOptions });
    };

    const removeOption = (index) => {
        const newOptions = data.options.filter((_, i) => i !== index);
        updateData({ options: newOptions });
    };

    const updateOption = (index, field, value) => {
        const newOptions = [...data.options];
        newOptions[index] = { ...newOptions[index], [field]: value };
        updateData({ options: newOptions });
    };

    return (
        <div className={styles.inspector}>
            <div className={styles.inspectorSection}>
                <h2 className={styles.sectionTitle}>Basic Info</h2>
                <div className={styles.formGroup}>
                    <label className={styles.label}>ID (Unique)</label>
                    <input className={styles.input} value={selectedNode.id} disabled />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Node Label</label>
                    <input
                        className={styles.input}
                        value={data.label || ''}
                        onChange={(e) => updateData({ label: e.target.value })}
                        placeholder="e.g. Colosseum Intro"
                    />
                </div>
                {selectedNode.type === 'chat' && (
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Display Name (Header)</label>
                        <input
                            className={styles.input}
                            value={data.spotName || ''}
                            onChange={(e) => updateData({ spotName: e.target.value })}
                            placeholder="e.g. 1번 스팟: 콜로세움 앞"
                        />
                    </div>
                )}
            </div>

            <div className={styles.inspectorSection}>
                <h2 className={styles.sectionTitle}>Contents</h2>
                {data.contents?.map((content, idx) => (
                    <div key={idx} className={styles.contentItem}>
                        <button className={styles.removeBtn} onClick={() => removeContent(idx)}>×</button>
                        <select
                            className={`${styles.select} mb-2`}
                            value={content.type}
                            onChange={(e) => {
                                const newContents = [...data.contents];
                                newContents[idx] = { ...newContents[idx], type: e.target.value };
                                updateData({ contents: newContents });
                            }}
                        >
                            <option value="text">Text Message</option>
                            <option value="media">Media (Img/Vid)</option>
                        </select>
                        <textarea
                            className={styles.textarea}
                            rows={3}
                            value={content.value}
                            onChange={(e) => updateContent(idx, e.target.value)}
                            placeholder={content.type === 'text' ? "메시지 내용을 입력하세요..." : "이미지/비디오 URL을 입력하세요..."}
                        />
                        {content.type === 'media' && (
                            <input
                                className={`${styles.input} mt-2`}
                                placeholder="Caption (optional)"
                                value={content.caption || ''}
                                onChange={(e) => {
                                    const newContents = [...data.contents];
                                    newContents[idx] = { ...newContents[idx], caption: e.target.value };
                                    updateData({ contents: newContents });
                                }}
                            />
                        )}
                    </div>
                ))}
                <button className={styles.addItemBtn} onClick={addContent}>
                    <Plus size={14} className="inline mr-1" /> Add Content Item
                </button>
            </div>

            <div className={styles.inspectorSection}>
                <h2 className={styles.sectionTitle}>Navigation Options</h2>
                {data.options?.map((opt, idx) => (
                    <div key={idx} className={styles.contentItem}>
                        <button className={styles.removeBtn} onClick={() => removeOption(idx)}>×</button>

                        <div className="flex gap-2 mb-2">
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Button Label</label>
                                <input
                                    className={styles.input}
                                    placeholder="Button Label"
                                    value={opt.label}
                                    onChange={(e) => updateOption(idx, 'label', e.target.value)}
                                />
                            </div>
                            <div className="w-24">
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Target ID</label>
                                <input
                                    className={styles.input}
                                    placeholder="Target ID"
                                    value={opt.target || ''}
                                    onChange={(e) => updateOption(idx, 'target', e.target.value)}
                                />
                            </div>
                        </div>

                        {selectedNode.type === 'quiz' && (
                            <div className="flex items-start gap-3 mt-3">
                                <div className="flex-1 bg-blue-50/50 p-2 rounded border border-dashed border-blue-100">
                                    <label className="text-[10px] font-bold text-blue-500 uppercase mb-1 block">Feedback/Explanation</label>
                                    <textarea
                                        className={`${styles.textarea} bg-white`}
                                        rows={2}
                                        placeholder="선택 시 가이드가 해줄 대답..."
                                        value={opt.feedback || ''}
                                        onChange={(e) => updateOption(idx, 'feedback', e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col items-center pt-5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Correct?</label>
                                    <div
                                        onClick={() => updateOption(idx, 'isCorrect', !opt.isCorrect)}
                                        className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer flex items-center ${opt.isCorrect ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'}`}
                                    >
                                        <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                <button className={styles.addItemBtn} onClick={addOption}>
                    <Plus size={14} className="inline mr-1" /> Add Option
                </button>
            </div>

            {
                selectedNode.type === 'chat' && (
                    <div className={styles.inspectorSection}>
                        <h2 className={styles.sectionTitle}>Location (Map Pin)</h2>
                        <div className="flex gap-2">
                            <input
                                className={styles.input}
                                placeholder="Lat"
                                type="number" step="0.000001"
                                value={data.coords?.lat || ''}
                                onChange={(e) => updateData({ coords: { ...data.coords, lat: parseFloat(e.target.value) } })}
                            />
                            <input
                                className={styles.input}
                                placeholder="Lng"
                                type="number" step="0.000001"
                                value={data.coords?.lng || ''}
                                onChange={(e) => updateData({ coords: { ...data.coords, lng: parseFloat(e.target.value) } })}
                            />
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Inspector;
