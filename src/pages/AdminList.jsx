import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, ExternalLink } from 'lucide-react';
import '../admin.css';

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
        <div className="admin-body min-h-screen px-6 py-12 md:px-12 animate-ios-entry">
            <div className="max-w-6xl mx-auto">
                <header className="admin-header flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h1 className="admin-title">투어 관리 콘솔</h1>
                        <p className="text-[17px] text-gray-500 font-medium">Apple HIG 가이드라인을 준수하는 인터랙티브 가이드를 생성하세요.</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/tours/new')}
                        className="btn-primary-ios shadow-blue-500/20 shadow-xl"
                    >
                        <Plus size={20} /> 새 투어 추가
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tours.length === 0 ? (
                        <div className="col-span-full py-32 border border-gray-100 rounded-[20px] text-center bg-gray-50/50">
                            <p className="text-gray-400 font-medium">등록된 투어가 없습니다. 새로운 여정을 시작해보세요.</p>
                        </div>
                    ) : (
                        tours.map(tour => (
                            <div key={tour.id} className="dashboard-card group">
                                <div className="aspect-[16/10] bg-gray-50 rounded-lg overflow-hidden mb-6 border border-gray-100">
                                    {tour.thumbnail ? (
                                        <img src={tour.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-200 uppercase font-black tracking-tighter text-4xl">Tour</div>
                                    )}
                                </div>

                                <h3 className="text-xl font-bold mb-2 tracking-tight line-clamp-1">{tour.title}</h3>
                                <p className="text-sm font-semibold text-blue-500 mb-6 font-mono tracking-tight underline underline-offset-4 decoration-blue-200"> tour/{tour.slug}</p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/admin/tours/edit/${tour.id}`)}
                                            className="p-2.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-all"
                                        >
                                            <Edit2 size={20} />
                                        </button>
                                        <button
                                            onClick={() => deleteTour(tour.id)}
                                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>

                                    <Link
                                        to={`/tour/${tour.slug}`}
                                        target="_blank"
                                        className="btn-secondary-ios"
                                    >
                                        라이브 보기 <ExternalLink size={14} className="inline ml-1 mb-0.5" />
                                    </Link>
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
