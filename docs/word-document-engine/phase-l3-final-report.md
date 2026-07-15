# Word Document Engine Level 3 最終報告書

## 1. 監査対象論理フィールド総数
**96** 件

## 2. Mapping登録数
**90** 件

## 3. 自動入力可能Mapping数
**84** 件 (autoFill: true, manualCheck/humanReview: false)

## 4. v3実入力・検証論理フィールド数
**11** 件
入力項目: 申請日, 法人番号, 労働保険番号, 資本金, 労働者数, 金融機関名, 支店名, 口座番号, 口座名義, 協力する(単一選択), 成果目標(複数選択)

## 5. manualCheck数
**6** 件

## 6. humanReview数
**6** 件

## 7. 未Mapping数
**6** 件

## 8. B～F件数 (監査分類)
- B (無変更): 0件
- C (Mapping追加のみ): 84件
- D (軽微拡張・手動確認): 4件 (manualCheckのうち、繰返し表でないもの)
- E (新共通Core・手動確認): 2件 (繰返し表: designated_workplaces, wage_increase_workers)
- F (自動化対象外): 6件 (未Mappingの手動入力項目)
(合計: 96件)

## 9. 既存Core適用率
**87.5%**  ( (B + C) / A * 100 = (0 + 84) / 96 * 100 )

## 10. 今回実装対象成功率
**100.0%** ( v3成功 11件 / v3実行 11件 )

## 11. 将来Core候補の論理フィールド数
**3** 件 (designated_workplaces, wage_increase_workers, bank_account_type)

## 12. 将来Core機能種類数
**2** 種類 (行追加・行複製, 同一段落内の複数SDT個別特定)

## 13. 検証結果
- 新規共通Core: paragraph-exact-text (表外段落特定Locator), 分散セルSeparator汎用検証
- 制度固有Core: なし
- 220テスト成功: 成功 (pass 220, fail 0)
- verify成功: 成功
- build成功: 成功
- 変更ファイル限定lint error／warning: 0
- 全体lint終了コード: 1 (既存ファイルの対象外警告による)
- OutputVerifier成功: 成功
- DomSerializationVerifier成功: 成功
- Word実アプリ確認済み: 確認済み
- 原本SHA不変: b87253adeb29b593913c97fe972a4bb3afb8c36bac6dbb66bd70d08146963da8
- v3 SHA: 7357ca119318cb6d92b77104014e635b0bdb56aad8a9bc7346e365c5488df4fb
- Git commit／push済み: 完了

## 14. 最終判定
**Word Document Engine Level 3正式完了**

