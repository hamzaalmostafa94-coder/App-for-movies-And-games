import React, { useState, useRef } from 'react';
import { requestService } from '../api/client';
import { useNavigate } from 'react-router-dom';
import './CustomerPage.css';

const CustomerPage = () => {
    const [activeTab, setActiveTab] = useState('movies');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();
    
    const clickTimer = useRef(null);
    
    const [formData, setFormData] = useState({
        customer_name: localStorage.getItem('customer_name') || '',
        customer_phone: localStorage.getItem('customer_phone') || '',
        content_name: '',
        details: '1080p (FHD) - جودة عالية',
        part_number: '',
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // دالة خاصة لمعالجة الملف المرفوع من اللابتوب وتحويله لبيانات نصية (Base64)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image_url: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
        setFormData(prev => ({
            ...prev,
            details: tab === 'movies' ? '1080p (FHD) - جودة عالية' : '',
            part_number: '',
            content_name: '',
            image_url: '' // تفريغ الصورة عند تبديل التبويب
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!formData.customer_name || !formData.customer_phone || (!formData.content_name && !formData.image_url)) {
            alert('يرجى إدخال اسمك ورقمك، مع تحديد اسم المحتوى أو إرفاق صورته على الأقل');
            return;
        }
        setIsLoading(true);
        try {
            localStorage.setItem('customer_name', formData.customer_name);
            localStorage.setItem('customer_phone', formData.customer_phone);
            await requestService.createRequest({
                customer_name: formData.customer_name,
                customer_phone: formData.customer_phone,
                content_type: activeTab === 'movies' ? 'فيلم/مسلسل' : 'لعبة',
                content_name: formData.content_name || 'طلب عبر صورة الجهاز',
                details: formData.details,
                part_number: formData.part_number,
                image_url: formData.image_url
            });
            setIsSuccess(true);
            setFormData(prev => ({ ...prev, content_name: '', details: activeTab === 'movies' ? '1080p (FHD) - جودة عالية' : '', part_number: '', image_url: '' }));
            setTimeout(() => setIsSuccess(false), 3000);
        } catch (error) {
            alert('حدث خطأ أثناء إرسال الطلب، تأكد من تشغيل الخادم.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSingleClick = () => {
        if (clickTimer.current) clearTimeout(clickTimer.current);
        clickTimer.current = setTimeout(() => {
            alert("عذراً، هذا الزر خاص بمؤسس التطبيق 🛑");
        }, 250);
    };

    const handleDoubleClick = () => {
        if (clickTimer.current) clearTimeout(clickTimer.current);
        const password = prompt("الرجاء إدخال مفتاح الوصول:");
        if (password === "12345") { 
            navigate('/admin');
        } else if (password !== null && password !== "") {
            alert("كلمة المرور خاطئة!");
        }
    };

    return (
        <div className="customer-container">
            <button 
                onClick={handleSingleClick}
                onDoubleClick={handleDoubleClick}
                style={{ position: 'absolute', top: '20px', left: '20px', background: 'transparent', border: 'none', color: 'var(--border-color)', cursor: 'pointer', fontSize: '1.2rem', padding: '10px' }}
                title="تسجيل دخول الإدارة"
            >
                <i className="fa-solid fa-lock"></i>
            </button>

            <div className="glass-panel">
                <header>
                    <h1 className="header-title">اطلب محتواك</h1>
                    <p className="header-desc">بوابتك الذكية لتحميل أحدث الأفلام والألعاب</p>
                </header>

                <div className="tabs-container">
                    <button className={`tab-btn ${activeTab === 'movies' ? 'active' : ''}`} onClick={() => handleTabSwitch('movies')}>أفلام ومسلسلات</button>
                    <button className={`tab-btn ${activeTab === 'games' ? 'active' : ''}`} onClick={() => handleTabSwitch('games')}>ألعاب</button>
                </div>

                <form onSubmit5={handleSubmit} onSubmit={handleSubmit}>
                    <div className="user-details-group">
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#E2E8F0' }}>اسمك الكامل</label>
                            <input type="text" name="customer_name" className="input-field" value={formData.customer_name} onChange={handleInputChange} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#E2E8F0' }}>رقم الموبايل</label>
                            <input type="tel" name="customer_phone" className="input-field"  value={formData.customer_phone} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>{activeTab === 'movies' ? 'اسم الفيلم / المسلسل' : 'اسم اللعبة'}</label>
                        <input type="text" name="content_name" className="input-field" placeholder="اكتب الاسم هنا بدقة" value={formData.content_name} onChange={handleInputChange} />
                    </div>
                    
                    {/* ميزة إرفاق الصورة من اللابتوب - تظهر حصرياً في قسم الألعاب */}
                    {activeTab === 'games' && (
                        <div className="form-group">
                            <label>إرفاق لقطة شاشة للعبة من جهازك (اختياري)</label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                                className="input-field" 
                                style={{ padding: '8px', cursor: 'pointer', lineHeight: 'normal' }}
                            />
                            {formData.image_url && (
                                <p style={{ color: '#10B981', fontSize: '0.85rem', marginTop: '6px', fontWeight: '600' }}>
                                    تم اختيار وإرفاق الصورة بنجاح ✅
                                </p>
                            )}
                        </div>
                    )}

                    <div className="form-group">
                        <label>{activeTab === 'movies' ? 'الدقة المطلوبة' : 'الإصدار أو سنة الإصدار'}</label>
                        {activeTab === 'movies' ? (
                            <select name="details" className="input-field" value={formData.details} onChange={handleInputChange}>
                                <option>1080p (FHD) - جودة عالية</option>
                                <option>720p (HD) - جودة متوسطة</option>
                                <option>4K (UHD) - جودة سينمائية</option>
                            </select>
                        ) : (
                            <input type="text" name="details" className="input-field" placeholder="مثال: 2024 أو النسخة الكاملة" value={formData.details} onChange={handleInputChange} />
                        )}
                    </div>

                    {activeTab === 'movies' && (
                        <div className="form-group">
                            <label>رقم الجزء / الموسم (إن وجد)</label>
                            <input type="text" name="part_number" className="input-field" placeholder="مثال: الجزء الأول، أو الموسم 2" value={formData.part_number} onChange={handleInputChange} />
                        </div>
                    )}

                    <button type="submit" className="submit-btn" disabled={isLoading} style={isSuccess ? {background: 'linear-gradient(90deg, #10B981, #059669)', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)'} : {}}>
                        {isLoading ? 'جاري الإرسال...' : isSuccess ? 'تم إرسال الطلب بنجاح' : 'إرسال الطلب'}
                    </button>
                </form>

                <div className="status-bar">
                    <div className="pulse-dot"></div>
                    <span>النظام متصل ومشفر - جاهز لاستقبال طلبك</span>
                </div>
            </div>
        </div>
    );
};

export default CustomerPage;
