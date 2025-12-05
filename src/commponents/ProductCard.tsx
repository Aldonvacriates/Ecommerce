import type { Product } from "../types/types";

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    
    return (
        <div className="product-card">
           <h3>{product.title}</h3>
           <img src={product.image} alt={product.title} />
           <p>${product.price}</p>
           <p>{product.description}</p>
        </div>
    );
};

export default ProductCard;