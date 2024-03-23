import { styled } from "styled-components";
import { useState } from "react";

import { auth, db } from "../firebase";
import { updateDoc, deleteDoc, doc } from "firebase/firestore";

import { date2String } from "./date-components";

export interface IAnni {
  id: string;
  name: string;
  date: timestamp;
  repeatType: number;
}

export interface IThisAnni {
  id: string;
  name: string;
  date: timestamp;
  count: number;
}

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 9fr 1fr;
  width: 100%;
  margin: 5px;
  cursor: pointer;
`;

const Name = styled.h1`
  font-family: "PretendardRegular";
`;

const Count = styled.h6`
  font-size: 13px;
  font-family: "PretendardRegular";
  color: tomato;
  padding-top: 3px;
  margin-left: 3px;
`;

const Edit = styled.input`
  font-size: 16px;
  font-family: "PretendardRegular";
`;

const More = styled.span`
  cursor: pointer;
  width: 30px;
  font-size: 15px;
  font-family: "PretendardRegular";
  color: grey;
`;

export function Anniversary({ name, date, count, id }: IThisAnni) {
  const user = auth.currentUser;

  const dateString = `${date2String(new Date(date.seconds * 1000))}`;

  const [more, setMore] = useState(false);
  const [edit, setEdit] = useState(false);

  const [newName, setNewName] = useState(name);

  const onEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newName === "") return;
    try {
      await updateDoc(doc(db, `${user.uid}/anniversary/repeat`, id), {
        name: `${newName}`,
      });
      setEdit(false);
    } catch (e) {
      console.log(e);
    }
  };

  const moreOn = () => {
    setMore(true);
  };

  const moreOff = () => {
    setMore(false);
  };

  const editOn = () => {
    setEdit(true);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  };

  const onDelete = async () => {
    try {
      await deleteDoc(doc(db, `${user.uid}/anniversary/repeat`, id));
    } catch (e) {
      console.log(e);
    } finally {
      //
    }
  };

  return (
    <Wrapper onMouseEnter={moreOn} onMouseLeave={moreOff}>
      <div style={{ display: "flex", alignItems: "center" }}>
        {edit ? (
          <form onSubmit={onEdit}>
            <Edit
              type="text"
              onChange={onChange}
              value={newName}
              placeholder="어떤 날인가요?"
            />
          </form>
        ) : (
          <Name>{name}</Name>
        )}
        <Count>{count}</Count>
      </div>
      {more ? (
        <div style={{ display: "flex", alignItems: "center" }}>
          <More onClick={editOn}>수정</More>
          <More onClick={onDelete}>삭제</More>
        </div>
      ) : null}
    </Wrapper>
  );
}
