
export function getRequiredRule() {
  return {
    required: true,
    message: '不能为空'
  }
}

export function getNameRule({ max = 30 }: { max?: number } = {}) {
  return [
    { required: true, message: '请输入名称' },
    {
      // eslint-disable-next-line no-useless-escape
      pattern: /^[-\$\%\^\*\(\)\+\.\\a-zA-Z0-9_\u4e00-\u9fa5!@#&=]+$/,
      // pattern: /^[^><]+$/,
      // pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5!@#&-=,\$\%\^\*\(\)\+\.\\]+$/,
      message: '汉字、字母、数字、常用特殊字符!@#$%^&*()~_+-=.,\\'
    },
    { max, message: '最多30个字符' }
  ]
}
