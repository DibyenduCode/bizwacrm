"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trash2,
  Building,
  Mail,
  Calendar,
  X,
  Shield,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  account_id: string;
  account_role: string;
  status: "pending" | "active" | "deactivated";
  is_super_admin: boolean;
  accounts: {
    id: string;
    name: string;
  } | null;
}

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "active" | "deactivated">("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Delete modal state
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to load users");
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      toast.error(err.message || "Could not load user list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateStatus = async (userId: string, newStatus: "active" | "deactivated") => {
    setActionLoadingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      setUsers((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, status: newStatus } : u))
      );

      toast.success(
        newStatus === "active"
          ? "Account approved and activated! User can now access CRM."
          : "Account access deactivated."
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users?userId=${userToDelete.user_id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      setUsers((prev) => prev.filter((u) => u.user_id !== userToDelete.user_id));
      toast.success(`User ${userToDelete.email} was permanently deleted.`);
      setUserToDelete(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = users.length;
    const pending = users.filter((u) => u.status === "pending").length;
    const active = users.filter((u) => u.status === "active").length;
    const deactivated = users.filter((u) => u.status === "deactivated").length;
    return { total, pending, active, deactivated };
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (statusFilter !== "all" && u.status !== statusFilter) {
        return false;
      }
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const name = (u.full_name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const company = (u.accounts?.name || "").toLowerCase();
      return name.includes(q) || email.includes(q) || company.includes(q);
    });
  }, [users, statusFilter, search]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              User & Organization Administration
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 border border-primary/20 text-primary">
              <Sparkles className="h-3 w-3" />
              Live Console
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Review incoming company registrations, approve workspace access, and manage multi-tenant authorizations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            onClick={fetchUsers}
            disabled={loading}
            variant="outline"
            size="sm"
            className="border-border bg-card hover:bg-muted text-foreground h-9 px-3.5 rounded-xl gap-2 transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : "text-muted-foreground"}`} />
            <span>Refresh Data</span>
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Accounts */}
        <Card className="border-border bg-card/80 backdrop-blur-xs rounded-2xl shadow-xs hover:border-primary/40 transition-all group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5">
            <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Accounts
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-muted text-foreground border border-border group-hover:scale-105 transition-transform">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-1">
            <div className="text-3xl font-extrabold text-foreground tracking-tight">{metrics.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Platform companies & users</p>
          </CardContent>
        </Card>

        {/* Pending Review */}
        <Card className="border-amber-500/30 bg-card/80 backdrop-blur-xs rounded-2xl shadow-xs hover:border-amber-500/60 transition-all group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500/60" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5">
            <CardTitle className="text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>Pending Review</span>
              {metrics.pending > 0 && (
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30 group-hover:scale-105 transition-transform">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-1">
            <div className="text-3xl font-extrabold text-amber-500 tracking-tight">{metrics.pending}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Awaiting administrator activation</p>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card className="border-emerald-500/30 bg-card/80 backdrop-blur-xs rounded-2xl shadow-xs hover:border-emerald-500/60 transition-all group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500/60" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5">
            <CardTitle className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">
              Active Companies
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 group-hover:scale-105 transition-transform">
              <UserCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-1">
            <div className="text-3xl font-extrabold text-emerald-500 tracking-tight">{metrics.active}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Full CRM access authorized</p>
          </CardContent>
        </Card>

        {/* Deactivated */}
        <Card className="border-destructive/30 bg-card/80 backdrop-blur-xs rounded-2xl shadow-xs hover:border-destructive/60 transition-all group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-destructive/60" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5">
            <CardTitle className="text-[11px] font-bold text-destructive uppercase tracking-wider">
              Suspended Access
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-destructive/15 text-destructive border border-destructive/30 group-hover:scale-105 transition-transform">
              <UserX className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-1">
            <div className="text-3xl font-extrabold text-destructive tracking-tight">{metrics.deactivated}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Temporarily restricted</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border bg-card rounded-2xl shadow-xs">
        <CardContent className="p-3.5 sm:p-4 flex flex-col md:flex-row gap-3.5 justify-between items-stretch md:items-center">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted rounded-xl border border-border">
            {(
              [
                { id: "all", label: "All Users", count: metrics.total },
                { id: "pending", label: "Pending", count: metrics.pending },
                { id: "active", label: "Active", count: metrics.active },
                { id: "deactivated", label: "Suspended", count: metrics.deactivated },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    statusFilter === tab.id
                      ? "bg-primary-foreground/20 text-primary-foreground font-bold"
                      : "bg-background text-foreground border border-border"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80 flex items-center">
            <Search className="h-4 w-4 absolute left-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "2.75rem", paddingRight: search ? "2.5rem" : "1rem" }}
              className="w-full h-10 bg-background border border-input rounded-xl text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-border bg-card rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50 border-b border-border">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-foreground font-bold text-xs py-4 pl-6">
                  User Details
                </TableHead>
                <TableHead className="text-foreground font-bold text-xs py-4">
                  Organization / Company
                </TableHead>
                <TableHead className="text-foreground font-bold text-xs py-4">
                  Signup Date
                </TableHead>
                <TableHead className="text-foreground font-bold text-xs py-4">
                  Access Status
                </TableHead>
                <TableHead className="text-foreground font-bold text-xs py-4 pr-6 text-right">
                  Manage Access
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-52 text-center text-muted-foreground text-xs">
                    <RefreshCw className="h-7 w-7 animate-spin mx-auto mb-3 text-primary" />
                    Fetching registered organizations...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-44 text-center text-muted-foreground text-xs">
                    <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="font-semibold text-foreground">No accounts found</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Try adjusting your search terms or status filters</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = u.is_super_admin;
                  const isActionLoading = actionLoadingId === u.user_id;

                  return (
                    <TableRow
                      key={u.id}
                      className="border-border/60 hover:bg-muted/40 transition-colors"
                    >
                      {/* User Info */}
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shadow-xs">
                            {u.full_name ? u.full_name[0].toUpperCase() : u.email[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground text-xs">
                                {u.full_name || "Unnamed User"}
                              </span>
                              {u.is_super_admin && (
                                <Badge className="bg-primary/15 text-primary border-primary/30 text-[9px] px-1.5 py-0 h-4">
                                  Super Admin
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="font-mono text-xs">{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Company Info */}
                      <TableCell className="py-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                          <Building className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>{u.accounts?.name || "Personal Workspace"}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground capitalize ml-5 block mt-0.5 font-medium">
                          Role: <span className="text-foreground">{u.account_role || "owner"}</span>
                        </span>
                      </TableCell>

                      {/* Created At */}
                      <TableCell className="py-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>
                            {new Date(u.created_at).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-4">
                        {u.status === "active" ? (
                          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs px-2.5 py-1 gap-1.5 font-semibold rounded-lg">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </Badge>
                        ) : u.status === "pending" ? (
                          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs px-2.5 py-1 gap-1.5 font-semibold rounded-lg">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                            Pending Review
                          </Badge>
                        ) : (
                          <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-xs px-2.5 py-1 gap-1.5 font-semibold rounded-lg">
                            <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                            Suspended
                          </Badge>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-4 pr-6 text-right">
                        {isSelf ? (
                          <span className="text-xs text-muted-foreground italic pr-3 font-mono">
                            Master Admin (Self)
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            {/* Activate / Approve Action */}
                            {u.status !== "active" && (
                              <Button
                                size="sm"
                                disabled={isActionLoading}
                                onClick={() => handleUpdateStatus(u.user_id, "active")}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white h-8 px-3 text-xs gap-1.5 font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
                              >
                                {isActionLoading ? (
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                )}
                                {u.status === "pending" ? "Approve" : "Reactivate"}
                              </Button>
                            )}

                            {/* Deactivate Action */}
                            {u.status === "active" && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isActionLoading}
                                onClick={() => handleUpdateStatus(u.user_id, "deactivated")}
                                className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 h-8 px-3 text-xs gap-1.5 rounded-lg transition-all cursor-pointer font-medium"
                              >
                                {isActionLoading ? (
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5" />
                                )}
                                Deactivate
                              </Button>
                            )}

                            {/* Delete User */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setUserToDelete(u)}
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0 rounded-lg cursor-pointer transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Delete User Confirmation Modal */}
      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent className="border-border bg-card text-card-foreground sm:max-w-md rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete User Account
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs mt-1">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-foreground">{userToDelete?.email}</span>? This will permanently erase their workspace, contacts, and account records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUserToDelete(null)}
              className="border-border hover:bg-muted text-foreground rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteUser}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-1.5 rounded-xl cursor-pointer text-xs"
            >
              {deleting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Permanently Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
