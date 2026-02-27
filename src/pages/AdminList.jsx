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
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">투어 관리자 페이지</h1>
                    <button
                        onClick={() => navigate('/admin/tours/new')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} /> 새 투어 추가
                    </button>
                </header>

                <div className="grid gap-4">
                    {tours.length === 0 ? (
                        <div className="bg-white p-10 rounded-xl shadow-sm text-center text-gray-500">
                            등록된 투어가 없습니다. 새로운 투어를 추가해 보세요!
                        </div>
                    ) : (
                        tours.map(tour => (
                            <div key={tour.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {tour.thumbnail ? (
                                            <img src={tour.thumbnail} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">Image</div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">{tour.title}</h3>
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                            slug: <span className="text-blue-600">/{tour.slug}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Link
                                        to={`/tour/${tour.slug}`}
                                        target="_blank"
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="미리보기"
                                    >
                                        <ExternalLink size={18} />
                                    </Link>
                                    <button
                                        onClick={() => navigate(`/admin/tours/edit/${tour.id}`)}
                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                        title="수정"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => deleteTour(tour.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="삭제"
                                    >
                                        <Trash2 size={18} />
                                    </button>
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
