/**
 * 性别 1 男；2 女；
 * @export
 * @param {any} val
 * @returns {string}
 */
export function sex(val) {
  switch (+val) {
    case 1:
      return "男";
    case 2:
      return "女";
    default:
      return "";
  }
}
/**
 *
 * 格式化车牌名称
 * @export
 * @param {any} arr 获取的brand_detail 这个是数组
 * @returns
 */
export function brand_detailFmt(arr) {
  if (arr == undefined) return;
  if (arr == "[]") return;
  if (arr === "") return;
  arr = JSON.parse(arr);
  if (!Array.isArray(arr)) {
    return;
  }
  arr.sort((a, b) => a.depth - b.depth);
  let str = "";
  arr.map(val => {
    str += val.name;
  });
  return str;
}
