import { Plus, RefreshCw, Search, Trash2 } from "lucide-react";
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
import type { AnthropicUsageResponse, PaymentRecord, Subscription } from "@/types";

type Tab = "payments" | "anthropic";

export function PaymentsPage() {
  const { isManager, isAdmin } = useAuthStore();
  const [tab, setTab] = useState<Tab>("payments");
  const [data, setData] = useState<PaymentRecord[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ subscription_id: "", transaction_date: "", amount: "", payment_method: "", approval_number: "", memo: "" });

  // Anthropic state
  const [anthropicConfigured, setAnthropicConfigured] = useState(false);
  const [anthropicData, setAnthropicData] = useState<AnthropicUsageResponse | null>(null);
  const [anthropicLoading, setAnthropicLoading] = useState(false);

  const load = () => {
    api.payments.list().then(setData);
    api.subscriptions.list().then(setSubs);
    api.anthropic.config().then((c) => setAnthropicConfigured(c.configured)).catch(() => {});
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

  const fetchAnthropicUsage = async () => {
    setAnthropicLoading(true);
    try {
      const result = await api.anthropic.usage();
      setAnthropicData(result);
      toast.success("Anthropic 사용량을 가져왔습니다");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Anthropic 사용량 조회에 실패했습니다");
    } finally {
      setAnthropicLoading(false);
    }
  };

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("ko-KR") : "-";
  const fmtAmount = (n: number, cur: string) => new Intl.NumberFormat("ko-KR", { style: "currency", currency: cur || "KRW" }).format(n);
  const fmtUsd = (dollars: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(dollars);
  const fmtTokens = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);

  const aggregateCostByDate = (buckets: AnthropicUsageResponse["cost"]["data"]) => {
    const map = new Map<string, { date: string; total: number; details: Map<string, number> }>();
    for (const bucket of buckets) {
      const dateKey = bucket.started_at.slice(0, 10);
      for (const r of bucket.results) {
        if (!map.has(dateKey)) map.set(dateKey, { date: dateKey, total: 0, details: new Map() });
        const entry = map.get(dateKey)!;
        const amt = parseFloat(r.amount) || 0;
        entry.total += amt;
        const desc = r.description || "Unknown";
        entry.details.set(desc, (entry.details.get(desc) || 0) + amt);
      }
    }
    return [...map.values()].sort((a, b) => b.date.localeCompare(a.date));
  };

  const aggregateUsageByModel = (buckets: AnthropicUsageResponse["usage"]["data"]) => {
    const map = new Map<string, { model: string; input: number; output: number; cache_read: number; cache_creation: number }>();
    for (const bucket of buckets) {
      for (const r of bucket.results) {
        const model = r.model || "unknown";
        if (!map.has(model)) map.set(model, { model, input: 0, output: 0, cache_read: 0, cache_creation: 0 });
        const entry = map.get(model)!;
        entry.input += r.uncached_input_tokens;
        entry.output += r.output_tokens;
        entry.cache_read += r.cache_read_input_tokens;
        const cc = r.cache_creation;
        entry.cache_creation += (cc?.ephemeral_1h_input_tokens || 0) + (cc?.ephemeral_5m_input_tokens || 0);
      }
    }
    return [...map.values()].sort((a, b) => (b.input + b.output) - (a.input + a.output));
  };

  const costRows = anthropicData ? aggregateCostByDate(anthropicData.cost.data) : [];
  const usageRows = anthropicData ? aggregateUsageByModel(anthropicData.usage.data) : [];
  const totalCost = costRows.reduce((s, r) => s + r.total, 0);

  return (
    <>
      <h1 className="text-lg font-semibold text-foreground">결제 내역</h1>
      <div className="mt-4 flex gap-2 border-b">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === "payments" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          onClick={() => setTab("payments")}
        >
          결제 내역
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === "anthropic" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          onClick={() => setTab("anthropic")}
        >
          Anthropic 사용량
        </button>
      </div>

      {tab === "payments" && (
        <div className="mt-4 space-y-4">
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
      )}

      {tab === "anthropic" && (
        <div className="mt-4 space-y-4">
          {!anthropicConfigured ? (
            <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
              <p>Anthropic Admin API key가 설정되지 않았습니다.</p>
              <p className="mt-1 text-sm">서버 .env 에 <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">ANTHROPIC_ADMIN_KEY</code> 를 추가하세요.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {anthropicData ? `${fmtDate(anthropicData.period.starting_at)} ~ ${fmtDate(anthropicData.period.ending_at)} (최근 30일)` : "동기화 버튼을 눌러 데이터를 가져오세요"}
                </p>
                <Button size="sm" onClick={fetchAnthropicUsage} disabled={anthropicLoading}>
                  <RefreshCw className={`mr-1.5 h-4 w-4 ${anthropicLoading ? "animate-spin" : ""}`} />
                  {anthropicLoading ? "조회 중..." : "Anthropic 동기화"}
                </Button>
              </div>

              {anthropicData && (
                <>
                  {/* 총 비용 */}
                  <div className="rounded-lg border bg-card p-4">
                    <p className="text-sm text-muted-foreground">총 비용 (최근 30일)</p>
                    <p className="mt-1 text-2xl font-bold">{fmtUsd(totalCost)}</p>
                  </div>

                  {/* 모델별 사용량 */}
                  <div>
                    <h3 className="mb-2 text-sm font-medium">모델별 토큰 사용량</h3>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>모델</TableHead>
                            <TableHead className="text-right">입력 토큰</TableHead>
                            <TableHead className="text-right">출력 토큰</TableHead>
                            <TableHead className="text-right">캐시 읽기</TableHead>
                            <TableHead className="text-right">캐시 생성</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {usageRows.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="py-4 text-center text-muted-foreground">데이터 없음</TableCell></TableRow>
                          ) : usageRows.map((r) => (
                            <TableRow key={r.model}>
                              <TableCell className="font-mono text-sm">{r.model}</TableCell>
                              <TableCell className="text-right font-mono text-sm">{fmtTokens(r.input)}</TableCell>
                              <TableCell className="text-right font-mono text-sm">{fmtTokens(r.output)}</TableCell>
                              <TableCell className="text-right font-mono text-sm">{fmtTokens(r.cache_read)}</TableCell>
                              <TableCell className="text-right font-mono text-sm">{fmtTokens(r.cache_creation)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* 일별 비용 */}
                  <div>
                    <h3 className="mb-2 text-sm font-medium">일별 비용</h3>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>날짜</TableHead>
                            <TableHead className="text-right">비용 (USD)</TableHead>
                            <TableHead>상세</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {costRows.length === 0 ? (
                            <TableRow><TableCell colSpan={3} className="py-4 text-center text-muted-foreground">데이터 없음</TableCell></TableRow>
                          ) : costRows.map((r) => (
                            <TableRow key={r.date}>
                              <TableCell>{fmtDate(r.date)}</TableCell>
                              <TableCell className="text-right font-mono">{fmtUsd(r.total)}</TableCell>
                              <TableCell className="max-w-[300px] truncate text-xs text-muted-foreground">
                                {[...r.details.entries()].map(([desc, amt]) => `${desc}: ${fmtUsd(amt)}`).join(", ")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

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
