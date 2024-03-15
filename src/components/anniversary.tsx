import { styled } from "styled-components";
import { useState } from "react";

export interface IAnni {
  id: string;
  name: string;
}

const Wrapper = styled.div`
  width: 100%;
  margin: 5px;
  cursor: pointer;
`;

const Name = styled.h1`
  font-family: "PretendardRegular";
`;

export function Anniversary({ name, id }: IScd) {
  const [deleteBtnOn, setDeleteBtnOn] = useState(false);

  return (
    <Wrapper>
      <Name>{name}</Name>
      {deleteBtnOn ? <button>delete</button> : null}
    </Wrapper>
  );
}
