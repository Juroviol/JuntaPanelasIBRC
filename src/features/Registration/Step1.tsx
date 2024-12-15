import React, { useCallback, useState } from "react";
import { Button, Divider, Flex, Form, Input, message, Modal, Switch, Typography } from "antd";
import { useStore } from "@/contexts/StoreContext";
import Registration from "@/models/RegistrationModel";
import PhoneInput from "@/components/PhoneInput";
import Link from "@/components/Link";
import RegistrationService from "@/services/RegistrationService";

export default function Step1() {
  const { setRegistration, setStep } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConsulting, setIsConsulting] = useState(false);
  const handleOnFinish = useCallback(
    (values: Registration) => {
      setRegistration(values);
      setStep(2);
    },
    [setStep, setRegistration]
  );

  const handleOnFinishConsulting = useCallback(
    ({ phone }: { phone: string }) => {
      setIsConsulting(true);
      RegistrationService.findByPhone(phone).then((registration) => {
        setIsConsulting(false);
        if (registration) {
          setRegistration(registration);
          setIsModalOpen(false);
          setStep(3);
        } else {
          message.info("Não foi encontrato nenhum registro para o telefone informado.");
        }
      });
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
        <Flex justify="center" style={{ paddingTop: 10 }}>
          <Form.Item label="Me voluntariar para ajudar" name="volunteer">
            <Switch />
          </Form.Item>
          <Form.Item label="Vou precisar de carona" name="needRide">
            <Switch />
          </Form.Item>
        </Flex>
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
        <Form layout="vertical" onFinish={handleOnFinishConsulting}>
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
            <Button htmlType="submit" variant="solid" color="primary" size="large" loading={isConsulting}>
              Consultar
            </Button>
          </Flex>
        </Form>
      </Modal>
    </>
  );
}
