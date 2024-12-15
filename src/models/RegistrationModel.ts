import Product from "@/models/ProductModel";

export default interface Registration {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  volunteer: boolean;
  needRide: boolean;
  products?: { qty: number; product: Product }[];
}
