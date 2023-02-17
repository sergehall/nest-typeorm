export type QueryArrType = {
  id?: string;
  searchNameTerm?: string;
  searchLoginTerm?: string;
  searchEmailTerm?: string;
  blogId?: string;
  userId?: string;
  banStatus?: string;
  'postInfo.blogOwnerId'?: string;
  'banInfo.isBanned'?: boolean;
  'blogOwnerInfo.isBanned'?: boolean;
  'postOwnerInfo.isBanned'?: boolean;
  'commentatorInfo.isBanned'?: boolean;
}[];
