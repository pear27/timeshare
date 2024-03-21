import { styled } from "styled-components";

export const Form = styled.form`
  padding: 15px;
  gap: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Input = styled.input`
  border: 2px solid lightgrey;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 16px;
  color: black
  background-color: white;
  width: 100%;
  font-family: "PretendardRegular";
  &:focus {
    outline: none;
    border-color: black;
  }
`;

export const NumInput = styled.input`
  border: 2px solid lightgrey;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 16px;
  color: black
  background-color: white;
  width: 60px;
  text-align: center;
  font-family: "PretendardRegular";
  &:focus {
    outline: none;
    border-color: black;
  }
`;

export const Label = styled.label`
  font-family: "PretendardRegular";
`;

export const Error = styled.span`
  font-family: "PretendardRegular";
  font-weight: 600;
  color: tomato;
`;

export const Button = styled.button`
  margin-top: 5px;
  gap: 5px;
  padding: 10px 15px;
  border: 2px solid black;
  font-family: "seolleimcoolTTFSemiBold";
  font-size: 16px;
  border-radius: 10px;
  cursor: pointer;
  background-color: white;
  color: black;
  display: flex;
  align-items: center;
  justify-content: center;
  &.add {
    width: 70%;
  }
  &.selected,
  &:hover {
    background-color: black;
    color: white;
  }
`;
