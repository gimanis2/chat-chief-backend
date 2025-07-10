import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import path from "path";
import OpenAI from "openai";

const app = express();

//cors설정
app.use(cors());

//dotenv설정
const __dirname = path.resolve();
dotenv.config({
  path: __dirname + "/.env",
});

// openai 정보 설정
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log(process.env.OPENAI_API_KEY);

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

// 챗봇 api설정
const initialMessage = (ingredientList) => {
  return [
    {
      role: "system",
      content: `당신은 "맛있는 쉐프"라는 이름의 전문 요리사입니다. 사용자가 재료 목록을 제공하면, 첫번째 답변에서는 오직 다음 문장만을 응답으로 제공해야 합니다. 다른 어떤 정보도 추가하지 마세요: 제공해주신 재료 목록을 보니 정말 맛있는 요리를 만들 수 있을 것 같아요. 어떤 종류의 요리를 선호하시나요? 간단한 한끼 식사, 특별한 저녁 메뉴, 아니면 가벼운 간식 등 구체적인 선호도가 있으시다면 말씀해 주세요. 그에 맞춰 최고의 레시피를 제안해 드리겠습니다!`,
    },
    {
      role: "user",
      content: `안녕하세요, 맛있는 쉐프님. 제가 가진 재료로 요리를 하고 싶은데 도와주실 수 있나요? 제 냉장고에 있는 재료들은 다음과 같아요: ${ingredientList
        .map((item) => item.value)
        .join(", ")}`,
    },
  ];
};

// 초기 답변
app.post("/recipe", async (req, res) => {
  const { ingredientList } = req.body; //배열형태로 사용자로부터 입력 받음
  const messages = initialMessage(ingredientList);
  try {
    //chat gpt에 요청을 보내는 함수로 결과값을 response로 받음
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages, //messages:messages 와 동일
      temperature: 1, //창의성
      max_tokens: 4000, // max글자수
      top_p: 1,
    });

    //기존  messages 배열에 답변 배열을 추가하여 data로 반환
    const data = [...messages, response.choices[0].message];

    console.log("data", data);
    res.json({ data });
  } catch (error) {
    console.log(error);
  }
});

// 유저와의 채팅
app.post("/message", async (req, res) => {
  const { userMessage, messages } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [...messages, userMessage], //기존메시지와 사용자메시지를 합쳐서 보냄
      temperature: 1,
      max_tokens: 4000,
      top_p: 1,
    });
    const data = response.choices[0].message;
    res.json({ data });
  } catch (error) {
    console.log(error);
  }
});

const port = process.env.PORT || 8080; //앞에 port값이 없으면 8080번 포트를 쓰겠다.

app.listen(port, () => {
  //PORT번호 확인
  console.log("port번호 : ", port);
});
