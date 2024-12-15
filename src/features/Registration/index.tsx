import { useStore } from "@/contexts/StoreContext";
import Step1 from "@/features/Registration/Step1";
import { Card, Col, Row } from "antd";
import { motion } from "framer-motion";
import Step2 from "@/features/Registration/Step2";
import { useEffect, useMemo, useState } from "react";
import Step3 from "@/features/Registration/Step3";
import RegistrationService from "@/services/RegistrationService";

export default function Index() {
  const { step, setRegistration, setStep } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("registrationId")) {
      setIsLoading(true);
      RegistrationService.findById(localStorage.getItem("registrationId") as string).then((registration) => {
        setRegistration(registration);
        setStep(3);
        setIsLoading(false);
      });
    }
  }, [setRegistration, setStep]);

  const breakpoints = useMemo(() => {
    if (step === 1) {
      return {
        xs: { span: 22, offset: 1 },
        xl: { span: 10, offset: 7 },
        xxl: { span: 8, offset: 8 },
      };
    }
    if (step === 2) {
      return {
        xs: { span: 22, offset: 1 },
        xl: { span: 16, offset: 4 },
        xxl: { span: 10, offset: 7 },
      };
    }
    return {
      xs: { span: 22, offset: 1 },
      xl: { span: 10, offset: 7 },
      xxl: { span: 8, offset: 8 },
    };
  }, [step]);
  return (
    <motion.div
      layout
      style={{
        width: "100%",
      }}
    >
      <Row
        style={{
          width: "100%",
        }}
      >
        <Col {...breakpoints}>
          <Card loading={isLoading} style={{ marginBottom: 25 }}>
            <motion.div
              initial={{
                scaleX: 0,
              }}
              animate={{
                scaleX: step / 3,
              }}
              transition={{
                duration: 0.5,
                delay: 1,
              }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 10,
                background: "#164B7B",
                transformOrigin: 0,
              }}
            />
            {step === 1 && <Step1 />}
            {step === 2 && <Step2 />}
            {step === 3 && <Step3 />}
          </Card>
        </Col>
      </Row>
    </motion.div>
  );
}
