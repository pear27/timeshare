import DatePicker from "react-datepicker";

import { auth, db } from "./../firebase";
import { deleteDoc, doc } from "firebase/firestore";

import { useState } from "react";

import { setDoc } from "firebase/firestore";

import { date2String } from "./date-components";

import styles from "../styles/datepicker.module.css";

import { Form, Input, Error, Button } from "./save-components";

const selectedName = "selected";

export default function SaveDdayForm({ id, initname, end, user, setSaveForm }) {
  const [name, setName] = useState(initname);
  const [endDate, setEndDate] = useState(end);

  const [error, setError] = useState("");

  const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  //여기도 수정
  const onSubmitDday = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) return;
    if (name === "") {
      setError("디데이를 입력하세요.");
      return;
    }

    try {
      const newId = Date.now();
      await setDoc(
        doc(db, `${user.uid}/dday/${date2String(endDate)}`, `${newId}`),
        {
          name,
          endDate,
        }
      );
      setName("");
      setSaveForm(false);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div>
      <Form onSubmit={onSubmitDday}>
        <Input
          value={name}
          type="text"
          onChange={onChangeName}
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
        <Button className="add" type="submit" onClick={onSubmitDday}>
          저장하기
        </Button>
      </Form>
    </div>
  );
}
