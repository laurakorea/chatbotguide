import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Save, Eye } from 'lucide-react';

const AdminEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        jsonData: '',
        thumbnail: ''
    });

    const [error, setError] = useState('');

    useEffect(() => {
        if (isEdit) {
            const savedTours = JSON.parse(localStorage.getItem('tours') || '[]');
            const tour = savedTours.find(t => t.id === id);
            if (tour) {
                setFormData({
                    title: tour.title,
                    slug: tour.slug,
                    jsonData: typeof tour.jsonData === 'string' ? tour.jsonData : JSON.stringify(tour.jsonData, null, 2),
                    thumbnail: tour.thumbnail || ''
                });
            }
        }
    }, [id, isEdit]);

    const handleJsonUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                // Validate JSON
                JSON.parse(event.target.result);
                setFormData(prev => ({ ...prev, jsonData: event.target.result }));
                setError('');
            } catch (err) {
                setError('유효하지 않은 JSON 파일입니다.');
            }
        };
        reader.readAsText(file);
    };

    const handleSave = (e) => {
        e.preventDefault();

        if (!formData.title || !formData.slug || !formData.jsonData) {
            setError('모든 필수 항목을 입력해주세요.');
            return;
        }

        const savedTours = JSON.parse(localStorage.getItem('tours') || '[]');

        // Slug Duplicate Check (except when editing the same tour)
        const duplicate = savedTours.find(t => t.slug === formData.slug && t.id !== id);
        if (duplicate) {
            setError('이미 사용 중인 Slug입니다.');
            return;
        }

        try {
            const parsedJson = JSON.parse(formData.jsonData);
            const newTour = {
                id: isEdit ? id : Date.now().toString(),
                title: formData.title,
                slug: formData.slug,
                jsonData: parsedJson,
                thumbnail: formData.thumbnail,
                updatedAt: new Date().toISOString()
            };

            let updated;
            if (isEdit) {
                updated = savedTours.map(t => t.id === id ? newTour : t);
            } else {
                updated = [...savedTours, newTour];
            }

            localStorage.setItem('tours', JSON.stringify(updated));
            navigate('/admin/tours');
        } catch (err) {
            setError('JSON 형식이 올바르지 않습니다.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            <div className="max-w-3xl mx-auto">
                <header className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/admin/tours')}
                        className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {isEdit ? '투어 수정' : '새 투어 추가'}
                    </h1>
                </header>

                <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">투어 제목 *</label>
                        <input
                            type="text"
                            placeholder="예: 콜로세움 역사 투어"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">Slug (URL 식별자) *</label>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400 font-medium">domain.com/tour/</span>
                            <input
                                type="text"
                                placeholder="rome-colosseum"
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">JSON 데이터 설정 *</label>
                        <div className="flex items-center gap-4 mb-2">
                            <label className="cursor-pointer bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-200 transition-colors">
                                <Upload size={16} /> 파일 업로드 (.json)
                                <input type="file" accept=".json" className="hidden" onChange={handleJsonUpload} />
                            </label>
                        </div>
                        <textarea
                            rows="10"
                            placeholder="JSON 데이터를 직접 붙여넣거나 파일을 업로드하세요."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-xs leading-relaxed"
                            value={formData.jsonData}
                            onChange={(e) => setFormData({ ...formData, jsonData: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">썸네일 이미지 URL</label>
                        <input
                            type="text"
                            placeholder="https://example.com/image.jpg"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={formData.thumbnail}
                            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md active:scale-[0.98]"
                        >
                            <Save size={20} /> 저장하기
                        </button>
                        {formData.slug && (
                            <button
                                type="button"
                                onClick={() => window.open(`/tour/${formData.slug}`, '_blank')}
                                className="px-6 border border-gray-200 bg-white text-gray-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
                            >
                                <Eye size={20} /> 미리보기
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminEdit;
