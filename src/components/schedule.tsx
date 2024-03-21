import { styled } from "styled-components";
import { DAY_LIST } from "./calendar";
import { useState } from "react";
import { auth, db } from "../firebase";
import { deleteDoc, doc } from "firebase/firestore";

import Modal from "react-modal";
import SaveScdForm from "./save-scd-form";

import { date2String } from "./date-components";

export interface IScd {
  id: string;
  name: string;
  startDate: timestamp;
  endDate: timestamp;
}

export interface IRepeat {
  id: string;
  name: string;
  startDate: timestamp;
  endDate: timestamp;
  repeatType: number;
  repeatPeriod: number;
  repeatInfo: map;
  repeatEnd: timestamp;
}

const Wrapper = styled.div`
  display: grid;
  gap: 5px;
  padding: 10px;
  margin: 10px;
  border: 2px solid lightgrey;
  border-radius: 5px;
  cursor: pointer;
`;

const Name = styled.h1`
  font-family: "PretendardRegular";
`;

const StartEnd = styled.span`
  font-family: "PretendardRegular";
  color: grey;
`;

const ButtonWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
  padding: 5px;
`;

const Button = styled.button`
  width: 100%;
  border: 1.5px solid black;
  border-radius: 7px;
  font-family: "seolleimcoolTTFSemiBold";
  font-size: 15px;
  padding: 5px 5px;
  cursor: pointer;
  background-color: white;
  color: black;
  align-items: center;
  justify-content: center;
  &:hover {
    background-color: black;
    color: white;
  }
  /**margin-top: 5px;
  gap: 5px;
  width: 70%;
  display: flex;
   */
`;

export function Schedule({ name, startDate, endDate, id }: IScd) {
  const [buttonOn, setButtonOn] = useState(false);
  const [updateScdForm, setUpdateScdForm] = useState(false);

  const user = auth.currentUser;

  const start = new Date(startDate.seconds * 1000);
  const end = new Date(endDate.seconds * 1000);

  function getDateString(date) {
    const dateString = `${("0" + (date.getMonth() + 1)).slice(-2)}.
    ${("0" + date.getDate()).slice(-2)}.
    ${DAY_LIST[date.getDay()]} ${("0" + date.getHours()).slice(-2)}:${(
      "0" + date.getMinutes()
    ).slice(-2)}`;
    return dateString;
  }

  function buttonOnOff() {
    if (buttonOn) {
      setButtonOn(false);
    } else {
      setButtonOn(true);
    }
  }

  const onUpdate = async () => {
    return setUpdateScdForm(true);
  };

  const onDelete = async () => {
    const ok = confirm("일정을 삭제하시겠습니까?");
    if (!ok) return;
    try {
      for (
        let i = 0;
        i <= (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        i++
      ) {
        const nowDate = new Date();
        const dateString = date2String(nowDate.setDate(start.getDate() + i));
        await deleteDoc(doc(db, `${user.uid}/schedule/${dateString}`, id));
      }
    } catch (e) {
      console.log(e);
    } finally {
      //
    }
  };
  return (
    <div>
      <Wrapper onClick={buttonOnOff}>
        <Name>{name}</Name>
        <StartEnd>
          {getDateString(start)} - {getDateString(end)}
        </StartEnd>
        {buttonOn ? (
          <ButtonWrapper>
            <Button onClick={onUpdate}>수정</Button>
            <Button onClick={onDelete}>삭제</Button>
          </ButtonWrapper>
        ) : null}
      </Wrapper>
      <Modal
        isOpen={updateScdForm}
        onRequestClose={() => setUpdateScdForm(false)}
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
          id={id}
          initname={name}
          start={start}
          end={end}
          user={user}
        />
      </Modal>
    </div>
  );
}
