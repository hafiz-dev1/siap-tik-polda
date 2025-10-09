// file: src/app/(app)/log-activity/ActivityLogClient.tsx
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  Download, 
  Filter, 
  Search, 
  Calendar,
  User,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import type { ActivityCategory, ActivityType } from '@/lib/activityLogger';
import { 
  getActivityLogs, 
  getActivityStats, 
  exportActivityLogsToCSV,
  getUsersForFilter,
  clearActivityLogs,
  clearAllActivityLogs,
} from './actions';

interface Session {
  operatorId: string;
  username: string;
  nama: string;
  role: string;
}

interface ActivityLogClientProps {
  session: Session;
}

export default function ActivityLogClient({ session }: ActivityLogClientProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [clearDays, setClearDays] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState<ActivityCategory | ''>('');
  const [typeFilter, setTypeFilter] = useState<ActivityType | ''>('');
  const [userFilter, setUserFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const isSuperAdmin = session.role === 'SUPER_ADMIN';

  // Load initial data
  useEffect(() => {
    loadData();
    loadStats();
    if (isSuperAdmin) {
      loadUsers();
    }
  }, [currentPage, pageSize, categoryFilter, typeFilter, userFilter, startDate, endDate]);

  const loadData = async () => {
    setLoading(true);
    const result = await getActivityLogs({
      page: currentPage,
      limit: pageSize,
      category: categoryFilter || undefined,
      type: typeFilter || undefined,
      userId: userFilter || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (result.logs) {
      setLogs(result.logs);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
    }
    setLoading(false);
  };

  const loadStats = async () => {
    const result = await getActivityStats();
    if (!result.error) {
      setStats(result);
    }
  };

  const loadUsers = async () => {
    const result = await getUsersForFilter();
    if (result.users) {
      setUsers(result.users);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    const result = await exportActivityLogsToCSV({
      category: categoryFilter || undefined,
      type: typeFilter || undefined,
      userId: userFilter || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (result.csv) {
      // Create blob and download
      const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = result.filename;
      link.click();
      URL.revokeObjectURL(link.href);
    }
    setExporting(false);
  };

  const resetFilters = () => {
    setCategoryFilter('');
    setTypeFilter('');
    setUserFilter('');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleClearLogs = async () => {
    if (!isSuperAdmin) return;

    setClearing(true);
    const result = await clearActivityLogs({
      olderThanDays: clearDays,
      category: categoryFilter || undefined,
      type: typeFilter || undefined,
      userId: userFilter || undefined,
    });

    if (result.success) {
      toast.success(result.message, {
        duration: 4000,
        icon: '✅',
      });
      setShowClearModal(false);
      loadData();
      loadStats();
    } else if (result.error) {
      toast.error(result.error, {
        duration: 4000,
        icon: '❌',
      });
    }
    setClearing(false);
  };

  const handleClearAllLogs = async () => {
    if (!isSuperAdmin) return;

    setClearing(true);
    const result = await clearAllActivityLogs();

    if (result.success) {
      toast.success(result.message, {
        duration: 4000,
        icon: '✅',
      });
      setShowClearAllModal(false);
      loadData();
      loadStats();
    } else if (result.error) {
      toast.error(result.error, {
        duration: 4000,
        icon: '❌',
      });
    }
    setClearing(false);
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      
      // Langsung panggil getActivityLogs dan getActivityStats tanpa loadData/loadStats
      // untuk menghindari konflik setLoading
      const [logsResult, statsResult] = await Promise.all([
        getActivityLogs({
          page: currentPage,
          limit: pageSize,
          category: categoryFilter || undefined,
          type: typeFilter || undefined,
          userId: userFilter || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
        getActivityStats()
      ]);

      if (logsResult.logs) {
        setLogs(logsResult.logs);
        setTotalPages(logsResult.pagination.totalPages);
        setTotal(logsResult.pagination.total);
      }

      if (!statsResult.error) {
        setStats(statsResult);
      }

      toast.success('Data berhasil di-refresh', {
        duration: 2000,
        icon: '🔄',
      });
    } catch (error) {
      toast.error('Gagal refresh data', {
        duration: 2000,
        icon: '❌',
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Filter logs by search query
  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.description.toLowerCase().includes(query) ||
      log.user.nama.toLowerCase().includes(query) ||
      log.user.username.toLowerCase().includes(query) ||
      log.category.toLowerCase().includes(query) ||
      log.type.toLowerCase().includes(query)
    );
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'WARNING':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: ActivityCategory) => {
    const colors: Record<ActivityCategory, string> = {
      AUTH: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      SURAT: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      USER: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      PROFILE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      TRASH: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      SYSTEM: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type: ActivityType) => {
    const colors: Record<string, string> = {
      CREATE: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
      UPDATE: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      DELETE: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
      LOGIN: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400',
      LOGOUT: 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
    };
    return colors[type] || 'bg-gray-50 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Log</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalLogs.toLocaleString()}
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Hari Ini</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.todayLogs.toLocaleString()}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Kategori</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.categoryStats.length}
                </p>
              </div>
              <Filter className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">User Aktif</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {isSuperAdmin ? users.length : '1'}
                </p>
              </div>
              <User className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter & Pencarian
          </h2>
          <button
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pencarian
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari aktivitas..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                  title="Hapus pencarian"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kategori
            </label>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value as ActivityCategory | '');
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-10 cursor-pointer"
              >
                <option value="">Semua Kategori</option>
                <option value="AUTH">Autentikasi</option>
                <option value="SURAT">Surat</option>
                <option value="USER">Pengguna</option>
                <option value="PROFILE">Profil</option>
                <option value="TRASH">Trash</option>
                <option value="SYSTEM">Sistem</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipe Aktivitas
            </label>
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as ActivityType | '');
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-10 cursor-pointer"
              >
                <option value="">Semua Tipe</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="CREATE">Buat</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Hapus</option>
                <option value="RESTORE">Pulihkan</option>
                <option value="PERMANENT_DELETE">Hapus Permanen</option>
                <option value="VIEW">Lihat</option>
                <option value="DOWNLOAD">Unduh</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* User Filter (Super Admin only) */}
          {isSuperAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pengguna
              </label>
              <div className="relative">
                <select
                  value={userFilter}
                  onChange={(e) => {
                    setUserFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-10 cursor-pointer"
                >
                  <option value="">Semua Pengguna</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nama} ({user.username})
                    </option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex justify-between items-center">
          {/* Clear Logs - Only for Super Admin */}
          {isSuperAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearModal(true)}
                disabled={clearing}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                Clear Logs Lama
              </button>
              <button
                onClick={() => setShowClearAllModal(true)}
                disabled={clearing}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                Clear Semua
              </button>
            </div>
          )}

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 ml-auto cursor-pointer disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Mengekspor...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Riwayat Aktivitas
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Total {total.toLocaleString()} aktivitas tercatat
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
              refreshing 
                ? 'bg-blue-500 text-white cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 cursor-pointer disabled:cursor-not-allowed'
            }`}
            title={refreshing ? 'Sedang refresh...' : 'Refresh data'}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Tidak ada log aktivitas</p>
          </div>
        ) : (
          <>
            <div className="overflow-auto max-h-[60vh] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              <table className="min-w-full leading-normal">
                <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
                  <tr>
                    <th className="px-4 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider backdrop-blur-sm">
                      No.
                    </th>
                    <th className="px-4 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider backdrop-blur-sm">
                      Waktu
                    </th>
                    <th className="px-4 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider backdrop-blur-sm">
                      Pengguna
                    </th>
                    <th className="px-3 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider backdrop-blur-sm">
                      Kategori
                    </th>
                    <th className="px-3 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider backdrop-blur-sm">
                      Tipe
                    </th>
                    <th className="px-4 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider backdrop-blur-sm">
                      Deskripsi
                    </th>
                    <th className="px-3 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider backdrop-blur-sm">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {filteredLogs.map((log, index) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                        {((currentPage - 1) * pageSize) + index + 1}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-900 dark:text-gray-300">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {new Date(log.createdAt).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(log.createdAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate" title={log.user.nama}>
                            {log.user.nama}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate" title={log.user.username}>
                            @{log.user.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full whitespace-nowrap ${getCategoryColor(log.category)}`}>
                          {log.category}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-md whitespace-nowrap ${getTypeColor(log.type)}`}>
                          {log.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        <div className="line-clamp-2" title={log.description}>
                          {log.description}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center">
                          {getStatusIcon(log.status)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Pagination - Separate component like arsip */}
      {!loading && filteredLogs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-gray-200 dark:border-gray-700 text-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">Tampilkan:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                >
                  {[25, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n} / halaman
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, total)} dari {total} item
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className={`w-9 h-9 flex items-center justify-center rounded border text-sm ${
                  currentPage === 1
                    ? 'cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600'
                    : 'cursor-pointer bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'
                }`}
                aria-label="First Page"
              >
                «
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-3 h-9 rounded border text-sm flex items-center ${
                  currentPage === 1
                    ? 'cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600'
                    : 'cursor-pointer bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Prev
              </button>
              <span className="px-4 h-9 inline-flex items-center justify-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 h-9 rounded border text-sm flex items-center ${
                  currentPage === totalPages
                    ? 'cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600'
                    : 'cursor-pointer bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'
                }`}
              >
                Next
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className={`w-9 h-9 flex items-center justify-center rounded border text-sm ${
                  currentPage === totalPages
                    ? 'cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600'
                    : 'cursor-pointer bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'
                }`}
                aria-label="Last Page"
              >
                »
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Logs Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Clear Activity Logs Lama
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Hapus log aktivitas yang lebih lama dari jumlah hari yang ditentukan.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hapus log lebih lama dari (hari):
              </label>
              <input
                type="number"
                min="1"
                value={clearDays}
                onChange={(e) => setClearDays(parseInt(e.target.value) || 30)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Log yang dibuat lebih dari {clearDays} hari yang lalu akan dihapus
              </p>
            </div>

            {categoryFilter && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-2">
                ⚠️ Hanya kategori: <strong>{categoryFilter}</strong>
              </p>
            )}
            {typeFilter && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-2">
                ⚠️ Hanya tipe: <strong>{typeFilter}</strong>
              </p>
            )}
            {userFilter && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-2">
                ⚠️ Hanya user yang dipilih
              </p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowClearModal(false)}
                disabled={clearing}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Batal
              </button>
              <button
                onClick={handleClearLogs}
                disabled={clearing}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200"
              >
                {clearing ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Logs Modal */}
      {showClearAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Peringatan!
            </h3>
            <p className="text-gray-900 dark:text-white font-semibold mb-2">
              Anda akan menghapus SEMUA activity logs!
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Tindakan ini tidak dapat dibatalkan. Semua riwayat aktivitas akan dihapus permanen dari database.
            </p>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 dark:text-red-300">
                <strong>Total logs yang akan dihapus: {stats?.totalLogs || 0}</strong>
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowClearAllModal(false)}
                disabled={clearing}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Batal
              </button>
              <button
                onClick={handleClearAllLogs}
                disabled={clearing}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200"
              >
                {clearing ? 'Menghapus...' : 'Ya, Hapus Semua'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
