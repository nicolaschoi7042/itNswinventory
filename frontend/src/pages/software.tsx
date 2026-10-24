import { FileSpreadsheet, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
import type { Software } from "@/types";

const TYPES = ["운영체제", "오피스", "개발도구", "보안", "기타"];
const LICENSE_TYPES = ["단일사용자", "다중사용자", "사이트라이선스", "무료"];

export function SoftwarePage() {
  const { isManager, isAdmin } = useAuthStore();
  const [data, setData] = useState<Software[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", manufacturer: "", version: "", type: "", license_type: "단일사용자", total_licenses: "1", purchase_date: "", expiry_date: "", price: "" });

  const load = () => api.software.list().then(setData);
  useEffect(() => { load(); }, []);

  const filtered = data.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.manufacturer?.toLowerCase().includes(q);
    const matchType = !typeFilter || s.type === typeFilter;
    return matchSearch && matchType;
  });

  const openCreate = () => {
    setEditId(null);
    setForm({ name: "", manufacturer: "", version: "", type: "", license_type: "단일사용자", total_licenses: "1", purchase_date: "", expiry_date: "", price: "" });
    setModalOpen(true);
  };

  const openEdit = (sw: Software) => {
    setEditId(sw.id);
    setForm({
      name: sw.name, manufacturer: sw.manufacturer || "", version: sw.version || "",
      type: sw.type, license_type: sw.license_type || "단일사용자",
      total_licenses: String(sw.total_licenses || 1),
      purchase_date: sw.purchase_date?.slice(0, 10) || "",
      expiry_date: sw.expiry_date?.slice(0, 10) || "",
      price: sw.price?.toString() || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...form, total_licenses: Number(form.total_licenses), price: form.price ? Number(form.price) : undefined } as Record<string, unknown>;
      if (editId) {
        await api.software.update(editId, payload);
        toast.success("소프트웨어 정보가 수정되었습니다");
      } else {
        await api.software.create(payload);
        toast.success("소프트웨어가 등록되었습니다");
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
      await api.software.delete(id);
      toast.success("소프트웨어가 삭제되었습니다");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "삭제에 실패했습니다");
    }
  };

  return (
    <>
      <h1 className="text-lg font-semibold text-foreground">소프트웨어 인벤토리</h1>
      <div className="mt-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="소프트웨어명, 제조사로 검색..." className="w-64 pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "")}>
              <SelectTrigger className="w-32"><SelectValue placeholder="전체 유형" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체 유형</SelectItem>
                {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportToExcel("software")}>
              <FileSpreadsheet className="mr-1.5 h-4 w-4" /> 엑셀 내보내기
            </Button>
            {isManager() && (
              <Button size="sm" onClick={openCreate}>
                <Plus className="mr-1.5 h-4 w-4" /> 소프트웨어 등록
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>자산태그</TableHead>
                <TableHead>소프트웨어명</TableHead>
                <TableHead>제조사</TableHead>
                <TableHead>버전</TableHead>
                <TableHead>유형</TableHead>
                <TableHead>라이선스 유형</TableHead>
                <TableHead className="text-center">총 라이선스</TableHead>
                <TableHead className="text-center">사용중</TableHead>
                <TableHead className="text-center">남은 라이선스</TableHead>
                {isManager() && <TableHead className="text-right">작업</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={10} className="py-8 text-center text-muted-foreground">데이터 없음</TableCell></TableRow>
              ) : filtered.map((s) => {
                const remaining = s.total_licenses - s.current_users;
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.asset_tag}</TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.manufacturer}</TableCell>
                    <TableCell>{s.version}</TableCell>
                    <TableCell><Badge variant="secondary">{s.type}</Badge></TableCell>
                    <TableCell>{s.license_type}</TableCell>
                    <TableCell className="text-center">{s.total_licenses}</TableCell>
                    <TableCell className="text-center">{s.current_users}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={remaining > 0 ? "default" : "destructive"}>{remaining}</Badge>
                    </TableCell>
                    {isManager() && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(s)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          {isAdmin() && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(s.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editId ? "소프트웨어 수정" : "소프트웨어 등록"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>소프트웨어명 *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>제조사</Label>
                <Input value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>버전</Label>
                <Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>유형 *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v ?? "" })}>
                  <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                  <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>라이선스 유형</Label>
                <Select value={form.license_type} onValueChange={(v) => setForm({ ...form, license_type: v ?? "" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LICENSE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>총 라이선스</Label>
                <Input type="number" value={form.total_licenses} onChange={(e) => setForm({ ...form, total_licenses: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>구입일</Label>
                <Input type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>만료일</Label>
                <Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>취소</Button>
              <Button onClick={handleSubmit} disabled={!form.name || !form.type}>저장</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
