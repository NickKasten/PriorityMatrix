import type { MetaFunction } from "react-router";
import { Welcome } from "../welcome/welcome";

export const meta: MetaFunction = () => [
  { title: "PriorityMatrix" },
  {
    name: "description",
    content: "Organize tasks with the Eisenhower Matrix.",
  },
];

export default function Home() {
  return <Welcome />;
}
