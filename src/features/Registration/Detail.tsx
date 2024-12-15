import React, { useCallback, useState } from "react";
import { Button, Descriptions, Divider, Flex, List, notification, Popconfirm, Typography, message } from "antd";
import RegistrationService from "@/services/RegistrationService";
import Registration from "@/models/RegistrationModel";
import { useStore } from "@/contexts/StoreContext";

function Detail({ registration }: { registration: Registration }) {
  const { setStep } = useStore();
  const [api, contextHolder] = notification.useNotification();

  const handleCancel = useCallback(() => {
    return new Promise((resolve) => {
      RegistrationService.cancel(registration!.id).then(() => {
        message.success("Confirmação de presença cancelada com sucesso!");
        resolve(true);
        localStorage.removeItem("registrationId");
        setStep(1);
      });
    });
  }, [registration, setStep, api]);
  return (
    <>
      <List
        itemLayout="horizontal"
        dataSource={registration!.products}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              style={{
                alignItems: "center",
              }}
              avatar={<img src={item.product.image} width={80} />}
              title={<Flex style={{ textAlign: "left" }}>{item.product.name}</Flex>}
              description={<Flex style={{ textAlign: "left" }}>{`Quantidade: ${item.product.qty}`}</Flex>}
            />
          </List.Item>
        )}
      />
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
      {contextHolder}
    </>
  );
}

export default Detail;
