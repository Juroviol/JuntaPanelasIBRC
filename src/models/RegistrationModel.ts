import Product from "@/models/ProductModel";

export default interface Registration {
  id: string;
  name: string;
  phone: string;
  qtyAdults: number;
  qtyChildren: number;
  qtyRide: number;
  qtyGiveRide: number;
  childrenAges: string[];
  products?: { id?: string; qty: number; product: Product }[];
}
