import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import { requestService } from '../api/client';

const AdminDashboard = () => {
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [statusFilter, setStatusFilter] = useState('all');
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const data = await requestService.getAllRequests();
                setRequests(data.reverse()); 
            } catch (error) {
                console.error("حدث خطأ أثناء جلب الطلبات:", error);
            }
        };
        fetchRequests();
    }, []);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await requestService.updateRequestStatus(id, newStatus);
            setRequests(requests.map(req => req.id === id ? { ...req, status: newStatus } : req));
        } catch (error) {
            console.error("حدث خطأ أثناء تحديث حالة الطلب:", error);
            alert("حدث خطأ في الاتصال، لم يتم تحديث الحالة.");
        }
    };

    const handleWhatsAppClick = (request) => {
        let statusArabic = '';
        if (request.status === 'pending') statusArabic = 'جاري معالجة طلبك';
        else if (request.status === 'downloading') statusArabic = 'جاري التنزيل';
        else if (request.status === 'ready') statusArabic = 'جاهز للاستلام';
        else if (request.status === 'archived') statusArabic = 'مؤرشف (مكتمل)';

        // تجهيز النصوص الإضافية (تظهر فقط إذا كان العميل قد أدخلها)
        const partText = request.part_number ? `الجزء/الموسم: ${request.part_number}\n` : '';
        const imageText = request.image_url ? `رابط الصورة المرفقة: ${request.image_url}\n` : '';

        const message = `مرحباً ${request.customer_name}،\n\n` +
                        `بخصوص طلبك رقم: #${request.id}\n` +
                        `نوع الطلب: ${request.content_type}\n` +
                        `اسم المحتوى: ${request.content_name}\n` +
                        partText +
                        `التفاصيل: ${request.details || 'لا يوجد'}\n` +
                        imageText + `\n` +
                        `حالة الطلب الحالية: *${statusArabic}* 🚀`;

        const encodedMessage = encodeURIComponent(message);
        
        let phone = request.customer_phone.replace(/\D/g, ''); 
        if (phone.startsWith('0')) {
            phone = '963' + phone.substring(1);
        } else if (!phone.startsWith('963')) {
            phone = '963' + phone;
        }

        window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
    };

    const getFilteredRequests = () => {
        let filtered = requests;
        
        if (activeMenu === 'movies') filtered = filtered.filter(r => r.content_type === 'فيلم/مسلسل');
        if (activeMenu === 'games') filtered = filtered.filter(r => r.content_type === 'لعبة');
        
        if (statusFilter === 'all') {
            filtered = filtered.filter(r => r.status !== 'archived');
        } else {
            filtered = filtered.filter(r => r.status === statusFilter);
        }
        
        return filtered; 
    };

    const displayedRequests = getFilteredRequests();

    return (
        <div className="admin-container">
            <aside className="sidebar">
                <div className="brand">إدارة النظام</div>
                <ul className="nav-menu">
                    <li className={`nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveMenu('dashboard')}>
                        <i className="fa-solid fa-chart-line"></i> <span>لوحة القيادة</span>
                    </li>
                    <li className={`nav-item ${activeMenu === 'movies' ? 'active' : ''}`} onClick={() => setActiveMenu('movies')}>
                        <i className="fa-solid fa-film"></i> <span>طلبات الأفلام</span>
                    </li>
                    <li className={`nav-item ${activeMenu === 'games' ? 'active' : ''}`} onClick={() => setActiveMenu('games')}>
                        <i className="fa-solid fa-gamepad"></i> <span>طلبات الألعاب</span>
                    </li>
                </ul>
            </aside>

            <main className="main-content">
                <div className="dashboard-header">
                    <div>
                        <h1>
                            {activeMenu === 'dashboard' && 'نظرة عامة على الطلبات'}
                            {activeMenu === 'movies' && 'إدارة طلبات الأفلام والمسلسلات'}
                            {activeMenu === 'games' && 'إدارة طلبات الألعاب'}
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            {activeMenu === 'dashboard' ? 'مرحباً بك، بانتظار استلام طلبات العملاء الجدد.' : 'إدارة وتصفية البيانات المحددة.'}
                        </p>
                    </div>
                </div>

                <div className="stats-grid">
                    {/* ... (العدادات بقيت كما هي دون تغيير لتقليل طول الكود المعروض هنا) ... */}
                    <div className="stat-card">
                        <div className="stat-icon icon-blue"><i className="fa-solid fa-inbox"></i></div>
                        <div className="stat-info">
                            <h3>{requests.filter(r => r.status !== 'archived').length}</h3>
                            <p>إجمالي الطلبات النشطة</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon icon-orange"><i className="fa-solid fa-hourglass-half"></i></div>
                        <div className="stat-info">
                            <h3>{requests.filter(r => r.status === 'pending').length}</h3>
                            <p>جاري معالجة الطلب</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon icon-pink"><i className="fa-solid fa-cloud-arrow-down"></i></div>
                        <div className="stat-info">
                            <h3>{requests.filter(r => r.status === 'downloading').length}</h3>
                            <p>جاري التنزيل</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon icon-green"><i className="fa-solid fa-check-double"></i></div>
                        <div className="stat-info">
                            <h3>{requests.filter(r => r.status === 'ready').length}</h3>
                            <p>جاهز للاستلام</p>
                        </div>
                    </div>
                </div>

                <div className="table-container" style={{ overflowX: 'auto' }}>
                    <div className="table-header">
                        <h2>{statusFilter === 'archived' ? 'سجل الأرشيف' : 'القائمة الحالية'}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>تصفية:</span>
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">الطلبات النشطة (الكل)</option>
                                <option value="pending">جاري معالجة طلبك</option>
                                <option value="downloading">جاري التنزيل</option>
                                <option value="ready">جاهز للاستلام</option>
                                <option value="archived" style={{color: '#FE019A'}}>الأرشيف 📦</option>
                            </select>
                        </div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>رقم الطلب</th>
                                <th>العميل</th>
                                <th>النوع</th>
                                <th>اسم المحتوى</th>
                                <th>الموسم/الجزء</th> {/* تمت إضافة العامود */}
                                <th>التفاصيل</th>
                                <th>صورة/مرفق</th> {/* تمت إضافة العامود */}
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedRequests.length > 0 ? (
                                displayedRequests.map(request => (
                                    <tr key={request.id} style={{ opacity: request.status === 'archived' ? 0.6 : 1 }}>
                                        <td style={{ color: 'var(--text-muted)' }}>#{request.id}</td>
                                        <td style={{ fontWeight: '700', color: '#fff' }}>{request.customer_name}</td>
                                        <td>
                                            {request.content_type === 'لعبة' ? 
                                                <><i className="fa-solid fa-gamepad" style={{ color: 'var(--secondary-accent)' }}></i> لعبة</> : 
                                                <><i className="fa-solid fa-film" style={{ color: 'var(--primary-accent)' }}></i> فيلم/مسلسل</>
                                            }
                                        </td>
                                        <td style={{ fontWeight: '700' }}>{request.content_name}</td>
                                        
                                        {/* عرض رقم الجزء/الموسم */}
                                        <td style={{ color: 'var(--text-muted)' }}>
                                            {request.part_number ? request.part_number : '-'}
                                        </td>
                                        
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{request.details}</td>
                                        
                                        {/* عرض رابط الصورة في حال وجوده */}
                                        <td>
                                            {request.image_url ? (
                                                <a href={request.image_url} target="_blank" rel="noopener noreferrer" style={{ color: '#00d2ff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <i className="fa-solid fa-image"></i> عرض
                                                </a>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)' }}>-</span>
                                            )}
                                        </td>

                                        <td>
                                            {request.status === 'pending' && <span className="badge badge-pending">جاري معالجة طلبك</span>}
                                            {request.status === 'downloading' && <span className="badge badge-downloading">جاري التنزيل...</span>}
                                            {request.status === 'ready' && <span className="badge badge-ready">جاهز للاستلام</span>}
                                            {request.status === 'archived' && <span className="badge" style={{background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)', border: '1px solid var(--border-color)'}}>مؤرشف</span>}
                                        </td>
                                        <td style={{ display: 'flex', gap: '5px' }}>
                                            <button className="action-btn" title="مراسلة العميل" onClick={() => handleWhatsAppClick(request)} style={{ color: '#25D366', borderColor: 'rgba(37, 211, 102, 0.3)', backgroundColor: 'rgba(37, 211, 102, 0.1)' }}>
                                                <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.2rem' }}></i>
                                            </button>
                                            {request.status === 'pending' && (
                                                <button className="action-btn" title="بدء التنزيل" onClick={() => handleUpdateStatus(request.id, 'downloading')}><i className="fa-solid fa-download"></i></button>
                                            )}
                                            {request.status === 'downloading' && (
                                                <button className="action-btn btn-ready" title="تحديد كجاهز للاستلام" onClick={() => handleUpdateStatus(request.id, 'ready')}><i className="fa-solid fa-check"></i></button>
                                            )}
                                            {request.status === 'ready' && (
                                                <button className="action-btn" title="نقل للأرشيف" onClick={() => handleUpdateStatus(request.id, 'archived')}><i className="fa-solid fa-box-archive"></i></button>
                                            )}
                                            {request.status === 'archived' && (
                                                <button className="action-btn" title="استعادة الطلب من الأرشيف" onClick={() => handleUpdateStatus(request.id, 'ready')} style={{ color: 'var(--primary-accent)' }}>
                                                    <i className="fa-solid fa-arrow-rotate-left"></i>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        <i className="fa-solid fa-inbox" style={{ fontSize: '2.5rem', marginBottom: '10px', display: 'block', opacity: 0.4 }}></i>
                                        لا توجد طلبات جديدة حالياً. النظام جاهز لاستقبال الطلبات!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
