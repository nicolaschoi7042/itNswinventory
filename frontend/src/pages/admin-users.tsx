import { FileSpreadsheet, Plus, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppHeader } from "@/components/layout/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import * as api from "@/lib/api";
import { exportToExcel } from "@/lib/api";
import type { User } from "@/types";

const ROLES = [
  { value: "admin", label: "관리자" },
  { value: "manager", label: "매니저" },
  { value: "user", label: "사용자" },
];

function roleBadge(role: string) {
  if (role === "admin") return <Badge className="bg-indigo-100 text-indigo-700">관리자</Badge>;
  if (role === "manager") return <Badge className="bg-blue-100 text-blue-700">매니저</Badge>;
  return <Badge variant="secondary">사용자</Badge>;
}

export function AdminUsersPage() {
  const [data, setData] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState("");
  const [form, setForm] = useState({ username: "", password: "", full_name: "", email: "", role: "" });
  const [syncing, setSyncing] = useState(false);

  const load = () => api.users.list().then(setData);
  useEffect(() => { load(); }, []);

  const filtered = data.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.username.toLowerCase().includes(q) || u.full_name?.toLowerCase().includes(q);
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleCreate = async () => {
    try {
      await api.users.create(form);
      toast.success("사용자가 생성되었습니다");
      setModalOpen(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "생성에 실패했습니다");
    }
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;
    try {
      await api.users.updateRole(selectedUser.id, newRole);
      toast.success("권한이 변경되었습니다");
      setRoleModalOpen(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "권한 변경에 실패했습니다");
    }
  };

  const handleStatusToggle = async (user: User) => {
    try {
      await api.users.updateStatus(user.id, !user.is_active);
      toast.success(`${user.username} 상태가 변경되었습니다`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "상태 변경에 실패했습니다");
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.users.syncLdap();
      toast.success("LDAP 동기화 완료");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "LDAP 동기화 실패");
    } finally {
      setSyncing(false);
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setRoleModalOpen(true);
  };

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleString("ko-KR") : "-";

  return (
    <>
      <AppHeader title="사용자 관리" />
      <div className="flex-1 space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="사용자명, 이름으로 검색..." className="w-64 pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v ?? "")}>
              <SelectTrigger className="w-32"><SelectValue placeholder="전체 권한" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체 권한</SelectItem>
                {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportToExcel("users")}>
              <FileSpreadsheet className="mr-1.5 h-4 w-4" /> 엑셀 내보내기
            </Button>
            <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
              <RefreshCw className={`mr-1.5 h-4 w-4 ${syncing ? "animate-spin" : ""}`} /> LDAP 동기화
            </Button>
            <Button size="sm" onClick={() => { setForm({ username: "", password: "", full_name: "", email: "", role: "" }); setModalOpen(true); }}>
              <Plus className="mr-1.5 h-4 w-4" /> 신규 사용자
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>사용자명</TableHead>
                <TableHead>이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>권한</TableHead>
                <TableHead className="text-center">상태</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead>최근 로그인</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="py-8 text-center text-muted-foreground">데이터 없음</TableCell></TableRow>
              ) : filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.username}</TableCell>
                  <TableCell>{u.full_name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>{roleBadge(u.role)}</TableCell>
                  <TableCell className="text-center">
                    <Switch checked={u.is_active} onCheckedChange={() => handleStatusToggle(u)} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{fmtDate(u.created_at)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{fmtDate(u.last_login)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openRoleModal(u)}>
                      <ShieldCheck className="mr-1 h-3.5 w-3.5" /> 권한 변경
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create user dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>신규 사용자</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>사용자명 *</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
            <div className="grid gap-2"><Label>비밀번호 *</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <div className="grid gap-2"><Label>이름 *</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div className="grid gap-2"><Label>이메일</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="grid gap-2">
              <Label>권한 *</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v ?? "" })}>
                <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                <SelectContent>{ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>취소</Button>
              <Button onClick={handleCreate} disabled={!form.username || !form.password || !form.full_name || !form.role}>저장</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Role change dialog */}
      <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>권한 변경</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <p className="text-sm">사용자: <strong>{selectedUser?.username}</strong></p>
            <div className="grid gap-2">
              <Label>새 권한</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v ?? "")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setRoleModalOpen(false)}>취소</Button>
              <Button onClick={handleRoleChange}>변경</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
