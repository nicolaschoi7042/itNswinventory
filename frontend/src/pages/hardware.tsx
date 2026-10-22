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
import { Textarea } from "@/components/ui/textarea";
import * as api from "@/lib/api";
import { exportToExcel } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { Hardware } from "@/types";

// Hardware delete API (backend uses same pattern)
const deleteHardware = (id: number) =>
  fetch(`/api/hardware/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("inventory_token")}` } }).then(r => { if (!r.ok) throw new Error("삭제 실패"); });

const TYPES = ["데스크톱", "노트북", "태블릿", "모니터", "프린터", "네트워크장비", "서버", "재고자산", "저장장치"];
const STATUSES = ["사용중", "대기중", "수리중", "폐기"];

function statusVariant(s: string) {
  if (s === "사용중") return "default" as const;
  if (s === "대기중") return "secondary" as const;
  if (s === "수리중") return "outline" as const;
  return "destructive" as const;
}

export function HardwarePage() {
  const { isManager, isAdmin } = useAuthStore();
  const [data, setData] = useState<Hardware[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ type: "", manufacturer: "", model: "", serial_number: "", purchase_date: "", price: "", status: "대기중", notes: "" });

  const load = () => api.hardware.list().then(setData);
  useEffect(() => { load(); }, []);

  const filtered = data.filter((h) => {
    const q = search.toLowerCase();
    const matchSearch = !q || h.asset_tag?.toLowerCase().includes(q) || h.model?.toLowerCase().includes(q) || h.manufacturer?.toLowerCase().includes(q);
    const matchType = !typeFilter || h.type === typeFilter;
    const matchStatus = !statusFilter || h.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const openCreate = () => {
    setEditId(null);
    setForm({ type: "", manufacturer: "", model: "", serial_number: "", purchase_date: "", price: "", status: "대기중", notes: "" });
    setModalOpen(true);
  };

  const openEdit = (hw: Hardware) => {
    setEditId(hw.id);
    setForm({
      type: hw.type, manufacturer: hw.manufacturer || "", model: hw.model || "",
      serial_number: hw.serial_number || "", purchase_date: hw.purchase_date?.slice(0, 10) || "",
      price: hw.price?.toString() || "", status: hw.status, notes: hw.notes || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...form, price: form.price ? Number(form.price) : undefined };
      if (editId) {
        await api.hardware.update(editId, payload);
        toast.success("하드웨어 자산이 수정되었습니다");
      } else {
        await api.hardware.create(payload);
        toast.success("하드웨어 자산이 등록되었습니다");
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
      await deleteHardware(id);
      toast.success("하드웨어 자산이 삭제되었습니다");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "삭제에 실패했습니다");
    }
  };

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("ko-KR") : "-";

  return (
    <>
      <AppHeader title="하드웨어 자산 관리" />
      <div className="flex-1 space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="자산태그, 모델명으로 검색..." className="w-64 pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "")}>
              <SelectTrigger className="w-32"><SelectValue placeholder="전체 유형" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체 유형</SelectItem>
                {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "")}>
              <SelectTrigger className="w-32"><SelectValue placeholder="전체 상태" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체 상태</SelectItem>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportToExcel("hardware")}>
              <FileSpreadsheet className="mr-1.5 h-4 w-4" /> 엑셀 내보내기
            </Button>
            {isManager() && (
              <Button size="sm" onClick={openCreate}>
                <Plus className="mr-1.5 h-4 w-4" /> 자산 등록
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>자산태그</TableHead>
                <TableHead>유형</TableHead>
                <TableHead>제조사</TableHead>
                <TableHead>모델명</TableHead>
                <TableHead>시리얼번호</TableHead>
                <TableHead>구입일</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>할당자</TableHead>
                {isManager() && <TableHead className="text-right">작업</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="py-8 text-center text-muted-foreground">데이터 없음</TableCell></TableRow>
              ) : filtered.map((h) => (
                <TableRow key={h.id}>
                  <TableCell className="font-mono text-xs">{h.asset_tag}</TableCell>
                  <TableCell>{h.type}</TableCell>
                  <TableCell>{h.manufacturer}</TableCell>
                  <TableCell className="font-medium">{h.model}</TableCell>
                  <TableCell className="font-mono text-xs">{h.serial_number}</TableCell>
                  <TableCell>{fmtDate(h.purchase_date)}</TableCell>
                  <TableCell><Badge variant={statusVariant(h.status)}>{h.status}</Badge></TableCell>
                  <TableCell>{h.assigned_to_name || "-"}</TableCell>
                  {isManager() && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(h)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {isAdmin() && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(h.id)}>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "하드웨어 자산 수정" : "하드웨어 자산 등록"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>유형 *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v ?? "" })}>
                  <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                  <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>상태</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v ?? "" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>제조사</Label>
                <Input value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>모델명</Label>
                <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>시리얼번호</Label>
              <Input value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>구입일</Label>
                <Input type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>구입가격</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>비고</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>취소</Button>
              <Button onClick={handleSubmit} disabled={!form.type}>저장</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
