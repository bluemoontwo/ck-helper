import { DebateData } from "../types/debate";
import fs from "fs";

export function makeDebateHtml(debate: DebateData, interaction: any) {
  // HTML 템플릿 파일 읽기
  const baseHtml = fs.readFileSync("public/debate/base.html", "utf-8");
  // 사용자 메시지들을 HTML 형식으로 변환
  const userMessages = debate.messages.reduce((acc, message, index, array) => {
    try {
      // 이전 메시지가 있고 같은 유저인 경우
      if (index > 0 && array[index - 1].username === message.username) {
        // 마지막 div를 찾아서 메시지만 추가
        return acc.replace(
          "<!--next-->",
          `<br/>${message.message} <!--next-->`
        );
      }

      if (message.userAvatar === "") {
        message.userAvatar = "";
      }

      // 새로운 유저의 메시지 블록 생성
      return (
        acc +
        `
<div class="flex gap-4">
 <img
     class="rounded-full w-12 h-12"
     src="${
       message.userAvatar === ""
         ? "https://static-00.iconduck.com/assets.00/discord-icon-2048x2048-wooh9l0j.png"
         : message.userAvatar
     }"
     alt="logo"
     loading="lazy"
 />
 <div>
     <div class="flex items-center mt-[-2px] gap-2">
     <p class="text-md font-bold text-[${message.userColor}]">${
          message.username
        }</p>
     <p class="text-xs text-white/50">${new Date(
       parseInt(message.messageTimestamp)
     ).toLocaleDateString("ko-KR", {
       year: "numeric",
       month: "long",
       day: "numeric",
     })}</p>
     </div>
     
     <p>${message.message}<!--next-->\n</p>
 </div>
 </div>
`
      );
    } catch (error) {
      interaction.followUp({
        content: "메시지 처리 중 오류가 발생했습니다.",
        ephemeral: true,
      });
      return acc;
    }
  }, "");
  // HTML 템플릿에 제목과 메시지 내용 삽입
  const html = baseHtml
    .replace(new RegExp("{title}", "g"), debate.topic)
    .replace("{messages}", userMessages);

  // HTML을 버퍼로 변환하여 첨부 파일 생성
  const buffer = Buffer.from(html);
  const attachment = {
    attachment: buffer,
    name: `debate_${Date.now()}.html`,
  };
  return attachment;
}
