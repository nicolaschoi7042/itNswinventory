import { FileSpreadsheet, Plus, RotateCcw, Search } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import * as api from "@/lib/api";
import { exportToExcel } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { Assignment, Employee, Hardware, Software } from "@/types";

export function AssignmentsPage() {
  const { isManager } = useAuthStore();
  const [data, setData] = useState<Assignment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [hwList, setHwList] = useState<Hardware[]>([]);
  const [swList, setSwList] = useState<Software[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ employee_id: "", asset_type: "", asset_id: "", assigned_date: "", notes: "" });

  const load = () => {
    api.assignments.list().then(setData);
    api.employees.list().then(setEmployees);
    api.hardware.list().then(setHwList);
    api.software.list().then(setSwList);
  };
  useEffect(() => { load(); }, []);

  const filtered = data.filter((a) => {
    const q = search.toLowerCase();
    return !q || a.employee_name?.toLowerCase().includes(q) || a.asset_tag?.toLowerCase().includes(q);
  });

  const openCreate = () => {
    setForm({ employee_id: "", asset_type: "", asset_id: "", assigned_date: new Date().toISOString().slice(0, 10), notes: "" });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      await api.assignments.create({
        employee_id: Number(form.employee_id),
        asset_type: form.asset_type,
        asset_id: Number(form.asset_id),
        notes: form.notes,
      });
      toast.success("자산이 할당되었습니다");
      setModalOpen(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "할당에 실패했습니다");
    }
  };

  const handleReturn = async (id: number) => {
    if (!confirm("자산을 반납하시겠습니까?")) return;
    try {
      await api.assignments.returnAsset(id);
      toast.success("자산이 반납되었습니다");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "반납에 실패했습니다");
    }
  };

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("ko-KR") : "-";

  const assetOptions = form.asset_type === "hardware"
    ? hwList.filter((h) => h.status === "대기중")
    : form.asset_type === "software"
      ? swList.filter((s) => s.current_users < s.total_licenses)
      : [];

  return (
    <>
      <AppHeader title="자산 할당 관리" />
      <div className="flex-1 space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="임직원명, 자산태그로 검색..." className="w-64 pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportToExcel("assignments")}>
              <FileSpreadsheet className="mr-1.5 h-4 w-4" /> 엑셀 내보내기
            </Button>
            {isManager() && (
              <Button size="sm" onClick={openCreate}>
                <Plus className="mr-1.5 h-4 w-4" /> 자산 할당
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>할당일</TableHead>
                <TableHead>임직원</TableHead>
                <TableHead>부서</TableHead>
                <TableHead>자산유형</TableHead>
                <TableHead>자산태그</TableHead>
                <TableHead>모델명</TableHead>
                <TableHead>상태</TableHead>
                {isManager() && <TableHead className="text-right">작업</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="py-8 text-center text-muted-foreground">데이터 없음</TableCell></TableRow>
              ) : filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{fmtDate(a.assigned_date)}</TableCell>
                  <TableCell className="font-medium">{a.employee_name}</TableCell>
                  <TableCell>{a.department}</TableCell>
                  <TableCell><Badge variant="secondary">{a.asset_type === "hardware" ? "하드웨어" : "소프트웨어"}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{a.asset_tag}</TableCell>
                  <TableCell>{a.asset_model}</TableCell>
                  <TableCell>
                    <Badge variant={a.status === "할당중" ? "default" : "secondary"}>{a.status}</Badge>
                  </TableCell>
                  {isManager() && (
                    <TableCell className="text-right">
                      {a.status === "할당중" && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleReturn(a.id)}>
                          <RotateCcw className="mr-1 h-3.5 w-3.5" /> 반납
                        </Button>
                      )}
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
          <DialogHeader><DialogTitle>자산 할당</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>임직원 *</Label>
              <Select value={form.employee_id} onValueChange={(v) => setForm({ ...form, employee_id: v ?? "" })}>
                <SelectTrigger><SelectValue placeholder="선택하세요" /></SelectTrigger>
                <SelectContent>
                  {employees.map((e) => <SelectItem key={e.id} value={String(e.id)}>{e.name} ({e.department})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>자산 유형 *</Label>
              <Select value={form.asset_type} onValueChange={(v) => setForm({ ...form, asset_type: v ?? "", asset_id: "" })}>
                <SelectTrigger><SelectValue placeholder="선택하세요" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hardware">하드웨어</SelectItem>
                  <SelectItem value="software">소프트웨어</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.asset_type && (
              <div className="grid gap-2">
                <Label>{form.asset_type === "hardware" ? "하드웨어" : "소프트웨어"} 자산 *</Label>
                <Select value={form.asset_id} onValueChange={(v) => setForm({ ...form, asset_id: v ?? "" })}>
                  <SelectTrigger><SelectValue placeholder="선택하세요" /></SelectTrigger>
                  <SelectContent>
                    {assetOptions.map((a: Hardware | Software) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {"asset_tag" in a ? a.asset_tag : ""} - {"model" in a ? (a as Hardware).model : (a as Software).name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label>비고</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>취소</Button>
              <Button onClick={handleSubmit} disabled={!form.employee_id || !form.asset_type || !form.asset_id}>할당</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
