import Header from "../components/Header";
import Chat from "../components/chat/Chat";

const ChatPage = () => {
  return (
    <div className="flex flex-col h-full w-full items-center">
      <Header title={"SPARA"} />
      <Chat />
    </div>
  );
};

export default ChatPage;
