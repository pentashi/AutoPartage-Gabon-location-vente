"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  MoreVertical, 
  ShieldAlert,
  Mail,
  Smartphone,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const priorityConfig: Record<string, any> = {
  LOW: { label: "Basse", color: "text-slate-600 bg-slate-50", dot: "bg-slate-400" },
  MEDIUM: { label: "Moyenne", color: "text-blue-600 bg-blue-50", dot: "bg-blue-500" },
  HIGH: { label: "Haute", color: "text-amber-600 bg-amber-50", dot: "bg-amber-500" },
  CRITICAL: { label: "Critique", color: "text-red-600 bg-red-50", dot: "bg-red-500" },
};

const channelIcons: Record<string, any> = {
  IN_APP: Bell,
  EMAIL: Mail,
  SMS: Smartphone,
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data: notifications = [], isLoading, error } = useQuery({ 
    queryKey: ["notifications"], 
    queryFn: api.notifications 
  });

  const readMutation = useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Lue");
    },
    onError: () => {
      toast.error("Erreur");
    }
  });

  const markAllAsRead = useMutation({
    mutationFn: () => api.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Tout marqué comme lu");
    }
  });

  if (error) return (
    <div className="p-4 md:p-6 text-center text-red-500">
      <ShieldAlert className="h-12 w-12 mx-auto mb-4" />
      <p>Erreur lors du chargement.</p>
    </div>
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm">Alertes et relances système</p>
        </div>
        <button
          onClick={() => markAllAsRead.mutate()}
          disabled={unreadCount === 0 || markAllAsRead.isPending}
          className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-all disabled:opacity-50 w-full sm:w-auto"
        >
          {markAllAsRead.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
          Tout marquer comme lu
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Alerte</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priorité</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Chargement...
                  </td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400">Aucune notification</td>
                </tr>
              ) : (
                notifications.map((notification: any) => {
                  const Icon = channelIcons[notification.channel] || Info;
                  return (
                    <tr 
                      key={notification.id} 
                      className={cn(
                        "hover:bg-slate-50/50 transition-colors text-sm",
                        !notification.isRead && "bg-blue-50/30"
                      )}
                    >
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex gap-3">
                          <div className={cn(
                            "h-8 w-8 md:h-9 md:w-9 shrink-0 rounded-full flex items-center justify-center shadow-sm",
                            notification.isRead ? "bg-slate-100 text-slate-400" : "bg-white text-primary ring-1 ring-primary/20"
                          )}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="overflow-hidden">
                            <div className={cn(
                              "font-semibold truncate text-xs md:text-sm",
                              notification.isRead ? "text-slate-600" : "text-slate-900"
                            )}>
                              {notification.title}
                            </div>
                            <div className="text-[10px] md:text-xs text-slate-500 mt-0.5 line-clamp-1">{notification.message}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center">
                          <span className={cn(
                            "h-1 w-1 md:h-1.5 md:w-1.5 rounded-full mr-1.5 md:mr-2",
                            priorityConfig[notification.priority]?.dot || "bg-slate-400"
                          )} />
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase",
                            priorityConfig[notification.priority]?.color || "bg-slate-100 text-slate-700"
                          )}>
                            {priorityConfig[notification.priority]?.label || notification.priority}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center text-[10px] md:text-xs text-slate-500 whitespace-nowrap">
                          <Clock className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1.5 text-slate-400" />
                          {new Date(notification.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-right">
                        {!notification.isRead ? (
                          <button 
                            onClick={() => readMutation.mutate(notification.id)}
                            className="text-[10px] md:text-xs font-bold text-primary hover:text-primary/80 underline whitespace-nowrap"
                          >
                            Marquer lu
                          </button>
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-slate-300 ml-auto" />
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
