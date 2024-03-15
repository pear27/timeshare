import { useState, useEffect } from "react";
import { styled } from "styled-components";

import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { auth, db } from "../firebase";
import { ITodo, Todo } from "./todo";
import { Unsubscribe } from "firebase/auth";

import { date2String } from './date-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const Form = styled.form`
  padding: 10px;
  gap: 5px;
  height: 43px;
  width: 100%;
  display: grid;
  grid-template-columns: 8fr 1fr;
`;

const Input = styled.input`
  border: 2px solid lightgrey;
  padding: 10px 15px;
  border-radius: 20px;
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

const SubmitBtn = styled.input`
  background-color: white;
  color: black;
  border: 2px solid black;
  padding: 5px 5px;
  //width: 100px;
  border-radius: 20px;
  font-size: 14px;
  font-family: "seolleimcoolTTFSemiBold";
  cursor: pointer;
  &:hover,
  &:active {
    background-color: black;
    color: white;
  }
`;

export default function SaveTodoForm() {
  const user = auth.currentUser;

  const [isLoading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date());

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user || isLoading || name === "") return;
    try {
      setLoading(true);
      await addDoc(
        collection(
          db,
          `${user.uid}/todo/${date2String(date)}`
        ),
        {
          name,
          createdAt: Date.now(),
          checked: false,
        }
      );
      setName("");
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Form onSubmit={onSubmit}>
        <Input
          type="text"
          rows={1}
          onChange={onChange}
          value={name}
          placeholder="무엇을 할까?"
        />
        <SubmitBtn type="submit" value={isLoading ? "..." : "SAVE"} />
      </Form>
    </div>
  );
}
