import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useSaveCartMutation } from "../features/api/apiSlice";

const CartSync = () => {
  const { cartItems } = useSelector((s: RootState) => s.cart);
  const { user } = useSelector((s: RootState) => s.auth);
  const [saveCart] = useSaveCartMutation();

  useEffect(() => {
    if (!user) return;

    const items = cartItems.map((item) => ({
      product: item._id,
      qty: item.qty,
      price: item.price,
      variant: item.variant || undefined,
    }));

    saveCart({ items });
  }, [cartItems, user, saveCart]);

  return null;
};

export default CartSync;