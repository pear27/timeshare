import { styled } from "styled-components";
import { useState } from "react";

import { auth, db } from "../firebase";
import { updateDoc, deleteDoc, doc } from "firebase/firestore";
import { date2String } from "./date-components";

export interface ITodo {
  id: string;
  name: string;
  createdAt: number;
  checked: boolean;
}

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 8fr 1fr;
  margin: 10px;
`;

const Icon = styled.div`
  cursor: pointer;
  height: 30px;
  width: 30px;
  svg {
    width: 30px;
  }
`;

const Edit = styled.input`
  font-size: 16px;
  font-family: "PretendardRegular";
`;

const Name = styled.p`
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

export function Todo({ name, createdAt, checked, id }: ITodo) {
  const user = auth.currentUser;
  const createdDate = new Date(createdAt);

  const [more, setMore] = useState(false);
  const [edit, setEdit] = useState(false);

  const [newName, setNewName] = useState(name);

  const createdDateString = `${date2String(createdDate)}`;

  const onCheck = async () => {
    try {
      if (checked) {
        await updateDoc(doc(db, `${user.uid}/todo/${createdDateString}`, id), {
          checked: false,
        });
      } else {
        await updateDoc(doc(db, `${user.uid}/todo/${createdDateString}`, id), {
          checked: true,
        });
      }
    } catch (e) {
      console.log(e);
    } finally {
      //
    }
  };

  const onEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newName === "") return;
    try {
      await updateDoc(doc(db, `${user.uid}/todo/${createdDateString}`, id), {
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
      await deleteDoc(doc(db, `${user.uid}/todo/${createdDateString}`, id));
    } catch (e) {
      console.log(e);
    } finally {
      //
    }
  };

  return (
    <Wrapper onMouseEnter={moreOn} onMouseLeave={moreOff}>
      <Icon onClick={onCheck}>
        {checked ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-6 h-6"
          >
            <path
              fill-rule="evenodd"
              d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
              clip-rule="evenodd"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
            />
          </svg>
        )}
      </Icon>

      <div style={{ display: "flex", alignItems: "center" }}>
        {edit ? (
          <form onSubmit={onEdit}>
            <Edit
              type="text"
              onChange={onChange}
              value={newName}
              placeholder="무엇을 할까?"
            />
          </form>
        ) : (
          <Name>{name}</Name>
        )}
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
