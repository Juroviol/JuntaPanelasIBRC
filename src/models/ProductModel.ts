import { FieldSet } from "airtable";

export default interface Product extends FieldSet {
  id: string;
  name: string;
  qty: number;
  image: string;
  observation: string;
}
