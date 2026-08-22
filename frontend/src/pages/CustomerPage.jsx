import React, { useState, useRef, useEffect } from 'react';
import { requestService } from '../api/client';
import { useNavigate } from 'react-router-dom';
import './CustomerPage.css';

const CustomerPage = () => {
    const [activeTab, setActiveTab] = useState('movies');
    const [isLoading, setIsLoading] = useState(false);
    const [redirectCountdown, setRedirectCountdown] = useState(null); // حالة المؤقت الجديد
    const navigate = useNavigate();
    
    const clickTimer = useRef(null);
    
    const [formData, setFormData] = useState({
        customer_name: localStorage.getItem('customer_name') || '',
        customer_phone: localStorage.getItem('customer_phone') || '',
        content_name: '',
        details: '1080p (FHD) - جودة عالية',
        part_number: '',
    });
 
// مراقب المؤقت: ينقص الرقم كل ثانية، وعندما يصل للصفر يقوم بالتوجيه ويغلق نفسه
    useEffect(() => {
        if (redirectCountdown === null) return;

        if (redirectCountdown === 0) {
            // 1. افتح صفحة الفيسبوك
            window.location.href = "https://www.facebook.com/profile.php?id=61593001724205&mibextid=ZbWKwL";
            
            // 2. أمر مهم: أعد تعيين الحالة فوراً بعد التوجيه لكي لا تتجمد الصفحة عند العودة
            setTimeout(() => {
                setRedirectCountdown(null);
            }, 500); 
            return;
        }

        const timer = setTimeout(() => {
            setRedirectCountdown(redirectCountdown - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [redirectCountdown]);


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
            });
            
            // بدء المؤقت من 3 ثواني
            setRedirectCountdown(3);
            
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
                           <select name="details" className="form-control" value={formData.details} onChange={handleInputChange}>
                              <option value="1080p (FHD) - جودة عالية">1080p (FHD) - جودة عالية</option>
                              <option value="720p (HD) - جودة متوسطة">720p (HD) - جودة متوسطة</option>
                              <option value="480p - جودة مقبولة">480p - جودة مقبولة</option>
                              <option value="360p - موفرة لمساحة الهاتف ">360p - موفرة لمساحة الهاتف </option>
                              <option value="240p - اقتصادية جداً للذاكرة ">240p - اقتصادية جداً للذاكرة </option>
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

            {/* صندوق رسالة النجاح والمؤقت التلقائي */}
            {redirectCountdown !== null && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.85)', display: 'flex', justifyContent: 'center',
                    alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(8px)'
                }}>
                    <div className="modal-content" style={{
                        background: '#1a1a2e', padding: '40px 20px', borderRadius: '20px',
                        textAlign: 'center', maxWidth: '400px', width: '90%', border: '2px solid #2ecc71',
                        boxShadow: '0 15px 35px rgba(46, 204, 113, 0.2)', color: '#fff',
                        display: 'flex', flexDirection: 'column', alignItems: 'center'
                    }}>
                        <div style={{ fontSize: '4rem', color: '#2ecc71', marginBottom: '15px' }}>
                            <i className="fa-regular fa-circle-check"></i>
                        </div>
                        <h2 style={{ marginBottom: '15px', color: '#fff', fontSize: '1.6rem' }}>تم إرسال طلبك بنجاح!</h2>
                       
                        
                        {/* تصميم رقم المؤقت */}
                        <div style={{ 
                            fontSize: '3.5rem', fontWeight: 'bold', color: '#1877f2',
                            background: 'rgba(24, 119, 242, 0.1)', width: '100px', height: '100px',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            borderRadius: '50%', border: '4px solid #1877f2'
                        }}>
                            {redirectCountdown}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerPage;
