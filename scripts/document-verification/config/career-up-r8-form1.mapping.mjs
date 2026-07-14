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
      }
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
      }
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
      }
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
      }
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
      }
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
    }
  ],
};
