import { getDate, getDay, getDaysInMonth, subMonths, setDate } from "date-fns";

import { styled } from "styled-components";
import { useState, useEffect } from "react";

import Modal from "react-modal";
import "react-datepicker/dist/react-datepicker.css";
import { Unsubscribe } from "firebase/auth";
import { auth, db } from "./../firebase";

import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { ITodo, Todo } from "./todo";
import { IScd, Schedule } from "./schedule";
import { IAnni, Anniversary } from "./anniversary";
import SaveScdForm from "./save-scd-form";
import SaveTodoForm from "./save-todo-form";
import { date2String } from "./date-components";

const Wrapper = styled.div`
  align-items: center;
`;

const CalendarWrapper = styled.div`
  margin: 20px 0;
  //width: "480px";
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
`;

const Month = styled.div`
  display: flex;
  width: 162px;
  gap: 20px;
`;

const MonthName = styled.h1`
  width: 82px;
  align-items: center;
  font-size: 20px;
  font-family: "seolleimcoolTTFSemiBold";
`;

const MonthBtn = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  height: 20px;
  width: 20px;
`;

const TodayBtn = styled.div`
  margin-top: 10px;
  width: 60px;
  cursor: pointer;
  font-family: "seolleimcoolTTFSemiBold";
  font-size: 12px;
  border: 2px solid black;
  border-radius: 15px;
  background-color: white;
  color: black;
  gap: 5px;
  padding: 3px 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background-color: black;
    color: white;
  }
`;

const Week = styled.div`
  height: 20px;
  color: grey;
  font-size: 12px;
`;

const DateName = styled.h1`
  width: 50px;
  align-items: center;
  font-size: 35px;
  font-family: "seolleimcoolTTFSemiBold";
`;

const DayName = styled.h1`
  align-items: center;
  font-size: 25px;
  font-family: "seolleimcoolTTFSemiBold";
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

const DEFAULT_TRASH_VALUE = 0;
const CALENDER_LENGTH = 35;
const DAY_OF_WEEK = 7;
export const DAY_LIST = ["일", "월", "화", "수", "목", "금", "토"];

const CreateCalendar = () => {
  const [today, setToday] = useState(new Date());

  const startDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const prevDayList = new Array(getDay(startDay)).fill(DEFAULT_TRASH_VALUE);

  const totalMonthDays = getDaysInMonth(today);
  const currentDayList = Array.from({ length: totalMonthDays }).map(
    (_, i) => i + 1
  );
  // 이번 달 list (1~말일)

  let nextDayList;
  if (prevDayList.length + totalMonthDays <= CALENDER_LENGTH) {
    nextDayList = new Array(
      CALENDER_LENGTH - (prevDayList.length + totalMonthDays)
    ).fill(DEFAULT_TRASH_VALUE);
  } else {
    nextDayList = new Array(
      CALENDER_LENGTH + DAY_OF_WEEK - (prevDayList.length + totalMonthDays)
    ).fill(DEFAULT_TRASH_VALUE);
    // 다음 달 list (0으로 초기화)
  }

  const currentCalendarList = prevDayList.concat(currentDayList, nextDayList);
  // 달력에 표시할 전체 날짜 (0,0,0,1,2,3,...,29,30,31,0)

  return {
    currentCalendarList: currentCalendarList,
    currentDate: today,
    setCurrentDate: setToday,
  };
};

