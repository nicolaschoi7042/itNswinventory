import { FileSpreadsheet, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppHeader } from "@/components/layout/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import * as api from "@/lib/api";
import { exportToExcel } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { Employee } from "@/types";

const DEPARTMENTS = ["개발팀", "영업팀", "인사팀", "재무팀"];

export function EmployeesPage() {
  const { isManager, isAdmin } = useAuthStore();
  const [data, setData] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", department: "", email: "", phone: "" });

  const load = () => api.employees.list().then(setData);
  useEffect(() => { load(); }, []);

  const filtered = data.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.name.toLowerCase().includes(q) || e.department.toLowerCase().includes(q) || e.employee_id?.toLowerCase().includes(q);
    const matchDept = !deptFilter || e.department === deptFilter;
    return matchSearch && matchDept;
  });

  const openCreate = () => {
    setEditId(null);
    setForm({ name: "", department: "", email: "", phone: "" });
    setModalOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setEditId(emp.id);
    setForm({ name: emp.name, department: emp.department, email: emp.email || "", phone: emp.phone || "" });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editId) {
        await api.employees.update(editId, form);
        toast.success("임직원 정보가 수정되었습니다");
      } else {
        await api.employees.create(form);
        toast.success("임직원이 등록되었습니다");
      }
      setModalOpen(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "저장에 실패했습니다");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await api.employees.delete(id);
      toast.success("임직원이 삭제되었습니다");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "삭제에 실패했습니다");
    }
  };

  return (
    <>
      <AppHeader title="임직원 관리" />
      <div className="flex-1 space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="이름, 부서, 사번으로 검색..." className="w-64 pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={deptFilter} onValueChange={(v) => setDeptFilter(v ?? "")}>
              <SelectTrigger className="w-36"><SelectValue placeholder="전체 부서" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체 부서</SelectItem>
                {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportToExcel("employees")}>
              <FileSpreadsheet className="mr-1.5 h-4 w-4" /> 엑셀 내보내기
            </Button>
            {isManager() && (
              <Button size="sm" onClick={openCreate}>
                <Plus className="mr-1.5 h-4 w-4" /> 신규 등록
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>사번</TableHead>
                <TableHead>이름</TableHead>
                <TableHead>부서</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead className="text-center">할당 자산</TableHead>
                {isManager() && <TableHead className="text-right">작업</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">데이터 없음</TableCell></TableRow>
              ) : filtered.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-xs">{e.employee_id}</TableCell>
                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell><Badge variant="secondary">{e.department}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{e.email}</TableCell>
                  <TableCell className="text-muted-foreground">{e.phone}</TableCell>
                  <TableCell className="text-center">{e.assigned_assets ?? 0}</TableCell>
                  {isManager() && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(e)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {isAdmin() && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(e.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "임직원 수정" : "임직원 등록"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>이름 *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>부서 *</Label>
              <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v ?? "" })}>
                <SelectTrigger><SelectValue placeholder="선택하세요" /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>이메일</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>연락처</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>취소</Button>
              <Button onClick={handleSubmit} disabled={!form.name || !form.department}>저장</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
