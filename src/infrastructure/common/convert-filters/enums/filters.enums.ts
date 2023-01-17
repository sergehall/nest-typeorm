export enum PathFilterEnum {
  searchNameTerm = 'name',
  searchLoginTerm = 'login',
  searchEmailTerm = 'email',
  blogId = 'blogId',
  userId = 'blogOwnerInfo.userId',
  banStatus = 'banInfo.isBanned',
}
export type PatternConvertFilterType = {
  searchNameTerm?: string;
  searchLoginTerm?: string;
  searchEmailTerm?: string;
  blogId?: string;
  userId?: string;
  banStatus?: string;
};
