const API_URL = "https://app-for-movies-and-games.onrender.com"; // ضع رابط سيرفرك هنا

export const requestService = {
    // 1. دالة تسجيل الدخول للحصول على التوكن (بطاقة VIP)
  login: async (password) => {
        console.log("جاري إرسال كلمة المرور للسيرفر..."); // طباعة للتأكد من انطلاق الطلب
        
        const formData = new URLSearchParams();
        formData.append('username', 'admin');
        formData.append('password', password);

        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });
        
        console.log("استجابة السيرفر:", response.status); // طباعة حالة الاستجابة

        if (!response.ok) throw new Error("كلمة المرور خاطئة");
        
        const data = await response.json();
        localStorage.setItem('admin_token', data.access_token);
        return true;
    },

    // 2. إرسال الطلب (هذه مفتوحة للعملاء، لا تحتاج توكن)
    createRequest: async (requestData) => {
        const response = await fetch(`${API_URL}/api/requests/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });
        if (!response.ok) throw new Error("فشل إرسال الطلب");
        return response.json();
    },

    // 3. جلب كل الطلبات للأدمن (تحتاج بطاقة VIP)
    getAllRequests: async () => {
        const token = localStorage.getItem('admin_token');
        const response = await fetch(`${API_URL}/api/requests/`, {
            headers: {
                'Authorization': `Bearer ${token}` // إرفاق البطاقة هنا
            }
        });
        
        if (response.status === 401) {
            // إذا البطاقة منتهية الصلاحية أو غير موجودة، اطرده للصفحة الرئيسية
            localStorage.removeItem('admin_token');
            window.location.href = '/'; 
            throw new Error("غير مصرح لك");
        }
        return response.json();
    },

    // 4. تحديث حالة الطلب للأدمن (تحتاج بطاقة VIP)
    updateRequestStatus: async (id, status) => {
        const token = localStorage.getItem('admin_token');
        const response = await fetch(`${API_URL}/api/requests/${id}/status?status=${status}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}` // إرفاق البطاقة هنا
            }
        });
        
        if (response.status === 401) {
            localStorage.removeItem('admin_token');
            window.location.href = '/';
            throw new Error("غير مصرح لك");
        }
        return response.json();
    }
};