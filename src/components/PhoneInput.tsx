import DefaultPhoneInput from "react-phone-input-2";
import { styled } from "styled-components";
import { useCallback } from "react";
import { Form } from "antd";

const StyledPhoneInput = styled(DefaultPhoneInput)`
  display: flex;
  input {
    background: #ffffff;
    border-width: 1px;
    border-style: solid;
    border-color: #d9d9d9;
    padding: 7px 11px;
    font-size: 20px;
    line-height: 1.5;
    border-radius: 8px;
    width: 100%;
    &:hover {
      border-color: #2e5f87;
      background-color: #ffffff;
    }
    &:focus {
      border-color: #efa31c;
      box-shadow: 0 0 0 2px rgba(239, 163, 28, 0.1);
      outline: 0;
      background-color: #ffffff;
    }
  }
`;

export default function PhoneInput() {
  const form = Form.useFormInstance();
  const handleChange = useCallback(
    (value: string) => {
      form.setFieldValue("phone", value);
    },
    [form]
  );
  return (
    <StyledPhoneInput
      inputProps={{ name: "phone", id: "phone" }}
      specialLabel=""
      country="br"
      onChange={handleChange}
      masks={{ br: "(..) . ....-...." }}
    />
  );
}
