import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Table from '@/components/table/Table';
import type { ColumnConfig, TableQueryState } from '@/components/table/types';
import { userService } from '@/services';
import type { User } from '@/types';



type TableUser = User & Record<string, unknown>

const DEFAULT_SORT_FIELD = 'created_at';
const DEFAULT_SORT_ORDER: TableQueryState['sortDirection'] = 'desc';

const Users: React.FC = () => {
    const navigate = useNavigate();

    const fetchUsers = useCallback(async (query: TableQueryState) => {
        const response = await userService.getUsers({
            page: query.page,
            limit: query.pageSize,
            search: query.query || undefined,
            sortField: query.sortField,
            sortOrder: query.sortDirection,
        });

        return {
            data: response.data as TableUser[],
            total: response.total,
            emptyMessage: query.query
                ? 'No users found with search criteria'
                : 'No users available',
        };
    }, []);

    const handleRowClick = (user: TableUser) => {
        navigate(`/admin/users/${user.id}`);
    };

    const getStatusFromRoles = (roles: string[]): string => {
        if (roles.includes('superAdmin')) return 'Super Admin';
        if (roles.includes('admin')) return 'Admin';
        if (roles.includes('support')) return 'Support';
        return 'User';
    };

    const columns: ColumnConfig<TableUser>[] = [
        {
            name: 'Name',
            field: 'name',
            sort: true,
        },
        {
            name: 'Email',
            field: 'email',
            sort: true,
        },
        {
            name: 'Status',
            field: 'roles',
            sort: true,
            render: (_: unknown, row) => getStatusFromRoles(row.roles),
        },
        {
            name: 'Date of Joining',
            field: 'created_at',
            sort: true,
            render: (_: unknown, row) => new Date(row.created_at).toLocaleDateString(),
        },
    ];

    return (
        <div className="p-6">
            <h1 className="mb-6 text-2xl font-bold">Users</h1>

            <Table<TableUser>
                columns={columns}
                rowKey="id"
                onRowClick={handleRowClick}
                showSearch
                className="w-full"
                dataSource={{
                    fetchData: fetchUsers,
                    initialQuery: {
                        page: 1,
                        pageSize: 10,
                        query: '',
                        sortField: DEFAULT_SORT_FIELD,
                        sortDirection: DEFAULT_SORT_ORDER,
                    },
                }}
            />
        </div>
    );
};

export default Users;
