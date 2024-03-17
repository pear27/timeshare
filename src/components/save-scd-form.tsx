import DatePicker from "react-datepicker";

import { styled } from "styled-components";
import { auth, db } from "./../firebase";
import { deleteDoc, doc } from "firebase/firestore";

import { useState } from "react";

import { setDoc } from "firebase/firestore";

import { date2String } from "./date-components";

import styles from "../styles/datepicker.module.css";

const Form = styled.form`
  padding: 15px;
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

const Button = styled.button`
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

const selectedName = "selected";

export default function SaveScdForm({
  id,
  initname,
  start,
  end,
  user,
  setSaveScdForm,
}) {
  const [name, setName] = useState(initname);
  const [type, setType] = useState(1);

  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(
    end ? end : new Date(startDate.getTime() + 60 * 60 * 1000)
  );
  const [error, setError] = useState("");

  const handleTypeRadio = (e) => {
    setType(Number(e.target.value));

    for (let i = 0; i < 3; i++) {
      if (e.target.parentNode.childNodes[i].classList.contains(selectedName)) {
        e.target.parentNode.childNodes[i].classList.remove(selectedName);
      }
    }

    e.target.classList.add(selectedName);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const onSubmitSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const dateCount =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

    if (!user) return;

    if (name === "") {
      setError("일정을 입력하세요.");
      return;
    } else if (dateCount <= 0) {
      setError("종료 시간이 시작 시간보다 이를 수 없습니다.");
      return;
    }

    try {
      const newId = Date.now();
      if (id) {
        // 기존 데이터가 있는 경우 -> 삭제 후 재등록
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
            // 기존 데이터 삭제
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
      setName("");
      setSaveScdForm(false);
    } catch (e) {
      console.log(e);
    }
  };

  const onSubmitAnniversary = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) return;
    if (name === "") {
      setError("일정을 입력하세요.");
      return;
    }

    try {
      const newId = Date.now();
      if (id) {
        // 기존 데이터가 있는 경우 -> 삭제 후 재등록
        await deleteDoc(
          // 기존 데이터 삭제
          doc(db, `${user.uid}/anniversary/${date2String(start)}`, `${id}`)
        );
      }
      await setDoc(
        doc(db, `${user.uid}/schedule/${date2String(startDate)}`, `${newId}`),
        {
          name,
          startDate,
          endDate,
        }
      );
      setName("");
      setSaveScdForm(false);
    } catch (e) {
      console.log(e);
    }
  };

  const onSubmitDday = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) return;
    if (name === "") {
      setError("일정을 입력하세요.");
      return;
    }

    try {
      const newId = Date.now();
      if (id) {
        // 기존 데이터가 있는 경우 -> 삭제 후 재등록
        await deleteDoc(
          // 기존 데이터 삭제
          doc(db, `${user.uid}/anniversary/${date2String(end)}`, `${id}`)
        );
      }
      await setDoc(
        doc(db, `${user.uid}/schedule/${date2String(endDate)}`, `${newId}`),
        {
          name,
          startDate,
          endDate,
        }
      );
      setName("");
      setSaveScdForm(false);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "5px",
        }}
      >
        <Button className="type selected" value="1" onClick={handleTypeRadio}>
          일정
        </Button>
        <Button className="type" value="2" onClick={handleTypeRadio}>
          기념일
        </Button>
        <Button className="type" value="3" onClick={handleTypeRadio}>
          디데이
        </Button>
      </div>
      {type === 1 ? (
        <Form onSubmit={onSubmitSchedule}>
          <Input
            value={name}
            type="text"
            onChange={onChange}
            placeholder="일정을 등록하세요."
          />
          <div style={{ display: "flex", gap: "5px" }}>
            <DatePicker
              shouldCloseOnSelect // 날짜를 선택하면 datepicker가 자동으로 닫힘
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              showTimeSelect // 시간 나오게 하기
              timeFormat="HH:mm" //시간 포맷
              timeIntervals={5} // 5분 단위로 선택 가능한 box가 나옴
              timeCaption="time"
              dateFormat="yyyy.MM.dd, hh:mm aa"
              className={styles.datePicker}
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
              className={styles.datePicker}
            />
          </div>
          <Error>{error}</Error>
          <Button className="add" type="submit">
            저장하기
          </Button>
        </Form>
      ) : null}
      {type === 2 ? (
        <Form onSubmit={onSubmitAnniversary}>
          <Input
            value={name}
            type="text"
            onChange={onChange}
            placeholder="기념일을 등록하세요."
          />
          <DatePicker
            shouldCloseOnSelect // 날짜를 선택하면 datepicker가 자동으로 닫힘
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="yyyy.MM.dd"
            className={styles.datePicker}
          />
          <Error>{error}</Error>
          <Button className="add" type="submit">
            저장하기
          </Button>
        </Form>
      ) : null}
      {type === 3 ? (
        <Form onSubmit={onSubmitDday}>
          <Input
            value={name}
            type="text"
            onChange={onChange}
            placeholder="디데이를 등록하세요."
          />
          <DatePicker
            shouldCloseOnSelect // 날짜를 선택하면 datepicker가 자동으로 닫힘
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="yyyy.MM.dd"
            className={styles.datePicker}
          />
          <Error>{error}</Error>
          <Button className="add" type="submit">
            저장하기
          </Button>
        </Form>
      ) : null}
    </div>
  );
}
