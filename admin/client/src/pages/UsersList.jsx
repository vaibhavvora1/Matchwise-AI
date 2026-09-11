import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Users,
  Shield,
  UserX,
  UserCheck,
  Eye,
  RotateCcw,
} from 'lucide-react'
import {
  getUsersList,
  updateUserRole,
  updateUserStatus,
} from '../services/user.api'
import { useDebounce } from '../hooks/useDebounce'
import { useToast } from '../components/ui/Toast'
import StatusBadge from '../components/ui/StatusBadge'
import Pagination from '../components/ui/Pagination'
import ConfirmModal from '../components/ui/ConfirmModal'
import { TableSkeleton } from '../components/ui/Skeleton'

export const UsersList = () => {
  const { toastSuccess, toastError } = useToast()

  const [usersList, setUsersList] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 15 })
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 400)
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Actions
  const [modalAction, setModalAction] = useState(null) // { type: 'status' | 'role', user: object, targetValue: any }
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchUsers = useCallback(
    async (page = 1) => {
      setLoading(true)
      try {
        const data = await getUsersList({
          page,
          limit: 15,
          search: debouncedSearch,
          role: roleFilter,
          status: statusFilter,
        })
        if (data) {
          setUsersList(data.users || [])
          setPagination(data.pagination || { page, totalPages: 1, total: 0, limit: 15 })
        }
      } catch (err) {
        console.error('[UsersList] Fetch error:', err.message)
        toastError('Failed to load user accounts.')
      } finally {
        setLoading(false)
      }
    },
    [debouncedSearch, roleFilter, statusFilter, toastError],
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, roleFilter, statusFilter])

  useEffect(() => {
    fetchUsers(currentPage)
  }, [currentPage, fetchUsers])

  const handleConfirmAction = async () => {
    if (!modalAction) return
    setIsProcessing(true)

    try {
      if (modalAction.type === 'status') {
        await updateUserStatus(modalAction.user.id, modalAction.targetValue)
        toastSuccess(
          `User ${modalAction.user.username} has been ${
            modalAction.targetValue ? 'activated' : 'deactivated'
          }.`,
        )
      } else if (modalAction.type === 'role') {
        await updateUserRole(modalAction.user.id, modalAction.targetValue)
        toastSuccess(
          `User ${modalAction.user.username} role updated to '${modalAction.targetValue}'.`,
        )
      }

      setModalAction(null)
      await fetchUsers(currentPage)
    } catch (err) {
      toastError(err.response?.data?.message || 'Action failed.')
    } finally {
      setIsProcessing(false)
    }
  }

  const resetFilters = () => {
    setSearchInput('')
    setRoleFilter('')
    setStatusFilter('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            User Directory
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            View, search, and manage registered MatchWise AI user accounts safely.
          </p>
        </div>

        {(searchInput || roleFilter || statusFilter) && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw size={14} />
            Reset Filters
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by username or email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Roles</option>
              <option value="user">Standard User</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Deactivated Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800/90 overflow-hidden backdrop-blur-xl shadow-xl">
        {loading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : usersList.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
              <Users size={24} />
            </div>
            <h4 className="text-lg font-bold text-white">No user accounts found</h4>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              {searchInput || roleFilter || statusFilter
                ? 'No users match your filter criteria.'
                : 'No users registered in the database.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">User Account</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Login Activity</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {usersList.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    {/* User info */}
                    <td className="py-4 px-4 sm:px-6 font-medium text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 font-bold flex items-center justify-center text-sm shrink-0">
                          {user.username[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-100">{user.username}</p>
                          <p className="text-xs text-slate-400 font-normal">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={user.role} size="sm" />
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge
                        status={user.isActive ? 'active' : 'inactive'}
                        size="sm"
                      />
                    </td>

                    {/* Login stats */}
                    <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-400">
                      <div>
                        <span>Logins: </span>
                        <span className="font-bold text-slate-200">
                          {user.loginCount || 0}
                        </span>
                      </div>
                      {user.lastLoginAt ? (
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Last: {new Date(user.lastLoginAt).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Never</span>
                      )}
                    </td>

                    {/* Registered Date */}
                    <td className="py-4 px-4 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Status Toggle Button */}
                        <button
                          type="button"
                          onClick={() =>
                            setModalAction({
                              type: 'status',
                              user,
                              targetValue: !user.isActive,
                            })
                          }
                          className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                            user.isActive
                              ? 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 border-transparent hover:border-amber-500/20'
                              : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20'
                          }`}
                          title={user.isActive ? 'Deactivate User' : 'Activate User'}
                        >
                          {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>

                        {/* View User Details */}
                        <Link
                          to={`/users/${user.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-colors"
                          title="View User Details"
                        >
                          <Eye size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="border-t border-slate-800/80 bg-slate-950/40 px-4 sm:px-6">
          <Pagination
            pagination={pagination}
            onPageChange={(page) => setCurrentPage(page)}
            loading={loading}
          />
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(modalAction)}
        title={
          modalAction?.type === 'status'
            ? modalAction?.targetValue
              ? `Activate User Account`
              : `Deactivate User Account`
            : `Change User Role`
        }
        message={
          modalAction?.type === 'status'
            ? `Are you sure you want to ${
                modalAction?.targetValue ? 'activate' : 'deactivate'
              } account "${modalAction?.user?.username}"?`
            : `Are you sure you want to change role for "${modalAction?.user?.username}" to "${modalAction?.targetValue}"?`
        }
        confirmText="Confirm Action"
        isDestructive={modalAction?.type === 'status' && !modalAction?.targetValue}
        isLoading={isProcessing}
        onConfirm={handleConfirmAction}
        onCancel={() => setModalAction(null)}
      />
    </div>
  )
}

export default UsersList
