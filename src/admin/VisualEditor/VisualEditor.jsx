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
import { ChatNode, QuizNode } from './CustomNodes';
import Inspector from './Inspector';
import styles from './VisualEditor.module.css';

const RF_SPACING_X = 150;
const RF_SPACING_Y = 150;

const nodeTypes = {
    chat: ChatNode,
    quiz: QuizNode
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
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState([]);
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [tourTitle, setTourTitle] = useState("New Tour Project");

    // Load Data
    useEffect(() => {
        if (id !== 'new') {
            const savedTours = JSON.parse(localStorage.getItem('tours') || '[]');
            const tour = savedTours.find(t => t.id === id);
            if (tour) {
                setTourTitle(tour.title);
                const flow = tour.jsonData?.flow || [];

                const rfNodes = flow.map((node, idx) => ({
                    id: node.id,
                    type: node.options?.some(o => o.isCorrect) ? 'quiz' : 'chat',
                    position: { x: RF_SPACING_X + idx * 280, y: RF_SPACING_Y },
                    data: {
                        label: node.spotName || node.id,
                        spotName: node.spotName,
                        contents: node.contents || [],
                        options: node.options || [],
                        coords: node.coords
                    }
                }));

                const rfEdges = [];
                flow.forEach(node => {
                    node.options?.forEach((opt, optIdx) => {
                        if (opt.target) {
                            rfEdges.push({
                                id: `e-${node.id}-${opt.target}-${optIdx}`,
                                source: node.id,
                                target: opt.target,
                                label: opt.label,
                                animated: true,
                                type: 'default',
                                style: { stroke: '#007AFF', strokeWidth: 2 }
                            });
                        }
                    });
                });

                setNodes(rfNodes.length > 0 ? rfNodes : initialNodes);
                setEdges(rfEdges);
            }
        }
    }, [id]);

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

    const exportJson = () => {
        const flow = nodes.map(n => ({
            id: n.id,
            spotName: n.data.spotName || n.data.label,
            contents: n.data.contents || [],
            options: n.data.options || [],
            coords: n.data.coords
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
            spotName: n.data.spotName || n.data.label,
            contents: n.data.contents || [],
            options: n.data.options || [],
            coords: n.data.coords
        }));

        const savedTours = JSON.parse(localStorage.getItem('tours') || '[]');
        const newTour = {
            id: id === 'new' ? Date.now().toString() : id,
            title: tourTitle,
            slug: tourTitle.toLowerCase().replace(/\s+/g, '-'),
            jsonData: { flow },
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
                    <button className={styles.btnSecondary} onClick={exportJson}><Download size={14} /> Export JSON</button>
                    <button className={styles.btnPrimary} onClick={saveToProject}><Save size={14} /> Save Project</button>
                </div>
            </header>

            <main className={styles.mainLayout}>
                <aside className={styles.toolbar}>
                    <button className={styles.toolbarItem} onClick={() => addNode('chat')} title="Add Chat Message">
                        <MessageCircle size={22} />
                    </button>
                    <button className={styles.toolbarItem} onClick={() => addNode('quiz')} title="Add Quiz">
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
