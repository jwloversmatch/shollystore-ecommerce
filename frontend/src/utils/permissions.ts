import type { RootState } from "../store";

type User = RootState["auth"]["user"];

/** Guests and customers can shop; admins cannot. */
export const canShop = (user: User): boolean =>
  !user || user.role === "user";

/** Only logged-in customers can review; guests and admins cannot. */
export const canReview = (user: User): boolean =>
  !!user && user.role === "user";

/** Only logged-in customers can use the wishlist. */
export const canUseWishlist = (user: User): boolean =>
  !!user && user.role === "user";