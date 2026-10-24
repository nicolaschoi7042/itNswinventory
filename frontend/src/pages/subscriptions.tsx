import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import * as api from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { Software, Subscription } from "@/types";

const STATUSES = [
  { value: "active", label: "활성", variant: "default" as const },
  { value: "expired", label: "만료", variant: "destructive" as const },
  { value: "cancelled", label: "해지", variant: "outline" as const },
  { value: "pending", label: "대기", variant: "secondary" as const },
];

const CYCLES = [
  { value: "monthly", label: "월간" },
  { value: "quarterly", label: "분기" },
  { value: "yearly", label: "연간" },
  { value: "one_time", label: "일회성" },
];

function statusBadge(status: string) {
  const s = STATUSES.find((st) => st.value === status);
  return <Badge variant={s?.variant ?? "secondary"}>{s?.label ?? status}</Badge>;
}

function cycleName(cycle: string) {
  return CYCLES.find((c) => c.value === cycle)?.label ?? cycle;
}

const emptyForm = {
  software_id: "", name: "", vendor: "", status: "active", billing_cycle: "yearly",
  amount: "", currency: "KRW", total_licenses: "", used_licenses: "0",
  start_date: "", end_date: "", renewal_date: "", auto_renewal: true,
  contract_url: "", notes: "",
};

export function SubscriptionsPage() {
  const { isManager, isAdmin } = useAuthStore();
  const [data, setData] = useState<Subscription[]>([]);
  const [swList, setSwList] = useState<Software[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    api.subscriptions.list().then(setData);
    api.software.list().then(setSwList);
  };
  useEffect(() => { load(); }, []);

  const filtered = data.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.vendor?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (sub: Subscription) => {
    setEditId(sub.id);
    setForm({
      software_id: sub.software_id ? String(sub.software_id) : "",
      name: sub.name, vendor: sub.vendor || "", status: sub.status,
      billing_cycle: sub.billing_cycle, amount: String(sub.amount),
      currency: sub.currency, total_licenses: sub.total_licenses ? String(sub.total_licenses) : "",
      used_licenses: String(sub.used_licenses || 0),
      start_date: sub.start_date?.slice(0, 10) || "",
      end_date: sub.end_date?.slice(0, 10) || "",
      renewal_date: sub.renewal_date?.slice(0, 10) || "",
      auto_renewal: sub.auto_renewal, contract_url: sub.contract_url || "",
      notes: sub.notes || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        software_id: form.software_id ? Number(form.software_id) : null,
        amount: Number(form.amount) || 0,
        total_licenses: form.total_licenses ? Number(form.total_licenses) : null,
        used_licenses: Number(form.used_licenses) || 0,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        renewal_date: form.renewal_date || null,
      };
      if (editId) {
        await api.subscriptions.update(editId, payload);
        toast.success("구독이 수정되었습니다");
      } else {
        await api.subscriptions.create(payload);
        toast.success("구독이 등록되었습니다");
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
      await api.subscriptions.delete(id);
      toast.success("구독이 삭제되었습니다");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "삭제에 실패했습니다");
    }
  };

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("ko-KR") : "-";
  const fmtAmount = (n: number, cur: string) => new Intl.NumberFormat("ko-KR", { style: "currency", currency: cur }).format(n);

  const daysUntilRenewal = (d: string | null) => {
    if (!d) return null;
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
    return diff;
  };

  return (
    <>
      <h1 className="text-lg font-semibold text-foreground">구독/라이선스 관리</h1>
      <div className="mt-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="구독명, 벤더로 검색..." className="w-64 pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "")}>
              <SelectTrigger className="w-32"><SelectValue placeholder="전체 상태" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체 상태</SelectItem>
                {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            {isManager() && (
              <Button size="sm" onClick={openCreate}>
                <Plus className="mr-1.5 h-4 w-4" /> 구독 등록
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>구독명</TableHead>
                <TableHead>벤더</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>주기</TableHead>
                <TableHead className="text-right">금액</TableHead>
                <TableHead className="text-center">라이선스</TableHead>
                <TableHead>시작일</TableHead>
                <TableHead>갱신일</TableHead>
                <TableHead>남은 일</TableHead>
                {isManager() && <TableHead className="text-right">작업</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={10} className="py-8 text-center text-muted-foreground">데이터 없음</TableCell></TableRow>
              ) : filtered.map((s) => {
                const days = daysUntilRenewal(s.renewal_date);
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{s.name}</p>
                        {s.software_name && <p className="text-xs text-muted-foreground">{s.software_name}</p>}
                      </div>
                    </TableCell>
                    <TableCell>{s.vendor}</TableCell>
                    <TableCell>{statusBadge(s.status)}</TableCell>
                    <TableCell>{cycleName(s.billing_cycle)}</TableCell>
                    <TableCell className="text-right font-mono">{fmtAmount(s.amount, s.currency)}</TableCell>
                    <TableCell className="text-center">
                      {s.total_licenses ? `${s.used_licenses}/${s.total_licenses}` : "-"}
                    </TableCell>
                    <TableCell>{fmtDate(s.start_date)}</TableCell>
                    <TableCell>{fmtDate(s.renewal_date)}</TableCell>
                    <TableCell>
                      {days !== null && (
                        <Badge variant={days <= 30 ? "destructive" : days <= 60 ? "outline" : "secondary"}>
                          {days > 0 ? `${days}일` : "만료"}
                        </Badge>
                      )}
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
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? "구독 수정" : "구독 등록"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>구독명 *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>벤더</Label>
                <Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>연결 소프트웨어</Label>
                <Select value={form.software_id} onValueChange={(v) => setForm({ ...form, software_id: v ?? "" })}>
                  <SelectTrigger><SelectValue placeholder="선택 (선택사항)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">없음</SelectItem>
                    {swList.map((sw) => <SelectItem key={sw.id} value={String(sw.id)}>{sw.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>상태</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v ?? "active" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>주기</Label>
                <Select value={form.billing_cycle} onValueChange={(v) => setForm({ ...form, billing_cycle: v ?? "yearly" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CYCLES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>금액</Label>
                <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>총 라이선스</Label>
                <Input type="number" value={form.total_licenses} onChange={(e) => setForm({ ...form, total_licenses: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>사용중 라이선스</Label>
                <Input type="number" value={form.used_licenses} onChange={(e) => setForm({ ...form, used_licenses: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>시작일 *</Label>
                <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>종료일</Label>
                <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>갱신일</Label>
                <Input type="date" value={form.renewal_date} onChange={(e) => setForm({ ...form, renewal_date: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.auto_renewal} onCheckedChange={(v) => setForm({ ...form, auto_renewal: v })} />
              <Label>자동 갱신</Label>
            </div>
            <div className="grid gap-2">
              <Label>비고</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>취소</Button>
              <Button onClick={handleSubmit} disabled={!form.name || !form.start_date}>저장</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
