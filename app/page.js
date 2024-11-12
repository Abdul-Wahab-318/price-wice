import Image from "next/image";
import SubscriptionForm from "./components/SubscriptionForm/SubscriptionForm";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen px-6 pb-20 sm:p-20 home-wrapper">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start home-main">
        <h1 className="gradient-text intro_title text-3xl md:text-5xl font-[900] text-center">Never Miss a Deal <br /> Get Notified When Prices Drop!</h1>
        <SubscriptionForm/>
      </main>
    </div>
  );
}
