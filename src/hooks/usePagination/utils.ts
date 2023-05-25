

export function gerationPageSizeOptions(pageSize: number) {
  const count = 5;
  const pageSizeOptions: number[] = [];
  for (let i = 1; i <= count; i++) {
    pageSizeOptions.push(pageSize * i)
  }
  return pageSizeOptions;
}
