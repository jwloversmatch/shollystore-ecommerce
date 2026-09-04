import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useGetWishlistQuery,
  WishlistProduct,
} from "../features/api/apiSlice";
import { setWishlist } from "../features/wishlist/wishlistSlice";
import { RootState } from "../store";

const WishlistSync = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s: RootState) => s.auth);

  const { data, isSuccess } = useGetWishlistQuery(undefined, {
    skip: !user,
  });

  useEffect(() => {
    if (isSuccess && data?.wishlist) {
      const ids = data.wishlist.map((item: WishlistProduct) => item._id);
      dispatch(setWishlist(ids));
    }
  }, [data, isSuccess, dispatch]);

  return null;
};

export default WishlistSync;