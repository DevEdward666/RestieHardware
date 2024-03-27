export interface GetUserInfo {
  loginInfo: UserInfo;
  accessToken: string;
  refreshToken: string;
}
export interface UserInfo {
  username: string;
  name: string;
  role: string;
}
