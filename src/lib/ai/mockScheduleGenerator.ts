import { RequiredDocument, SubsidyScheduleItem } from '@/types';

export function buildMockScheduleFromRequiredDocuments(
  requiredDocuments: RequiredDocument[]
): SubsidyScheduleItem[] {
  const scheduleItems: SubsidyScheduleItem[] = [];
  
  // 今日、明日、今週などの日付を生成するためのベース
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  requiredDocuments.forEach((doc, index) => {
    let title = '';
    const category = '資料準備';
    let progressStatus: SubsidyScheduleItem['progressStatus'] = 'not_started';
    let dueDate = formatDate(today);

    // 状態に応じたタスク生成
    if (doc.status === 'not_started') {
      title = `${doc.name}の依頼`;
      progressStatus = 'not_started';
      // 高優先度は今日、それ以外は明日
      dueDate = doc.priority === 'high' ? formatDate(today) : formatDate(tomorrow);
    } else if (doc.status === 'requested') {
      title = `${doc.name}の受領確認`;
      progressStatus = 'in_progress';
      dueDate = formatDate(tomorrow);
    } else if (doc.status === 'received') {
      title = `${doc.name}の確認`;
      progressStatus = 'done';
      dueDate = formatDate(today); // 完了済みのものは今日としておくか、特に期日は意識させない
    } else if (doc.status === 'not_needed') {
      // 不要なものは予定として生成しない
      return;
    }

    scheduleItems.push({
      id: `sched_${Date.now()}_${index}`,
      title,
      dueDate,
      category,
      importance: doc.priority,
      verificationStatus: 'unverified', // この画面では使わないが必須プロパティ
      progressStatus,
      aiMemo: doc.reason, // 資料の理由をメモとして活用
      assignee: '担当者未定',
    });
  });

  // 少しバリエーションを出すために、自動生成される一般的なスケジュールもいくつか追加
  scheduleItems.push({
    id: `sched_gen_1`,
    title: '申請スケジュールの全体共有',
    dueDate: formatDate(today),
    category: '進行管理',
    importance: 'high',
    verificationStatus: 'unverified',
    progressStatus: 'done',
    aiMemo: 'プロジェクトキックオフ時に共有済み',
    assignee: '担当者A',
  });

  scheduleItems.push({
    id: `sched_gen_2`,
    title: '第一回 ドラフトレビュー',
    dueDate: formatDate(nextWeek),
    category: 'レビュー',
    importance: 'high',
    verificationStatus: 'unverified',
    progressStatus: 'not_started',
    aiMemo: '資料が概ね揃った段階で実施予定',
    assignee: '専門家B',
  });

  return scheduleItems;
}
