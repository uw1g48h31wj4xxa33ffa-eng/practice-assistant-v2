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
  ],
};
