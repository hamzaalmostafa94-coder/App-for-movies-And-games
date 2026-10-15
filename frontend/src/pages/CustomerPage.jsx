import React, { useState, useRef, useEffect } from 'react';
import { requestService } from '../api/client';
import { useNavigate } from 'react-router-dom';
import './CustomerPage.css';

const CustomerPage = () => {
    // 0: ترويجي | 1: مثال فيلم | 2: مثال مسلسل | 3: مثال لعبة | 4: واجهة التطبيق
    const [onboardingStep, setOnboardingStep] = useState(0);

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

    // بيانات الواجهات التعريفية
    const introScreens = [
        {
            type: 'promo',
            title: 'تطبيقنا بيختصر عليك التعب! 🚀',
            text: 'باقة النت عم تخلص والتحميل بطيء؟ أو عبالك فيلم، مسلسل كامل، أو لعبة تقيلة؟ تطبيقنا بيختصر عليك التعب! صار فيك تطلب أي محتوى ببالك بضغطة زر. نحنا منستلم المهمة ومنحمل طلبك بأسرع وقت لنوفر باقتك، وبس يجهز منتواصل معك لتستلمه جاهز على فلاشة أو هارد او جوال. لا تضيع وقتك بالتدوير.. نزل التطبيق هلا، اطلب اللي ببالك، وخلي الباقي علينا!',
            btnText: 'تخطي'
        },
        {
            type: 'example',
            title: 'مثال: طلب فيلم 🎬',
            subtitle: 'شاهد كيف تحدد اسم الفيلم والدقة المطلوبة',
            tab: 'movies',
            data: {
                name: 'يوسف أحمد العلي',
                phone: '0987132453',
                content: 'Mission: Impossible',
                details: '1080p (FHD) - جودة عالية',
                part: 'الجزء الأول'
            },
            highlight: 'content',
            btnText: 'تخطي'
        },
        {
            type: 'example',
            title: 'مثال: طلب مسلسل 📺',
            subtitle: 'شاهد كيف تحدد اسم المسلسل ورقم الجزء أو الموسم',
            tab: 'movies',
            data: {
                name: 'أحمد سليمان الخضر',
                phone: '0981076447',
                content: 'باب الحارة',
                details: '1080p (FHD) - جودة عالية',
                part: 'الجزء 12'
            },
            highlight: 'part',
            btnText: 'تخطي'
        },
        {
            type: 'example',
            title: 'مثال: طلب لعبة 🎮',
            subtitle: 'شاهد كيف تكتب اسم اللعبة مع سنة الإصدار أو النسخة',
            tab: 'games',
            data: {
                name: 'جعفر محمد الخضر',
                phone: '0954231232',
                content: 'GTA 5',
                details: '2013',
                part: ''
            },
            highlight: 'details',
            btnText: 'تخطي والدخول للتطبيق'
        }
    ];

    const handleNextStep = () => {
        setOnboardingStep(prev => prev + 1);
    };

    const handleSkipAll = () => {
        setOnboardingStep(4);
    };

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
        const { name, value } = e.target;

        if (name === 'customer_name') {
            const cleanedValue = value.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, '');
            setFormData({ ...formData, [name]: cleanedValue });
            return;
        }

        if (name === 'customer_phone') {
            const cleanedValue = value.replace(/[^\d+]/g, ''); 
            if (cleanedValue.lastIndexOf('+') > 0) return;
            setFormData({ ...formData, [name]: cleanedValue });
            return;
        }

        setFormData({ ...formData, [name]: value });
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
        
        const nameStr = formData.customer_name.trim();
        const phoneStr = formData.customer_phone.replace(/\s/g, '');
        const contentStr = formData.content_name.trim();
        const detailsStr = formData.details.trim();

        if (nameStr.length < 3) {
            alert('⚠️ يرجى إدخال اسمك الكامل بشكل حقيقي وصحيح.');
            return;
        }

        const phoneRegex = /^\+?[0-9]{9,15}$/;
        if (!phoneRegex.test(phoneStr)) {
            alert('⚠️ رقم الموبايل غير صالح! يرجى إدخال أرقام فقط بدون رموز أو أحرف (مثال: 0992017993).');
            return;
        }

        const hasLetters = /[a-zA-Z\u0600-\u06FF]/.test(contentStr); 
        if (contentStr.length < 3 || !hasLetters) {
            alert(`⚠️ يرجى كتابة اسم ${activeTab === 'movies' ? 'الفيلم/المسلسل' : 'اللعبة'} بشكل حقيقي.`);
            return;
        }

        if (activeTab === 'games' && detailsStr.length < 3) {
            alert('⚠️ يرجى كتابة سنة الإصدار أو النسخة بشكل واضح.');
            return;
        }

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
        }, 400); 
    };

    const handleDoubleClick = async () => {
        if (clickTimer.current) clearTimeout(clickTimer.current);
        const password = prompt("الرجاء إدخال مفتاح الوصول:");
        
        if (password !== null && password !== "") {
            try {
                await requestService.login(password);
                navigate('/admin');
            } catch (error) {
                console.error("خطأ تسجيل الدخول:", error);
                alert("كلمة المرور خاطئة!");
            }
        }
    };

    const currentScreen = introScreens[onboardingStep];

    return (
        <div className="customer-container">
            {/* الزر السري للدخول للإدارة */}
            <button 
                onClick={handleSingleClick}
                onDoubleClick={handleDoubleClick}
                className="secret-admin-btn"
            />

            {onboardingStep < 4 ? (
                /* الشاشات التعريفية بدقة فائقة وخطوط كبيرة */
                <div className="glass-panel onboarding-card">
                    <div className="onboarding-top-bar">
                        <div className="step-indicators">
                            {introScreens.map((_, idx) => (
                                <span 
                                    key={idx} 
                                    className={`indicator-dot ${onboardingStep === idx ? 'active' : ''}`}
                                />
                            ))}
                        </div>
                        <button className="skip-all-btn" onClick={handleSkipAll}>
                            تخطي الكل
                        </button>
                    </div>

                    {currentScreen.type === 'promo' ? (
                        <div className="onboarding-content promo-mode">
                            <h2 className="header-title">{currentScreen.title}</h2>
                            <p className="promo-text">{currentScreen.text}</p>
                        </div>
                    ) : (
                        <div className="onboarding-content">
                            <h2 className="header-title" style={{ fontSize: '1.7rem', marginBottom: '4px' }}>
                                {currentScreen.title}
                            </h2>
                            <p className="header-desc" style={{ marginBottom: '1.2rem', fontSize: '0.85rem' }}>
                                {currentScreen.subtitle}
                            </p>

                            {/* نموذج التوضيح المباشر فائق الوضوح بخطوط كبيرة */}
                            <div className="example-mock-card">
                                <div className="mock-tabs">
                                    <span className={`mock-tab ${currentScreen.tab === 'movies' ? 'active' : ''}`}>أفلام ومسلسلات</span>
                                    <span className={`mock-tab ${currentScreen.tab === 'games' ? 'active' : ''}`}>ألعاب</span>
                                </div>

                                <div className="mock-field">
                                    <span className="mock-label">اسمك الكامل</span>
                                    <div className="mock-input">{currentScreen.data.name}</div>
                                </div>

                                <div className="mock-field">
                                    <span className="mock-label">رقم الموبايل</span>
                                    <div className="mock-input ltr-text">{currentScreen.data.phone}</div>
                                </div>

                                <div className="mock-field">
                                    <span className="mock-label">{currentScreen.tab === 'movies' ? 'اسم الفيلم / المسلسل' : 'اسم اللعبة'}</span>
                                    <div className={`mock-input ${currentScreen.highlight === 'content' ? 'highlight-box' : ''}`}>
                                        {currentScreen.data.content}
                                    </div>
                                </div>

                                <div className="mock-field">
                                    <span className="mock-label">{currentScreen.tab === 'movies' ? 'الدقة المطلوبة' : 'الإصدار أو سنة الإصدار'}</span>
                                    <div className={`mock-input ${currentScreen.highlight === 'details' ? 'highlight-box' : ''}`}>
                                        {currentScreen.data.details}
                                    </div>
                                </div>

                                {currentScreen.tab === 'movies' && currentScreen.data.part && (
                                    <div className="mock-field">
                                        <span className="mock-label">رقم الجزء / الموسم (إن وجد)</span>
                                        <div className={`mock-input ${currentScreen.highlight === 'part' ? 'highlight-box' : ''}`}>
                                            {currentScreen.data.part}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <button className="submit-btn onboarding-btn" onClick={handleNextStep}>
                        {currentScreen.btnText}
                    </button>
                </div>
            ) : (
                /* واجهة الإدخال الحقيقية الأصلية */
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
                        <div className="form-group">
                            <label>اسمك الكامل</label>
                            <input type="text" name="customer_name" className="input-field" value={formData.customer_name} onChange={handleInputChange} />
                        </div>
                        
                        <div className="form-group">
                            <label>رقم الموبايل</label>
                            <input type="text" inputMode="tel" name="customer_phone" className="input-field" value={formData.customer_phone} onChange={handleInputChange} dir="ltr" style={{ textAlign: 'right' }} />
                        </div>

                        <div className="form-group">
                            <label>{activeTab === 'movies' ? 'اسم الفيلم / المسلسل' : 'اسم اللعبة'}</label>
                            <input type="text" name="content_name" className="input-field" placeholder="اكتب الاسم هنا بدقة" value={formData.content_name} onChange={handleInputChange} />
                        </div>
                        
                        <div className="form-group">
                            <label>{activeTab === 'movies' ? 'الدقة المطلوبة' : 'الإصدار أو سنة الإصدار'}</label>
                            {activeTab === 'movies' ? (
                               <select name="details" className="input-field" value={formData.details} onChange={handleInputChange}>
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
            )}

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
                        <div style={{ fontSize: '4rem', color: '#2ecc71', marginBottom: '15px' }}>✓</div>
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