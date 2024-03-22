import DatePicker from "react-datepicker";

import { auth, db } from "./../firebase";

import { useState } from "react";

import { setDoc,doc } from "firebase/firestore";

import styles from "../styles/datepicker.module.css";

import { Form, Input, Error, Button } from "./save-components";

const selectedName = "selected";

export default function SaveAniForm({ id, initname, date, user, setSaveForm }) {
  const [name, setName] = useState(initname);
  const [selectedDate, setDate] = useState(date);

  const [repeatType, setRepeatType] = useState(1);

  const [error, setError] = useState("");

  const handleRepeatRadio = (e) => {
    e.preventDefault();
    setRepeatType(Number(e.target.value));

    for (let i = 0; i < 3; i++) {
      if (e.target.parentNode.childNodes[i].classList.contains(selectedName)) {
        e.target.parentNode.childNodes[i].classList.remove(selectedName);
      }
    }

    e.target.classList.add(selectedName);
  };

  const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
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
      await setDoc(doc(db, `${user.uid}/anniversary/repeat`, `${newId}`), {
        name,
        date: { selectedDate },
        repeatType,
      });
      setName("");
      setSaveForm(false);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Form onSubmit={onSubmitAnniversary}>
      <Input
        value={name}
        type="text"
        onChange={onChangeName}
        placeholder="기념일을 등록하세요."
      />
      <DatePicker
        shouldCloseOnSelect // 날짜를 선택하면 datepicker가 자동으로 닫힘
        selected={selectedDate}
        onChange={(date) => setDate(date)}
        dateFormat="yyyy.MM.dd"
        className={styles.datePicker}
      />{" "}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "5px",
        }}
      >
        <Button value="1" onClick={handleRepeatRadio} className={selectedName}>
          매년
        </Button>
        <Button value="2" onClick={handleRepeatRadio}>
          100일마다
        </Button>
        <Button value="3" onClick={handleRepeatRadio}>
          1000일마다
        </Button>
      </div>
      <Error>{error}</Error>
      <Button className="add" type="submit" onClick={onSubmitAnniversary}>
        저장하기
      </Button>
    </Form>
  );
}
