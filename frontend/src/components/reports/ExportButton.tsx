'use client';

import { FileDown, Table, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

interface ExportButtonProps {
  data: any[];
  filename: string;
  className?: string;
}

export function ExportButton({ data, filename, className }: ExportButtonProps) {
  const exportToCSV = () => {
    if (!data || data.length === 0) {
      toast.error('No data available to export');
      return;
    }

    try {
      // Get headers from first object
      const headers = Object.keys(data[0]);
      const csvRows = [];
      
      // Header row
      csvRows.push(headers.join(','));

      // Data rows
      for (const row of data) {
        const values = headers.map(header => {
          const val = row[header];
          const escaped = ('' + val).replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
      }

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={exportToCSV}
        className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
      >
        <FileSpreadsheet className="w-3.5 h-3.5" />
        Export CSV
      </button>
    </div>
  );
}
