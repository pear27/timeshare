import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { styled } from "styled-components";
import { auth, db } from "./../firebase";
import { deleteDoc, doc } from "firebase/firestore";

import { useState, useEffect } from "react";

import {
  setDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { date2String } from "./date-components";

const Form = styled.form`
  gap: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Input = styled.input`
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

export const Error = styled.span`
  font-family: "PretendardRegular";
  font-weight: 600;
  color: tomato;
`;

const AddButton = styled.button`
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

export default function SaveScdForm({
  id,
  initname,
  start,
  end,
  user,
  setSaveScdForm,
}) {
  const [name, setName] = useState(initname);
  const [anniversary, setAnniversary] = useState(false);
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(
    end ? end : new Date(startDate.getTime() + 60 * 60 * 1000)
  );
  const [error, setError] = useState("");
  const onCheck = () => {
    if (anniversary) {
      setAnniversary(false);
    } else {
      setAnniversary(true);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const dateCount =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

    if (!user) {
      return;
    } else if (name === "") {
      setError("일정을 입력하세요.");
      return;
    } else if (dateCount <= 0) {
      setError("종료 시간이 시작 시간보다 이를 수 없습니다.");
      return;
    }

    try {
      const newId = Date.now();
      if (anniversary) {
        const dateString = date2String(new Date(startDate));
        await setDoc(
          doc(db, `${user.uid}/anniversary/${dateString}`, `${newId}`),
          {
            name,
          }
        );
      } else {
        if (id) {
          for (
            let i = 0;
            i <= (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
            i++
          ) {
            const nowDate = new Date();
            const nowDateString = date2String(
              nowDate.setDate(start.getDate() + i)
            );
            await deleteDoc(
              doc(db, `${user.uid}/schedule/${nowDateString}`, `${id}`)
            );
          }
        }
        for (let i = 0; i <= dateCount; i++) {
          const nowDate = new Date();
          const nowDateString = date2String(
            nowDate.setDate(startDate.getDate() + i)
          );
          await setDoc(
            doc(db, `${user.uid}/schedule/${nowDateString}`, `${newId}`),
            {
              name,
              startDate,
              endDate,
            }
          );
        }
      }
      setName("");
      setSaveScdForm(false);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Form onSubmit={onSubmit}>
      <Input
        value={name}
        type="text"
        placeholder="일정을 입력하세요."
        onChange={onChange}
      />
      <label>
        <input type="checkbox" checked={anniversary} onChange={onCheck} />
        기념일
      </label>
      {anniversary ? (
        <DatePicker
          shouldCloseOnSelect // 날짜를 선택하면 datepicker가 자동으로 닫힘
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          dateFormat="yyyy.MM.dd"
        />
      ) : (
        <div style={{ display: "flex" }}>
          <DatePicker
            shouldCloseOnSelect // 날짜를 선택하면 datepicker가 자동으로 닫힘
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            showTimeSelect // 시간 나오게 하기
            timeFormat="HH:mm" //시간 포맷
            timeIntervals={5} // 5분 단위로 선택 가능한 box가 나옴
            timeCaption="time"
            dateFormat="yyyy.MM.dd, hh:mm aa"
          />
          <DatePicker
            shouldCloseOnSelect // 날짜를 선택하면 datepicker가 자동으로 닫힘
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            showTimeSelect // 시간 나오게 하기
            timeFormat="HH:mm" //시간 포맷
            timeIntervals={5} // 5분 단위로 선택 가능한 box가 나옴
            minDate={startDate} // minDate 이전 날짜 선택 불가
            timeCaption="time"
            dateFormat="yyyy.MM.dd, hh:mm aa"
          />
        </div>
      )}
      <Error>{error}</Error>
      <AddButton type="submit">저장하기</AddButton>
    </Form>
  );
}
