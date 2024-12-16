import { Attachment, FieldSet, Table } from "airtable";
import Base from "@/core/Base";
import Registration from "@/models/RegistrationModel";

class RegistrationService {
  private registrationsTable: Table<FieldSet>;
  private registrationsProductsTable: Table<FieldSet>;
  private productsTable: Table<FieldSet>;
  constructor() {
    this.registrationsTable = Base("registros");
    this.registrationsProductsTable = Base("registrosprodutos");
    this.productsTable = Base("produtos");
  }

  async insert(registration: Registration): Promise<Registration> {
    const result = await this.registrationsTable.create({
      Nome: registration.name,
      Telefone: registration.phone,
      Carona: registration.qtyRide,
      Vagas: registration.qtyGiveRide,
      Adultos: registration.qtyAdults,
      Crianças: registration.qtyChildren,
      Idades: (registration.childrenAges || []).map((age) => age.toString()),
    });
    await Promise.all(
      (registration.products || []).map(async (p) =>
        this.registrationsProductsTable.create({
          Registro: registration.name,
          Produto: p.product.name,
          Quantidade: p.qty,
        })
      )
    );
    if (registration.products?.length) {
      await this.productsTable.update(
        registration.products.map((product) => ({
          id: product.product.id,
          fields: {
            Quantidade: product.product.qty - product.qty,
          },
        }))
      );
    }
    return {
      ...registration,
      id: result.id,
    };
  }

  async cancel(registrationId: string): Promise<void> {
    const registrationResult = await this.registrationsTable.find(registrationId);
    const products = await this.productsTable
      .select({
        view: "Produtos",
      })
      .firstPage();
    const registrationProductsResult = await this.registrationsProductsTable
      .select({
        view: "RegistrosProdutos",
        filterByFormula: `{Registro} = '${registrationResult.fields["Nome"]}'`,
      })
      .firstPage();
    await Promise.all(registrationProductsResult.map((rp) => this.registrationsProductsTable.destroy([rp.id])));
    if (registrationProductsResult.length) {
      await this.productsTable.update(
        registrationProductsResult.map((rp) => {
          const product = products.find((p) => p.fields["Descrição"] === rp.fields["Produto"])!;
          return {
            id: product.id,
            fields: {
              Quantidade: (product.fields["Quantidade"] as number) + (rp.fields["Quantidade"] as number),
            },
          };
        })
      );
    }
    await this.registrationsTable.destroy([registrationId]);
  }

  async findById(registrationId: string): Promise<Registration> {
    const registrationResult = await this.registrationsTable.find(registrationId);
    const products = await this.productsTable
      .select({
        view: "Produtos",
      })
      .firstPage();
    const registrationProductsResult = await this.registrationsProductsTable
      .select({
        view: "RegistrosProdutos",
        filterByFormula: `{Registro} = '${registrationResult.fields["Nome"]}'`,
      })
      .firstPage();
    return {
      id: registrationId,
      name: registrationResult.fields["Nome"] as string,
      phone: registrationResult.fields["Phone"] as string,
      qtyAdults: registrationResult.fields["Adultos"] as number,
      qtyChildren: registrationResult.fields["Crianças"] as number,
      qtyRide: registrationResult.fields["Carona"] as number,
      qtyGiveRide: registrationResult.fields["Vagas"] as number,
      childrenAges: registrationResult.fields["Idades"] as string[],
      products: registrationProductsResult.map((rp) => {
        const product = products.find((p) => p.fields["Descrição"] === (rp.fields["Produto"] as string))!;
        const [image] = product.fields["Imagem"] as Array<Attachment>;
        return {
          product: {
            name: rp.fields["Produto"] as string,
            id: product.id,
            qty: product.fields["Quantidade"] as number,
            observation: product.fields["Observação"] as string,
            image: image.url,
          },
          qty: rp.fields["Quantidade"] as number,
        };
      }),
    };
  }

  async findByPhone(phone: string): Promise<Registration | null> {
    const registrationsResults = await this.registrationsTable
      .select({
        view: "Registros",
        filterByFormula: `{Telefone} = '${phone}'`,
      })
      .firstPage();
    if (registrationsResults.length) {
      const registrationResult = registrationsResults.at(0)!;
      const products = await this.productsTable
        .select({
          view: "Produtos",
        })
        .firstPage();
      const registrationProductsResult = await this.registrationsProductsTable
        .select({
          view: "RegistrosProdutos",
          filterByFormula: `{Registro} = '${registrationResult.fields["Nome"]}'`,
        })
        .firstPage();
      return {
        id: registrationResult.id,
        name: registrationResult.fields["Nome"] as string,
        phone: registrationResult.fields["Phone"] as string,
        qtyAdults: registrationResult.fields["Adultos"] as number,
        qtyChildren: registrationResult.fields["Crianças"] as number,
        qtyRide: registrationResult.fields["Carona"] as number,
        qtyGiveRide: registrationResult.fields["Vagas"] as number,
        childrenAges: registrationResult.fields["Idades"] as string[],
        products: registrationProductsResult.map((rp) => {
          const product = products.find((p) => p.fields["Descrição"] === (rp.fields["Produto"] as string))!;
          const [image] = product.fields["Imagem"] as Array<Attachment>;
          return {
            product: {
              name: rp.fields["Produto"] as string,
              id: product.id,
              qty: product.fields["Quantidade"] as number,
              observation: product.fields["Observação"] as string,
              image: image.url,
            },
            qty: rp.fields["Quantidade"] as number,
          };
        }),
      };
    }
    return null;
  }
}

const registrationService = new RegistrationService();

export default registrationService;
