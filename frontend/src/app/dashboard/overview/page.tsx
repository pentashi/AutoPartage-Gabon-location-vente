"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

export default function OverviewPage() {
  const { data, isLoading, error } = useQuery({ 
    queryKey: ["dashboard-stats"], 
    queryFn: api.dashboardStats 
  });

  if (isLoading) return <p className="p-4 md:p-6">Chargement des statistiques...</p>;
  if (error) return <p className="p-4 md:p-6 text-red-600">Erreur lors du chargement des statistiques.</p>;
  if (!data) return null;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-slate-900">Tableau de bord - Vue d'ensemble</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 md:p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-slate-500">Flotte totale</h3>
            <span className="text-xl">🚗</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{data.vehicles.total}</div>
            <p className="text-xs text-slate-500 mt-1">
              {data.vehicles.ACTIVE || 0} actifs, {data.vehicles.IMMOBILIZED || 0} immobilisés
            </p>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-slate-500">Chauffeurs</h3>
            <span className="text-xl">👤</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{data.drivers}</div>
            <p className="text-xs text-slate-500 mt-1">Chauffeurs enregistrés</p>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-slate-500">Revenu encaissé</h3>
            <span className="text-xl">💰</span>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-slate-900">{(data.finance.paidAmount).toLocaleString()} FCFA</div>
            <p className="text-xs text-slate-500 mt-1">Sur {(data.finance.dueAmount).toLocaleString()} FCFA dus</p>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-slate-500">Taux recouvrement</h3>
            <span className="text-xl">📈</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{data.finance.recoveryRate}%</div>
            <p className="text-xs text-slate-500 mt-1">Performance mensuelle</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card className="border-red-200 bg-red-50 p-4 md:p-6">
          <div className="flex flex-row items-center space-x-2 mb-2">
            <span className="text-xl">⚠️</span>
            <h3 className="text-lg font-semibold text-red-900">Alertes critiques</h3>
          </div>
          <div>
            <div className="text-3xl font-bold text-red-600">{data.alerts.criticalNotifications}</div>
            <p className="text-sm text-red-700 mt-1">Notifications de haute priorité à traiter.</p>
          </div>
        </Card>

        <Card className="border-orange-200 bg-orange-50 p-4 md:p-6">
          <div className="flex flex-row items-center space-x-2 mb-2">
            <span className="text-xl">🚨</span>
            <h3 className="text-lg font-semibold text-orange-900">Incidents actifs</h3>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600">{data.alerts.activeIncidents}</div>
            <p className="text-sm text-orange-700 mt-1">Incidents en cours d'investigation ou ouverts.</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="p-4 md:p-6">
          <div className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Journal d'audit récent</h3>
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Temps réel</span>
          </div>
          <AuditLogsList />
        </Card>
      </div>
    </div>
  );
}

function AuditLogsList() {
  const { data, isLoading, error } = useQuery({ 
    queryKey: ["dashboard-audit-logs"], 
    queryFn: api.dashboardAuditLogs 
  });

  if (isLoading) return <p className="text-sm text-slate-500">Chargement des logs...</p>;
  if (error) return <p className="text-sm text-red-500">Erreur lors du chargement des logs.</p>;
  if (!data || data.length === 0) return <p className="text-sm text-slate-500">Aucun événement récent.</p>;

  return (
    <div className="space-y-4">
      {data.map((log) => (
        <div key={log.id} className="flex flex-col sm:flex-row sm:items-start sm:space-x-4 text-sm border-l-2 border-slate-200 pl-4 py-2 sm:py-1 hover:border-blue-400 transition-colors">
          <div className="min-w-[140px] text-[10px] md:text-xs text-slate-400 font-mono mb-1 sm:mb-0">
            {new Date(log.timestamp).toLocaleString()}
          </div>
          <div className="flex-1">
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mr-2 mb-1 sm:mb-0 ${
              log.type === "GPS_COMMAND" ? "bg-blue-100 text-blue-700" :
              log.type === "INCIDENT_UPDATE" ? "bg-orange-100 text-orange-700" :
              "bg-red-100 text-red-700"
            }`}>
              {log.type.replace("_", " ")}
            </span>
            <span className="text-slate-700 block sm:inline">{log.message}</span>
          </div>
          <div className="text-[10px] md:text-xs font-medium text-slate-500 uppercase mt-1 sm:mt-0">
            {log.status}
          </div>
        </div>
      ))}
    </div>
  );
}
