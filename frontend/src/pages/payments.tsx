import { Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import * as api from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { PaymentRecord, Subscription } from "@/types";

export function PaymentsPage() {
  const { isManager, isAdmin } = useAuthStore();
  const [data, setData] = useState<PaymentRecord[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ subscription_id: "", transaction_date: "", amount: "", payment_method: "", approval_number: "", memo: "" });

  const load = () => {
    api.payments.list().then(setData);
    api.subscriptions.list().then(setSubs);
  };
  useEffect(() => { load(); }, []);

  const filtered = data.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.subscription_name?.toLowerCase().includes(q) || p.memo?.toLowerCase().includes(q) || p.payment_method?.toLowerCase().includes(q);
  });

  const openCreate = () => {
    setForm({ subscription_id: "", transaction_date: new Date().toISOString().slice(0, 10), amount: "", payment_method: "", approval_number: "", memo: "" });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      await api.payments.create({
        ...form,
        subscription_id: form.subscription_id ? Number(form.subscription_id) : null,
        amount: Number(form.amount) || 0,
      });
      toast.success("결제 내역이 등록되었습니다");
      setModalOpen(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "등록에 실패했습니다");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await api.payments.delete(id);
      toast.success("결제 내역이 삭제되었습니다");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "삭제에 실패했습니다");
    }
  };

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("ko-KR") : "-";
  const fmtAmount = (n: number, cur: string) => new Intl.NumberFormat("ko-KR", { style: "currency", currency: cur || "KRW" }).format(n);

  return (
    <>
      <h1 className="text-lg font-semibold text-foreground">결제 내역</h1>
      <div className="mt-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="구독명, 메모로 검색..." className="w-64 pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {isManager() && (
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" /> 결제 등록
            </Button>
          )}
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>거래일</TableHead>
                <TableHead>구독명</TableHead>
                <TableHead className="text-right">금액</TableHead>
                <TableHead>결제수단</TableHead>
                <TableHead>승인번호</TableHead>
                <TableHead>메모</TableHead>
                <TableHead>등록자</TableHead>
                {isAdmin() && <TableHead className="text-right">작업</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="py-8 text-center text-muted-foreground">데이터 없음</TableCell></TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{fmtDate(p.transaction_date)}</TableCell>
                  <TableCell className="font-medium">{p.subscription_name || "-"}</TableCell>
                  <TableCell className="text-right font-mono">{fmtAmount(p.amount, p.currency)}</TableCell>
                  <TableCell>{p.payment_method || "-"}</TableCell>
                  <TableCell className="font-mono text-xs">{p.approval_number || "-"}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">{p.memo || "-"}</TableCell>
                  <TableCell>{p.created_by_name || "-"}</TableCell>
                  {isAdmin() && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
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
          <DialogHeader><DialogTitle>결제 등록</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>구독</Label>
              <Select value={form.subscription_id} onValueChange={(v) => setForm({ ...form, subscription_id: v ?? "" })}>
                <SelectTrigger><SelectValue placeholder="선택 (선택사항)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">없음</SelectItem>
                  {subs.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>거래일 *</Label>
                <Input type="date" value={form.transaction_date} onChange={(e) => setForm({ ...form, transaction_date: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>금액 *</Label>
                <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>결제수단</Label>
                <Input value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} placeholder="법인카드, 계좌이체 등" />
              </div>
              <div className="grid gap-2">
                <Label>승인번호</Label>
                <Input value={form.approval_number} onChange={(e) => setForm({ ...form, approval_number: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>메모</Label>
              <Textarea value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>취소</Button>
              <Button onClick={handleSubmit} disabled={!form.transaction_date || !form.amount}>저장</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
