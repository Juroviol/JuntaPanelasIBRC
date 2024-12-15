import React, { useCallback, useEffect, useState } from "react";
import ProductsService from "@/services/ProductsService";
import Product from "@/models/ProductModel";
import { Button, Card, Col, ConfigProvider, Divider, Flex, List, Row, Skeleton, Spin, Typography } from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { useStore } from "@/contexts/StoreContext";
import RegistrationService from "@/services/RegistrationService";

export default function Step2() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const { setRegistration, registration, setStep } = useStore();

  useEffect(() => {
    setLoading(true);
    ProductsService.list().then((products) => {
      setProducts(products);
      setLoading(false);
    });
  }, []);

  const handleAddProduct = useCallback(
    (productId: string) => {
      const existentProduct = (registration!.products || []).find((p) => p.product.id === productId);
      if (existentProduct) {
        setRegistration({
          ...registration!,
          products: [
            ...(registration!.products || []).filter((p) => p.product.id !== productId),
            { ...existentProduct, qty: existentProduct.qty + 1 },
          ],
        });
      } else {
        const product = products.find((p) => p.id === productId)!;
        setRegistration({
          ...registration!,
          products: [...(registration!.products || []), { product, qty: 1 }],
        });
      }
    },
    [setRegistration, registration, products]
  );

  const handleRemoveProduct = useCallback(
    (productId: string) => {
      const productToRemove = (registration!.products || []).find((p) => p.product.id === productId)!;
      if (productToRemove.qty > 1) {
        setRegistration({
          ...registration!,
          products: [
            ...(registration!.products || []).filter((p) => p.product.id !== productId),
            {
              product: productToRemove.product,
              qty: productToRemove.qty - 1,
            },
          ],
        });
      } else {
        setRegistration({
          ...registration!,
          products: (registration!.products || []).filter((p) => p.product.id !== productId),
        });
      }
    },
    [setRegistration, registration]
  );

  const handleConfirm = useCallback(() => {
    setIsConfirming(true);
    RegistrationService.insert(registration!).then((result) => {
      setIsConfirming(false);
      setStep(3);
      setRegistration(result);
      localStorage.setItem("registrationId", result.id);
    });
  }, [registration, setStep, setRegistration]);

  return (
    <Flex
      vertical
      style={{
        textAlign: "center",
      }}
    >
      <Typography.Title level={4}>Opções para levar</Typography.Title>
      {loading && (
        <Flex style={{ height: 700 }} justify="center" align="center">
          <Spin />
        </Flex>
      )}
      <List
        grid={{ gutter: 16, xs: 1, xl: 4, xxl: 4 }}
        dataSource={products}
        renderItem={(product) => {
          const qty = (registration!.products || []).find((p) => p.product.id === product.id)?.qty || 0;
          return (
            <List.Item>
              <ConfigProvider
                theme={{
                  token: {
                    paddingLG: 16,
                  },
                }}
              >
                <Card>
                  <Flex vertical align="center" gap={10}>
                    <img src={product.image} height={100} />
                    <Typography.Text>{product.name}</Typography.Text>
                    <Flex gap={10} align="center">
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        disabled={qty >= product.qty}
                        size="middle"
                        shape="circle"
                        onClick={() => handleAddProduct(product.id)}
                      />
                      {qty}
                      <Button
                        type="default"
                        icon={<MinusOutlined />}
                        disabled={!qty}
                        size="middle"
                        shape="circle"
                        onClick={() => handleRemoveProduct(product.id)}
                      />
                    </Flex>
                  </Flex>
                </Card>
              </ConfigProvider>
            </List.Item>
          );
        }}
      />
      <Divider />
      <Flex justify="center" align="center">
        <Button
          htmlType="submit"
          variant="solid"
          color="primary"
          size="large"
          onClick={handleConfirm}
          loading={isConfirming}
        >
          Confirmar Presença
        </Button>
      </Flex>
    </Flex>
  );
}
