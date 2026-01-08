import { useState } from "react";
import { Link } from "react-router-dom";
import { Rating } from "@smastrom/react-rating";
import { useAppDispatch } from "../store/hooks";
import { addToCart } from "../store/cartSlice";
import type { Product } from "../types/types";

const FALLBACK_IMAGE = "https://via.placeholder.com/200?text=Image+Unavailable";

type ProductCardProps = {
  product: Product;
  editHref?: string;
};

const ProductCard: React.FC<ProductCardProps> = ({ product, editHref }) => {
  const dispatch = useAppDispatch();
  const [imageSrc, setImageSrc] = useState(product.image);
  const ratingValue = product.rating?.rate ?? 0;

  const handleImageError = () => {
    if (imageSrc !== FALLBACK_IMAGE) {
      setImageSrc(FALLBACK_IMAGE);
    }
  };

  return (
    <div className="card h-100 shadow-sm">
      <img
        src={imageSrc}
        alt={product.title}
        onError={handleImageError}
        className="card-img-top p-3"
        style={{ height: "250px", objectFit: "contain" }}
      />
      <div className="card-body d-flex flex-column gap-2">
        <h5 className="card-title">{product.title}</h5>
        <p className="mb-1 text-primary fw-semibold">${product.price.toFixed(2)}</p>
        <span className="badge text-bg-secondary align-self-start text-uppercase">
          {product.category}
        </span>
        <Rating style={{ maxWidth: 150 }} value={ratingValue} readOnly />
        <p className="card-text small text-muted">{product.description}</p>
        <div className="mt-auto d-flex flex-wrap gap-2">
          <button className="btn btn-dark" onClick={() => dispatch(addToCart(product))}>
            Add to Cart
          </button>
          {editHref && (
            <Link className="btn btn-outline-secondary" to={editHref}>
              Edit
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
