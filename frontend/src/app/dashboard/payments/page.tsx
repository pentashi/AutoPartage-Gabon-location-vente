"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { 
  CreditCard, 
  Plus, 
  Loader2, 
  MoreVertical,
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  XCircle,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchFilterBar } from "@/components/search-filter-bar";
import { generatePaymentReceipt } from "@/lib/pdf";
import { exportToCsv } from "@/lib/export";

const paymentStatuses: Record<string, any> = {
  PENDING: { label: "En attente", color: "text-amber-600 bg-amber-50", dot: "bg-amber-500" },
  PAID: { label: "Payé", color: "text-emerald-600 bg-emerald-50", dot: "bg-emerald-500" },
  OVERDUE: { label: "En retard", color: "text-red-600 bg-red-50", dot: "bg-red-500" },
};

const statusFilterOptions = Object.entries(paymentStatuses).map(([val, info]) => ({
  label: info.label,
  value: val
}));

const paymentMethods: Record<string, string> = {
  CASH: "Espèces",
  MOBILE_MONEY: "Mobile Money",
  BANK_TRANSFER: "Virement",
};

export default function PaymentsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Form state
  const [contractId, setContractId] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState("MOBILE_MONEY");
  const [status, setStatus] = useState("PENDING");

  const { data: payments = [], isLoading: isLoadingPayments } = useQuery({ 
    queryKey: ["payments"], 
    queryFn: api.payments 
  });

  const { data: contracts = [] } = useQuery({ 
    queryKey: ["contracts"], 
    queryFn: api.contracts 
  });

  const filteredPayments = useMemo(() => {
    return payments.filter((p: any) => {
      const matchesSearch = 
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.contract?.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.contract?.driver?.user?.fullName || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "" || p.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const paid = payments.filter(p => p.status === "PAID").reduce((sum, p) => sum + Number(p.amount), 0);
    const overdue = payments.filter(p => p.status === "OVERDUE").length;
    return { total, paid, overdue };
  }, [payments]);

  const createMutation = useMutation({
    mutationFn: (newPayment: any) => api.createPayment(newPayment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Paiement enregistré");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error("Erreur d'enregistrement", { description: err.message });
    }
  });

  const resetForm = () => {
    setContractId("");
    setAmount("");
    setDueDate(new Date().toISOString().split('T')[0]);
    setMethod("MOBILE_MONEY");
    setStatus("PENDING");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ 
      contractId, 
      amount: Number(amount), 
      dueDate: new Date(dueDate).toISOString(),
      method: status === "PAID" ? method : undefined,
      status,
      paidAt: status === "PAID" ? new Date().toISOString() : undefined
    });
  };

  const handleExport = () => {
    const headers = ["ID", "ContratID", "Chauffeur", "Montant", "Echeance", "Methode", "Statut"];
    const exportData = payments.map((p: any) => ({
      id: p.id,
      contractId: p.contract?.id,
      driver: p.contract?.driver?.user?.fullName,
      amount: p.amount,
      dueDate: new Date(p.dueDate).toLocaleDateString(),
      method: p.method || "-",
      status: p.status
    }));
    exportToCsv(exportData, "Paiements_Finances", headers);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Finances & Paiements</h1>
          <p className="text-slate-500 text-sm">Suivi des encaissements et recouvrement</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={handleExport}
            className="inline-flex items-center justify-center rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-all flex-1 sm:flex-none"
          >
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all flex-1 sm:flex-none"
          >
            <Plus className="mr-2 h-4 w-4" />
            Enregistrer un paiement
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-8">
        <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xl md:text-2xl font-bold">{stats.total.toLocaleString()} FCFA</div>
          <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wider font-semibold">Total attendu</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xl md:text-2xl font-bold text-emerald-600">{stats.paid.toLocaleString()} FCFA</div>
          <p className="text-[10px] md:text-xs text-emerald-600 uppercase tracking-wider font-semibold">Total encaissé</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xl md:text-2xl font-bold text-red-600">{stats.overdue}</div>
          <p className="text-[10px] md:text-xs text-red-600 uppercase tracking-wider font-semibold">Impayés critiques</p>
        </div>
      </div>

      <SearchFilterBar
        searchPlaceholder="Chercher par réf, contrat ou chauffeur..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={statusFilterOptions}
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px] md:min-w-0">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Référence / Contrat</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Montant</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Échéance</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Méthode</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                <th className="px-4 md:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingPayments ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Chargement des transactions...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">Aucun paiement ne correspond à vos critères</td>
                </tr>
              ) : (
                filteredPayments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                    <td className="px-4 md:px-6 py-4">
                      <div className="font-semibold text-slate-900 text-xs md:text-sm">#{payment.id.slice(-6).toUpperCase()}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[100px]">Contrat: {payment.contract?.id.slice(-6)}</div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="font-bold text-slate-900 text-xs md:text-sm">{Number(payment.amount).toLocaleString()} FCFA</div>
                      {payment.penaltyAmount > 0 && (
                        <div className="text-[9px] md:text-[10px] text-red-600 font-bold">Pénalité: {Number(payment.penaltyAmount).toLocaleString()}</div>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-slate-600 text-xs">
                      <div className="flex items-center whitespace-nowrap">
                        <Calendar className="h-3 w-3 mr-1.5 text-slate-400" />
                        {new Date(payment.dueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-slate-600 text-xs">
                      {payment.method ? paymentMethods[payment.method] : "-"}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center">
                        <span className={cn(
                          "h-1.5 w-1.5 rounded-full mr-2",
                          paymentStatuses[payment.status]?.dot || "bg-slate-300"
                        )} />
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase",
                          paymentStatuses[payment.status]?.color || "bg-slate-100 text-slate-700"
                        )}>
                          {paymentStatuses[payment.status]?.label || payment.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => generatePaymentReceipt(payment)}
                          className="text-slate-400 hover:text-primary p-1 transition-colors"
                          title="Télécharger le reçu"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button className="text-slate-400 hover:text-slate-600 p-1">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[95vh] overflow-y-auto custom-scrollbar">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-bold text-lg text-slate-900">Enregistrer un paiement</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-4 md:p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Contrat associé</label>
                <select
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={contractId}
                  onChange={e => {
                    setContractId(e.target.value);
                    const contract = contracts.find((c: any) => c.id === e.target.value);
                    if (contract) setAmount(String(contract.monthlyAmount));
                  }}
                >
                  <option value="">Sélectionner un contrat...</option>
                  {contracts.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.driver?.user?.fullName} - {c.vehicle?.plateNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Montant (FCFA)</label>
                  <input
                    required
                    type="number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-primary"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Échéance</label>
                  <input
                    required
                    type="date"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Statut initial</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus("PENDING")}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all",
                      status === "PENDING" ? "bg-amber-500 text-white border-amber-500" : "bg-white text-slate-600 border-slate-200"
                    )}
                  >
                    EN ATTENTE
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("PAID")}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all",
                      status === "PAID" ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-slate-600 border-slate-200"
                    )}
                  >
                    DÉJÀ PAYÉ
                  </button>
                </div>
              </div>

              {status === "PAID" && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                  <label className="text-sm font-semibold text-slate-700">Mode de paiement</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={method}
                    onChange={e => setMethod(e.target.value)}
                  >
                    {Object.entries(paymentMethods).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all order-2 sm:order-1"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all disabled:opacity-50 order-1 sm:order-2"
                >
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
