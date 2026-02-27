import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, ExternalLink } from 'lucide-react';

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
        <div className="min-h-screen bg-white p-4 md:p-10 font-sans text-gray-900 border-none shadow-none">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b pb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-black">투어 관리 콘솔</h1>
                        <p className="text-gray-500 mt-1">등록된 투어 콘텐츠를 관리하고 새 인터랙티브 가이드를 생성하세요.</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/tours/new')}
                        className="bg-black text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95 text-sm"
                    >
                        <Plus size={18} /> 새 투어 추가
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tours.length === 0 ? (
                        <div className="col-span-full py-24 border-2 border-dashed border-gray-100 rounded-3xl text-center text-gray-400">
                            등록된 투어가 없습니다. 우측 상단의 버튼을 눌러 시작하세요.
                        </div>
                    ) : (
                        tours.map(tour => (
                            <div key={tour.id} className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:border-black transition-all duration-300 shadow-sm hover:shadow-xl">
                                <div className="aspect-video bg-gray-50 relative overflow-hidden">
                                    {tour.thumbnail ? (
                                        <img src={tour.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">No Image</div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-gray-100">
                                        /{tour.slug}
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="font-bold text-xl mb-6 line-clamp-1 text-black">{tour.title}</h3>

                                    <div className="flex items-center justify-between border-t pt-5">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => navigate(`/admin/tours/edit/${tour.id}`)}
                                                className="p-3 text-gray-400 hover:text-black hover:bg-gray-50 rounded-2xl transition-all"
                                                title="수정"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => deleteTour(tour.id)}
                                                className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                                                title="삭제"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <Link
                                            to={`/tour/${tour.slug}`}
                                            target="_blank"
                                            className="px-5 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center gap-2 hover:bg-black transition-all shadow-md"
                                        >
                                            라이브 보기 <ExternalLink size={14} />
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