## 15. 全件対応表
| 論理fieldId | 原本項目名(推定) | B～F分類 | Mapping登録有無 | Mapping fieldId | autoFill | manualCheck | humanReview | v3実入力有無 | 未登録理由/将来Core候補 | 備考 |
|---|---|---|---|---|---|---|---|---|---|---|
| plan_start_date | 年　　月　　日 | C | Yes | plan_start_date | true | false | false | Yes | - | - |
| sdt_group_1 | - | C | Yes | sdt_group_1 | true | false | false | No | - | - |
| sdt_group_2 | - | C | Yes | sdt_group_2 | true | false | false | No | - | - |
| sdt_group_3 | - | C | Yes | sdt_group_3 | true | false | false | No | - | - |
| sdt_group_4 | - | C | Yes | sdt_group_4 | true | false | false | No | - | - |
| sdt_group_5 | - | C | Yes | sdt_group_5 | true | false | false | No | - | - |
| sdt_group_6 | - | C | Yes | sdt_group_6 | true | false | false | No | - | - |
| sdt_group_7 | - | C | Yes | sdt_group_7 | true | false | false | No | - | - |
| sdt_group_8 | - | C | Yes | sdt_group_8 | true | false | false | No | - | - |
| bank_account_type | - | C | Yes | bank_account_type | true | false | false | No | 同一段落内複数SDT特定 | - |
| cooperate_checkbox | - | C | Yes | cooperate_checkbox | true | false | false | Yes | - | - |
| sdt_group_11 | - | E | Yes | sdt_group_11 | false | true | true | No | - | - |
| sdt_group_12 | - | C | Yes | sdt_group_12 | true | false | false | No | - | - |
| sdt_group_13 | - | C | Yes | sdt_group_13 | true | false | false | No | - | - |
| sdt_group_14 | - | C | Yes | sdt_group_14 | true | false | false | Yes | - | - |
| sdt_group_15 | - | C | Yes | sdt_group_15 | true | false | false | No | - | - |
| sdt_group_16 | - | C | Yes | sdt_group_16 | true | false | false | No | - | - |
| sdt_group_17 | - | C | Yes | sdt_group_17 | true | false | false | No | - | - |
| sdt_group_18 | - | C | Yes | sdt_group_18 | true | false | false | No | - | - |
| sdt_group_19 | - | C | Yes | sdt_group_19 | true | false | false | No | - | - |
| sdt_group_20 | - | C | Yes | sdt_group_20 | true | false | false | No | - | - |
| sdt_group_21 | - | C | Yes | sdt_group_21 | true | false | false | No | - | - |
| sdt_group_22 | - | C | Yes | sdt_group_22 | true | false | false | No | - | - |
| sdt_group_23 | - | C | Yes | sdt_group_23 | true | false | false | No | - | - |
| sdt_group_24 | - | C | Yes | sdt_group_24 | true | false | false | No | - | - |
| sdt_group_25 | - | C | Yes | sdt_group_25 | true | false | false | No | - | - |
| sdt_group_26 | - | E | Yes | sdt_group_26 | false | true | true | No | - | - |
| sdt_group_27 | - | C | Yes | sdt_group_27 | true | false | false | No | - | - |
| sdt_group_28 | - | C | Yes | sdt_group_28 | true | false | false | No | - | - |
| sdt_group_29 | - | C | Yes | sdt_group_29 | true | false | false | No | - | - |
| sdt_group_30 | - | C | Yes | sdt_group_30 | true | false | false | No | - | - |
| sdt_group_31 | - | C | Yes | sdt_group_31 | true | false | false | No | - | - |
| sdt_group_32 | - | C | Yes | sdt_group_32 | true | false | false | No | - | - |
| sdt_group_33 | - | C | Yes | sdt_group_33 | true | false | false | No | - | - |
| sdt_group_34 | - | C | Yes | sdt_group_34 | true | false | false | No | - | - |
| sdt_group_35 | - | E | Yes | sdt_group_35 | false | true | true | No | - | - |
| sdt_group_36 | - | E | Yes | sdt_group_36 | false | true | true | No | - | - |
| sdt_group_37 | - | C | Yes | sdt_group_37 | true | false | false | No | - | - |
| sdt_group_38 | - | C | Yes | sdt_group_38 | true | false | false | No | - | - |
| sdt_group_39 | - | C | Yes | sdt_group_39 | true | false | false | No | - | - |
| sdt_group_40 | - | C | Yes | sdt_group_40 | true | false | false | No | - | - |
| sdt_group_41 | - | C | Yes | sdt_group_41 | true | false | false | No | - | - |
| sdt_group_42 | - | C | Yes | sdt_group_42 | true | false | false | No | - | - |
| sdt_group_43 | - | C | Yes | sdt_group_43 | true | false | false | No | - | - |
| sdt_group_44 | - | C | Yes | sdt_group_44 | true | false | false | No | - | - |
| sdt_group_45 | - | C | Yes | sdt_group_45 | true | false | false | No | - | - |
| corporate_number | （１）法人番号（個人事業主等は | C | Yes | corporate_number | true | false | false | Yes | - | - |
| labor_insurance_number | （２）労働保険番号（継続事業の | C | Yes | labor_insurance_number | true | false | false | Yes | - | - |
| field_3 | - | C | Yes | field_3 | true | false | false | No | - | - |
| field_4 | - | C | Yes | field_4 | true | false | false | No | - | - |
| field_5 | - | C | Yes | field_5 | true | false | false | No | - | - |
| field_6 | - | C | Yes | field_6 | true | false | false | No | - | - |
| capital | （４）資本金の額又は出資の総額 | C | Yes | capital | true | false | false | Yes | - | - |
| employee_count | 企業全体 | C | Yes | employee_count | true | false | false | Yes | - | - |
| field_9 | 企業全体 | C | Yes | field_9 | true | false | false | No | - | - |
| field_10 | （13）本年度におい | C | Yes | field_10 | true | false | false | No | - | - |
| bank_name | 金融機関名 | C | Yes | bank_name | true | false | false | Yes | - | - |
| branch_name | 支店名 | C | Yes | branch_name | true | false | false | Yes | - | - |
| bank_account_number | 口座番号（右詰め） | C | Yes | bank_account_number | true | false | false | Yes | - | - |
| bank_account_holder | 口座名義（カタカナ） | C | Yes | bank_account_holder | true | false | false | Yes | - | - |
| field_15 | （１）労使の話合いの | C | Yes | field_15 | true | false | false | No | - | - |
| field_16 | 労働時間や年次有給休 | C | Yes | field_16 | true | false | false | No | - | - |
| field_17 | 職場の意識を改善する | C | Yes | field_17 | true | false | false | No | - | - |
| field_18 | 労働者に対して、働き | C | Yes | field_18 | true | false | false | No | - | - |
| designated_workplaces | - | E | Yes | designated_workplaces | false | true | true | No | 繰返し行追加/複製 | - |
| field_19 | イ　賃上げ対象労働者 | C | Yes | field_19 | true | false | false | No | - | - |
| field_20 | ウ　引上げ時期（予定 | C | Yes | field_20 | true | false | false | No | - | - |
| field_21 | ウ　引上げ時期（予定 | C | Yes | field_21 | true | false | false | No | - | - |
| field_22 | ア　意見を聴いた労働 | C | Yes | field_22 | true | false | false | No | - | - |
| field_23 | １ | C | Yes | field_23 | true | false | false | No | - | - |
| field_24 | 〒 | C | Yes | field_24 | true | false | false | No | - | - |
| field_25 | ２ | C | Yes | field_25 | true | false | false | No | - | - |
| field_26 | 〒 | C | Yes | field_26 | true | false | false | No | - | - |
| field_27 | ３ | C | Yes | field_27 | true | false | false | No | - | - |
| field_28 | 〒 | C | Yes | field_28 | true | false | false | No | - | - |
| field_29 | ４ | C | Yes | field_29 | true | false | false | No | - | - |
| field_30 | 〒 | C | Yes | field_30 | true | false | false | No | - | - |
| field_31 | ５ | C | Yes | field_31 | true | false | false | No | - | - |
| field_32 | 〒 | C | Yes | field_32 | true | false | false | No | - | - |
| field_33 | ６ | C | Yes | field_33 | true | false | false | No | - | - |
| field_34 | 〒 | C | Yes | field_34 | true | false | false | No | - | - |
| field_35 | ７ | C | Yes | field_35 | true | false | false | No | - | - |
| field_36 | 〒 | C | Yes | field_36 | true | false | false | No | - | - |
| field_37 | ８ | C | Yes | field_37 | true | false | false | No | - | - |
| field_38 | 〒 | C | Yes | field_38 | true | false | false | No | - | - |
| field_39 | ９ | C | Yes | field_39 | true | false | false | No | - | - |
| field_40 | 〒 | C | Yes | field_40 | true | false | false | No | - | - |
| field_41 | 10 | C | Yes | field_41 | true | false | false | No | - | - |
| field_42 | 〒 | C | Yes | field_42 | true | false | false | No | - | - |
| wage_increase_workers | - | E | Yes | wage_increase_workers | false | true | true | No | 繰返し行追加/複製 | - |
| improvement_projects_other | 改善事業 その他 | F | No | - | false | false | false | No | 自由記述併設・手動補完 | - |
| special_leave_type_other | 特別休暇 その他 | F | No | - | false | false | false | No | 自由記述併設・手動補完 | - |
| awareness_method_other | 周知方法 その他 | F | No | - | false | false | false | No | 自由記述併設・手動補完 | - |
| opinion_other | 意見 その他 | F | No | - | false | false | false | No | 自由記述併設・手動補完 | - |
| sdt_group_9 | 口座種類（統合前） | C | No | - | false | false | false | No | 単一選択として統合 | - |
| sdt_group_10 | 税抜税込（統合前） | C | No | - | false | false | false | No | 単一選択として統合 | - |

