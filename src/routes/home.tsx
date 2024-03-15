import { styled } from "styled-components";
import { Calendar } from "./../components/calendar";

const Wrapper = styled.div`
  display: grid;
  width: 100%;
  max-width: 860px;
  align-items: center;
`;

export default function Home() {
  return (
    <Wrapper>
      <Calendar />
    </Wrapper>
  );
}
