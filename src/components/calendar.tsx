import { getDate, getDay, getDaysInMonth, subMonths, setDate } from "date-fns";

import { styled } from "styled-components";
import { useState, useEffect } from "react";

import Modal from "react-modal";
import "react-datepicker/dist/react-datepicker.css";
import { Unsubscribe } from "firebase/auth";
import { doc } from "firebase/firestore";
import { auth, db } from "./../firebase";

import {
  setDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { ITodo, Todo } from "./todo";
import { IScd, IRepeat, Schedule } from "./schedule";
import { IAnni, Anniversary } from "./anniversary";
import SaveForm from "./save-form";
import SaveTodoForm from "./save-todo-form";
import { date2String, DAY_LIST } from "./date-components";

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

const TodayBtn = styled.button`
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

const MoreBtn = styled.div`
  cursor: pointer;
  height: 30px;
  width: 30px;
  float: right;
  svg {
    width: 30px;
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

const AddBtn = styled.button`
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
  const selectedDate = new Date(createdCalendar.currentDate);
  const [saveForm, setSaveForm] = useState(false);

  const [todos, setTodos] = useState<ITodo[]>([]);
  const [scds, setScds] = useState<IScd[]>([]);
  const [annis, setAnnis] = useState<IAnni[]>([]);

  const [scdIds, setScdIds] = useState([]);
  const [repeatScds, setRepeatScds] = useState<IRepeat[]>([]);

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;
    const dateString = `${date2String(selectedDate)}`;

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
        limit(25)
      );

      unsubscribe = await onSnapshot(ScdQuery, (snapshot) => {
        const schedules = snapshot.docs.map((doc) => {
          const { name, startDate, endDate } = doc.data();
          return { name, startDate, endDate, id: doc.id };
        });
        setScds(schedules);
      });

      const scheduleIds = scds.map((scd) => {
        return scd.id;
      });
      setScdIds(scheduleIds);
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

    const saveEachScd = async (
      dateCount,
      newId,
      name,
      startDate,
      endDate,
      repeatType
    ) => {
      for (let i = 0; i <= dateCount; i++) {
        const nowDate = startDate;
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
    };

    const saveRepeatScd = async () => {
      const RepeatScdQuery = query(
        collection(db, `${user.uid}/schedule/repeat`),
        orderBy("startDate", "asc"),
        limit(25)
      );

      unsubscribe = await onSnapshot(RepeatScdQuery, (snapshot) => {
        const repeatScds = snapshot.docs.map((doc) => {
          const {
            name,
            startDate,
            endDate,
            repeatType,
            repeatInfo,
            repeatEnd,
          } = doc.data();
          return {
            name,
            startDate,
            endDate,
            repeatType,
            repeatInfo,
            repeatEnd,
            id: doc.id,
          };
        });
        setRepeatScds(repeatScds);
      });

      repeatScds.map((scd) => {
        const startDate = new Date(scd.startDate.seconds * 1000);
        const endDate = new Date(scd.endDate.seconds * 1000);
        const tmxkxm = new Date(selectedDate);
        tmxkxm.setHours(23, 59, 59);
        if (
          !scdIds.includes(scd.id) &&
          startDate <= tmxkxm &&
          (!scd.repeatEnd ||
            selectedDate < new Date(scd.repeatEnd.seconds * 1000))
        ) {
          const dateCount =
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
          const newId = scd.id;

          const start = new Date(selectedDate);
          start.setHours(startDate.getHours(), startDate.getMinutes(), 0);

          const end = new Date(selectedDate);
          end.setDate(start.getDate() + dateCount);
          end.setHours(endDate.getHours(), endDate.getMinutes(), 0);

          switch (scd.repeatType) {
            case 1:
              if (
                Math.floor(
                  (tmxkxm.getTime() - startDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                ) %
                  scd.repeatInfo.repeatDayData ===
                0
              ) {
                //db에 저장
                saveEachScd(
                  dateCount,
                  newId,
                  scd.name,
                  start,
                  end,
                  scd.repeatType
                );
              }
              break;
            case 2:
              if (scd.repeatInfo.repeatWeekData[selectedDate.getDay()]) {
                //db에 저장
                saveEachScd(
                  dateCount,
                  newId,
                  scd.name,
                  start,
                  end,
                  scd.repeatType
                );
              }
              break;
            case 3:
              if (
                (scd.repeatInfo.repeatMonthData === 0 &&
                  selectedDate.getDate() === startDate.getDate()) ||
                (scd.repeatInfo.repeatMonthData === 1 &&
                  selectedDate.getDay() === startDate.getDay() &&
                  Math.floor(
                    (selectedDate.getDate() + selectedDate.getDay() + 1) / 7
                  ) ===
                    Math.floor(
                      (startDate.getDate() + startDate.getDay() + 1) / 7
                    ))
              ) {
                //db에 저장
                saveEachScd(
                  dateCount,
                  newId,
                  scd.name,
                  start,
                  end,
                  scd.repeatType
                );
              }
              break;
            case 4:
              if (
                selectedDate.getMonth() === startDate.getMonth() &&
                ((scd.repeatInfo.repeatYearData === 0 &&
                  selectedDate.getDate() === startDate.getDate()) ||
                  (scd.repeatInfo.repeatYearData === 1 &&
                    selectedDate.getDay() === startDate.getDay() &&
                    Math.floor(
                      (selectedDate.getDate() + selectedDate.getDay() + 1) / 7
                    ) ===
                      Math.floor(
                        (startDate.getDate() + startDate.getDay() + 1) / 7
                      )))
              ) {
                //db에 저장
                saveEachScd(
                  dateCount,
                  newId,
                  scd.name,
                  start,
                  end,
                  scd.repeatType
                );
              }
              break;
          }
        }
      });
    };
    fetchAnni();
    fetchScd();
    fetchTodo();
    saveRepeatScd();

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
      <div style={{ display: "flex", flexDirection: "column" }}>
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
          isOpen={saveForm}
          onRequestClose={() => setSaveForm(false)}
          style={{
            overlay: { backgroundColor: "rgba(0, 0, 0, 0.3)" },
            content: {
              position: "absolute",
              top: "15%",
              bottom: "15%",
              left: "15%",
              right: "15%",
              padding: "3%",
            },
          }}
        >
          <SaveForm
            initname=""
            start={createdCalendar.currentDate}
            end={null}
            user={user}
            Rtype={null}
            Rperiod={null}
            Rinfo={null}
            Rend={null}
            setSaveForm={setSaveForm}
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
          <AddBtn
            onClick={() => {
              setSaveForm(true);
            }}
          >
            일정 추가하기
          </AddBtn>
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
