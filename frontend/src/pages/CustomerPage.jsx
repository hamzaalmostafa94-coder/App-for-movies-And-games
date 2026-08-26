import React, { useState, useRef, useEffect } from 'react';
import { requestService } from '../api/client';
import { useNavigate } from 'react-router-dom';
import './CustomerPage.css';

const CustomerPage = () => {
    const [activeTab, setActiveTab] = useState('movies');
    const [isLoading, setIsLoading] = useState(false);
    const [redirectCountdown, setRedirectCountdown] = useState(null); 
    const navigate = useNavigate();
    
    const clickTimer = useRef(null);
    
    const [formData, setFormData] = useState({
        customer_name: localStorage.getItem('customer_name') || '',
        customer_phone: localStorage.getItem('customer_phone') || '',
        content_name: '',
        details: '1080p (FHD) - جودة عالية',
        part_number: '',
    });

    useEffect(() => {
        if (redirectCountdown === null) return;

        if (redirectCountdown === 0) {
            window.location.href = "https://www.facebook.com/profile.php?id=61593001724205&mibextid=ZbWKwL";
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

    // ==========================================
    // دالة الإرسال مع فلاتر التحقق الصارمة الجديدة
    // ==========================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // تنظيف النصوص من الفراغات الزائدة لتسهيل الفحص
        const nameStr = formData.customer_name.trim();
        const phoneStr = formData.customer_phone.replace(/\s/g, ''); // إزالة الفراغات من الرقم
        const contentStr = formData.content_name.trim();
        const detailsStr = formData.details.trim();

        // 1. فحص الاسم (يجب أن يكون 3 أحرف على الأقل)
        if (nameStr.length < 3) {
            alert('⚠️ يرجى إدخال اسمك الكامل بشكل حقيقي وصحيح.');
            return;
        }

        // 2. فحص رقم الموبايل (يسمح بإشارة + في البداية، والباقي أرقام فقط بين 9 و 15 رقم)
        const phoneRegex = /^\+?[0-9]{9,15}$/;
        if (!phoneRegex.test(phoneStr)) {
            alert('⚠️ رقم الموبايل غير صالح! يرجى إدخال أرقام فقط بدون رموز أو أحرف (مثال: 0992017993).');
            return;
        }

        // 3. فحص اسم المحتوى (يجب أن يكون 3 أحرف على الأقل)
        if (contentStr.length < 3) {
            alert(`⚠️ يرجى كتابة اسم ${activeTab === 'movies' ? 'الفيلم/المسلسل' : 'اللعبة'} بشكل واضح وصحيح.`);
            return;
        }

        // 4. فحص تفاصيل الإصدار (للألعاب فقط، يجب أن تكون منطقية)
        if (activeTab === 'games' && detailsStr.length < 3) {
            alert('⚠️ يرجى كتابة سنة الإصدار أو النسخة بشكل واضح (مثال: 2024 أو النسخة الكاملة).');
            return;
        }

        // إذا نجحت كل الفحوصات السابقة، نسمح بمرور الطلب للسيرفر
        setIsLoading(true);
        try {
            localStorage.setItem('customer_name', nameStr);
            localStorage.setItem('customer_phone', phoneStr);
            
            await requestService.createRequest({
                customer_name: nameStr,
                customer_phone: phoneStr,
                content_type: activeTab === 'movies' ? 'فيلم/مسلسل' : 'لعبة',
                content_name: contentStr,
                details: detailsStr,
                part_number: formData.part_number
            });
            
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
                            {/* تغيير نوع الحقل وتحديد المدخلات ليساعد الكيبورد على إظهار الأرقام فقط */}
                            <input type="text" inputMode="tel" name="customer_phone" className="input-field" value={formData.customer_phone} onChange={handleInputChange} dir="ltr" style={{ textAlign: 'right' }} />
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
                        <p style={{ color: '#b2bec3', fontSize: '1.1rem', marginBottom: '25px' }}>
                            جاري تحويلك لصفحتنا على الفيسبوك...
                        </p>
                        
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