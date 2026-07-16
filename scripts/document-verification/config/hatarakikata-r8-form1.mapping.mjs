export const hatarakikataR8Form1Mapping = {
  template: {
    id: "hatarakikata-r8-form1",
    version: "R8.1.0",
    expectedSha256: "b87253adeb29b593913c97fe972a4bb3afb8c36bac6dbb66bd70d08146963da8",
  },
  fields: [
    {
        "fieldId": "plan_start_date",
        "labelText": "年　　月　　日",
        "locator": {
            "type": "paragraph-exact-text",
            "scope": "body-outside-table",
            "matchIndex": 0
        },
        "preserve": {
            "yearToken": "年",
            "monthToken": "月",
            "dayToken": "日"
        },
        "inputMode": "date-preserve-tokens",
        "verification": {
            "type": "date"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "sdt_group_1",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "記載あり　労働者数1",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_2",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_3",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_4",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_5",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_6",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_7",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "滞納したことがない　",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_8",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "申請も受給もしていな",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "multi",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                },
                {
                    "value": "option_3",
                    "contextText": "option_text_3"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "bank_account_type",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "普通",
            "optionContextMode": "index-in-group"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "普通",
                    "contextText": "普通",
                    "index": 0
                },
                {
                    "value": "当座",
                    "contextText": "当座",
                    "index": 1
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "cooperate_checkbox",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "協力しない",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "協力する",
                    "contextText": "協力する"
                },
                {
                    "value": "協力しない",
                    "contextText": "協力しない"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_11",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "労働者に対して、働き",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "multi",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                },
                {
                    "value": "option_3",
                    "contextText": "option_text_3"
                },
                {
                    "value": "option_4",
                    "contextText": "option_text_4"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        },
        "manualCheck": true,
        "humanReview": true
    },
    {
        "fieldId": "sdt_group_12",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "①労務管理担当者に対",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "multi",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                },
                {
                    "value": "option_3",
                    "contextText": "option_text_3"
                },
                {
                    "value": "option_4",
                    "contextText": "option_text_4"
                },
                {
                    "value": "option_5",
                    "contextText": "option_text_5"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_13",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "⑥労務管理用ソフトウ",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "multi",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                },
                {
                    "value": "option_3",
                    "contextText": "option_text_3"
                },
                {
                    "value": "option_4",
                    "contextText": "option_text_4"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_14",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "①時間外労働の上限設",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "multi",
            "options": [
                {
                    "value": "①時間外労働の上限設定",
                    "contextText": "①時間外労働の上限設定"
                },
                {
                    "value": "②年休の計画的付与の導入",
                    "contextText": "②年休の計画的付与の導入"
                },
                {
                    "value": "③時間単位年休及び特別休暇の導入",
                    "contextText": "③時間単位年休及び特別休暇の導入"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_15",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "④賃金引上げ 　⑤割",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_16",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "年　　月　　日　～　",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_17",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "ア　２－１（１）①～",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "multi",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                },
                {
                    "value": "option_3",
                    "contextText": "option_text_3"
                },
                {
                    "value": "option_4",
                    "contextText": "option_text_4"
                },
                {
                    "value": "option_5",
                    "contextText": "option_text_5"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_18",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "所要額の内訳【 税抜",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_19",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "イ　２－１（１）⑥～",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "multi",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                },
                {
                    "value": "option_3",
                    "contextText": "option_text_3"
                },
                {
                    "value": "option_4",
                    "contextText": "option_text_4"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_20",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "所要額の内訳【 税抜",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_21",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "はい　いいえ",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_22",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "イ【改善事業実施前】",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_23",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "ウ【改善事業実施後】",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_24",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "はい　いいえ",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_25",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "はい　いいえ",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_26",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "ア　導入する特別休暇",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "multi",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                },
                {
                    "value": "option_3",
                    "contextText": "option_text_3"
                },
                {
                    "value": "option_4",
                    "contextText": "option_text_4"
                },
                {
                    "value": "option_5",
                    "contextText": "option_text_5"
                },
                {
                    "value": "option_6",
                    "contextText": "option_text_6"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        },
        "manualCheck": true,
        "humanReview": true
    },
    {
        "fieldId": "sdt_group_27",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "はい　いいえ",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_28",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "はい　いいえ",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_29",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "３％以上　　５％以上",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "multi",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                },
                {
                    "value": "option_3",
                    "contextText": "option_text_3"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_30",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "毎月　　　日締め　　",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_31",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "⑤　割増賃金引上げ交",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_32",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "毎月　　　日締め　　",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_33",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "はい　いいえ",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_34",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "はい　いいえ",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_35",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "イ　改善事業（上記２",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "multi",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                },
                {
                    "value": "option_3",
                    "contextText": "option_text_3"
                },
                {
                    "value": "option_4",
                    "contextText": "option_text_4"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        },
        "manualCheck": true,
        "humanReview": true
    },
    {
        "fieldId": "sdt_group_36",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "ウ　成果目標（上記２",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "multi",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                },
                {
                    "value": "option_3",
                    "contextText": "option_text_3"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        },
        "manualCheck": true,
        "humanReview": true
    },
    {
        "fieldId": "sdt_group_37",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "エ　上記意見の事業実",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "multi",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                },
                {
                    "value": "option_3",
                    "contextText": "option_text_3"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_38",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "税抜 ・ 税込円",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_39",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "税抜 ・ 税込円",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_40",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "はい　いいえ",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_41",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "はい　いいえ",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_42",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "はい　いいえ",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_43",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "（１）上記３（５）の",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_44",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "①免税事業者である　",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "multi",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                },
                {
                    "value": "option_2",
                    "contextText": "option_text_2"
                },
                {
                    "value": "option_3",
                    "contextText": "option_text_3"
                },
                {
                    "value": "option_4",
                    "contextText": "option_text_4"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "sdt_group_45",
        "inputMode": "sdt-checkbox",
        "locator": {
            "type": "sdt-checkbox-group",
            "groupContextText": "確認しました",
            "optionContextMode": "adjacent-text"
        },
        "selection": {
            "mode": "single",
            "options": [
                {
                    "value": "option_1",
                    "contextText": "option_text_1"
                }
            ],
            "clearUnselected": true
        },
        "validation": {
            "required": false
        }
    },
    {
        "fieldId": "corporate_number",
        "labelText": "（１）法人番号（個人事業主等は不要）",
        "locator": {
            "type": "distributed-cells",
            "pattern": [
                { "type": "digits", "count": 13 }
            ]
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "distributed",
            "length": 13
        }
    },
    {
        "fieldId": "labor_insurance_number",
        "labelText": "（２）労働保険番号（継続事業の一括申請をしている場合は指定事業（本社等）の労働保険番号を記入）",
        "locator": {
            "type": "distributed-cells",
            "pattern": [
                { "type": "digits", "count": 2, "groupId": "labor_pref" },
                { "type": "separator", "text": "-" },
                { "type": "digits", "count": 1, "groupId": "labor_bosho" },
                { "type": "separator", "text": "-" },
                { "type": "digits", "count": 2, "groupId": "labor_kankatsu" },
                { "type": "separator", "text": "-" },
                { "type": "digits", "count": 6, "groupId": "labor_kikango" },
                { "type": "separator", "text": "-" },
                { "type": "digits", "count": 3, "groupId": "labor_edaban" },
                { "type": "ignore", "count": 1 }
            ]
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "distributed",
            "length": 14
        },
        "manualCheck": false,
        "humanReview": false,
        "inputMode": "distributed-cells"
    },
    {
        "fieldId": "field_3",
        "labelText": "-",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_4",
        "labelText": "-",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_5",
        "labelText": "-",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_6",
        "labelText": "-",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "capital",
        "labelText": "（４）資本金の額又は出資の総額",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "affix": {
            "suffixText": "円　"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "numeric"
        },
        "manualCheck": false,
        "humanReview": false,
        "inputMode": "numeric-preserve-affix"
    },
    {
        "fieldId": "employee_count",
        "labelText": "企業全体",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "affix": {
            "suffixText": "人"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "numeric"
        },
        "manualCheck": false,
        "humanReview": false,
        "inputMode": "numeric-preserve-affix"
    },
    {
        "fieldId": "field_9",
        "labelText": "企業全体",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_10",
        "labelText": "（13）本年度におい",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "date"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "bank_name",
        "labelText": "金融機関名",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "branch_name",
        "labelText": "支店名",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "bank_account_number",
        "labelText": "口座番号（右詰め）",
        "locator": {
            "type": "distributed-cells",
            "pattern": [
                { "type": "ignore", "count": 1 },
                { "type": "digits", "count": 7 }
            ]
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "distributed",
            "length": 7
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "bank_account_holder",
        "labelText": "口座名義（カタカナ）",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_15",
        "labelText": "（１）労使の話合いの",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "date"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_16",
        "labelText": "労働時間や年次有給休",
        "inputMode": "multiline-text",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "includes"
        },
        "validation": {
            "required": false,
            "rejectInvalidChars": true
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_17",
        "labelText": "職場の意識を改善する",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_18",
        "labelText": "労働者に対して、働き",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": true
    },
    {
        "fieldId": "designated_workplaces",
        "inputMode": "fixed-row-table",
        "arrayConfig": {
            "maxRows": 10,
            "tableIndex": 14,
            "startRowIndex": 2,
            "clearUnused": true,
            "columns": [
                { "cellIndex": 0, "key": "number" },
                { "cellIndex": 1, "key": "name" },
                { "cellIndex": 2, "key": "address" },
                { "cellIndex": 3, "key": "employee_count" }
            ]
        },
        "locator": {
            "type": "table-rows",
            "tableIndex": 14
        },
        "manualCheck": true,
        "humanReview": true,
        "verification": {
            "type": "manual"
        }
    },
    {
        "fieldId": "field_19",
        "labelText": "イ　賃上げ対象労働者",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_20",
        "labelText": "ウ　引上げ時期（予定",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "date"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_21",
        "labelText": "ウ　引上げ時期（予定",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "date"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_22",
        "labelText": "ア　意見を聴いた労働",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_23",
        "labelText": "１",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_24",
        "labelText": "〒",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_25",
        "labelText": "２",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_26",
        "labelText": "〒",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_27",
        "labelText": "３",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_28",
        "labelText": "〒",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_29",
        "labelText": "４",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_30",
        "labelText": "〒",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_31",
        "labelText": "５",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_32",
        "labelText": "〒",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_33",
        "labelText": "６",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_34",
        "labelText": "〒",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_35",
        "labelText": "７",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_36",
        "labelText": "〒",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_37",
        "labelText": "８",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_38",
        "labelText": "〒",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_39",
        "labelText": "９",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_40",
        "labelText": "〒",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_41",
        "labelText": "10",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": false
    },
    {
        "fieldId": "field_42",
        "labelText": "〒",
        "locator": {
            "type": "adjacent-cell",
            "matchMode": "exact-cell-text"
        },
        "validation": {
            "required": false
        },
        "verification": {
            "type": "text"
        },
        "manualCheck": false,
        "humanReview": true
    },
    {
        "fieldId": "wage_increase_workers",
        "inputMode": "fixed-row-table",
        "arrayConfig": {
            "maxRows": 30,
            "tableIndex": 15,
            "startRowIndex": 1,
            "clearUnused": true,
            "columns": [
                { "cellIndex": 0, "key": "number" },
                { "cellIndex": 1, "key": "name" },
                { "cellIndex": 2, "key": "hire_date" },
                { "cellIndex": 3, "key": "current_wage" },
                { "cellIndex": 4, "key": "planned_wage" },
                { "cellIndex": 5, "key": "start_date" }
            ]
        },
        "locator": {
            "type": "table-rows",
            "tableIndex": 15
        },
        "manualCheck": true,
        "humanReview": true,
        "verification": {
            "type": "manual"
        }
    }
]
};
