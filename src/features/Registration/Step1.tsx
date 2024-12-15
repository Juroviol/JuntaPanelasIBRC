import React, { useCallback, useState } from "react";
import { get, range } from "lodash";
import {
  Button,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Switch,
  Typography,
} from "antd";
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
      <Form
        layout="vertical"
        onFinish={handleOnFinish}
        validateTrigger="onSubmit"
        initialValues={{
          qtyAdults: 0,
          qtyChildren: 0,
        }}
      >
        <Form.Item
          name="name"
          label="Nome (somente um da família)"
          required
          rules={[{ required: true, message: "Preecha o campo" }]}
        >
          <Input size="large" />
        </Form.Item>
        <Form.Item
          name="phone"
          label="Telefone"
          required
          rules={[
            {
              validator: (_, value) => {
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
        <Row>
          <Col
            xl={{
              span: 8,
            }}
            xs={{
              span: 24,
            }}
          >
            <Form.Item
              name="qtyAdults"
              label="Quantos adultos?"
              required
              rules={[{ required: true, message: "Preecha o campo" }]}
            >
              <InputNumber min={0} max={10} size="large" />
            </Form.Item>
          </Col>
          <Col
            xl={{
              span: 8,
            }}
            xs={{
              span: 24,
            }}
          >
            <Form.Item
              name="qtyChildren"
              label="Quantas crianças?"
              required
              rules={[{ required: true, message: "Preecha o campo" }]}
            >
              <InputNumber min={0} max={10} size="large" />
            </Form.Item>
          </Col>
          <Col
            xl={{
              span: 8,
            }}
            xs={{
              span: 24,
            }}
          >
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, nextValues) =>
                get(prevValues, "qtyChildren") !== get(nextValues, "qtyChildren")
              }
            >
              {({ getFieldValue }) =>
                (getFieldValue("qtyChildren") || 0) > 0 ? (
                  <Form.Item
                    name="childrenAges"
                    label={(getFieldValue("qtyChildren") || 0) > 1 ? "Idade das crianças" : "Idade da criança"}
                    required
                    rules={[
                      {
                        type: "array",
                        validator: (_, value) => {
                          if (!value || !value.length) {
                            return Promise.reject(new Error("Preencha o campo"));
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      size="large"
                      options={range(0, 18).map((age) => ({
                        label: age,
                        value: age,
                      }))}
                    />
                  </Form.Item>
                ) : null
              }
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col
            xs={{
              span: 24,
            }}
            xl={{
              span: 8,
            }}
          >
            <Form.Item label="Vou precisar de carona" name="needRide">
              <Switch />
            </Form.Item>
          </Col>
          <Col
            xs={{
              span: 24,
            }}
            xl={{
              span: 8,
            }}
          >
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, nextValues) =>
                get(prevValues, "needRide") !== get(nextValues, "needRide") ||
                get(prevValues, "qtyAdults") !== get(nextValues, "qtyAdults") ||
                get(prevValues, "qtyChildren") !== get(nextValues, "qtyChildren")
              }
            >
              {({ getFieldValue, setFieldValue }) => {
                setFieldValue("qtyRide", (getFieldValue("qtyAdults") || 0) + (getFieldValue("qtyChildren") || 0));
                return getFieldValue("needRide") ? (
                  <Form.Item
                    name="qtyRide"
                    required
                    rules={[{ required: true, message: "Preecha o campo" }]}
                    label="Carona para quantas pessoas?"
                  >
                    <InputNumber min={0} max={10} size="large" />
                  </Form.Item>
                ) : null;
              }}
            </Form.Item>
          </Col>
        </Row>
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
