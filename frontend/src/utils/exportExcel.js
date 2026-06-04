import * as XLSX from 'xlsx';

export function exportResultsToExcel(results) {
  const data = results.map(r => ({
    'Студент': r.student?.fullName || '-',
    'Тест': r.test?.title || '-',
    'Предмет': r.test?.subject || '-',
    'Балл (%)': r.score,
    'Верных ответов': `${r.correctAnswers}/${r.totalQuestions}`,
    'Предупреждений': r.warnings,
    'Статус': r.status === 'COMPLETED' ? 'Успешно' : r.status === 'VIOLATION' ? 'Нарушение' : 'В процессе',
    'Начало': new Date(r.startedAt).toLocaleString('ru-RU'),
    'Завершение': r.finishedAt ? new Date(r.finishedAt).toLocaleString('ru-RU') : '-'
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [{wch:25},{wch:25},{wch:20},{wch:10},{wch:15},{wch:14},{wch:14},{wch:20},{wch:20}];
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Результаты');
  XLSX.writeFile(wb, `examguard-results-${Date.now()}.xlsx`);
}
