/**
 * 性别 1 男；2 女；
 * @export
 * @param {any} val
 * @returns {string}
 */
export function sex(val) {
  switch (+val) {
    case 1:
      return "男"
    case 2:
      return "女"
    default:
      return ""
  }
}
