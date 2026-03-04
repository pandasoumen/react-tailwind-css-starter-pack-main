import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { removeFromCart, clearCart } from "../store/slices/productSlice";

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export default function CartSidebar({ cart, forceOpen = false, onClose }) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  const totalPrice = cart.reduce(
    (sum, item) => sum + Number(item?.price || 0) * Number(item?.quantity || 0),
    0
  );

  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-yellow-400 px-4 py-3 font-semibold text-yellow-900 shadow-lg transition hover:bg-yellow-300"
      >
        Cart ({cart.length})
      </button>

      <div
        className={`fixed right-0 top-20 z-40 h-[calc(100%-5rem)] w-80 transform border-l border-slate-700 bg-slate-900 p-6 transition-all duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          onClick={() => {
            setOpen(false);
            if (onClose) onClose();
          }}
          className="absolute right-4 top-4 text-xl text-white"
          aria-label="Close cart sidebar"
        >
          X
        </button>

        <h2 className="mb-4 text-xl font-bold text-white">Your Cart</h2>

        {cart.length === 0 ? (
          <p className="text-slate-400">Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item._id}
                className="flex justify-between rounded-lg bg-slate-800 p-4"
              >
                <div>
                  <h3 className="font-semibold text-white">{item.name}</h3>
                  <p className="text-sm text-slate-400">Qty: {item.quantity}</p>
                  <p className="text-sm text-slate-300">
                    {inrFormatter.format(Number(item?.price || 0))}
                  </p>
                </div>

                <button
                  onClick={() => dispatch(removeFromCart(item._id))}
                  className="text-sm font-semibold text-red-400 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}

            <div className="pt-3 text-lg font-semibold text-white">
              Total: {inrFormatter.format(totalPrice)}
            </div>

            <button
              onClick={() => dispatch(clearCart())}
              className="mt-4 w-full rounded-lg bg-red-500 py-2 text-white transition hover:bg-red-600"
            >
              Clear Cart
            </button>

            <button className="w-full rounded-lg bg-green-500 py-2 text-white transition hover:bg-green-600">
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
