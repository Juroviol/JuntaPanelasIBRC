import React from "react";
import { Divider, Flex, Typography } from "antd";
import Lottie from "react-lottie";
import * as checkAnimation from "@/assets/check.json";
import Detail from "@/features/Registration/Detail";
import { useStore } from "@/contexts/StoreContext";

export default function Step3() {
  const { registration } = useStore();
  return (
    <Flex
      vertical
      justify="center"
      style={{
        textAlign: "center",
      }}
    >
      <Flex align="center" justify="center" gap={10}>
        <Lottie
          width={100}
          options={{
            animationData: checkAnimation,
            loop: true,
          }}
          style={{
            margin: 0,
          }}
        />
        <Typography.Title
          level={3}
          style={{
            color: "rgb(10, 223, 200)",
          }}
        >
          Presença confirmada!
        </Typography.Title>
      </Flex>
      <Divider style={{ borderColor: "#efa31c" }}>O que você irá levar</Divider>
      <Detail registration={registration!} />
    </Flex>
  );
}
