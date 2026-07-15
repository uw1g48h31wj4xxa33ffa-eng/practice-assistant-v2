export const careerUpR8Form1Mapping = {
  template: {
    id: "career-up-r8-form1",
    version: "R8.4.8",
    expectedSha256: "d46f03b16e9eda461275acbef2c127b22cbc2c1e321b27465f59e2181cb43092",
  },
  fields: [
    {
      fieldId: "business_owner_name",
      labelText: "①事業主名",
      locator: {
        type: "adjacent-cell",
        matchMode: "exact-cell-text",
      },
      validation: {
        required: true,
        maxLength: 60,
      },
      verification: { type: 'text' }
    },
    {
      fieldId: "business_address",
      labelRunTexts: ["②事業所", "所在地"],
      labelText: "②事業所所在地",
      locator: {
        type: "next-row-continuation-cell",
        matchMode: "exact-concatenated-cell-text",
        requireEmptyParagraph: true,
      },
      validation: {
        required: true,
        maxLength: 100,
      },
      verification: { type: 'text' }
    },
    {
      fieldId: 'business_phone_number',
      labelText: '③電話番号',
      locator: {
        type: 'adjacent-cell',
        matchMode: 'exact-cell-text'
      },
      validation: {
        required: true,
        allowedDigits: [10, 11],
        allowHyphen: true,
        rejectLetters: true,
        rejectSymbols: true,
        rejectEmpty: true
      },
      verification: { type: 'text' }
    },
    {
      fieldId: 'business_contact_name',
      labelText: '④事業所の担当者',
      locator: {
        type: 'adjacent-cell',
        matchMode: 'exact-cell-text'
      },
      validation: {
        required: true,
        maxLength: 30,
        rejectEmpty: true,
        rejectInvalidChars: true
      },
      verification: { type: 'text' }
    },
    {
      fieldId: 'employment_insurance_office_number',
      labelText: '⑤雇用保険適用事業所番号',
      locator: {
        type: 'distributed-cells',
        pattern: [
          { type: 'digits', count: 4 },
          { type: 'separator', text: '－' },
          { type: 'digits', count: 6 },
          { type: 'separator', text: '－' },
          { type: 'digits', count: 1 },
          { type: 'ignore', count: 1 }
        ]
      },
      validation: {
        required: true,
        digits: 11,
        acceptedInputPatterns: [
          '####-######-#',
          '####－######－#',
          '###########'
        ]
      }
    },
    {
      fieldId: 'labor_insurance_number',
      labelText: '⑥労働保険番号',
      locator: {
        type: 'multi-row-distributed-cells',
        targetRowOffset: 1,
        pattern: [
          { type: 'ignore', count: 1 },
          { type: 'digits', count: 2, groupId: 'prefecture' },
          { type: 'digits', count: 1, groupId: 'jurisdictionType' },
          { type: 'digits', count: 2, groupId: 'office' },
          { type: 'digits', count: 6, groupId: 'baseNumber' },
          { type: 'separator', text: '－' },
          { type: 'digits', count: 3, groupId: 'branchNumber' }
        ]
      },
      validation: {
        required: true,
        digits: 14,
        acceptedInputPatterns: [
          '##############',
          '###########-###',
          '###########－###'
        ]
      }
    },
    {
      fieldId: 'main_business',
      labelText: '⑦主たる事業',
      locator: {
        type: 'adjacent-cell'
      },
      validation: {
        required: true,
        rejectEmpty: true,
        rejectInvalidChars: true,
        maxLength: 100
      },
      verification: { type: 'text' }
    },
    {
      fieldId: 'employee_count',
      labelText: '⑧企業規模（人数）',
      locator: {
        type: 'adjacent-cell'
      },
      inputMode: 'numeric-preserve-affix',
      affix: {
        suffixText: '人',
        preserveSuffix: true,
        position: 'after-value'
      },
      validation: {
        dataType: 'integer',
        required: true,
        normalizeFullWidthDigits: true,
        allowZero: false,
        allowNegative: false,
        allowDecimal: false,
        allowComma: false,
        min: 1
      }
    },
    {
      fieldId: 'agent_name',
      labelText: '⑩代理人等氏名',
      locator: {
        type: 'adjacent-cell'
      },
      validation: {
        required: false,
        maxLength: 50,
        rejectInvalidChars: true,
        allowHalfWidthSpace: true,
        allowFullWidthSpace: true
      },
      verification: { type: 'text' }
    },
    {
      fieldId: "agent_address",
      labelRunTexts: ["⑪", "所在地"],
      labelText: "⑪所在地",
      locator: {
        type: "next-row-continuation-cell",
        matchMode: "exact-concatenated-cell-text",
        requireEmptyParagraph: true,
      },
      validation: {
        required: false,
        maxLength: 100,
      },
      verification: { type: 'text' }
    },
    {
      fieldId: 'agent_phone_number',
      labelText: '⑫電話番号',
      locator: {
        type: 'adjacent-cell',
        matchMode: 'exact-cell-text'
      },
      validation: {
        required: false,
        allowedDigits: [10, 11],
        allowHyphen: true,
        rejectLetters: true,
        rejectSymbols: true,
        rejectEmpty: false
      },
      verification: { type: 'text' }
    },
    {
      fieldId: 'manager_name',
      labelText: '（氏　名）：',
      locator: {
        type: 'same-cell'
      },
      inputMode: 'text-preserve-prefix',
      preserve: {
        prefixText: '（氏　名）：'
      },
      validation: {
        required: true,
        rejectEmpty: true,
        maxLength: 30,
        rejectInvalidChars: true
      },
      verification: {
        type: 'text',
        preservePrefix: true,
        prefixText: '（氏　名）：'
      }
    },
    {
      fieldId: 'manager_assigned_date',
      labelText: '（配置日）：　　　　　　年　　　　月　　　　日',
      locator: {
        type: 'same-cell'
      },
      inputMode: 'date-preserve-tokens',
      preserve: {
        yearToken: '年',
        monthToken: '月',
        dayToken: '日'
      },
      format: {
        yearDigits: 4,
        padMonth: false,
        padDay: false
      },
      validation: {
        required: true,
        rejectEmpty: true,
        inputFormat: 'YYYY-MM-DD'
      }
    },
    {
      fieldId: 'plan_start_date',
      labelText: '年　　　月　　　日',
      locator: {
        type: 'same-cell',
        matchIndex: 0
      },
      inputMode: 'date-preserve-tokens',
      preserve: {
        yearToken: '年',
        monthToken: '月',
        dayToken: '日'
      },
      format: {
        yearDigits: 4,
        padMonth: false,
        padDay: false
      },
      validation: {
        required: true,
        rejectEmpty: true,
        inputFormat: 'YYYY-MM-DD'
      }
    },
    {
      fieldId: 'plan_end_date',
      labelText: '年　　　月　　　日',
      locator: {
        type: 'same-cell',
        matchIndex: 1
      },
      inputMode: 'date-preserve-tokens',
      preserve: {
        yearToken: '年',
        monthToken: '月',
        dayToken: '日'
      },
      format: {
        yearDigits: 4,
        padMonth: false,
        padDay: false
      },
      validation: {
        required: true,
        rejectEmpty: true,
        inputFormat: 'YYYY-MM-DD'
      }
    },
    {
      fieldId: 'career_up_manager_role_type',
      inputMode: 'sdt-checkbox',
      locator: {
        type: 'sdt-checkbox-group',
        groupContextText: '当てはまる方に☑をしてください',
        optionContextMode: 'adjacent-text'
      },
      selection: {
        mode: 'single',
        options: [
          {
            value: '事業主又は役員',
            contextText: '事業主又は役員である'
          },
          {
            value: '役員でない',
            contextText: '事業主又は役員ではない'
          }
        ],
        clearUnselected: true
      },
      validation: {
        required: true,
        rejectEmpty: true
      }
    },
    {
      fieldId: 'worker_representative_consent',
      inputMode: 'sdt-checkbox',
      locator: {
        type: 'sdt-checkbox-group',
        groupContextText: 'はい☐',
        optionContextMode: 'adjacent-text'
      },
      selection: {
        mode: 'single',
        options: [
          { value: 'はい', contextText: '☐' }
        ],
        clearUnselected: false
      },
      validation: {
        required: true,
        rejectEmpty: true
      }
    },
    {
      fieldId: 'opinion_hearing_method',
      inputMode: 'sdt-checkbox',
      locator: {
        type: 'sdt-checkbox-group',
        groupContextText: 'ア　☐イ　☐ウ　☐',
        optionContextMode: 'adjacent-text'
      },
      selection: {
        mode: 'single',
        options: [
          { value: 'ア', contextText: 'ア' },
          { value: 'イ', contextText: 'イ' },
          { value: 'ウ', contextText: 'ウ' }
        ],
        clearUnselected: true
      },
      validation: {
        required: true,
        rejectEmpty: true
      }
    },
    {
      fieldId: 'regularization_candidates',
      inputMode: 'sdt-checkbox',
      locator: {
        type: 'sdt-checkbox-group',
        groupContextText: '有期雇用労働者（勤続５年以内の有期雇用労働者）',
        optionContextMode: 'adjacent-text'
      },
      selection: {
        mode: 'multi',
        clearUnselected: true,
        minSelections: 1,
        maxSelections: 3,
        options: [
          {
            value: 'fixed_term',
            contextText: '有期雇用労働者（勤続５年以内の有期雇用労働者）'
          },
          {
            value: 'indefinite_term',
            contextText: '無期雇用労働者（正規雇用労働者を除く・勤続５年超の有期雇用労働者含む）'
          },
          {
            value: 'dispatch',
            contextText: '派遣労働者'
          }
        ]
      },
      validation: {
        required: false,
        rejectEmpty: false
      }
    },
    {
      fieldId: 'regularization_goals',
      inputMode: 'sdt-checkbox',
      locator: {
        type: 'sdt-checkbox-group',
        groupContextText: '対象者のうち、（　　　）名程度に対し、正規雇用労働者（多様な正社員※含む）への転換を実施',
        optionContextMode: 'adjacent-text'
      },
      selection: {
        mode: 'multi',
        clearUnselected: true,
        minSelections: 1,
        maxSelections: 2,
        options: [
          {
            value: 'conversion_to_regular',
            contextText: '対象者のうち、（　　　）名程度に対し、正規雇用労働者（多様な正社員※含む）への転換を実施'
          },
          {
            value: 'direct_employment_to_regular',
            contextText: '対象者（派遣労働者）のうち、（　　　）名程度に対し、正規雇用労働者（多様な正社員※含む）としての直接雇用を実施'
          }
        ]
      },
      validation: {
        required: false,
        rejectEmpty: false
      }
    },
    {
      fieldId: 'disability_regularization_targets',
      inputMode: 'sdt-checkbox',
      locator: {
        type: 'sdt-checkbox-group',
        groupContextText: '有期雇用労働者の対象者のうち、（　　　）名程度に対して正規雇用労働者（多様な正社員※含む）への転換を実施',
        optionContextMode: 'adjacent-text'
      },
      selection: {
        mode: 'multi',
        clearUnselected: true,
        minSelections: 1,
        maxSelections: 3,
        options: [
          {
            value: 'fixed_term_to_regular',
            contextText: '有期雇用労働者の対象者のうち、（　　　）名程度に対して正規雇用労働者（多様な正社員※含む）への転換を実施'
          },
          {
            value: 'fixed_term_to_indefinite',
            contextText: '有期雇用労働者の対象者のうち、（　　　）名程度に対して無期雇用労働者（※２）への転換を実施（※３）'
          },
          {
            value: 'indefinite_to_regular',
            contextText: '無期雇用労働者の対象者のうち、（　　　）名程度に対して正規雇用労働者（多様な正社員※含む）への転換を実施'
          }
        ]
      },
      validation: {
        required: false,
        rejectEmpty: false
      }
    },
    {
      fieldId: 'wage_increase_rate',
      inputMode: 'sdt-checkbox',
      locator: {
        type: 'sdt-checkbox-group',
        groupContextText: '３％以上４％未満の増額改定',
        optionContextMode: 'adjacent-text'
      },
      selection: {
        mode: 'single',
        options: [
          { value: '3%以上4%未満', contextText: '３％以上４％未満の増額改定' },
          { value: '4%以上5%未満', contextText: '４％以上５％未満の増額改定' },
          { value: '5%以上6%未満', contextText: '５％以上６％未満の増額改定' },
          { value: '6%以上', contextText: '６％以上の増額改定' }
        ],
        clearUnselected: true
      },
      validation: {
        required: false
      }
    },
    {
      fieldId: 'manager_duties',
      inputMode: 'sdt-checkbox',
      locator: {
        type: 'sdt-checkbox-group',
        groupContextText: 'キャリアアップのために講ずる取組等を事業所内に周知',
        optionContextMode: 'adjacent-text'
      },
      selection: {
        mode: 'multi',
        clearUnselected: true,
        minSelections: 1,
        maxSelections: 5,
        options: [
          { value: 'disseminate', contextText: 'キャリアアップのために講ずる取組等を事業所内に周知' },
          { value: 'follow_up', contextText: 'キャリアアップ計画の見直し及び見直しに基づく取組のフォローアップ' },
          { value: 'training', contextText: '職業能力等の向上のための訓練、研修その他業務指導等の実施' },
          { value: 'consultation', contextText: '仕事内容や処遇等について話し合う機会や相談窓口の設置' },
          { value: 'other', contextText: 'その他（' }
        ]
      },
      validation: { required: false, rejectEmpty: false }
    },
    {
      fieldId: 'disability_regularization_candidates',
      inputMode: 'sdt-checkbox',
      locator: {
        type: 'sdt-checkbox-group',
        groupContextText: '無期雇用労働者（正規雇用労働者を除く）',
        optionContextMode: 'adjacent-text'
      },
      selection: {
        mode: 'multi',
        clearUnselected: true,
        minSelections: 1,
        maxSelections: 2,
        options: [
          { value: 'fixed_term', contextText: '有期雇用労働者' },
          { value: 'indefinite_term', contextText: '無期雇用労働者（正規雇用労働者を除く）' }
        ]
      },
      validation: { required: false, rejectEmpty: false }
    },
    {
      fieldId: 'disability_regularization_actions',
      inputMode: 'sdt-checkbox',
      locator: {
        type: 'sdt-checkbox-group',
        groupContextText: '初めて多様な正社員への転換を実施する場合',
        optionContextMode: 'adjacent-text'
      },
      selection: {
        mode: 'multi',
        clearUnselected: true,
        minSelections: 1,
        maxSelections: 5,
        options: [
          { value: 'new_rules', contextText: '初めて多様な正社員への転換を実施する場合は、「勤務地限定・職務限定・短時間正社員」制度を新たに規定' },
          { value: 'interview', contextText: '対象者の働き方の希望を把握し、仕事内容や処遇等について話し合う面談の実施' },
          { value: 'training', contextText: '対象者に対し、正社員化等に向けたキャリアアップのための教育訓練等を実施' },
          { value: 'exam', contextText: '正規雇用労働者（多様な正社員※含む）に転換するための面接試験・昇格試験等を実施' },
          { value: 'other', contextText: 'その他（' }
        ]
      },
      validation: { required: false, rejectEmpty: false }
    },
    {
      fieldId: 'wage_revision_target_category',
      inputMode: 'sdt-checkbox',
      locator: {
        type: 'sdt-checkbox-group',
        groupContextText: '一部の有期雇用労働者等（一部の対象者のみ改定を行う場合は',
        optionContextMode: 'adjacent-text'
      },
      selection: {
        mode: 'multi',
        clearUnselected: true,
        minSelections: 1,
        maxSelections: 8,
        options: [
          { value: 'all', contextText: '全ての有期雇用労働者等（正規雇用労働者以外の無期雇用労働者を含む）' },
          { value: 'partial', contextText: '一部の有期雇用労働者等' },
          { value: 'employment_type', contextText: '雇用形態の区分（契約社員、パート、アルバイト等）で一部の区分のみ' },
          { value: 'job_type', contextText: '職種別（事務、営業、販売等）で一部の職種のみ' },
          { value: 'level', contextText: '業務レベルによる区分（初級、中級、上級等）が規定されている場合で、その' },
          { value: 'location', contextText: '雇用保険適用事業所非該当承認施設単位（店舗単位等）' },
          { value: 'minimum_wage', contextText: '最低賃金の改定施行によって、これを下回ることとなる金額の等級のみ' },
          { value: 'other', contextText: 'その他（' }
        ]
      },
      validation: { required: false, rejectEmpty: false }
    },
    {
      fieldId: 'wage_rules_revision_actions',
      inputMode: 'sdt-checkbox',
      locator: {
        type: 'sdt-checkbox-group',
        groupContextText: '有期雇用労働者等に係る昇給制度を新たに規',
        optionContextMode: 'adjacent-text'
      },
      selection: {
        mode: 'multi',
        clearUnselected: true,
        minSelections: 1,
        maxSelections: 5,
        options: [
          { value: 'interview', contextText: '対象者と仕事内容や処遇等について話し合う面談の実施' },
          { value: 'new_rules', contextText: '有期雇用労働者等に係る昇給制度を新たに規定' },
          { value: 'evaluation', contextText: '対象者及び正規雇用労働者の仕事内容や責任の程度を比較し、待遇がそれに見合ったものとなっているかどうかを確認するための、職務分析・職務評価の実施' },
          { value: 'create_rules', contextText: '対象者に適用される基本給を定めた賃金規定等が改定前に存在しない場合には、当該規定を新たに作成' },
          { value: 'other', contextText: 'その他（' }
        ]
      },
      validation: { required: false, rejectEmpty: false }
    },
    {
      fieldId: 'wage_rules_commonization_actions',
      inputMode: 'sdt-checkbox',
      locator: {
        type: 'sdt-checkbox-group',
        groupContextText: '賃金規定等の区分を有期雇用労働者等と正規',
        optionContextMode: 'adjacent-text'
      },
      selection: {
        mode: 'multi',
        clearUnselected: true,
        minSelections: 1,
        maxSelections: 7,
        options: [
          { value: 'interview', contextText: '対象者と仕事内容や処遇等について話し合う面談の実施' },
          { value: 'evaluation', contextText: '対象者及び正規雇用労働者の職務の内容や職業能力等について、職務分析・職務評価の実施' },
          { value: 'check_wage', contextText: '対象者について、職務の内容に密接に関連して支払われる賃金が基本給以外にないかどうかの確認' },
          { value: 'create_rules', contextText: '正規雇用労働者と共通の職務等に応じた賃金規定等の作成' },
          { value: 'three_categories', contextText: '賃金規定等の区分を有期雇用労働者等と正規雇用労働者についてそれぞれ３区分以上設け、うち共通する区分を２区分以上設ける' },
          { value: 'apply_rules', contextText: '正規雇用労働者及び対象者に作成した規定を適用' },
          { value: 'other', contextText: 'その他（' }
        ]
      },
      validation: { required: false, rejectEmpty: false }
    },
    {
      fieldId: 'bonus_retirement_new_systems',
      inputMode: 'sdt-checkbox',
      locator: {
        type: 'sdt-checkbox-group',
        groupContextText: '就業規則又は労働協約の定めるところにより',
        optionContextMode: 'adjacent-text'
      },
      selection: {
        mode: 'multi',
        clearUnselected: true,
        minSelections: 1,
        maxSelections: 7,
        options: [
          { value: 'bonus', contextText: '賞与制度（６か月相当として対象者１人あたり５万円以上）' },
          { value: 'retirement', contextText: '退職金制度（６か月相当として対象者１人あたり１万８千円以上）' },
          { value: 'external_retirement', contextText: '中退共など外部退職金制度の導入' },
          { value: 'insurance', contextText: '積立型民間保険契約の返戻金などの利用' },
          { value: 'internal_reserve', contextText: '社内積立（毎月の対象者と積立金が確認できる帳簿を作成）' },
          { value: 'dc_pension', contextText: '企業型確定拠出年金制度の利用' },
          { value: 'other', contextText: 'その他（' }
        ]
      },
      validation: { required: false, rejectEmpty: false }
    },
    {
      fieldId: 'bonus_retirement_actions',
      inputMode: 'sdt-checkbox',
      locator: {
        type: 'sdt-checkbox-group',
        groupContextText: '全ての対象者に適用する賞与・退職金制度に',
        optionContextMode: 'adjacent-text'
      },
      selection: {
        mode: 'multi',
        clearUnselected: true,
        minSelections: 1,
        maxSelections: 5,
        options: [
          { value: 'interview', contextText: '対象者と仕事内容や処遇等について話し合う面談の実施' },
          { value: 'evaluation', contextText: '対象者及び正規雇用労働者の職務の内容や職業能力等について、職務分析・職務評価の実施' },
          { value: 'balance', contextText: '全ての対象者に適用する賞与・退職金制度について、その金額に関してのバランスの検討等' },
          { value: 'apply', contextText: '就業規則等（別冊となる規則含む）に導入する制度を規定し、制度施行日より、実際に制度を適用（賞与支給・退職金積立）する' },
          { value: 'other', contextText: 'その他（' }
        ]
      },
      validation: { required: false, rejectEmpty: false }
    },
    {
      fieldId: 'social_insurance_actions',
      inputMode: 'sdt-checkbox',
      locator: {
        type: 'sdt-checkbox-group',
        groupContextText: '労働時間の延長（５時間以上）',
        optionContextMode: 'exact-match-text'
      },
      selection: {
        mode: 'multi',
        clearUnselected: true,
        minSelections: 1,
        maxSelections: 12,
        options: [
          { value: 'interview', contextText: '対象者の働き方の希望を把握し、仕事内容や処遇等について話し合う面談の実施' },
          { value: 'explanation', contextText: '社会保険制度の概要や加入のメリット及び本助成措置について、対象者に説明' },
          { value: 'notice', contextText: '労働条件の変更時には、雇用契約書や労働条件通知書にて変更内容を通知' },
          { value: 'other', contextText: 'その他（　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　）' },
          { value: 'ext_5h', contextText: '労働時間の延長（５時間以上）' },
          { value: 'ext_4h_base_5pct', contextText: '労働時間の延長（４時間以上）及び基本給の増額（５％以上）' },
          { value: 'ext_3h_base_10pct', contextText: '労働時間の延長（３時間以上）及び基本給の増額（10％以上）' },
          { value: 'ext_2h_base_15pct', contextText: '労働時間の延長（２時間以上）及び基本給の増額（15％以上）' },
          { value: 'multi_year', contextText: '複数年かけての上記の取組の実施' },
          { value: 'ext_2h_y2', contextText: '労働時間の延長（２時間以上）' },
          { value: 'base_5pct_y2', contextText: '基本給の増額（５％以上）' },
          { value: 'apply_bonus_retirement', contextText: '昇給、賞与、退職金制度の適用' }
        ]
      },
      validation: { required: false, rejectEmpty: false }
    }
  ]
};
