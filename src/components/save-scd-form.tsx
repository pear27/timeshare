import DatePicker from "react-datepicker";

import { auth, db } from "./../firebase";
import { deleteDoc, doc } from "firebase/firestore";

import { useState } from "react";

import { setDoc } from "firebase/firestore";

import { date2String } from "./date-components";

import styles from "../styles/datepicker.module.css";

import { Form, Input, NumInput, Label, Error, Button } from "./save-components";

import { DAY_LIST } from "./calendar";

const selectedName = "selected";

export default function SaveScdForm({
  id,
  initname,
  start,
  end,
  Rtype,
  Rperiod,
  Rinfo,
  Rend,
  user,
  setSaveScdForm,
}) {
  const [name, setName] = useState(initname);
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(
    end ? end : new Date(startDate.getTime() + 60 * 60 * 1000)
  );

  const [repeatType, setRepeatType] = useState(Rtype ? Rtype : 0);
  const [repeatPeriod, setRepeatPeriod] = useState(Rperiod ? Rperiod : 1);

  let repeatWeekData = [false, false, false, false, false, false, false];
  const [repeatMonthData, setRepeatMonthData] = useState(start.getDate());
  const [repeatYearData, setRepeatYearData] = useState(start);

  const [repeatEnd, setRepeatEnd] = useState(Rend ? Rend : null);

  const [error, setError] = useState("");

  const handleRepeatRadio = (e) => {
    e.preventDefault();
    setRepeatType(Number(e.target.value));

    for (let i = 0; i < 5; i++) {
      if (e.target.parentNode.childNodes[i].classList.contains(selectedName)) {
        e.target.parentNode.childNodes[i].classList.remove(selectedName);
      }
    }
    e.target.classList.add(selectedName);
  };

  const handleRepeatEnd = (e) => {
    e.preventDefault();

    if (Number(e.target.value) === 1) {
      setRepeatEnd(true);
    } else setRepeatEnd(false);

    for (let i = 1; i < 3; i++) {
      if (e.target.parentNode.childNodes[i].classList.contains(selectedName)) {
        e.target.parentNode.childNodes[i].classList.remove(selectedName);
      }
    }
    e.target.classList.add(selectedName);
  };

  const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const onChangeRepeatPeriod = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRepeatPeriod(e.target.value);
  };

  const onChangeRepeatWeekDay = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const selectedDay = Number(e.target.value);

    if (repeatWeekData[selectedDay]) {
      repeatWeekData[selectedDay] = false;
      e.target.classList.remove(selectedName);
    } else {
      repeatWeekData[selectedDay] = true;
      e.target.classList.add(selectedName);
    }
  };

  const onChangeRepeatMonthData = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    setRepeatMonthData(Number(e.target.value));

    if (Number(repeatMonthData) === 0) {
      e.target.classList.add(selectedName);
      e.target.nextSibling.classList.remove(selectedName);
    } else {
      e.target.previousSibling.classList.remove(selectedName);
      e.target.classList.add(selectedName);
    }
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
      switch (repeatType) {
        case 0: // 반복 없음
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
                repeatType,
                repeatEnd: true,
              }
            );
          }
          break;
        case 1: // 매일 반복
          await setDoc(doc(db, `${user.uid}/schedule/repeat`, `${newId}`), {
            name,
            startDate,
            endDate,
            repeatType,
            repeatPeriod,
            repeatEnd,
          });
          break;
        case 2: // 매주 반복
          await setDoc(doc(db, `${user.uid}/schedule/repeat`, `${newId}`), {
            name,
            startDate,
            endDate,
            repeatType,
            repeatInfo: { repeatWeekData },
            repeatEnd,
          });
          break;
        case 3: // 매달 반복
          await setDoc(doc(db, `${user.uid}/schedule/repeat`, `${newId}`), {
            name,
            startDate,
            endDate,
            repeatType,
            repeatInfo: { repeatMonthData },
            repeatEnd,
          });
          break;
        case 4: // 매년 반복
          await setDoc(doc(db, `${user.uid}/schedule/repeat`, `${newId}`), {
            name,
            startDate,
            endDate,
            repeatType,
            repeatInfo: { repeatYearData },
            repeatEnd,
          });
          break;
      }

      setName("");
      setSaveScdForm(false);
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <Form>
      <Input
        value={name}
        type="text"
        onChange={onChangeName}
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
          gap: "5px",
        }}
      >
        <Button className="selected" value="0" onClick={handleRepeatRadio}>
          반복 없음
        </Button>
        <Button value="1" onClick={handleRepeatRadio}>
          매일
        </Button>
        <Button value="2" onClick={handleRepeatRadio}>
          매주
        </Button>
        <Button value="3" onClick={handleRepeatRadio}>
          매월
        </Button>
        <Button value="4" onClick={handleRepeatRadio}>
          매년
        </Button>
      </div>
      {repeatType === 1 ? (
        <div>
          <NumInput
            value={repeatPeriod}
            type="number"
            onChange={onChangeRepeatPeriod}
          />
          <Label> 일마다 반복</Label>
        </div>
      ) : null}
      {repeatType === 2 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr 1fr",
            gap: "5px",
          }}
        >
          <Button value="0" onClick={onChangeRepeatWeekDay}>
            일
          </Button>
          <Button value="1" onClick={onChangeRepeatWeekDay}>
            월
          </Button>
          <Button value="2" onClick={onChangeRepeatWeekDay}>
            화
          </Button>
          <Button value="3" onClick={onChangeRepeatWeekDay}>
            수
          </Button>
          <Button value="4" onClick={onChangeRepeatWeekDay}>
            목
          </Button>
          <Button value="5" onClick={onChangeRepeatWeekDay}>
            금
          </Button>
          <Button value="6" onClick={onChangeRepeatWeekDay}>
            토
          </Button>
        </div>
      ) : null}
      {repeatType === 3 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "5px",
          }}
        >
          <Button value="0" onClick={onChangeRepeatMonthData}>
            {startDate.getDate()}일
          </Button>
          <Button value="1" onClick={onChangeRepeatMonthData}>
            {Math.floor((startDate.getDate() + startDate.getDay() + 1) / 7)}
            번째
            {DAY_LIST[startDate.getDay()]}요일
          </Button>
        </div>
      ) : null}
      {repeatType === 4 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "5px",
          }}
        >
          <Button value="0">
            {startDate.getMonth()}월 {startDate.getDate()}일
          </Button>
          <Button value="1">
            {startDate.getMonth()}월{" "}
            {Math.floor((startDate.getDate() + startDate.getDay() + 1) / 7)}
            번째 {DAY_LIST[startDate.getDay()]}요일
          </Button>
        </div>
      ) : null}
      {repeatType === 0 ? null : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr 2fr 3fr",
            gap: "5px",
          }}
        >
          <h1>반복 종료</h1>
          <Button className="selected" value="0" onClick={handleRepeatEnd}>
            없음
          </Button>
          <Button value="1" onClick={handleRepeatEnd}>
            날짜
          </Button>
          {repeatEnd ? (
            <DatePicker
              shouldCloseOnSelect // 날짜를 선택하면 datepicker가 자동으로 닫힘
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="yyyy.MM.dd"
              className={styles.datePicker}
            />
          ) : null}
        </div>
      )}
      <Error>{error}</Error>
      <Button className="add" type="submit" onClick={onSubmitSchedule}>
        저장하기
      </Button>
    </Form>
  );
}
