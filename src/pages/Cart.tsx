import ShoppingCart from "../commponents/ShoppingCart";

const Cart = () => {
  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="mb-1">Your Cart</h1>
          <p className="text-muted mb-0">Review items and place your order.</p>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <ShoppingCart />
        </div>
      </div>
    </div>
  );
};

export default Cart;
