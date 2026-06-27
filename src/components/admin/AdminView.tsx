"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import {
  Shield,
  Users,
  BookOpen,
  Trophy,
  Award,
  Swords,
  MessageCircle,
  FolderKanban,
  TrendingUp,
  Loader2,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Star,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AdminStats {
  totalUsers: number;
  totalLessonsCompleted: number;
  totalQuizzesTaken: number;
  totalPosts: number;
  totalProjectsSubmitted: number;
  totalChallengesCompleted: number;
  totalCertificates: number;
  avgQuizScore: number;
  activeUsersThisWeek: number;
  totalXP: number;
  totalAchievementsEarned: number;
  totalAchievements: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  xp: number;
  coins: number;
  streak: number;
  createdAt: string;
  lastLoginDate: string | null;
  avatar: string | null;
}

const statCards = [
  { key: "totalUsers", label: "Total Users", icon: Users, color: "text-js-yellow", bg: "bg-js-yellow/10" },
  { key: "activeUsersThisWeek", label: "Active This Week", icon: TrendingUp, color: "text-js-emerald", bg: "bg-js-emerald/10" },
  { key: "totalLessonsCompleted", label: "Lessons Completed", icon: BookOpen, color: "text-js-sky", bg: "bg-js-sky/10" },
  { key: "totalQuizzesTaken", label: "Quizzes Taken", icon: Star, color: "text-js-violet", bg: "bg-js-violet/10" },
  { key: "totalChallengesCompleted", label: "Challenges Solved", icon: Swords, color: "text-js-rose", bg: "bg-js-rose/10" },
  { key: "totalCertificates", label: "Certificates Issued", icon: Award, color: "text-amber-500", bg: "bg-amber-500/10" },
  { key: "totalPosts", label: "Forum Posts", icon: MessageCircle, color: "text-js-sky", bg: "bg-js-sky/10" },
  { key: "totalProjectsSubmitted", label: "Projects Submitted", icon: FolderKanban, color: "text-js-violet", bg: "bg-js-violet/10" },
];

export function AdminView() {
  const { user } = useAppStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      toast.error("Failed to load admin stats");
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  const fetchUsers = useCallback(async (p: number, search: string) => {
    setIsLoadingUsers(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(limit) });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setTotal(data.total);
      }
    } catch {
      toast.error("Failed to load users");
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role !== "admin") return;
    fetchStats();
    fetchUsers(1, "");
  }, [user, fetchStats, fetchUsers]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
    fetchUsers(1, value);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingUserId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        toast.success(`User role updated to ${newRole}`);
        fetchUsers(page, searchTerm);
        if (userId === user?.id) {
          // Refresh current user data in store if role changed
        }
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update role");
      }
    } catch {
      toast.error("Failed to update role");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setDeletingUserId(userId);
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("User deleted successfully");
        fetchUsers(page, searchTerm);
        fetchStats();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete user");
      }
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setDeletingUserId(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    fetchUsers(newPage, searchTerm);
  };

  // Access denied for non-admins
  if (!user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 mb-6">
            <Shield className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-3">Access Denied</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            You do not have permission to access the admin panel. This area is restricted to administrators only.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-js-violet/10">
            <Shield className="h-5 w-5 text-js-violet" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Manage users, monitor platform activity</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          const value = stats ? stats[stat.key as keyof AdminStats] : 0;
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg shrink-0", stat.bg)}>
                      <Icon className={cn("h-4 w-4", stat.color)} />
                    </div>
                    <div className="min-w-0">
                      {isLoadingStats ? (
                        <div className="h-5 w-12 bg-muted animate-pulse rounded" />
                      ) : (
                        <p className="text-lg sm:text-xl font-bold truncate">{value.toLocaleString()}</p>
                      )}
                      <p className="text-[11px] text-muted-foreground truncate">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Additional Stats Row */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="glass-card">
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Avg Quiz Score</p>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-js-yellow" />
                    <span className="text-lg font-bold">{stats.avgQuizScore}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total XP Earned</p>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-js-yellow" />
                    <span className="text-lg font-bold">{stats.totalXP.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Achievements Earned</p>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-js-emerald" />
                    <span className="text-lg font-bold">{stats.totalAchievementsEarned}/{stats.totalAchievements}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Weekly Active Rate</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-js-sky" />
                    <span className="text-lg font-bold">
                      {stats.totalUsers > 0 ? Math.round((stats.activeUsersThisWeek / stats.totalUsers) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* User Management */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-0">
            {/* User Table Header */}
            <div className="p-4 sm:p-6 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">User Management</h2>
                <p className="text-xs text-muted-foreground">{total} total users</p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Email</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">XP</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Streak</TableHead>
                    <TableHead className="text-xs">Role</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Joined</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingUsers ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <TableCell key={j}>
                            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-js-sky/20 flex items-center justify-center text-xs font-bold text-js-sky shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-sm truncate max-w-[120px] sm:max-w-none">{u.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground truncate max-w-[150px] sm:max-w-none">
                          {u.email}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm font-medium text-js-yellow">{u.xp}</span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="text-sm">{u.streak} days</span>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={u.role}
                            onValueChange={(value) => handleRoleChange(u.id, value)}
                            disabled={updatingUserId === u.id || u.id === user.id}
                          >
                            <SelectTrigger className={cn(
                              "w-[110px] h-8 text-xs",
                              u.role === "admin" && "border-js-violet/50 text-js-violet"
                            )}>
                              {updatingUserId === u.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <SelectValue />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">
                                <span className="flex items-center gap-1.5">
                                  <Users className="h-3 w-3" />Student
                                </span>
                              </SelectItem>
                              <SelectItem value="admin">
                                <span className="flex items-center gap-1.5">
                                  <Shield className="h-3 w-3" />Admin
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={deletingUserId === u.id || u.id === user.id}
                          >
                            {deletingUserId === u.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Page {page} of {totalPages} ({total} users)
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs font-medium px-3">{page}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}