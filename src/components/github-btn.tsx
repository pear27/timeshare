import { useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import { auth } from "../firebase.ts";
import { GithubAuthProvider, signInWithPopup } from "firebase/auth";

const Button = styled.span`
  margin-top: 5px;
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
    background-color: black;
    color: white;
  }
`;

export default function GithubButton() {
  const navigate = useNavigate();
  const onClick = async () => {
    try {
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };
  return <Button onClick={onClick}>Github 계정으로 로그인하기</Button>;
}
