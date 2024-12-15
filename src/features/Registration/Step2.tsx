import React, { useCallback, useEffect, useMemo, useState } from "react";
import useMediaQuery, { MediaQueryKey } from "use-media-antd-query";
import ProductsService from "@/services/ProductsService";
import Product from "@/models/ProductModel";
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  Divider,
  Flex,
  Form,
  List,
  Row,
  Spin,
  Switch,
  Tooltip,
  Typography,
} from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { useStore } from "@/contexts/StoreContext";
import RegistrationService from "@/services/RegistrationService";

export default function Step2() {
  const colSize = useMediaQuery();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const { setRegistration, registration, setStep } = useStore();
  const [byPassMinProductsRule, setByPassMinProductsRule] = useState(false);

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

  const disableConfirm = useMemo(
    () => !byPassMinProductsRule && (registration?.products?.length || 0) < (registration?.qtyAdults || 0),
    [byPassMinProductsRule, registration]
  );

  return (
    <Flex
      vertical
      style={{
        textAlign: "center",
      }}
      gap={20}
    >
      <Flex vertical align="center" justify="center">
        {byPassMinProductsRule ? (
          <Typography.Title level={4}>Opções para levar</Typography.Title>
        ) : (
          <Typography.Title level={4}>
            Escolha {registration?.qtyAdults} opções para levar. Faltam{" "}
            {(registration?.qtyAdults || 0) - (registration?.products?.length || 0)}.
          </Typography.Title>
        )}

        <Flex gap={5}>
          <Typography.Text>Não consigo levar, mas quero participar</Typography.Text>
          <Switch value={byPassMinProductsRule} onChange={(value) => setByPassMinProductsRule(value)} />
        </Flex>
      </Flex>
      {loading && (
        <Flex style={{ height: 700 }} justify="center" align="center">
          <Spin />
        </Flex>
      )}
      {!loading && (
        <Flex vertical>
          <List
            grid={{ gutter: 16, xs: 1, xl: 4, xxl: 4 }}
            dataSource={products}
            renderItem={(product) => {
              const qty = (registration!.products || []).find((p) => p.product.id === product.id)?.qty || 0;
              return (
                <List.Item key={product.id}>
                  <ConfigProvider
                    theme={{
                      token: {
                        paddingLG: 16,
                      },
                    }}
                  >
                    <Card>
                      <Flex vertical align="center" gap={10}>
                        <Tooltip title={product.observation} open={!!product.observation}>
                          <img src={product.image} height={100} alt={product.name} />
                        </Tooltip>
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
            <Tooltip
              title={
                disableConfirm
                  ? `Escolha ${
                      (registration?.qtyAdults || 0) - (registration?.products?.length || 0)
                    } opções para confirmar presença.`
                  : ""
              }
            >
              <Button
                htmlType="submit"
                variant="solid"
                color="primary"
                size="large"
                disabled={disableConfirm}
                onClick={handleConfirm}
                loading={isConfirming}
              >
                Confirmar Presença
              </Button>
            </Tooltip>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}
