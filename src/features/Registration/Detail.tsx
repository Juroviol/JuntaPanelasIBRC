import React, { useCallback } from "react";
import { Button, Divider, Flex, List, message, Popconfirm, Typography } from "antd";
import RegistrationService from "@/services/RegistrationService";
import Registration from "@/models/RegistrationModel";
import { useStore } from "@/contexts/StoreContext";

function Detail({ registration }: { registration: Registration }) {
  const { setStep } = useStore();

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
                  description={<Flex style={{ textAlign: "left" }}>{`Quantidade: ${item.product.qty}`}</Flex>}
                />
              </List.Item>
            )}
          />
        </>
      )}
      <Divider style={{ borderColor: "#efa31c" }}>Data e Local</Divider>
      <Typography.Text>22/12/2024, depois do culto</Typography.Text>
      <Divider />
      <Flex justify="center">
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
