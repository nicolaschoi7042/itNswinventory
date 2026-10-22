import { Download, ExternalLink, FileText, HardDrive, Monitor, Package, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as api from "@/lib/api";
import type { Activity, Employee, Hardware, Software } from "@/types";

export function DashboardPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [hw, setHw] = useState<Hardware[]>([]);
  const [sw, setSw] = useState<Software[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    Promise.all([
      api.employees.list(),
      api.hardware.list(),
      api.software.list(),
      api.activities.list(),
    ]).then(([e, h, s, a]) => {
      setEmployees(e);
      setHw(h);
      setSw(s);
      setActivities(a);
    });
  }, []);

  const statusCounts = hw.reduce<Record<string, number>>((acc, h) => {
    acc[h.status] = (acc[h.status] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  const stats = [
    { label: "임직원", value: employees.length, icon: Users, color: "text-blue-600" },
    { label: "하드웨어 자산", value: hw.length, icon: Monitor, color: "text-indigo-600" },
    { label: "소프트웨어", value: sw.length, icon: Package, color: "text-violet-600" },
    { label: "총 자산", value: hw.length + sw.length, icon: HardDrive, color: "text-purple-600" },
  ];

  return (
    <>
      <AppHeader title="대시보드" />
      <div className="flex-1 space-y-6 p-6">
        {/* Stats cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-lg bg-muted p-3 ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Asset status chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">자산 현황</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">데이터 없음</p>
              )}
            </CardContent>
          </Card>

          {/* License status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">소프트웨어 라이선스</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sw.length > 0 ? (
                sw.slice(0, 6).map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.manufacturer}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {s.current_users}/{s.total_licenses}
                      </p>
                      <p className="text-xs text-muted-foreground">사용중</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">데이터 없음</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* SW License manual */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">SW 라이선스 점검 매뉴얼</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.open("/SMART_Check_Plus_User_Manual_V2.0.pdf", "_blank")}>
                <ExternalLink className="mr-1.5 h-4 w-4" /> 새 창에서 열기
              </Button>
              <a href="/SMART_Check_Plus_User_Manual_V2.0.pdf" download className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent">
                <Download className="mr-1.5 h-4 w-4" /> PDF 다운로드
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 rounded-md border p-4">
              <FileText className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">소프트웨어 라이선스 개별 점검 가이드</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>SMART Check Plus 프로그램 사용법</li>
                  <li>소프트웨어 라이선스 확인 절차</li>
                  <li>점검 결과 해석 및 조치사항</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-2">
                {activities.slice(0, 10).map((a) => (
                  <div key={a.id} className="flex items-center justify-between border-b py-2 last:border-0">
                    <p className="text-sm">{a.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(a.created_at).toLocaleString("ko-KR")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">활동 기록 없음</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
