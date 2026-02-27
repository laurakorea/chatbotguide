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
        <div className="admin-body min-h-screen bg-white p-4 md:p-10 font-sans text-gray-900">
            <div className="max-w-4xl mx-auto">
                <header className="flex items-center gap-6 mb-12 border-b pb-8">
                    <button
                        onClick={() => navigate('/admin/tours')}
                        className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all border border-gray-100"
                    >
                        <ArrowLeft size={22} className="text-black" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-black">
                            {isEdit ? '투어 콘텐츠 수정' : '새로운 투어 생성'}
                        </h1>
                        <p className="text-gray-500 mt-1">투어 정보와 시나리오 데이터를 설정하세요.</p>
                    </div>
                </header>

                <form onSubmit={handleSave} className="space-y-10">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-5 rounded-2xl text-sm font-bold border border-red-100 animate-shake">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-black uppercase tracking-wider">투어 이름 *</label>
                            <input
                                type="text"
                                placeholder="예: 콜로세움 역사 투어"
                                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all font-medium"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-black uppercase tracking-wider"> Slug *</label>
                            <div className="flex items-center gap-1">
                                <span className="text-gray-400 font-medium px-2">/tour/</span>
                                <input
                                    type="text"
                                    placeholder="rome-colosseum"
                                    className="flex-1 px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all font-mono text-sm"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="block text-sm font-bold text-black uppercase tracking-wider">시나리오 JSON 데이터 *</label>
                            <label className="cursor-pointer bg-black text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-md">
                                <Upload size={14} /> JSON 업로드
                                <input type="file" accept=".json" className="hidden" onChange={handleJsonUpload} />
                            </label>
                        </div>
                        <textarea
                            rows="12"
                            placeholder="JSON 데이터를 직접 입력하거나 위 버튼을 통해 파일을 업로드하세요."
                            className="w-full px-6 py-5 rounded-3xl border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all font-mono text-xs leading-relaxed"
                            value={formData.jsonData}
                            onChange={(e) => setFormData({ ...formData, jsonData: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-black uppercase tracking-wider">썸네일 이미지 URL</label>
                        <input
                            type="text"
                            placeholder="https://images.unsplash.com/..."
                            className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition-all font-medium"
                            value={formData.thumbnail}
                            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                        />
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 pt-6">
                        <button
                            type="submit"
                            className="flex-1 bg-black text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-800 transition-all shadow-xl active:scale-[0.98] text-lg uppercase"
                        >
                            <Save size={22} /> {isEdit ? '수정 사항 저장' : '투어 등록 완료'}
                        </button>
                        {formData.slug && (
                            <button
                                type="button"
                                onClick={() => window.open(`/tour/${formData.slug}`, '_blank')}
                                className="px-8 border border-black bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
                            >
                                <Eye size={22} /> 라이브 미리보기
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminEdit;
