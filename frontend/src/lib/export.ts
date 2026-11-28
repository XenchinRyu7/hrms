/**
 * Utility functions for exporting data to CSV and generating print-ready PDFs.
 */

export function exportToCSV(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
) {
  const escapeCell = (val: string | number) => {
    const str = String(val ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => row.map(escapeCell).join(",")),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    filename.endsWith(".csv") ? filename : `${filename}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface PayslipPrintData {
  companyName: string;
  companyAddress: string;
  employeeName: string;
  employeeCode: string;
  jobTitle: string;
  department: string;
  periodName: string;
  basicSalary: number;
  overtimePay: number;
  reimbursements: number;
  totalAllowances: number;
  taxDeduction: number;
  insuranceDeduction: number;
  totalDeductions: number;
  netSalary: number;
  bankName?: string;
  bankAccount?: string;
}

export function printPayslip(data: PayslipPrintData) {
  const formatIDR = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);

  const printWindow = window.open("", "_blank", "width=850,height=950");
  if (!printWindow) {
    alert(
      "Popup diblokir oleh browser. Izinkan popup untuk mencetak slip gaji.",
    );
    return;
  }

  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Slip Gaji - ${data.employeeName} - ${data.periodName}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #18181b;
      margin: 0;
      padding: 24px;
      line-height: 1.4;
      font-size: 13px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #27272a;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .company-title {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0 0 4px 0;
    }
    .company-sub {
      color: #71717a;
      font-size: 11px;
      margin: 0;
    }
    .payslip-badge {
      text-align: right;
    }
    .payslip-badge h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 800;
      color: #09090b;
      letter-spacing: 0.5px;
    }
    .payslip-badge p {
      margin: 4px 0 0 0;
      font-size: 12px;
      font-weight: 600;
      color: #52525b;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      background: #f4f4f5;
      padding: 14px 18px;
      border-radius: 8px;
      margin-bottom: 24px;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .meta-label {
      color: #71717a;
      font-size: 12px;
    }
    .meta-val {
      font-weight: 600;
      color: #18181b;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .details-table th {
      background: #e4e4e7;
      text-align: left;
      padding: 10px 12px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #d4d4d8;
    }
    .details-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #f4f4f5;
    }
    .text-right { text-align: right; }
    .text-emerald { color: #059669; font-weight: 600; }
    .text-rose { color: #e11d48; font-weight: 600; }
    .total-box {
      background: #fafafa;
      border: 1px solid #e4e4e7;
      border-radius: 8px;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
    }
    .take-home-label {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #27272a;
    }
    .take-home-val {
      font-size: 22px;
      font-weight: 900;
      color: #09090b;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      text-align: center;
      margin-top: 40px;
    }
    .sign-space {
      height: 70px;
    }
    .sign-name {
      font-weight: 700;
      border-top: 1px solid #71717a;
      padding-top: 6px;
      display: inline-block;
      min-width: 180px;
    }
    .footer-note {
      margin-top: 32px;
      font-size: 11px;
      color: #a1a1aa;
      text-align: center;
      border-top: 1px dashed #e4e4e7;
      padding-top: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="company-title">${data.companyName}</h1>
      <p class="company-sub">${data.companyAddress}</p>
    </div>
    <div class="payslip-badge">
      <h2>SLIP GAJI</h2>
      <p>${data.periodName}</p>
    </div>
  </div>

  <div class="meta-grid">
    <div>
      <div class="meta-row"><span class="meta-label">Nama Karyawan:</span><span class="meta-val">${data.employeeName}</span></div>
      <div class="meta-row"><span class="meta-label">ID Karyawan:</span><span class="meta-val">${data.employeeCode}</span></div>
      <div class="meta-row"><span class="meta-label">Jabatan:</span><span class="meta-val">${data.jobTitle}</span></div>
    </div>
    <div>
      <div class="meta-row"><span class="meta-label">Departemen:</span><span class="meta-val">${data.department}</span></div>
      <div class="meta-row"><span class="meta-label">Tanggal Cetak:</span><span class="meta-val">${currentDate}</span></div>
      <div class="meta-row"><span class="meta-label">Rekening Bank:</span><span class="meta-val">${data.bankName || "BCA"} - ${data.bankAccount || "8829012391"}</span></div>
    </div>
  </div>

  <table class="details-table">
    <thead>
      <tr>
        <th>Komponen Penghasilan</th>
        <th class="text-right">Jumlah</th>
        <th>Komponen Potongan</th>
        <th class="text-right">Jumlah</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Gaji Pokok</td>
        <td class="text-right">${formatIDR(data.basicSalary)}</td>
        <td>PPh 21 Pajak Penghasilan</td>
        <td class="text-right text-rose">-${formatIDR(data.taxDeduction)}</td>
      </tr>
      <tr>
        <td>Uang Lembur</td>
        <td class="text-right text-emerald">+${formatIDR(data.overtimePay)}</td>
        <td>BPJS Ketenagakerjaan & Kesehatan</td>
        <td class="text-right text-rose">-${formatIDR(data.insuranceDeduction)}</td>
      </tr>
      <tr>
        <td>Reimbursement Disetujui</td>
        <td class="text-right text-emerald">+${formatIDR(data.reimbursements)}</td>
        <td>-</td>
        <td class="text-right">-</td>
      </tr>
      <tr style="font-weight: 700; background: #fafafa;">
        <td>Total Penerimaan Kotor</td>
        <td class="text-right text-emerald">${formatIDR(data.basicSalary + data.totalAllowances)}</td>
        <td>Total Potongan</td>
        <td class="text-right text-rose">-${formatIDR(data.totalDeductions)}</td>
      </tr>
    </tbody>
  </table>

  <div class="total-box">
    <div>
      <div class="take-home-label">Gaji Bersih Diterima (Take Home Pay)</div>
      <small style="color: #71717a;">Telah diproses dan ditransfer ke rekening karyawan</small>
    </div>
    <div class="take-home-val">${formatIDR(data.netSalary)}</div>
  </div>

  <div class="signatures">
    <div>
      <p style="color: #71717a; margin-bottom: 0;">Penerima,</p>
      <div class="sign-space"></div>
      <div class="sign-name">${data.employeeName}</div>
    </div>
    <div>
      <p style="color: #71717a; margin-bottom: 0;">Finance & Payroll Dept,</p>
      <div class="sign-space"></div>
      <div class="sign-name">Ethereal Global HR</div>
    </div>
  </div>

  <div class="footer-note">
    Dokumen ini dicetak secara otomatis oleh Sistem HRMS dan berlaku sebagai bukti pembayaran sah.
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>
`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
