import { useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import { auth } from "../firebase.ts";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const Button = styled.span`
  margin-top: 50px;
  gap: 5px;
  padding: 10px 15px;
  border: 2px solid black;
  font-family: "seolleimcoolTTFSemiBold";
  font-size: 16px;
  border-radius: 10px;
  width: 70%;
  cursor: pointer;
  background-color: white;
  color: black;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background-color: #4285f4;
    border-color: #4285f4;
    color: white;
  }
`;

export default function GoogleButton() {
  const navigate = useNavigate();
  const onClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };
  return <Button onClick={onClick}>Google 계정으로 로그인하기</Button>;
}
