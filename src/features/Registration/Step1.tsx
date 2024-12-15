import React, { useCallback, useState } from "react";
import { Button, Divider, Flex, Form, Input, Modal, Typography } from "antd";
import { useStore } from "@/contexts/StoreContext";
import Registration from "@/models/RegistrationModel";
import PhoneInput from "@/components/PhoneInput";
import Link from "@/components/Link";

export default function Step1() {
  const { setRegistration, setStep } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOnFinish = useCallback(
    (values: Registration) => {
      setRegistration(values);
      setStep(2);
    },
    [setStep, setRegistration]
  );

  return (
    <>
      <Typography.Title
        level={2}
        style={{
          textAlign: "center",
        }}
      >
        Confirmar Presença
      </Typography.Title>
      <Form layout="vertical" onFinish={handleOnFinish} validateTrigger="onSubmit">
        <Form.Item name="name" label="Nome" required rules={[{ required: true, message: "Preecha o campo" }]}>
          <Input size="large" />
        </Form.Item>
        <Form.Item
          name="phone"
          label="Telefone"
          required
          rules={[
            {
              validator: (_, value) => {
                console.log(value);
                if (!value) {
                  return Promise.reject(new Error("Preencha o campo"));
                }
                if (value.replace(/[^\d]/, "").length > 12) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Telefone inválido"));
              },
            },
          ]}
        >
          <PhoneInput />
        </Form.Item>
        <Form.Item name="email" label="E-mail" rules={[{ type: "email", message: "E-mail inválido" }]}>
          <Input size="large" />
        </Form.Item>
        <Divider />
        <Flex justify="center" vertical gap={10} align="center">
          <Button htmlType="submit" variant="solid" color="primary" size="large">
            Próximo
          </Button>
          <Link onClick={() => setIsModalOpen(true)}>
            Já confirmou presença? Clique aqui para consultar dados da inscrição.
          </Link>
        </Flex>
      </Form>
      <Modal open={isModalOpen} closable footer={null} onCancel={() => setIsModalOpen(false)} width={300}>
        <Form layout="vertical">
          <Form.Item
            name="phone"
            label="Telefone"
            required
            rules={[
              {
                validator: (_, value) => {
                  console.log(value);
                  if (!value) {
                    return Promise.reject(new Error("Preencha o campo"));
                  }
                  if (value.replace(/[^\d]/, "").length > 12) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Telefone inválido"));
                },
              },
            ]}
          >
            <PhoneInput />
          </Form.Item>
          <Flex justify="center">
            <Button htmlType="submit" variant="solid" color="primary" size="large">
              Consultar
            </Button>
          </Flex>
        </Form>
      </Modal>
    </>
  );
}
