import Button from '../components/Button';
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      {/* TODO: Use HERO page for landing. and change home page url */}
      <div className="m-t-1 hero min-h-screen">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold dark:text-white">Hello there</h1>
            <p className="py-6 dark:text-slate-300">
              This is SPARA chatbot. Ask your questions by starting a chat.
            </p>
            <Button
              text={'Start chat!'}
              onClick={() => navigate("/chat")}
            />
          </div>
        </div>
      </div>
      {/* <div className="flex w-full max-w-screen-md flex-col items-center">
        <div className="flex-1 justify-center">
          <div className="text-2xl dark:text-white">HOME</div>
        </div>
        <div className="divider m-0" />

        <Button text={'My Button'} onClick={() => console.log('pressed!')} />
      </div> */}
    </>
  );
}

export default HomePage;
