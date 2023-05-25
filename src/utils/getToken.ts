export const loginToken: any = {};
// 从父应用获取 token 信息
export function getTokenFromFather(data: any) {
  const { access_token, token_type } = data;
  if (access_token && token_type) {
    loginToken.access_token = access_token;
    loginToken.token_type = token_type;
  }
}
