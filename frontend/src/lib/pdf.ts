import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePaymentReceipt = (payment: any) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text("AutoPartage Gabon", 20, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text("Location-Vente Automobile de Luxe", 20, 27);
  doc.text("Libreville, Gabon | +241 00 00 00 00", 20, 32);
  
  // Line
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 40, 190, 40);
  
  // Title
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text("REÇU DE PAIEMENT", 20, 55);
  
  doc.setFontSize(10);
  doc.text(`Réf: #${payment.id.slice(-8).toUpperCase()}`, 20, 62);
  doc.text(`Date d'émission: ${new Date().toLocaleDateString()}`, 140, 62);
  
  // Body Table
  autoTable(doc, {
    startY: 75,
    head: [["Désignation", "Détails"]],
    body: [
      ["Contrat", `#${payment.contract?.id.slice(-8).toUpperCase() || "N/A"}`],
      ["Chauffeur", payment.contract?.driver?.user?.fullName || "N/A"],
      ["Véhicule", `${payment.contract?.vehicle?.brand} ${payment.contract?.vehicle?.model} (${payment.contract?.vehicle?.plateNumber})`],
      ["Échéance", new Date(payment.dueDate).toLocaleDateString()],
      ["Mode de paiement", payment.method || "N/A"],
      ["Statut", payment.status],
    ],
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });
  
  // Total Section
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  doc.setFontSize(14);
  doc.text("TOTAL ENCAISSÉ:", 120, finalY + 20);
  doc.setTextColor(5, 150, 105); // Emerald-600
  doc.setFont("helvetica", "bold");
  doc.text(`${Number(payment.amount).toLocaleString()} FCFA`, 170, finalY + 20, { align: "right" });
  
  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("Ce document est une preuve officielle de paiement générée électroniquement par le système AutoPartage.", 105, 280, { align: "center" });
  
  doc.save(`Recu_${payment.id.slice(-6)}.pdf`);
};

export const generateContractSummary = (contract: any) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.text("AutoPartage Gabon", 20, 20);
  doc.setFontSize(10);
  doc.text("SOMMAIRE DU CONTRAT DE LOCATION-VENTE", 20, 27);
  
  doc.line(20, 35, 190, 35);
  
  // Sections
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("1. PARTIES PRENANTES", 20, 50);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Chauffeur: ${contract.driver?.user?.fullName}`, 25, 60);
  doc.text(`Numéro de Permis: ${contract.driver?.licenseNumber}`, 25, 65);
  doc.text(`Email: ${contract.driver?.user?.email}`, 25, 70);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("2. OBJET DU CONTRAT", 20, 85);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Véhicule: ${contract.vehicle?.brand} ${contract.vehicle?.model}`, 25, 95);
  doc.text(`Immatriculation: ${contract.vehicle?.plateNumber}`, 25, 100);
  doc.text(`Type de contrat: ${contract.type === "RENTAL" ? "LOCATION" : "VENTE"}`, 25, 105);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("3. CONDITIONS FINANCIÈRES", 20, 120);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Loyer Mensuel: ${Number(contract.monthlyAmount).toLocaleString()} FCFA`, 25, 130);
  doc.text(`Date d'effet: ${new Date(contract.startDate).toLocaleDateString()}`, 25, 135);
  
  // Signature Placeholders
  doc.text("Signature AutoPartage", 40, 200);
  doc.text("Signature Chauffeur", 130, 200);
  doc.rect(20, 210, 70, 30);
  doc.rect(110, 210, 70, 30);
  
  doc.save(`Contrat_${contract.id.slice(-6)}.pdf`);
};
