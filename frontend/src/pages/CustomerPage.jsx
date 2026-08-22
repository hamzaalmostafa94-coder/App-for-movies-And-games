import React, { useState, useRef } from 'react';
import { requestService } from '../api/client';
import { useNavigate } from 'react-router-dom';
import './CustomerPage.css';

const CustomerPage = () => {
    const [activeTab, setActiveTab] = useState('movies');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false); // الحالة الخاصة بنافذة الفيسبوك
    const navigate = useNavigate();
    
    const clickTimer = useRef(null);
    
    const [formData, setFormData] = useState({
        customer_name: localStorage.getItem('customer_name') || '',
        customer_phone: localStorage.getItem('customer_phone') || '',
        content_name: '',
        details: '1080p (FHD) - جودة عالية',
        part_number: '',
        // تم حذف image_url بالكامل من هنا
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
        setFormData(prev => ({
            ...prev,
            details: tab === 'movies' ? '1080p (FHD) - جودة عالية' : '',
            part_number: '',
            content_name: '',
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // تعديل التحقق بعد حذف الصورة
        if(!formData.customer_name || !formData.customer_phone || !formData.content_name) {
            alert('يرجى إدخال اسمك ورقمك، مع تحديد اسم المحتوى المطلوب بدقة');
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
                content_name: formData.content_name,
                details: formData.details,
                part_number: formData.part_number
                // تم إزالة image_url من الإرسال
            });
            
            // إظهار نافذة الفيسبوك بدلاً من مجرد تغيير لون الزر
            setShowSuccessModal(true);
            
            // تفريغ الحقول لطلب جديد
            setFormData(prev => ({ 
                ...prev, 
                content_name: '', 
                details: activeTab === 'movies' ? '1080p (FHD) - جودة عالية' : '', 
                part_number: '' 
            }));
        } catch (error) {
            console.error(error);
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
        if (password === "12345") { // يمكنك تغيير كلمة السر من هنا أيضاً متى شئت
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

                <form onSubmit={handleSubmit}>
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
                    
                    <div className="form-group">
                        <label>{activeTab === 'movies' ? 'الدقة المطلوبة' : 'الإصدار أو سنة الإصدار'}</label>
                        {activeTab === 'movies' ? (
                            // تم ربط قائمة الدقة بـ details لكي تصلك للأدمن، وإضافة الدقات الجديدة
                           <select name="details" className="form-control" value={formData.details} onChange={handleInputChange}>
                              <option value="1080p (FHD) - جودة عالية">1080p (FHD) - جودة عالية</option>
                              <option value="720p (HD) - جودة متوسطة">720p (HD) - جودة متوسطة</option>
                              <option value="480p - جودة مقبولة">480p - جودة مقبولة</option>
                              <option value="360p - موفرة لمساحة الهاتف 📱">360p - موفرة لمساحة الهاتف 📱</option>
                              <option value="240p - اقتصادية جداً للذاكرة ⚡">240p - اقتصادية جداً للذاكرة ⚡</option>
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

                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? 'جاري الإرسال...' : 'إرسال الطلب'}
                    </button>
                </form>

                <div className="status-bar">
                    <div className="pulse-dot"></div>
                    <span>النظام متصل ومشفر - جاهز لاستقبال طلبك</span>
                </div>
            </div>

            {/* النافذة المنبثقة الإبداعية لدعوة العميل لصفحة الفيسبوك */}
            {showSuccessModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex', justifyContent: 'center',
                    alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)'
                }}>
                    <div className="modal-content" style={{
                        background: '#1a1a2e', padding: '30px', borderRadius: '15px',
                        textAlign: 'center', maxWidth: '400px', width: '90%', border: '1px solid #00d2ff',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)', color: '#fff'
                    }}>
                        <div style={{ fontSize: '3rem', color: '#2ecc71', marginBottom: '15px' }}>🎉</div>
                        <h2 style={{ marginBottom: '10px', color: '#fff' }}>تم إرسال طلبك بنجاح!</h2>
                        <p style={{ color: '#b2bec3', fontSize: '0.95rem', marginBottom: '20px', lineHeight: '1.6' }}>
                            نحن نعمل على تجهيز طلبك الآن. لكي تبقى على اطلاع بكل جديد وتستفيد من عروضنا الحصرية، يسعدنا انضمامك لعائلتنا على الفيسبوك!
                        </p>
                        
                        <a 
                            href="https://www.facebook.com/profile.php?id=61593001724205&mibextid=ZbWKwL" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                                display: 'block', backgroundColor: '#1877f2', color: '#fff',
                                padding: '12px', borderRadius: '8px', textDecoration: 'none',
                                fontWeight: 'bold', marginBottom: '10px', transition: 'background 0.3s'
                            }}
                        >
                            <i className="fa-brands fa-facebook" style={{ marginLeft: '8px' }}></i>
                            تابع صفحتنا على الفيسبوك ❤️
                        </a>

                        <button 
                            onClick={() => {
                                setShowSuccessModal(false);
                                window.scrollTo(0, 0); // رفع الشاشة للأعلى لبدء طلب جديد
                            }}
                            style={{
                                background: 'transparent', border: 'none', color: '#b2bec3',
                                cursor: 'pointer', marginTop: '10px', fontSize: '0.9rem'
                            }}
                        >
                            إغلاق والعودة للتطبيق
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerPage;
