import { Evidence, ServiceJob } from '@core/entities/types';
import { PdfExporter } from '@core/ports/repositories';
import jsPDF from 'jspdf';

export class JsPdfExporter implements PdfExporter {
  async exportJob(job: ServiceJob, evidence: Evidence | undefined): Promise<Blob> {
    const doc = new jsPDF();
    doc.text(`Reporte de servicio ${job.id}`, 10, 10);
    doc.text(`Cliente: ${job.clientId}`, 10, 20);
    doc.text(`Fecha: ${job.scheduledAt}`, 10, 30);
    doc.text(`Estado: ${job.status}`, 10, 40);
    doc.text(`Precio: ${job.price}€`, 10, 50);
    if (evidence) {
      doc.text(`Checklist: ${evidence.checklist.filter((c) => c.done).length}/${evidence.checklist.length}`, 10, 60);
      doc.text(`Fotos antes: ${evidence.beforePhotos.length}`, 10, 70);
      doc.text(`Fotos después: ${evidence.afterPhotos.length}`, 10, 80);
    }
    const blob = new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
    return blob;
  }
}
