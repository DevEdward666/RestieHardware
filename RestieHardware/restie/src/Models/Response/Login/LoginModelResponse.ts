export interface GetUserInfo {
  loginInfo: UserInfo;
  accessToken: string;
  refreshToken: string;
}
export interface UserInfo {
  id: string;
  username: string;
  name: string;
  role: string;
}
