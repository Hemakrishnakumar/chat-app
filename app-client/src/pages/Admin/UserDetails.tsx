import { API_ENDPOINTS, apiClient } from '@/api';
import { ConfirmModal } from '@/components/modals';
import Pagination from '@/components/table/Pagination';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import Skeleton from '@/components/ui/skeleton';
import type { AuditLog, AuditLogsResponse, User, UserDevice } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, UserX, Shield, Activity, Monitor, ArrowLeft } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';



const UserDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [user, setUser] = useState<User | null>(null);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [devices, setDevices] = useState<UserDevice[]>([]);
    const [loading, setLoading] = useState(false);
    const [logsLoading, setLogsLoading] = useState(false);
    const [devicesLoading, setDevicesLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [showSoftDeleteModal, setShowSoftDeleteModal] = useState(false);
    const [showHardDeleteModal, setShowHardDeleteModal] = useState(false);

    const [logsPagination, setLogsPagination] = useState({
        page: 1,
        pageSize: 10,
        total: 0,
    });

    const fetchUserDetails = useCallback(async () => {
        try {
            setLoading(true);
            const userData = await apiClient.get<User>(API_ENDPOINTS.USERS.DETAIL(id!));

            if (!userData) {
                setError('User not found');
                return;
            }

            setUser(userData);
        } catch (error: unknown) {
            if (
                error &&
                typeof error === 'object' &&
                'statusCode' in error &&
                error.statusCode === 404
            ) {
                setError('User not found');
            } else {
                setError('Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchAuditLogs = useCallback(
        async (page = 1, limit = 10) => {
            try {
                setLogsLoading(true);
                const response = await apiClient.get<AuditLogsResponse>(
                    `${API_ENDPOINTS.AUDIT_LOGS}?user_id=${id}&page=${page}&limit=${limit}`,
                );
                setAuditLogs(response.data);
                setLogsPagination({
                    page: response.meta.page,
                    pageSize: response.meta.limit,
                    total: response.meta.total,
                });
            } catch {
                // Handle error silently or show user-friendly message
                setAuditLogs([]);
            } finally {
                setLogsLoading(false);
            }
        },
        [id],
    );

    const fetchUserDevices = useCallback(async () => {
        try {
            setDevicesLoading(true);
            const devicesData = await apiClient.get<UserDevice[]>(API_ENDPOINTS.USER_DEVICES(id!));
            setDevices(devicesData);
        } catch {
            // Handle error silently or show user-friendly message
            setDevices([]);
        } finally {
            setDevicesLoading(false);
        }
    }, [id]);

    const handleDelete = async (type: 'soft' | 'hard') => {
        try {
            setDeleteLoading(true);
            if (type === 'soft') {
                await apiClient.patch(API_ENDPOINTS.USERS.SOFT_DELETE(id!));
            } else {
                await apiClient.delete(API_ENDPOINTS.USERS.DELETE(id!));
            }
            navigate('/admin/users');
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setDeleteLoading(false);
            setShowSoftDeleteModal(false);
            setShowHardDeleteModal(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchUserDetails();
            fetchAuditLogs();
            fetchUserDevices();
        }
    }, [id, fetchUserDetails, fetchAuditLogs, fetchUserDevices]);

    const handleLogsPageChange = (page: number) => {
        fetchAuditLogs(page, logsPagination.pageSize);
    };

    const handleLogsPageSizeChange = (pageSize: number) => {
        fetchAuditLogs(1, pageSize);
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Skeleton width={80} height={36} />
                        <Skeleton width={200} height={36} />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton width={120} height={36} />
                        <Skeleton width={120} height={36} />
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton width={180} height={24} />
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton width={80} height={16} />
                                    <Skeleton width="100%" height={24} />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <Skeleton width={140} height={24} />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} height={80} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Skeleton width={160} height={24} />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} height={100} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center py-12">
                    <p className="text-lg text-gray-600">{error}</p>
                    <Button onClick={() => navigate('/admin/users')} className="mt-4">
                        Back to Users
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/admin/users')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <h1 className="text-3xl font-bold">User Details</h1>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowSoftDeleteModal(true)}
                        className="text-orange-600 hover:text-orange-700"
                    >
                        <UserX className="w-4 h-4 mr-2" />
                        Soft Delete
                    </Button>
                    <Button variant="destructive" onClick={() => setShowHardDeleteModal(true)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Hard Delete
                    </Button>
                </div>
            </div>

            {/* Profile Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Profile Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-muted-foreground mb-2">
                                Name
                            </label>
                            <p className="text-lg font-medium">{user?.name || 'N/A'}</p>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-muted-foreground mb-2">
                                Email
                            </label>
                            <p className="text-lg">{user?.email || 'N/A'}</p>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-muted-foreground mb-2">
                                Status
                            </label>
                            <p
                                className={`text-lg font-medium capitalize ${
                                    user?.status === 'active'
                                        ? 'text-green-600'
                                        : user?.status === 'inactive'
                                            ? 'text-orange-600'
                                            : 'text-red-600'
                                }`}
                            >
                                {user?.status || 'Active'}
                            </p>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-muted-foreground mb-2">
                                Date of Joining
                            </label>
                            <p className="text-lg">
                                {user?.created_at
                                    ? new Date(user.created_at).toLocaleDateString()
                                    : 'N/A'}
                            </p>
                        </div>
                        <div className="flex flex-col md:col-span-2">
                            <label className="text-sm font-medium text-muted-foreground mb-2">
                                Roles
                            </label>
                            {user?.roles && user.roles.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {user.roles.map((role) => (
                                        <span
                                            key={role}
                                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                                        >
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-lg text-muted-foreground">No roles assigned</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Activity Logs and Devices */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Logs */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            Activity Logs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {logsLoading ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton width="75%" height={16} />
                                        <Skeleton width="50%" height={12} />
                                    </div>
                                ))}
                            </div>
                        ) : auditLogs.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">
                                No activity logs available
                            </p>
                        ) : (
                            <>
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {auditLogs.map((log) => (
                                        <div
                                            key={log.id}
                                            className="border-l-4 border-blue-200 pl-4 py-3 bg-gray-50 rounded-r"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">
                                                        {log.action}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {log.resource}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        IP: {log.ip} •{' '}
                                                        {formatDistanceToNow(
                                                            new Date(log.created_at),
                                                        )}{' '}
                                                        ago
                                                    </p>
                                                </div>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        log.status === 'success'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {log.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Pagination
                                    pagination={logsPagination}
                                    onPageChange={handleLogsPageChange}
                                    onPageSizeChange={handleLogsPageSizeChange}
                                    className="mt-4"
                                />
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Logged-in Devices */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Monitor className="w-5 h-5" />
                            Logged-in Devices
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {devicesLoading ? (
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton width="100%" height={16} />
                                        <Skeleton width="66%" height={12} />
                                    </div>
                                ))}
                            </div>
                        ) : devices.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">
                                No devices found
                            </p>
                        ) : (
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {devices.map((device) => (
                                    <div
                                        key={device.id}
                                        className="border rounded-lg p-4 bg-gray-50"
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <Monitor className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-medium text-sm">
                                                {device.device_type}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">
                                                <span className="font-medium">Browser:</span>{' '}
                                                {device.browser}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                <span className="font-medium">IP:</span> {device.ip}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                <span className="font-medium">Last active:</span>{' '}
                                                {formatDistanceToNow(new Date(device.last_active))}{' '}
                                                ago
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modals */}
            <ConfirmModal
                isOpen={showSoftDeleteModal}
                onClose={() => setShowSoftDeleteModal(false)}
                onConfirm={() => handleDelete('soft')}
                title="Soft Delete User"
                message="Are you sure you want to soft delete this user? The user will be marked as inactive but data will be preserved."
                confirmText="Soft Delete"
                cancelText="Cancel"
                variant="info"
                isLoading={deleteLoading}
            />

            <ConfirmModal
                isOpen={showHardDeleteModal}
                onClose={() => setShowHardDeleteModal(false)}
                onConfirm={() => handleDelete('hard')}
                title="Hard Delete User"
                message="This action cannot be undone. Are you sure you want to permanently delete this user and all associated data?"
                confirmText="Delete Permanently"
                cancelText="Cancel"
                variant="danger"
                isLoading={deleteLoading}
            />
        </div>
    );
};

export default UserDetails;
