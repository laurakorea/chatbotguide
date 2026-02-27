import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Save, Eye } from 'lucide-react';
import styles from './Admin.module.css';

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
        <div className={`${styles.appleAdminTheme} ${styles.fadeIn}`}>
            <div className={styles.adminContainer}>
                <header className={styles.adminHeader}>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/tours')}
                            className={styles.iconButton}
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className={styles.adminTitle}>{isEdit ? '투어 수정' : '새 투어 생성'}</h1>
                            <p className={styles.adminSubtitle}>프로그램 정보와 시나리오 데이터를 구성합니다.</p>
                        </div>
                    </div>
                </header>

                <form onSubmit={handleSave} className={styles.dashboardCard}>
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-semibold mb-8 border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className={styles.formGroup}>
                            <label className={styles.label}>투어 타이틀</label>
                            <input
                                type="text"
                                placeholder="예: 경복궁 달빛 산책"
                                className={styles.input}
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Slug (URL 주소)</label>
                            <input
                                type="text"
                                placeholder="palace-walk"
                                className={styles.input}
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <div className="flex justify-between items-center mb-2">
                            <label className={styles.label}>시나리오 JSON</label>
                            <label className="text-blue-500 text-xs font-bold cursor-pointer hover:underline flex items-center gap-1">
                                <Upload size={12} /> JSON 업로드
                                <input type="file" accept=".json" className="hidden" onChange={handleJsonUpload} />
                            </label>
                        </div>
                        <textarea
                            className={`${styles.input} ${styles.textarea}`}
                            placeholder="시나리오 JSON 데이터를 입력하세요."
                            value={formData.jsonData}
                            onChange={(e) => setFormData({ ...formData, jsonData: e.target.value })}
                        ></textarea>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>썸네일 이미지 URL</label>
                        <input
                            type="text"
                            placeholder="https://..."
                            className={styles.input}
                            value={formData.thumbnail}
                            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="submit" className={styles.btnPrimary}>
                            <Save size={18} /> {isEdit ? '변경사항 저장' : '등록하기'}
                        </button>
                        {formData.slug && (
                            <button
                                type="button"
                                onClick={() => window.open(`/tour/${formData.slug}`, '_blank')}
                                className={styles.btnSecondary}
                            >
                                <Eye size={18} className="inline mr-1" /> 미리보기
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminEdit;
