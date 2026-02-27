import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    applyEdgeChanges,
    applyNodeChanges,
    Panel,
    MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Download, Upload, Play, MessageCircle, HelpCircle, Save } from 'lucide-react';
import { ChatNode, QuizNode, SpotNode } from './CustomNodes';
import Inspector from './Inspector';
import styles from './VisualEditor.module.css';

const RF_SPACING_X = 150;
const RF_SPACING_Y = 150;

const nodeTypes = {
    chat: ChatNode,
    quiz: QuizNode,
    spot: SpotNode
};

const initialNodes = [
    {
        id: 'intro',
        type: 'chat',
        position: { x: 100, y: 100 },
        data: { label: 'Intro Chat', contents: [{ type: 'text', value: 'Welcome!' }], options: [] }
    }
];

const VisualEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [tourTitle, setTourTitle] = useState("New Tour Project");
    const [isLoading, setIsLoading] = useState(false);

    // JSON to Flow Mapping & Auto-Layout
    const loadSavedJson = useCallback((data) => {
        console.log("loadSavedJson input data:", data);
        if (!data) return;

        let flowData = [];

        // Handle varied structures: object with .flow or direct array
        if (Array.isArray(data)) {
            flowData = data;
        } else if (data.flow && Array.isArray(data.flow)) {
            flowData = data.flow;
        } else if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                flowData = parsed.flow || (Array.isArray(parsed) ? parsed : []);
            } catch (e) {
                console.error("Failed to parse JSON string in loader", e);
                return;
            }
        }

        if (flowData.length === 0) return;

        const newNodes = flowData.map((item, index) => {
            const position = item.position || {
                x: RF_SPACING_X + (index % 4) * 350,
                y: RF_SPACING_Y + Math.floor(index / 4) * 250
            };

            return {
                id: item.id || `node_${index}`,
                type: item.type === 'quiz' || item.options?.some(o => o.isCorrect) ? 'quiz' : 'chat',
                position,
                data: {
                    label: item.spotName || item.id || `Node ${index}`,
                    spotName: item.spotName,
                    contents: item.contents || [],
                    options: item.options || [],
                    coords: item.coords
                }
            };
        });

        const newEdges = [];
        flowData.forEach((item) => {
            if (item.options && Array.isArray(item.options)) {
                item.options.forEach((opt, optIdx) => {
                    if (opt.target) {
                        newEdges.push({
                            id: `e-${item.id}-${opt.target}-${optIdx}`,
                            source: item.id,
                            target: opt.target,
                            label: opt.label || '',
                            animated: true,
                            type: 'default',
                            style: { stroke: '#007AFF', strokeWidth: 2 }
                        });
                    }
                });
            }
        });

        setNodes(newNodes);
        setEdges(newEdges);
    }, []);

    // Initial Sync & Loading State
    useEffect(() => {
        if (id !== 'new') {
            setIsLoading(true);
            const savedTours = JSON.parse(localStorage.getItem('tours') || '[]');
            const tour = savedTours.find(t => t.id === id);
            console.log("Loading Tour in Builder:", tour);

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
            // New tour starts with one intro node
            setNodes(initialNodes);
            setEdges([]);
        }
    }, [id, loadSavedJson]);

    const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
    const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

    const onConnect = useCallback((params) => {
        const newEdge = { ...params, animated: true, style: { stroke: '#007AFF', strokeWidth: 2 } };
        setEdges((eds) => addEdge(newEdge, eds));

        // Auto-update target ID in the node data
        setNodes((nds) => nds.map(node => {
            if (node.id === params.source) {
                const updatedOptions = [...(node.data.options || [])];
                // Try to find an option without a target, or add a new one
                let optionToUpdate = updatedOptions.find(o => !o.target);
                if (optionToUpdate) {
                    optionToUpdate.target = params.target;
                } else {
                    updatedOptions.push({ label: 'Next', target: params.target });
                }
                return { ...node, data: { ...node.data, options: updatedOptions } };
            }
            return node;
        }));
    }, []);

    const onNodeClick = (_, node) => setSelectedNodeId(node.id);
    const onPaneClick = () => setSelectedNodeId(null);

    const addNode = (type) => {
        const id = `${type}_${Date.now().toString().slice(-4)}`;
        const newNode = {
            id,
            type,
            position: { x: window.innerWidth / 3, y: window.innerHeight / 3 },
            data: { label: `New ${type}`, contents: [], options: [] }
        };
        setNodes((nds) => [...nds, newNode]);
    };

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
                if (json.flow) {
                    setTimeout(() => {
                        loadSavedJson(json.flow);
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
            type: n.type, // 'chat' or 'quiz'
            spotName: n.data.spotName || n.data.label,
            contents: n.data.contents || [],
            options: n.data.options || [],
            coords: n.data.coords,
            position: n.position // Save visual position
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
            {/* Skeleton Loading Overlay */}
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
                        onNodeClick={onNodeClick}
                        onPaneClick={onPaneClick}
                        nodeTypes={nodeTypes}
                        fitView
                    >
                        <Background variant="dots" gap={20} size={1} color="#C7C7CC" />
                        <Controls />
                        <MiniMap nodeStrokeWidth={3} zoomable pannable />
                    </ReactFlow>
                </div>

                <Inspector
                    selectedNode={selectedNode}
                    onUpdateNode={updateNodeData}
                />
            </main>
        </div>
    );
};

export default VisualEditor;
