import { useNavigate } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminPanel from '@/components/admin/AdminPanel';

const AdminPanelPage = () => {
    const navigate = useNavigate();
    return (
        <ProtectedRoute requireAdmin>
            <AdminPanel onBack={() => navigate('/dashboard')} />
        </ProtectedRoute>
    );
};

export default AdminPanelPage;
