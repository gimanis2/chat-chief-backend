import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import path from "path";

const app = express();

//cors설정
app.use(cors());

//dotenv설정
const __dirname = path.resolve();
dotenv.config({
  path: __dirname + "/.env",
});

// 프론트에서 받은 json형태의 데이터를 객체로 파싱(변환)하여 사용하도록 설정
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

//테스트용
app.get("/test", async (req, res) => {
  try {
    res.json({ data: "chuddd" });
  } catch (error) {
    console.log(error);
  }
});

app.post("/message", async (req, res) => {
  const message = req.body.message;
  console.log("message", message);
  try {
    res.json({ id: Date.now(), message: message });
  } catch (error) {
    console.log(error);
  }
});

const port = process.env.PORT || 8080; //앞에 port값이 없으면 8080번 포트를 쓰겠다.

app.listen(port, () => {
  //PORT번호 확인
  console.log("port번호 : ", port);
});
