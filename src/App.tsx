import React from "react";
import { ConfigProvider, Flex } from "antd";
import "./App.css";
import CabecalhoImg from "@/assets/cabecalho.png";
import StoreProvider from "@/contexts/StoreContext";
import Registration from "@/features/Registration";

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#164B7B",
        },
        components: {
          Form: {
            labelFontSize: 20,
            itemMarginBottom: 10,
          },
          Input: {
            activeBorderColor: "#efa31c",
            activeShadow: "0 0 0 2px rgba(239,163,28, 0.1)",
            inputFontSizeLG: 20,
          },
          Button: {
            fontWeight: 700,
            primaryShadow: "none",
          },
        },
      }}
    >
      <StoreProvider>
        <Flex
          vertical
          justify="center"
          align="center"
          style={{ height: "100%", paddingTop: 25, paddingBottom: 25 }}
          gap={20}
        >
          <img src={CabecalhoImg} width={200} />
          <Registration />
        </Flex>
      </StoreProvider>
    </ConfigProvider>
  );
}

export default App;
