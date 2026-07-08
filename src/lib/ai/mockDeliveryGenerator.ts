import { Case, SubsidyDeliveryItem } from "@/types";

export function buildMockDeliveryItems(caseData: Case): SubsidyDeliveryItem[] {
  return [
    {
      id: `del_1_${Date.now()}`,
      title: "必須資料の受領確認",
      purpose: "提出必須となっているすべての資料が手元に揃っているかの最終確認",
      importance: "high",
      verificationStatus: "unverified",
      completionStatus: "incomplete",
      aiMemo: "必須資料リストと実際の受領フォルダを突き合わせて確認してください。",
      cautionNote: "不足があると申請が受理されません。"
    },
    {
      id: `del_2_${Date.now()}`,
      title: "申請内容の確認",
      purpose: "事業計画書や見積書の内容が公募要項の要件に合致しているかの確認",
      importance: "high",
      verificationStatus: "unverified",
      completionStatus: "incomplete",
      aiMemo: "対象経費や事業実施期間が要項の制限内に収まっているか確認してください。"
    },
    {
      id: `del_3_${Date.now()}`,
      title: "期限・提出日の確認",
      purpose: "公募締切日時と実際の提出予定日時のすり合わせ",
      importance: "high",
      verificationStatus: "unverified",
      completionStatus: "incomplete",
      aiMemo: "締切当日はシステムが混雑する可能性があるため、前日までの提出を推奨します。",
      cautionNote: "1分でも遅れると受け付けられません。"
    },
    {
      id: `del_4_${Date.now()}`,
      title: "gBizID等の準備確認",
      purpose: "電子申請システムへのログイン情報（gBizID等）が有効であるかの確認",
      importance: "high",
      verificationStatus: "unverified",
      completionStatus: "incomplete",
      aiMemo: "パスワードの有効期限切れやSMS認証用の端末が手元にあるか確認してください。"
    },
    {
      id: `del_5_${Date.now()}`,
      title: "添付資料の確認",
      purpose: "指定されたファイル形式・ファイルサイズ要件を満たしているかの確認",
      importance: "medium",
      verificationStatus: "unverified",
      completionStatus: "incomplete",
      aiMemo: "PDFの文字化けやファイルサイズの上限オーバーがないか確認してください。"
    },
    {
      id: `del_6_${Date.now()}`,
      title: "エビデンス確認",
      purpose: "前の工程でAIが整理したエビデンス・根拠がすべて確認済になっているかの確認",
      importance: "medium",
      verificationStatus: "unverified",
      completionStatus: "incomplete",
      aiMemo: "確認漏れがある場合は、AI検証画面に戻って確認を完了させてください。"
    },
    {
      id: `del_7_${Date.now()}`,
      title: "要修正項目の確認",
      purpose: "これまでに洗い出された要修正項目がすべて解消されているかの確認",
      importance: "high",
      verificationStatus: "unverified",
      completionStatus: "incomplete",
      aiMemo: "修正を依頼した書類が最新版に差し替わっているか確認してください。"
    },
    {
      id: `del_8_${Date.now()}`,
      title: "提出前の最終確認",
      purpose: "すべての準備が整い、顧客への最終報告および提出を実施する",
      importance: "high",
      verificationStatus: "unverified",
      completionStatus: "incomplete",
      aiMemo: "顧客に最終版の事業計画や確認画面のスクリーンショットを共有し、最終承認を得てください。"
    }
  ];
}
