import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, ExternalLink } from 'lucide-react';
import styles from './Admin.module.css';

const AdminList = () => {
    const [tours, setTours] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const savedTours = JSON.parse(localStorage.getItem('tours') || '[]');
        setTours(savedTours);
    }, []);

    const deleteTour = (id) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            const updated = tours.filter(t => t.id !== id);
            localStorage.setItem('tours', JSON.stringify(updated));
            setTours(updated);
        }
    };

    return (
        <div className={`${styles.appleAdminTheme} ${styles.fadeIn}`}>
            <div className={styles.adminContainer}>
                <header className={styles.adminHeader}>
                    <div>
                        <h1 className={styles.adminTitle}>투어 관리</h1>
                        <p className={styles.adminSubtitle}>인터랙티브 가이드 프로그램을 관리하고 배포합니다.</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate('/admin/tours/builder/new')}
                            className={styles.btnSecondary}
                        >
                            <Plus size={18} /> 시각적 빌더
                        </button>
                        <button
                            onClick={() => navigate('/admin/tours/new')}
                            className={styles.btnPrimary}
                        >
                            <Plus size={18} /> 새 투어 생성
                        </button>
                    </div>
                </header>

                <div className={styles.cardGrid}>
                    {tours.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-gray-400">
                            등록된 투어가 없습니다.
                        </div>
                    ) : (
                        tours.map(tour => (
                            <div key={tour.id} className={styles.dashboardCard}>
                                <div className={styles.cardThumb}>
                                    {tour.thumbnail ? (
                                        <img src={tour.thumbnail} alt="" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold">IMAGE</div>
                                    )}
                                </div>

                                <h3 className={styles.cardTitle}>{tour.title}</h3>
                                <p className={styles.cardSlug}>tour/{tour.slug}</p>

                                <div className={styles.cardFooter}>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => navigate(`/admin/tours/edit/${tour.id}`)}
                                            className={styles.iconButton}
                                            title="수정"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => deleteTour(tour.id)}
                                            className={`${styles.iconButton} ${styles.deleteButton}`}
                                            title="삭제"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/admin/tours/builder/${tour.id}`)}
                                            className={styles.btnSecondary}
                                            style={{ fontSize: '12px', padding: '6px 10px' }}
                                        >
                                            빌더
                                        </button>
                                        <Link
                                            to={`/tour/${tour.slug}`}
                                            target="_blank"
                                            className={styles.btnSecondary}
                                        >
                                            Live <ExternalLink size={12} className="inline ml-1" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminList;
