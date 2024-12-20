import React, { useCallback } from "react";
import { Button, Col, Descriptions, Divider, Flex, List, message, Popconfirm, Row, Typography } from "antd";
import RegistrationService from "@/services/RegistrationService";
import Registration from "@/models/RegistrationModel";
import { useStore } from "@/contexts/StoreContext";
import useMediaQuery, { MediaQueryEnum } from "use-media-antd-query";

function Detail({ registration }: { registration: Registration }) {
  const { setStep } = useStore();
  const colSize = useMediaQuery();

  const handleUpdateProducts = useCallback(() => {
    setStep(2);
  }, []);

  const handleCancel = useCallback(() => {
    return new Promise((resolve) => {
      RegistrationService.cancel(registration!.id).then(() => {
        message.success("Confirmação de presença cancelada com sucesso!");
        resolve(true);
        localStorage.removeItem("registrationId");
        setStep(1);
      });
    });
  }, [registration, setStep]);
  return (
    <>
      {registration.products?.length && (
        <>
          <Divider style={{ borderColor: "#efa31c" }}>O que você irá levar</Divider>
          <List
            itemLayout="horizontal"
            dataSource={registration!.products}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  style={{
                    alignItems: "center",
                  }}
                  avatar={<img src={item.product.image} width={80} alt={item.product.name} />}
                  title={<Flex style={{ textAlign: "left" }}>{item.product.name}</Flex>}
                  description={<Flex style={{ textAlign: "left" }}>{`Quantidade: ${item.qty}`}</Flex>}
                />
              </List.Item>
            )}
          />
        </>
      )}
      <Divider style={{ borderColor: "#efa31c" }}>Data e Local</Divider>
      <Descriptions
        bordered
        items={[
          {
            key: "data",
            label: "Data",
            children: <Typography.Text>22/12/2024, depois do culto</Typography.Text>,
          },
          {
            key: "local",
            label: "Local",
            children: (
              <Typography.Text>Rua Sargento Lafayette, 2026 - Bacacheri, Curitiba - PR, 82515-090</Typography.Text>
            ),
          },
        ]}
      />
      <Divider />
      <Flex justify="center" gap={10} vertical={colSize === "xs"}>
        <Button onClick={handleUpdateProducts}>Alterar o que vou levar</Button>
        <Popconfirm
          icon={null}
          title=""
          description={<Typography.Text>Tem certeza que deseja cancelar a confirmação de presença?</Typography.Text>}
          okText="Sim"
          cancelText="Não"
          onConfirm={handleCancel}
        >
          <Button>Cancelar confirmação de presença</Button>
        </Popconfirm>
      </Flex>
    </>
  );
}

export default Detail;
