import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportResultsToPdf(results) {
  const doc = new jsPDF();
  
  // Шапка с логотипом
  doc.setFontSize(18);
  doc.setTextColor(16, 185, 129);
  doc.text('ExamGuard Proctor', 14, 18);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text('Отчёт по результатам экзаменов', 14, 26);
  doc.text(`Дата: ${new Date().toLocaleString('ru-RU')}`, 14, 32);

  autoTable(doc, {
    startY: 40,
    head: [['Студент', 'Тест', 'Балл', 'Предупр.', 'Статус', 'Дата']],
    body: results.map(r => [
      r.student?.fullName || '-',
      r.test?.title || '-',
      `${r.score}%`,
      r.warnings,
      r.status === 'COMPLETED' ? 'Успешно' : r.status === 'VIOLATION' ? 'Нарушение' : 'В процессе',
      r.finishedAt ? new Date(r.finishedAt).toLocaleString('ru-RU') : '-'
    ]),
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 9 }
  });

  // Футер
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8); doc.setTextColor(150);
    doc.text(`Страница ${i} из ${pages}`, 14, doc.internal.pageSize.height - 8);
  }

  doc.save(`examguard-results-${Date.now()}.pdf`);
}
