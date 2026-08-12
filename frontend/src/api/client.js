import axios from 'axios';

// هنا السحر: سيأخذ الرابط من Netlify، وإذا لم يجده سيستخدم المحلي
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
    baseURL: `${apiUrl}/api`, 
    headers: {
        'Content-Type': 'application/json'
    }
});

export const requestService = {
    createRequest: async (requestData) => {
        try {
            const response = await apiClient.post('/requests/', requestData);
            return response.data;
        } catch (error) {
            console.error("خطأ في إرسال الطلب:", error);
            throw error;
        }
    },
    getAllRequests: async () => {
        try {
            const response = await apiClient.get('/requests/');
            return response.data;
        } catch (error) {
            console.error("خطأ في جلب الطلبات:", error);
            throw error;
        }
    },
    updateRequestStatus: async (id, status) => {
        try {
            const response = await apiClient.put(`/requests/${id}/status?status=${status}`);
            return response.data;
        } catch (error) {
            console.error("خطأ في تحديث الحالة:", error);
            throw error;
        }
    }
};