
// 找无序数组中未使用的最小正整数
export function findMissNumber(arr: number[]) {
  let l = 0;
  let r = arr.length;
  while (l < r) {
    if (arr[l] === l + 1) {
      l++
    } else if (arr[l] > r || arr[l] <= l || arr[arr[l] - 1] === arr[l]) {
      arr[l] = arr[--r]
    } else {
      const temp = arr[l]
      arr[l] = arr[arr[l] - 1]
      arr[temp - 1] = temp
    }
  }
  return l + 1;
}
