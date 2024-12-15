import Product from "@/models/ProductModel";

export default interface Registration {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  products?: { qty: number; product: Product }[];
}