const Calendar = () => {
  const user = auth.currentUser;
  const createdCalendar = CreateCalendar();
  const [saveScdForm, setSaveScdForm] = useState(false);

  const [todos, setTodos] = useState<ITodo[]>([]);
  const [scds, setScds] = useState<IScd[]>([]);
  const [annis, setAnnis] = useState<IAnni[]>([]);

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;
    const dateString = `${date2String(createdCalendar.currentDate)}`;

    const fetchAnni = async () => {
      const AnniQuery = query(
        collection(db, `${user.uid}/anniversary/${dateString}`),
        orderBy("name", "asc"),
        limit(10)
      );

      unsubscribe = await onSnapshot(AnniQuery, (snapshot) => {
        const anniversaries = snapshot.docs.map((doc) => {
          const { name } = doc.data();
          return { name, id: doc.id };
        });
        setAnnis(anniversaries);
      });
    };

    const fetchScd = async () => {
      const ScdQuery = query(
        collection(db, `${user.uid}/schedule/${dateString}`),
        orderBy("startDate", "asc"),
        limit(10)
      );

      unsubscribe = await onSnapshot(ScdQuery, (snapshot) => {
        const schedules = snapshot.docs.map((doc) => {
          const { name, startDate, endDate } = doc.data();
          return { name, startDate, endDate, id: doc.id };
        });
        setScds(schedules);
      });
    };

    const fetchTodo = async () => {
      const TodosQuery = query(
        collection(db, `${user.uid}/todo/${dateString}`),
        orderBy("createdAt", "desc"),
        limit(25)
      );

      unsubscribe = await onSnapshot(TodosQuery, (snapshot) => {
        const todos = snapshot.docs.map((doc) => {
          const { name, createdAt, checked } = doc.data();
          return { name, createdAt, checked, id: doc.id };
        });
        setTodos(todos);
      });
    };

    fetchAnni();
    fetchScd();
    fetchTodo();

    return () => {
      unsubscribe && unsubscribe();
    };
  }, [createdCalendar.currentDate]);

  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}
    >
      <Wrapper>
        <div align="center">
          <Month>
            <MonthBtn
              onClick={() => {
                createdCalendar.setCurrentDate(
                  subMonths(createdCalendar.currentDate, 1)
                );
              }}
            >
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
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
            </MonthBtn>
            <MonthName align="center">
              {createdCalendar.currentDate.getFullYear()}.
              {("0" + (createdCalendar.currentDate.getMonth() + 1)).slice(-2)}
            </MonthName>
            <MonthBtn
              onClick={() => {
                createdCalendar.setCurrentDate(
                  subMonths(createdCalendar.currentDate, -1)
                );
              }}
            >
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
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </MonthBtn>
          </Month>
          <TodayBtn
            onClick={() => {
              createdCalendar.setCurrentDate(new Date());
            }}
          >
            today
          </TodayBtn>
        </div>
        <CalendarWrapper>
          {DAY_LIST.map((day) => (
            <Week align="center">{day}</Week>
          ))}
          {createdCalendar.currentCalendarList.map((date, key) => (
            <div key={key} style={{ height: "70px" }}>
              {date ? (
                <div
                  align="center"
                  onClick={() => {
                    createdCalendar.setCurrentDate(
                      setDate(createdCalendar.currentDate, date)
                    );
                  }}
                  style={{
                    cursor: "pointer",
                    borderRadius: "50px",
                    fontSize: "13px",
                    color: `${
                      getDate(createdCalendar.currentDate) === date
                        ? "white"
                        : "grey"
                    }`,
                    backgroundColor: `${
                      getDate(createdCalendar.currentDate) === date
                        ? "black"
                        : "white"
                    }`,
                  }}
                >
                  {date}
                </div>
              ) : (
                ""
              )}
            </div>
          ))}
        </CalendarWrapper>
      </Wrapper>
      <div>
        <div
          style={{
            width: "100%",
            borderBottom: "2px solid",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              padding: "10px",
            }}
          >
            <DateName>
              {("0" + createdCalendar.currentDate.getDate()).slice(-2)}
            </DateName>
            <DayName>{DAY_LIST[createdCalendar.currentDate.getDay()]}</DayName>
          </div>
          <div style={{ width: "100%", paddingBottom: "10px" }}>
            {annis.map((anni) => (
              <Anniversary key={anni.id} {...anni} />
            ))}
          </div>
        </div>
        <Modal
          isOpen={saveScdForm}
          onRequestClose={() => setSaveScdForm(false)}
          style={{
            overlay: { backgroundColor: "rgba(0, 0, 0, 0.3)" },
            content: {
              position: "absolute",
              top: "15%",
              bottom: "15%",
              left: "15%",
              right: "15%",
              padding: "5%",
            },
          }}
        >
          <SaveScdForm
            initname=""
            start={createdCalendar.currentDate}
            end={null}
            user={user}
            setSaveScdForm={setSaveScdForm}
          />
        </Modal>
        <div
          style={{
            width: "100%",
            borderBottom: "2px solid",
            alignItems: "center",
            width: "100%",
            paddingBottom: "10px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ width: "100%" }}>
            {scds.map((scd) => (
              <Schedule key={scd.id} {...scd} />
            ))}
          </div>
          <AddButton
            onClick={() => {
              setSaveScdForm(true);
            }}
          >
            일정 추가하기
          </AddButton>
        </div>
        <div>
          <div>
            {todos.map((todo) => (
              <Todo key={todo.id} {...todo} />
            ))}
          </div>
          <SaveTodoForm />
        </div>
      </div>
    </div>
  );
};

export { CreateCalendar, Calendar };
