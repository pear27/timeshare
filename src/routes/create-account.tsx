import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "../firebase.ts";

import {
  Form,
  Error,
  Input,
  Switcher,
  Title,
  Wrapper,
} from "../components/auth-components";

import GoogleButton from "./../components/google-btn";
import GithubButton from "./../components/github-btn";

export default function CreateAccount() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { name, value },
    } = e;
    if (name === "name") {
      setName(value);
    } else if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (isLoading || name === "" || email === "" || password === "") return;
    try {
      setIsLoading(true);
      const credentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(credentials.user, { displayName: name });
      navigate("/");
    } catch (e) {
      if (e instanceof FirebaseError) {
        const errormsg = e.message.split("/");
        switch (errormsg[1]) {
          case "user-not-found)." || "wrong-password).":
            setError("이메일 혹은 비밀번호가 일치하지 않습니다.");
            break;
          case "email-already-in-use).":
            setError("이미 사용 중인 이메일입니다.");
            break;
          case "weak-password).":
            setError("비밀번호는 6글자 이상이어야 합니다.");
            break;
          case "network-request-failed).":
            setError("네트워크 연결에 실패 하였습니다.");
            break;
          case "invalid-email).":
            setError("잘못된 이메일 형식입니다.");
            break;
          case "internal-error).":
            setError("잘못된 요청입니다.");
            break;
          default:
            setError("로그인에 실패 하였습니다.");
            break;
        }
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Wrapper>
      <Form onSubmit={onSubmit}>
        <Title>TIMESHARE</Title>
        <Input
          onChange={onChange}
          name="name"
          value={name}
          placeholder="닉네임"
          type="text"
          required
        />
        <Input
          onChange={onChange}
          name="email"
          value={email}
          placeholder="이메일"
          type="email"
          required
        />
        <Input
          onChange={onChange}
          name="password"
          value={password}
          placeholder="비밀번호"
          type="password"
          required
        />
        <Input type="submit" value={isLoading ? "Loading..." : "회원가입"} />
      </Form>
      {error !== "" ? <Error>{error}</Error> : null}
      <Switcher>
        TIMESHARE 계정이 있으신가요? <Link to="/login">로그인</Link>
      </Switcher>
      <GoogleButton />
      <GithubButton />
    </Wrapper>
  );
}
