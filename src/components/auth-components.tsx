import { styled } from "styled-components";

export const Wrapper = styled.div`
  height: 100%;
  width: 400px;
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Title = styled.h1`
  font-family: "RixInooAriDuriR";
  font-size: 42px;
`;

export const Form = styled.form`
  align-items: center;
  margin-top: 50px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

export const Input = styled.input`
  font-family: "PretendardRegular";
  padding: 10px 15px;
  border-radius: 5px;
  border: 2px solid lightgrey;
  width: 100%;
  font-size: 16px;
  &[type="submit"] {
    font-family: "seolleimcoolTTFSemiBold";
    border-radius: 10px;
    width: 70%;
    cursor: pointer;
    background-color: white;
    border-color: black;
    color: black;
    &:hover {
      background-color: black;
      color: white;
    }
  }
`;

export const Error = styled.span`
  font-family: "PretendardRegular";
  font-weight: 600;
  color: tomato;
`;

export const Switcher = styled.span`
  font-family: "PretendardRegular";
  margin-top: 20px;
  a {
    color: #1d9bf0;
  }
`;
