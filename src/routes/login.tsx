import { useState } from "react";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  Error,
  Form,
  Input,
  Title,
  Switcher,
  Wrapper,
} from "../components/auth-components";

import GoogleButton from "./../components/google-btn";
import GithubButton from "./../components/github-btn";

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { name, value },
    } = e;
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (isLoading || email === "" || password === "") return;
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (e) {
      if (e instanceof FirebaseError) {
        const errormsg = e.message.split("/");
        console.log(errormsg[1]);
        switch (errormsg[1]) {
          case "user-not-found)." || "wrong-password).":
            setError("이메일 혹은 비밀번호가 일치하지 않습니다.");
            break;
          case "invalid-login-credentials).":
            setError("유효하지 않은 계정입니다.");
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
            setError("로그인에 실패하였습니다.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Form onSubmit={onSubmit}>
        {" "}
        <Title>TIMESHARE</Title>
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
          value={password}
          name="password"
          placeholder="비밀번호"
          type="password"
          required
        />
        <Input type="submit" value={isLoading ? "Loading..." : "로그인"} />
      </Form>
      {error !== "" ? <Error>{error}</Error> : null}
      <Switcher>
        계정이 없으신가요? <Link to="/create-account">회원가입</Link>
      </Switcher>
      <GoogleButton />
      <GithubButton />
    </Wrapper>
  );
}
