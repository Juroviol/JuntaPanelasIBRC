import Base from "@/core/Base";
import { Attachment, FieldSet, Table } from "airtable";
import Product from "@/models/ProductModel";

class ProductsService {
  private table: Table<FieldSet>;
  constructor() {
    this.table = Base("produtos");
  }

  async list(): Promise<Product[]> {
    const result = await this.table
      .select({
        view: "Produtos",
        filterByFormula: "NOT({Quantidade} = 0)",
      })
      .firstPage();
    return result.map((r) => {
      const id = r.id;
      const name = r.fields["Descrição"] as string;
      const qty = r.fields["Quantidade"] as number;
      const observation = r.fields["Observação"] as string;
      const [image] = r.fields["Imagem"] as Array<Attachment>;
      const adults = (r.fields["Adultos"] || []) as string[];
      return {
        id,
        name,
        qty,
        observation,
        image: image.url,
        adults,
      };
    });
  }
}
const productsService = new ProductsService();

export default productsService;
