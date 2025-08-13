import { Attachment, FieldSet, Table } from "airtable";
import Base from "@/core/Base";
import Registration from "@/models/RegistrationModel";
import { difference, intersection } from "lodash";

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
    return this.findById(result.id);
  }

  async updateProducts(registration: Registration): Promise<Registration> {
    const currentRegistration = await this.findById(registration.id);

    const previousProducts = currentRegistration.products?.map(({ product }) => product.name) || [];
    const currentProducts = registration.products?.map(({ product }) => product.name) || [];
    const newProducts = difference(currentProducts, previousProducts).map(
      (name) => registration.products?.find(({ product }) => product.name === name)!
    );
    const removedProducts = difference(previousProducts, currentProducts).map(
      (name) => currentRegistration.products?.find(({ product }) => product.name === name)!
    );
    const updatedProducts = intersection(currentProducts, previousProducts)
      .map((name) => registration.products?.find(({ product }) => product.name === name)!)
      .filter((updatedProduct) => {
        const currentProduct = currentRegistration.products?.find(
          (product) => product.product.id! === updatedProduct.product.id!
        )!;
        return updatedProduct.qty !== currentProduct.qty;
      });

    if (newProducts.length) {
      await Promise.all(
        newProducts.map((newProduct) =>
          this.registrationsProductsTable.create({
            Registro: registration.name,
            Produto: newProduct.product.name,
            Quantidade: newProduct.qty,
          })
        )
      );
      await this.productsTable.update(
        newProducts.map((newProduct) => ({
          id: newProduct.product.id,
          fields: {
            Quantidade: newProduct.product.qty - newProduct.qty,
          },
        }))
      );
    }

    if (removedProducts.length) {
      await this.registrationsProductsTable.destroy(removedProducts.map((removedProduct) => removedProduct.id!));
      await this.productsTable.update(
        removedProducts.map((removedProduct) => ({
          id: removedProduct.product.id,
          fields: {
            Quantidade: removedProduct.product.qty + removedProduct.qty,
          },
        }))
      );
    }

    if (updatedProducts.length) {
      await this.registrationsProductsTable.update(
        updatedProducts.map((updated) => ({
          id: updated.id!,
          fields: {
            Quantidade: updated.qty,
          },
        }))
      );
      await this.productsTable.update(
        updatedProducts.map((updatedProduct) => {
          const currentProduct = currentRegistration.products?.find(
            (product) => product.product.id! === updatedProduct.product.id!
          )!;
          return {
            id: updatedProduct.product.id,
            fields: {
              Quantidade:
                updatedProduct.qty > currentProduct.qty
                  ? updatedProduct.product.qty - (updatedProduct.qty - currentProduct.qty)
                  : updatedProduct.product.qty + (currentProduct.qty - updatedProduct.qty),
            },
          };
        })
      );
    }

    return this.findById(registration.id);
  }

  async cancel(registrationId: string): Promise<void> {
    const registration = await this.findById(registrationId);
    const products = await this.productsTable
      .select({
        view: "Produtos",
      })
      .firstPage();
    const registrationProductsResult = await this.registrationsProductsTable
      .select({
        view: "RegistrosProdutos",
        filterByFormula: `{Registro} = '${registration.name}'`,
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
          id: rp.id,
          product: {
            name: rp.fields["Produto"] as string,
            id: product.id,
            qty: product.fields["Quantidade"] as number,
            observation: product.fields["Observação"] as string,
            image: image.url,
            adults: product.fields["Adultos"] as string[],
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
      return this.findById(registrationResult.id);
    }
    return null;
  }
}

const registrationService = new RegistrationService();

export default registrationService;
