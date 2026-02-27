import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Save, Eye } from 'lucide-react';
import '../admin.css';

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
        <div className="admin-body min-h-screen px-6 py-12 md:px-12 animate-ios-entry">
            <div className="max-w-4xl mx-auto">
                <header className="admin-header flex items-center gap-6">
                    <button
                        onClick={() => navigate('/admin/tours')}
                        className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all"
                    >
                        <ArrowLeft size={22} className="text-black" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">
                            {isEdit ? '투어 콘텐츠 수정' : '새로운 투어 생성'}
                        </h1>
                        <p className="text-[17px] text-gray-500 font-medium">Apple HIG 가이드라인을 준수하여 가이드를 구성하세요.</p>
                    </div>
                </header>

                <form onSubmit={handleSave} className="space-y-12">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-5 rounded-2xl text-sm font-bold border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.1em] ml-1">투어 이름</label>
                            <input
                                type="text"
                                placeholder="예: 콜로세움 역사 투어"
                                className="input-ios font-medium"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.1em] ml-1">Slug (URL 식별자)</label>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400 font-bold px-1 text-sm">/tour/</span>
                                <input
                                    type="text"
                                    placeholder="rome-colosseum"
                                    className="input-ios font-mono text-sm"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center ml-1">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.1em]">시나리오 JSON 데이터</label>
                            <label className="cursor-pointer text-blue-500 text-sm font-bold flex items-center gap-1.5 hover:underline">
                                <Upload size={16} /> JSON 파일 선택
                                <input type="file" accept=".json" className="hidden" onChange={handleJsonUpload} />
                            </label>
                        </div>
                        <textarea
                            rows="14"
                            placeholder="JSON 데이터를 직접 입력하거나 위 버튼을 통해 파일을 업로드하세요."
                            className="input-ios font-mono text-xs leading-relaxed min-h-[400px]"
                            value={formData.jsonData}
                            onChange={(e) => setFormData({ ...formData, jsonData: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.1em] ml-1">썸네일 이미지 URL</label>
                        <input
                            type="text"
                            placeholder="https://images.unsplash.com/..."
                            className="input-ios font-medium"
                            value={formData.thumbnail}
                            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                        />
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 pt-8">
                        <button
                            type="submit"
                            className="flex-1 btn-primary-ios py-5 justify-center text-lg tracking-tight shadow-xl shadow-blue-500/10"
                        >
                            <Save size={24} /> {isEdit ? '수정 사항 저장' : '투어 등록 완료'}
                        </button>
                        {formData.slug && (
                            <button
                                type="button"
                                onClick={() => window.open(`/tour/${formData.slug}`, '_blank')}
                                className="px-10 btn-secondary-ios flex items-center justify-center gap-2"
                            >
                                <Eye size={22} /> 미리보기
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminEdit;
