import { useState } from "react";
import SaveScdForm from "./save-scd-form";
import { Button } from "./save-components";

const selectedName = "selected";

export default function SaveForm({
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
  const [type, setType] = useState(1);

  const handleTypeRadio = (e) => {
    e.preventDefault();
    setType(Number(e.target.value));

    for (let i = 0; i < 3; i++) {
      if (e.target.parentNode.childNodes[i].classList.contains(selectedName)) {
        e.target.parentNode.childNodes[i].classList.remove(selectedName);
      }
    }

    e.target.classList.add(selectedName);
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
        <Button className={selectedName} value="1" onClick={handleTypeRadio}>
          일정
        </Button>
        <Button value="2" onClick={handleTypeRadio}>
          기념일
        </Button>
        <Button value="3" onClick={handleTypeRadio}>
          디데이
        </Button>
      </div>
      {type === 1 ? (
        <SaveScdForm
          initname={initname}
          start={start}
          end={end}
          Rtype={Rtype}
          Rperiod={Rperiod}
          Rinfo={Rinfo}
          Rend={Rend}
          user={user}
          setSaveScdForm={setSaveScdForm}
        />
      ) : null}
    </div>
  );
}
