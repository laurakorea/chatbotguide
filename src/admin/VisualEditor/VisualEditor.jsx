import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    applyEdgeChanges,
    applyNodeChanges,
    Panel,
    MiniMap,
    ReactFlowProvider,
    useReactFlow,
    updateEdge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Download, Upload, Play, MessageCircle, HelpCircle, Save } from 'lucide-react';
import { ChatNode, QuizNode, SpotNode, LogicEdge } from './CustomNodes';
import Inspector from './Inspector';
import styles from './VisualEditor.module.css';

const RF_SPACING_X = 150;
const RF_SPACING_Y = 150;

const nodeTypes = {
    chat: ChatNode,
    quiz: QuizNode,
    spot: SpotNode
};

const edgeTypes = {
    logic: LogicEdge
};

const initialNodes = [
    {
        id: 'intro',
        type: 'chat',
        position: { x: 100, y: 100 },
        data: { label: 'Intro Chat', contents: [{ type: 'text', value: 'Welcome!' }], options: [] }
    }
];

const InnerVisualEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fitView } = useReactFlow();
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [tourTitle, setTourTitle] = useState("New Tour Project");
    const [isLoading, setIsLoading] = useState(false);

    // 🚀 Undo/Redo & History State
    const [history, setHistory] = useState({ past: [], future: [] });
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2000);
    }, []);

    const saveHistory = useCallback(() => {
        setHistory(prev => ({
            past: [...prev.past.slice(-20), { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }],
            future: []
        }));
    }, [nodes, edges]);

    const undo = useCallback(() => {
        if (history.past.length === 0) return;
        const previous = history.past[history.past.length - 1];
        const newPast = history.past.slice(0, history.past.length - 1);

        setHistory({
            past: newPast,
            future: [{ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }, ...history.future]
        });

        setNodes(previous.nodes);
        setEdges(previous.edges);
        showToast("되돌리기 (Undo)");
    }, [history, nodes, edges, showToast]);

    const redo = useCallback(() => {
        if (history.future.length === 0) return;
        const next = history.future[0];
        const newFuture = history.future.slice(1);

        setHistory({
            past: [...history.past, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }],
            future: newFuture
        });

        setNodes(next.nodes);
        setEdges(next.edges);
        showToast("다시 실행 (Redo)");
    }, [history, nodes, edges, showToast]);

    // JSON to Flow Mapping & Hierarchical Layout
    const loadSavedJson = useCallback((data) => {
        if (!data) return;

        let flowData = [];
        if (Array.isArray(data)) flowData = data;
        else if (data.flow) flowData = data.flow;
        else return;

        if (flowData.length === 0) return;

        // 1. Create Nodes
        // 🚀 Optimization: Collect all feedback values to identify redundant nodes
        const allFeedbacks = new Set();
        flowData.forEach(item => {
            if (item.type === 'quiz' && item.options) {
                item.options.forEach(opt => {
                    if (opt.feedback) allFeedbacks.add(opt.feedback.trim());
                });
            }
        });

        const tempNodes = flowData
            .filter(item => {
                // If it's a CHAT node and its first content matches a feedback string exactly, it's redundant
                if (item.type !== 'quiz' && item.contents?.length === 1 && item.contents[0].type === 'text') {
                    if (allFeedbacks.has(item.contents[0].value.trim())) return false;
                }
                return true;
            })
            .map((item, index) => ({
                id: item.id || `node_${index}`,
                type: item.type === 'quiz' || item.options?.some(o => o.isCorrect) ? 'quiz' : 'chat',
                position: item.position || { x: 0, y: 0 },
                data: {
                    label: item.spotName || item.id || `Node ${index}`,
                    spotName: item.spotName,
                    contents: item.contents || [],
                    options: item.options || [],
                    coords: item.coords
                }
            }));

        // 2. Create Edges with Logic Colors (Bundled)
        const tempEdges = [];
        flowData.forEach((item) => {
            if (item.options) {
                // Group options by their target
                const targetGroups = {};
                item.options.forEach((opt) => {
                    if (opt.target) {
                        // 🚀 Trace targets if it points to a now hidden node
                        let finalTarget = opt.target;
                        const hiddenNode = flowData.find(n => n.id === opt.target);
                        if (hiddenNode && !tempNodes.some(tn => tn.id === hiddenNode.id)) {
                            // If the node is hidden (feedback node), point to ITS first target
                            if (hiddenNode.options && hiddenNode.options.length > 0) {
                                finalTarget = hiddenNode.options[0].target;
                            }
                        }

                        if (!targetGroups[finalTarget]) targetGroups[finalTarget] = [];
                        targetGroups[finalTarget].push(opt);
                    }
                });

                // Create one edge per unique target
                Object.keys(targetGroups).forEach((targetId) => {
                    const group = targetGroups[targetId];
                    const hasCorrect = group.some(o => o.isCorrect === true);

                    tempEdges.push({
                        id: `e-${item.id}-${targetId}`,
                        source: item.id,
                        target: targetId,
                        sourceHandle: 'source-bottom', // Exit from Bottom
                        targetHandle: 'target-top',    // Enter from Top
                        type: 'logic',
                        label: group.length > 1 ? `${group.length} Paths` : (group[0].label || ''),
                        animated: hasCorrect,
                        interactionWidth: 30,
                        style: {
                            stroke: hasCorrect ? '#34C759' : '#8E8E93',
                            strokeWidth: hasCorrect ? 3 : 2,
                            opacity: hasCorrect ? 1 : 0.6
                        }
                    });
                });
            }
        });

        // 3. Hierarchical Layout (BFS based)
        const levels = new Map();
        const visited = new Set();
        const queue = [];

        // Find roots
        const incoming = new Set(tempEdges.map(e => e.target));
        const roots = tempNodes.filter(n => !incoming.has(n.id) || n.id === 'intro');
        if (roots.length === 0 && tempNodes.length > 0) roots.push(tempNodes[0]);

        roots.forEach(r => {
            queue.push({ id: r.id, level: 0 });
            visited.add(r.id);
        });

        while (queue.length > 0) {
            const { id, level } = queue.shift();
            if (!levels.has(level)) levels.set(level, []);
            levels.get(level).push(id);

            const children = tempEdges.filter(e => e.source === id).map(e => e.target);
            children.forEach(cid => {
                if (!visited.has(cid)) {
                    visited.add(cid);
                    queue.push({ id: cid, level: level + 1 });
                }
            });
        }

        // Assign final positions
        const finalNodes = tempNodes.map(node => {
            // If already has position, keep it
            if (node.position.x !== 0 && node.position.y !== 0) return node;

            let nodeLevel = 0;
            let nodeIndex = 0;
            levels.forEach((ids, lev) => {
                const idx = ids.indexOf(node.id);
                if (idx !== -1) {
                    nodeLevel = lev;
                    nodeIndex = idx;
                }
            });

            return {
                ...node,
                position: {
                    x: 350 * nodeIndex,
                    y: 250 * nodeLevel // 🚀 Top-to-Bottom: Level 0 is at Top
                }
            };
        });

        setNodes(finalNodes);
        setEdges(tempEdges);
        setTimeout(() => fitView({ duration: 800 }), 100);
    }, [fitView]);

    // Initial Sync & Loading State
    useEffect(() => {
        if (id !== 'new') {
            setIsLoading(true);
            const savedTours = JSON.parse(localStorage.getItem('tours') || '[]');
            const tour = savedTours.find(t => t.id === id);

            // Artificial delay for Apple-style smooth entry
            const timer = setTimeout(() => {
                if (tour && tour.jsonData) {
                    setTourTitle(tour.title);
                    loadSavedJson(tour.jsonData);
                }
                setIsLoading(false);
            }, 500);

            return () => clearTimeout(timer);
        } else {
            setNodes(initialNodes);
            setEdges([]);
        }
    }, [id, loadSavedJson]);

    const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
    const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

    // 🚀 Enhanced Connection Handling
    const onConnect = useCallback((params) => {
        // Validation: No self-loops
        if (params.source === params.target) return;

        // Validation: Prevent duplicate edges
        const exists = edges.find(e => e.source === params.source && e.target === params.target);
        if (exists) return;

        setNodes((nds) => nds.map(node => {
            if (node.id === params.source) {
                const updatedOptions = [...(node.data.options || [])];

                // Find or create an option to host this target
                let opt = updatedOptions.find(o => !o.target);
                if (!opt) {
                    opt = { label: 'Next Step', target: params.target };
                    updatedOptions.push(opt);
                } else {
                    opt.target = params.target;
                }

                const isCorrect = opt.isCorrect === true;
                const newEdge = {
                    ...params,
                    id: `e-${params.source}-${params.target}`,
                    sourceHandle: params.sourceHandle || 'source-bottom',
                    targetHandle: params.targetHandle || 'target-top',
                    type: 'logic',
                    animated: isCorrect,
                    interactionWidth: 30,
                    style: {
                        stroke: isCorrect ? '#34C759' : '#8E8E93',
                        strokeWidth: isCorrect ? 3 : 2,
                        opacity: isCorrect ? 1 : 0.6
                    }
                };

                setEdges((eds) => addEdge(newEdge, eds));
                return { ...node, data: { ...node.data, options: updatedOptions } };
            }
            return node;
        }));

        setTimeout(() => fitView({ duration: 400 }), 100);
    }, [edges, fitView]);

    // 🚀 Support Re-connecting Edges
    const onEdgeUpdate = useCallback((oldEdge, newConnection) => {
        if (newConnection.source === newConnection.target) return;

        setEdges((els) => updateEdge(oldEdge, newConnection, els));

        // Sync node data
        setNodes((nds) => nds.map(node => {
            if (node.id === oldEdge.source) {
                const updatedOptions = (node.data.options || []).map(opt => {
                    if (opt.target === oldEdge.target) {
                        return { ...opt, target: newConnection.target };
                    }
                    return opt;
                });
                return { ...node, data: { ...node.data, options: updatedOptions } };
            }
            return node;
        }));

        setTimeout(() => fitView({ duration: 400 }), 100);
    }, [fitView]);

    // 🚀 Handle Edge Deletion (Centralized)
    const onEdgesDelete = useCallback((deletedEdges) => {
        deletedEdges.forEach(edge => {
            setNodes((nds) => nds.map(node => {
                if (node.id === edge.source) {
                    const updatedOptions = (node.data.options || []).map(opt => {
                        if (opt.target === edge.target) {
                            return { ...opt, target: "" }; // 🚀 Set to empty string for data consistency
                        }
                        return opt;
                    });
                    return { ...node, data: { ...node.data, options: updatedOptions } };
                }
                return node;
            }));
        });
        setTimeout(() => fitView({ duration: 400 }), 100);
    }, [fitView]);

    // 🚀 Handle Node Deletion (Cleanup References)
    const onNodesDelete = useCallback((deletedNodes) => {
        deletedNodes.forEach(deletedNode => {
            setNodes((nds) => nds.map(node => {
                const updatedOptions = (node.data.options || []).map(opt => {
                    if (opt.target === deletedNode.id) {
                        return { ...opt, target: "" }; // 🚀 Target node no longer exists
                    }
                    return opt;
                });
                return { ...node, data: { ...node.data, options: updatedOptions } };
            }));
        });
        setTimeout(() => fitView({ duration: 400 }), 100);
    }, [fitView]);

    const onNodeClick = (_, node) => setSelectedNodeId(node.id);
    const onPaneClick = () => setSelectedNodeId(null);

    const addNode = (type) => {
        saveHistory();
        const id = `${type}_${Date.now().toString().slice(-4)}`;
        const newNode = {
            id,
            type,
            position: { x: window.innerWidth / 3, y: window.innerHeight / 3 },
            data: { label: `New ${type}`, contents: [], options: [] }
        };
        setNodes((nds) => [...nds, newNode]);
        showToast("노드 추가됨");
    };

    // 🚀 Clone / Copy Logic
    const cloneNode = useCallback((nodeId) => {
        const sourceNode = nodes.find(n => n.id === nodeId);
        if (!sourceNode) return;

        saveHistory();
        const newId = `${sourceNode.type}_${Date.now().toString().slice(-4)}`;
        const newNode = {
            ...JSON.parse(JSON.stringify(sourceNode)),
            id: newId,
            selected: true,
            position: {
                x: sourceNode.position.x + 40,
                y: sourceNode.position.y + 40
            }
        };
        setNodes(nds => [...nds.map(n => ({ ...n, selected: false })), newNode]);
        setSelectedNodeId(newId);
        showToast("노드 복제됨");
    }, [nodes, saveHistory, showToast]);

    // 🚀 Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            const isMeta = e.ctrlKey || e.metaKey;

            // Undo/Redo
            if (isMeta && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) redo();
                else undo();
            }

            // fitView (Ctrl + 0)
            if (isMeta && e.key === '0') {
                e.preventDefault();
                fitView({ duration: 800 });
                showToast("화면 최적화");
            }

            // Clone (Ctrl + D)
            if (isMeta && (e.key === 'd' || e.key === 'D')) {
                if (selectedNodeId) {
                    e.preventDefault();
                    cloneNode(selectedNodeId);
                }
            }

            // Save (Ctrl + S)
            if (isMeta && e.key === 's') {
                e.preventDefault();
                saveToProject();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, fitView, selectedNodeId, cloneNode, showToast]);

    const updateNodeData = (nodeId, newData) => {
        setNodes((nds) => nds.map((n) => (n.id === nodeId ? { ...n, data: newData } : n)));
    };

    const handleJsonUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsLoading(true);
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);
                const flow = json.flow || (Array.isArray(json) ? json : null);
                if (flow) {
                    setTimeout(() => {
                        loadSavedJson(flow);
                        setIsLoading(false);
                    }, 600);
                }
            } catch (err) {
                alert('JSON 형식이 올바르지 않습니다.');
                setIsLoading(false);
            }
        };
        reader.readAsText(file);
    };

    const exportJson = () => {
        const flow = nodes.map(n => ({
            id: n.id,
            type: n.type,
            spotName: n.data.spotName || n.data.label,
            contents: n.data.contents || [],
            options: n.data.options || [],
            coords: n.data.coords,
            position: n.position
        }));

        const tourExport = { flow };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tourExport, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${tourTitle.replace(/\s+/g, '_')}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const saveToProject = () => {
        const flow = nodes.map(n => ({
            id: n.id,
            type: n.type,
            spotName: n.data.spotName || n.data.label,
            contents: n.data.contents || [],
            options: n.data.options || [],
            coords: n.data.coords,
            position: n.position
        }));

        const savedTours = JSON.parse(localStorage.getItem('tours') || '[]');
        const currentTour = savedTours.find(t => t.id === id);

        const newTour = {
            id: id === 'new' ? Date.now().toString() : id,
            title: tourTitle,
            slug: tourTitle.toLowerCase().replace(/\s+/g, '-'),
            jsonData: { flow },
            thumbnail: currentTour?.thumbnail || '',
            updatedAt: new Date().toISOString()
        };

        const updated = id === 'new'
            ? [...savedTours, newTour]
            : savedTours.map(t => t.id === id ? newTour : t);

        localStorage.setItem('tours', JSON.stringify(updated));
        alert('Saved successfully!');
        if (id === 'new') navigate(`/admin/tours/builder/${newTour.id}`);
    };

    const selectedNode = nodes.find(n => n.id === selectedNodeId);

    return (
        <div className={styles.editorPage}>
            {isLoading && (
                <div className="absolute inset-0 z-[2000] bg-white/80 backdrop-blur-md flex items-center justify-center animate-pulse">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 border-4 border-[#007AFF] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-lg font-semibold text-[#1C1C1E]">시나리오 데이터를 분석 중입니다...</p>
                    </div>
                </div>
            )}

            <header className={styles.topBar}>
                <div className={styles.titleArea}>
                    <input
                        className={styles.titleInput}
                        value={tourTitle}
                        onChange={(e) => setTourTitle(e.target.value)}
                    />
                </div>
                <div className={styles.actionButtons}>
                    <button className={styles.btnSecondary} onClick={() => navigate('/admin/tours')}>Cancel</button>
                    <label className={`${styles.btnSecondary} cursor-pointer`}>
                        <Upload size={14} /> Import JSON
                        <input type="file" className="hidden" accept=".json" onChange={handleJsonUpload} />
                    </label>
                    <button className={styles.btnSecondary} onClick={exportJson}><Download size={14} /> Export JSON</button>
                    <button className={styles.btnPrimary} onClick={saveToProject}><Save size={14} /> Save Project</button>
                </div>
            </header>

            <main className={styles.mainLayout}>
                <aside className={styles.toolbar}>
                    <button type="button" className={styles.toolbarItem} onClick={() => addNode('chat')} title="Add Chat Message">
                        <MessageCircle size={22} />
                    </button>
                    <button type="button" className={styles.toolbarItem} onClick={() => addNode('quiz')} title="Add Quiz">
                        <div className="font-black text-xs">Q</div>
                    </button>
                </aside>

                <div className={styles.canvasContainer}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onEdgeUpdate={onEdgeUpdate}
                        onEdgesDelete={(eds) => {
                            saveHistory();
                            onEdgesDelete(eds);
                            showToast("연결 삭제됨");
                        }}
                        onNodesDelete={(nds) => {
                            if (nds.some(n => n.id === 'intro')) {
                                showToast("Intro 노드는 삭제할 수 없습니다.");
                                return;
                            }
                            saveHistory();
                            onNodesDelete(nds);
                            showToast("노드 삭제됨");
                        }}
                        onNodeDragStart={() => saveHistory()} // 🚀 Save before drag
                        onNodeClick={onNodeClick}
                        onPaneClick={onPaneClick}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        deleteKeyCode={["Backspace", "Delete"]}
                        selectionKeyCode="Shift"
                        multiSelectionKeyCode="Control"
                        fitView
                    >
                        <Background variant="dots" gap={20} size={1} color="#C7C7CC" />
                        <Controls />
                        <MiniMap nodeStrokeWidth={3} zoomable pannable />
                    </ReactFlow>

                    {/* 🚀 Apple Style Toasts */}
                    <div className={styles.toastContainer}>
                        {toasts.map(toast => (
                            <div key={toast.id} className={styles.toast}>
                                {toast.message}
                            </div>
                        ))}
                    </div>
                </div>

                <Inspector
                    selectedNode={selectedNode}
                    onUpdateNode={updateNodeData}
                />
            </main>
        </div>
    );
};

const VisualEditor = () => (
    <ReactFlowProvider>
        <InnerVisualEditor />
    </ReactFlowProvider>
);

export default VisualEditor;
